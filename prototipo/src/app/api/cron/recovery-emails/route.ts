import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";
import { buildRecoveryReminderEmail } from "@/lib/email/recovery-reminder";
import { unsubscribeToken } from "@/lib/email/unsubscribe-token";
import {
  emptyProjectDraft,
  type CompanyFormData,
  type ProjectFormData,
} from "@/lib/form-storage";
import { firstIncompleteStep, remainingSeconds } from "@/lib/guided-steps";
import { createAdminClient } from "@/lib/supabase/admin";

export const maxDuration = 60;

const RECOVERY_DELAY_MS = 60 * 60 * 1000;
const MAX_DRAFT_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const BATCH_SIZE = 25;
/** Resend acepta 2 pedidos por segundo en el plan gratuito. */
const SEND_INTERVAL_MS = 600;

type RecoveryStatus =
  | "sent"
  | "skipped_no_email"
  | "skipped_opt_out"
  | "skipped_superseded"
  | "skipped_no_draft";

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  const header = request.headers.get("authorization") ?? "";
  if (!secret) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(header);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Pieza 4: correo +1 h a quien empezó el formulario, dejó borrador y no lo envió.
 * La llama pg_cron cada 15 minutos (supabase/cron/recovery-emails.sql).
 */
export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const admin = createAdminClient();
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!admin || !apiKey || !from) {
    return NextResponse.json({ status: "skipped", reason: "not_configured" }, { status: 503 });
  }
  const resend = new Resend(apiKey);
  const replyTo = process.env.RESEND_REPLY_TO?.trim();
  const origin = request.nextUrl.origin;

  // Para probar: `dryRun` no envía ni guarda nada; `sessionId` procesa solo esa sesión sin esperar la hora.
  const body: unknown = await request.json().catch(() => null);
  const options = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const dryRun = options.dryRun === true;
  const onlySessionId = text(options.sessionId);

  const now = Date.now();
  let query = admin
    .from("test_sessions")
    .select("id, user_id, started_at")
    .eq("flow_piece", "formulario_inicial")
    .neq("status", "submitted")
    .is("recovery_email_status", null);
  query = onlySessionId
    ? query.eq("id", onlySessionId)
    : query
        .lte("last_activity_at", new Date(now - RECOVERY_DELAY_MS).toISOString())
        .gte("last_activity_at", new Date(now - MAX_DRAFT_AGE_MS).toISOString());
  const { data: candidates, error: candidatesError } = await query
    .order("last_activity_at", { ascending: true })
    .limit(BATCH_SIZE);
  if (candidatesError) {
    console.error("[recovery-emails] candidatos", candidatesError);
    return NextResponse.json({ error: "No se pudieron leer las sesiones." }, { status: 500 });
  }

  const summary: Record<RecoveryStatus | "failed", number> = {
    sent: 0,
    skipped_no_email: 0,
    skipped_opt_out: 0,
    skipped_superseded: 0,
    skipped_no_draft: 0,
    failed: 0,
  };

  const decisions: { sessionId: string; result: RecoveryStatus | "failed"; to?: string; subject?: string }[] =
    [];

  async function settle(sessionId: string, status: RecoveryStatus) {
    summary[status] += 1;
    decisions.push({ sessionId, result: status });
    if (dryRun) return;
    await admin!
      .from("test_sessions")
      .update({ recovery_email_status: status, recovery_email_at: new Date().toISOString() })
      .eq("id", sessionId);
  }

  for (const candidate of candidates ?? []) {
    const [{ data: profile }, { count: newerSessions }, { data: snapshot }] = await Promise.all([
      admin
        .from("profiles")
        .select("email, full_name, email_reminders_opt_out")
        .eq("id", candidate.user_id)
        .maybeSingle(),
      admin
        .from("test_sessions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", candidate.user_id)
        .eq("flow_piece", "formulario_inicial")
        .gt("started_at", candidate.started_at),
      admin
        .from("form_draft_snapshots")
        .select("company, project")
        .eq("session_id", candidate.id)
        .order("captured_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    const email = text(profile?.email);
    if (!email) {
      await settle(candidate.id, "skipped_no_email");
      continue;
    }
    if (profile?.email_reminders_opt_out) {
      await settle(candidate.id, "skipped_opt_out");
      continue;
    }
    if ((newerSessions ?? 0) > 0) {
      await settle(candidate.id, "skipped_superseded");
      continue;
    }
    // Sin borrador = nunca pasó de elegir el tipo de formulario (eso es pieza 1, no pieza 4).
    if (!snapshot) {
      await settle(candidate.id, "skipped_no_draft");
      continue;
    }

    const empty = emptyProjectDraft();
    const company = (snapshot.company ?? {}) as Partial<CompanyFormData>;
    const project = (snapshot.project ?? {}) as Partial<ProjectFormData>;
    const draft = {
      company: { ...empty.company, ...company },
      project: { ...empty.project, ...project },
    };
    const minutesLeft = Math.round(remainingSeconds(firstIncompleteStep(draft)) / 60);
    const fullName = text(profile?.full_name);
    const unsubscribeUrl = `${origin}/api/emails/unsubscribe?u=${candidate.user_id}&t=${unsubscribeToken(candidate.user_id)}`;

    const message = buildRecoveryReminderEmail({
      firstName: fullName ? fullName.split(/\s+/)[0] : null,
      organization: text(company.companyName),
      title: text(project.title),
      minutesLeft,
      resumeUrl: `${origin}/cargar-proyecto/retomar?sesion=${candidate.id}&origen=email`,
      unsubscribeUrl,
    });

    if (dryRun) {
      summary.sent += 1;
      decisions.push({
        sessionId: candidate.id,
        result: "sent",
        to: email.replace(/^(.{2}).*@/, "$1***@"),
        subject: message.subject,
      });
      continue;
    }

    const { error } = await resend.emails.send(
      {
        from,
        to: email,
        subject: message.subject,
        html: message.html,
        text: message.text,
        headers: {
          "List-Unsubscribe": `<${unsubscribeUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
        ...(replyTo ? { replyTo } : {}),
      },
      { idempotencyKey: `recovery/${candidate.id}` },
    );
    if (error) {
      // Queda sin estado: la próxima ejecución lo vuelve a intentar.
      console.error("[recovery-emails] envío", candidate.id, error);
      summary.failed += 1;
      decisions.push({ sessionId: candidate.id, result: "failed" });
    } else {
      await settle(candidate.id, "sent");
    }
    await wait(SEND_INTERVAL_MS);
  }

  return NextResponse.json({
    status: "ok",
    dryRun,
    evaluated: candidates?.length ?? 0,
    ...summary,
    decisions,
  });
}

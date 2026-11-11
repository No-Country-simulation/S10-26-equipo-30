import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";
import { buildApprovalNotificationEmail } from "@/lib/email/approval-notification";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthUser, createClient } from "@/lib/supabase/server";

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

type SubmissionRow = {
  id: string;
  session_id: string;
  company: unknown;
  project: unknown;
  review_status: string;
  review_status_note: string | null;
  test_sessions: { user_id: string } | { user_id: string }[] | null;
};

/**
 * Pieza 6 — Aviso al decisor cuando el revisor marca el envío como aprobado.
 * Solo lo dispara el equipo de research (no el decisor).
 */
export async function POST(request: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!apiKey || !from) {
    return NextResponse.json({ status: "skipped", reason: "resend_not_configured" }, { status: 503 });
  }

  const caller = await getAuthUser();
  if (!caller?.isResearcher) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const body: unknown = await request.json().catch(() => null);
  const submissionId =
    body && typeof body === "object" && "submissionId" in body ? text(body.submissionId) : "";
  if (!submissionId) {
    return NextResponse.json({ error: "Falta submissionId." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: submission, error: submissionError } = await supabase
    .from("project_submissions")
    .select(
      "id, session_id, company, project, review_status, review_status_note, test_sessions!inner(user_id)",
    )
    .eq("id", submissionId)
    .maybeSingle();

  if (submissionError || !submission) {
    return NextResponse.json({ error: "No encontramos el envío." }, { status: 404 });
  }

  const row = submission as SubmissionRow;
  if (row.review_status !== "aprobado") {
    return NextResponse.json({ error: "El envío no está en estado aprobado." }, { status: 409 });
  }

  const session = Array.isArray(row.test_sessions) ? row.test_sessions[0] : row.test_sessions;
  const ownerId = session?.user_id;
  if (!ownerId) {
    return NextResponse.json({ error: "Sesión inválida." }, { status: 500 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", ownerId)
    .maybeSingle();

  if (profileError || !profile?.email?.includes("@")) {
    return NextResponse.json({ status: "skipped", reason: "owner_no_email" });
  }

  const guestName =
    typeof profile.full_name === "string" && profile.full_name.startsWith("Invitado ");
  if (guestName) {
    return NextResponse.json({ status: "skipped", reason: "owner_guest" });
  }

  const company = (row.company ?? {}) as Record<string, unknown>;
  const project = (row.project ?? {}) as Record<string, unknown>;
  const firstName = text(profile.full_name).split(/\s+/)[0] || null;

  const email = buildApprovalNotificationEmail({
    firstName,
    submissionId: row.id,
    title: text(project.title) || "Tu desafío",
    companyName: text(company.companyName) || "tu organización",
    myProjectsUrl: `${request.nextUrl.origin}/mis-proyectos`,
    reviewerNote: text(row.review_status_note) || null,
  });

  const replyTo = process.env.RESEND_REPLY_TO?.trim();
  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send(
    {
      from,
      to: profile.email,
      subject: email.subject,
      html: email.html,
      text: email.text,
      ...(replyTo ? { replyTo } : {}),
    },
    { idempotencyKey: `approval-notification/${row.id}` },
  );
  if (error) {
    console.error("[resend] approval-notification", error);
    return NextResponse.json({ error: "No se pudo enviar el correo." }, { status: 502 });
  }

  const admin = createAdminClient();
  if (admin) {
    await admin.from("session_events").insert({
      session_id: row.session_id,
      event_type: "approval_email_sent",
      step_id: "aprobacion",
      payload: {
        email_id: data?.id ?? null,
        submission_id: row.id,
        sent_by: caller.id,
      },
    });
  }

  return NextResponse.json({ status: "sent", to: profile.email });
}

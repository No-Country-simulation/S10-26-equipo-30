import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";
import { buildSubmissionConfirmationEmail } from "@/lib/email/submission-confirmation";
import { createClient } from "@/lib/supabase/server";

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Envía el acuse de recibo de un desafío al correo de la cuenta que lo cargó.
 * El destinatario sale siempre de la sesión, nunca del cuerpo del pedido.
 */
export async function POST(request: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!apiKey || !from) {
    return NextResponse.json({ status: "skipped", reason: "resend_not_configured" }, { status: 503 });
  }

  const body: unknown = await request.json().catch(() => null);
  const sessionId =
    body && typeof body === "object" && "sessionId" in body ? text(body.sessionId) : "";
  if (!sessionId) {
    return NextResponse.json({ error: "Falta sessionId." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sesión requerida." }, { status: 401 });
  }
  if (user.is_anonymous || !user.email) {
    return NextResponse.json({ status: "skipped", reason: "no_email" });
  }

  const { data: submission, error: submissionError } = await supabase
    .from("project_submissions")
    .select("id, company, project, test_sessions!inner(user_id)")
    .eq("session_id", sessionId)
    .eq("test_sessions.user_id", user.id)
    .maybeSingle();
  if (submissionError || !submission) {
    return NextResponse.json({ error: "No encontramos el envío." }, { status: 404 });
  }

  const company = (submission.company ?? {}) as Record<string, unknown>;
  const project = (submission.project ?? {}) as Record<string, unknown>;
  const meta = user.user_metadata as Record<string, unknown>;
  const fullName = text(meta.full_name) || text(meta.name);

  const email = buildSubmissionConfirmationEmail({
    firstName: fullName ? fullName.split(/\s+/)[0] : null,
    submissionId: submission.id,
    title: text(project.title) || "Tu desafío",
    companyName: text(company.companyName) || "tu organización",
    problem: text(project.problem),
    deliverables: Array.isArray(project.deliverables)
      ? project.deliverables.filter((item): item is string => typeof item === "string")
      : [],
    myProjectsUrl: `${request.nextUrl.origin}/mis-proyectos`,
  });

  const replyTo = process.env.RESEND_REPLY_TO?.trim();
  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send(
    {
      from,
      to: user.email,
      subject: email.subject,
      html: email.html,
      text: email.text,
      ...(replyTo ? { replyTo } : {}),
    },
    { idempotencyKey: `submission-confirmation/${submission.id}` },
  );
  if (error) {
    console.error("[resend] submission-confirmation", error);
    return NextResponse.json({ error: "No se pudo enviar el correo." }, { status: 502 });
  }

  await supabase.from("session_events").insert({
    session_id: sessionId,
    event_type: "confirmation_email_sent",
    step_id: "post-envio",
    payload: { email_id: data?.id ?? null },
  });

  return NextResponse.json({ status: "sent" });
}

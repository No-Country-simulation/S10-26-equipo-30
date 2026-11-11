import {
  asRecord,
  formatWhen,
  labelStep,
  sessionStatus,
  textField,
} from "@/lib/research-labels";
import { labelRecoveryStatus } from "@/lib/qualified-leads";

type Row = Record<string, unknown>;

/** Reglas de alta intención de la pieza 4 (piloto de contacto humano +24 h). */
const COMPANY_STEPS = new Set(["company-name", "organization-type", "organization-size", "country", "phone", "compania"]);
const BRIEF_STEPS = new Set(["title", "problem", "description"]);
const BRIEF_MIN_MS = 30_000;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;


function str(value: unknown) {
  return typeof value === "string" ? value : null;
}

function time(value: unknown) {
  const at = str(value) ? new Date(String(value)).getTime() : Number.NaN;
  return Number.isNaN(at) ? null : at;
}

function isCompanyComplete(company: Record<string, unknown>) {
  return ["companyName", "organizationType", "organizationSize", "country", "phoneNumber"].every(
    (key) => textField(company, key) !== "—",
  );
}

/** Una pregunta concreta según dónde se trabó, para el mensaje firmado de WhatsApp o correo. */
function suggestedQuestion(stepId: string | null) {
  if (!stepId || COMPANY_STEPS.has(stepId)) {
    return "¿Te quedó alguna duda con los datos de la organización o para qué pedimos el teléfono?";
  }
  if (BRIEF_STEPS.has(stepId)) {
    return "¿Querés que te ayudemos a contar el problema? Podés mandármelo en un audio.";
  }
  if (stepId === "detalles") {
    return "¿Te trabó alguna pregunta de los detalles del proyecto?";
  }
  return "¿Te trabó alguna opción, como el área o los sectores? Te ayudo a elegirla.";
}

function whatsappLink(company: Record<string, unknown>) {
  const phone = `${textField(company, "phoneDialCode")}${textField(company, "phoneNumber")}`.replace(/\D/g, "");
  return phone.length >= 8 ? `wa.me/${phone}` : "—";
}

/** Tiempo en cada pregunta del brief: hasta el registro siguiente, o hasta la última actividad. */
function spentOnBrief(sessionEvents: Row[], lastActivity: number | null) {
  const ordered = [...sessionEvents].sort((a, b) => (time(a.created_at) ?? 0) - (time(b.created_at) ?? 0));
  return ordered.some((event, index) => {
    if (event.event_type !== "step_view" || !BRIEF_STEPS.has(String(event.step_id ?? ""))) return false;
    const start = time(event.created_at);
    const end = index + 1 < ordered.length ? time(ordered[index + 1].created_at) : lastActivity;
    return start !== null && end !== null && end - start >= BRIEF_MIN_MS;
  });
}

type RecoveryInput = {
  sessions: Row[];
  drafts: Row[];
  events: Row[];
  resumeEvents: Row[];
  profiles: Row[];
  names: Map<string, string>;
};

export function buildRecoveryView({ sessions, drafts, events, resumeEvents, profiles, names }: RecoveryInput) {
  const formSessions = sessions.filter((session) => session.flow_piece === "formulario_inicial");
  const profileById = new Map(profiles.map((person) => [String(person.id ?? ""), person]));

  const latestDraft = new Map<string, Row>();
  for (const draft of drafts) {
    const id = String(draft.session_id ?? "");
    const current = latestDraft.get(id);
    if (!current || (time(draft.captured_at) ?? 0) > (time(current.captured_at) ?? 0)) {
      latestDraft.set(id, draft);
    }
  }

  const eventsBySession = new Map<string, Row[]>();
  for (const event of events) {
    const id = String(event.session_id ?? "");
    eventsBySession.set(id, [...(eventsBySession.get(id) ?? []), event]);
  }

  const resumeSource = new Map<string, string>();
  for (const event of resumeEvents) {
    const id = String(event.session_id ?? "");
    const source = str(asRecord(event.payload).source) ?? "aviso";
    if (resumeSource.get(id) !== "email") resumeSource.set(id, source);
  }

  const now = Date.now();
  const abandoned = formSessions.filter((session) => {
    const lastActivity = str(session.last_activity_at) ?? str(session.started_at);
    return sessionStatus(str(session.status), lastActivity) === "abandoned";
  });

  const qualified = abandoned.filter((session) => {
    const id = String(session.id ?? "");
    const company = asRecord(latestDraft.get(id)?.company);
    const sessionEvents = eventsBySession.get(id) ?? [];
    const advanced =
      isCompanyComplete(company) ||
      sessionEvents.some((event) => event.event_type === "screen_complete" && event.step_id === "compania") ||
      spentOnBrief(sessionEvents, time(session.last_activity_at));
    const email = str(profileById.get(String(session.user_id ?? ""))?.email)?.trim();
    const reachable = whatsappLink(company) !== "—" || Boolean(email);
    return advanced && reachable;
  });

  const emailsSent = formSessions.filter((session) => session.recovery_email_status === "sent");
  const resumed = formSessions.filter((session) => resumeSource.has(String(session.id ?? "")));
  const resumedFromEmail = resumed.filter((session) => resumeSource.get(String(session.id ?? "")) === "email");
  const recovered = resumed.filter((session) => session.status === "submitted");
  const recoveredFromEmail = resumedFromEmail.filter((session) => session.status === "submitted");
  const abandonedThisWeek = abandoned.filter((session) => {
    const at = time(session.last_activity_at);
    return at !== null && now - at <= WEEK_MS;
  });
  const recoveryRate = emailsSent.length
    ? `${Math.round((recoveredFromEmail.length / emailsSent.length) * 100)} %`
    : "—";

  const metrics = [
    `Abandonos: ${abandoned.length} (${abandonedThisWeek.length} en los últimos 7 días)`,
    `Calificados para contacto humano: ${qualified.length}`,
    `Correos +1 h enviados: ${emailsSent.length}`,
    `Retomaron el borrador: ${resumed.length} (${resumedFromEmail.length} desde el correo)`,
    `Recuperados (enviaron después de retomar): ${recovered.length}`,
    `Recuperación por correo: ${recoveryRate}`,
  ].join(" · ");

  const rows = qualified
    .sort((a, b) => (time(b.last_activity_at) ?? 0) - (time(a.last_activity_at) ?? 0))
    .map((session) => {
      const id = String(session.id ?? "");
      const company = asRecord(latestDraft.get(id)?.company);
      const project = asRecord(latestDraft.get(id)?.project);
      const email = str(profileById.get(String(session.user_id ?? ""))?.email)?.trim();
      const stepId = str(session.current_step_id);
      const source = resumeSource.get(id);
      return [
        names.get(String(session.user_id ?? "")) ?? "Participante",
        textField(company, "companyName"),
        textField(project, "title"),
        email || "—",
        whatsappLink(company),
        labelStep(stepId, str(session.flow_variant)),
        formatWhen(str(session.last_activity_at)),
        labelRecoveryStatus(str(session.recovery_email_status)),
        source ? `Sí (${source === "email" ? "correo" : "aviso"})` : "No",
        suggestedQuestion(stepId),
      ];
    });

  return { metrics, rows };
}

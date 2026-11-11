/**
 * Pieza 4 — Leads calificados para el contacto humano +24 h.
 * Las filas salen de la función `public.qualified_leads()` de Supabase
 * (supabase/migrations/20261111100100_qualified_leads.sql), que aplica los criterios.
 */

export type QualifiedLead = {
  session_id: string;
  user_id: string;
  account_name: string | null;
  account_email: string | null;
  flow_variant: string | null;
  last_step_id: string | null;
  started_at: string | null;
  last_activity_at: string | null;
  recovery_email_status: string | null;
  recovery_email_at: string | null;
  resumed_draft: boolean;
  company_name: string | null;
  organization_type: string | null;
  organization_size: string | null;
  country: string | null;
  phone_dial_code: string | null;
  phone_number: string | null;
  project_title: string | null;
  company_complete: boolean;
  brief_written: boolean;
  brief_seconds: number;
  interest_score: number;
  contacts_count: number;
  last_contact_at: string | null;
  last_contact_by: string | null;
  last_contact_channel: string | null;
  last_contact_outcome: string | null;
  last_contact_note: string | null;
};

export type LeadContactSummary = {
  contacts: number;
  leads_contacted: number;
  resumed_after_contact: number;
  submitted_after_contact: number;
};

/** Puntaje máximo de `interest_score` (organización, brief escrito, 30 s en el brief, teléfono, retomó). */
export const MAX_INTEREST_SCORE = 5;

export const recoveryStatusLabels: Record<string, string> = {
  sent: "Enviado",
  skipped_no_email: "No: sin correo",
  skipped_opt_out: "No: pidió la baja",
  skipped_superseded: "No: empezó otra carga",
  skipped_no_draft: "No: sin borrador",
};

export function labelRecoveryStatus(value: string | null | undefined) {
  return recoveryStatusLabels[value ?? ""] ?? "Pendiente";
}

export const contactOutcomes = [
  { value: "sin_respuesta", label: "Sin respuesta (por ahora)" },
  { value: "respondio", label: "Respondió" },
  { value: "va_a_retomar", label: "Va a retomar la carga" },
  { value: "no_le_interesa", label: "No le interesa" },
  { value: "otro", label: "Otro (ver nota)" },
] as const;

export type ContactOutcome = (typeof contactOutcomes)[number]["value"];

export function labelContactOutcome(value: string | null | undefined) {
  return contactOutcomes.find((item) => item.value === value)?.label ?? "—";
}

/** Sugerencias para el campo de canal; se puede escribir cualquier otro. */
export const contactChannelSuggestions = ["WhatsApp", "Correo", "Llamada", "LinkedIn"];

export function interestLevel(score: number) {
  if (score >= 4) return { label: "Alto", tone: "high" as const };
  if (score >= 2) return { label: "Medio", tone: "medium" as const };
  return { label: "Inicial", tone: "low" as const };
}

export function formatLeadPhone(lead: Pick<QualifiedLead, "phone_dial_code" | "phone_number">) {
  const number = lead.phone_number?.trim();
  if (!number) return null;
  const dial = lead.phone_dial_code?.trim();
  return dial ? `${dial} ${number}` : number;
}

/** Pasos del brief (problema y descripción del desafío) y los anteriores a él. */
const BEFORE_OR_IN_BRIEF = new Set([
  "modo",
  "compania",
  "company-name",
  "organization-type",
  "organization-size",
  "country",
  "phone",
  "title",
  "problem",
  "description",
]);

export type SuggestedQuestion = {
  topic: "brief" | "sectores";
  label: string;
  text: string;
};

/**
 * Una sola pregunta concreta según el último paso (sectores vs brief), como pide el documento
 * de la pieza 4. Es una guía: quien contacta la adapta a su canal y a su forma de escribir.
 */
export function suggestedQuestion(
  lead: Pick<
    QualifiedLead,
    "last_step_id" | "brief_written" | "account_name" | "project_title" | "company_name"
  >,
): SuggestedQuestion {
  const step = lead.last_step_id ?? "";
  // En el formulario clásico el brief y los sectores están en la misma pantalla (detalles):
  // si ya escribió el problema, lo que falta son las opciones.
  const stuckInBrief =
    BEFORE_OR_IN_BRIEF.has(step) || (step === "detalles" && !lead.brief_written) || !step;

  const firstName = lead.account_name?.trim().split(/\s+/)[0];
  const greeting = firstName ? `Hola ${firstName}` : "Hola";
  const what = lead.project_title?.trim()
    ? `«${lead.project_title.trim()}»`
    : lead.company_name?.trim()
      ? `el desafío de ${lead.company_name.trim()}`
      : "tu desafío";

  if (stuckInBrief) {
    return {
      topic: "brief",
      label: "Brief: problema y descripción",
      text: `${greeting}, vi que empezaste a cargar ${what} en No Country. ¿Te trabó contar el problema o describir el desafío? Si querés, contámelo con tus palabras por acá y te ayudo a escribirlo para enviarlo a revisión.`,
    };
  }
  return {
    topic: "sectores",
    label: "Sectores y opciones del proyecto",
    text: `${greeting}, vi que empezaste a cargar ${what} en No Country. ¿Te trabó elegir el área o los sectores del proyecto? Te ayudo a definirlos en un par de minutos y lo terminás de enviar a revisión.`,
  };
}

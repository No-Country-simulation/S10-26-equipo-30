/**
 * Pieza 5 — Scoring pre-envío y cola de revisión.
 * Datos desde `public.submission_review_queue()` y flags con `set_submission_review_flags`.
 */

export type PreSubmitBand = "caliente" | "templado" | "frio";

export type ScoreBreakdownLine = {
  criterion: string;
  points: number;
};

export type SubmissionReviewQueueRow = {
  submission_id: string;
  session_id: string;
  submitted_at: string | null;
  pre_submit_score: number;
  pre_submit_band: PreSubmitBand;
  score_breakdown: ScoreBreakdownLine[] | null;
  sort_score: number;
  account_name: string | null;
  account_email: string | null;
  is_guest: boolean;
  flow_variant: string | null;
  company_name: string | null;
  organization_type: string | null;
  country: string | null;
  phone_dial_code: string | null;
  phone_number: string | null;
  project_title: string | null;
  problem_excerpt: string | null;
  review_status?: string | null;
  force_call: boolean;
  priority_bump: boolean;
  flags_note: string | null;
};

/** Suma teórica de criterios positivos del modelo v1 (sin penalizaciones). */
export const MAX_PRE_SUBMIT_SCORE = 95;

export const BAND_THRESHOLDS = {
  caliente: 55,
  templado: 30,
} as const;

export const bandLabels: Record<PreSubmitBand, string> = {
  caliente: "Caliente",
  templado: "Templado",
  frio: "Frío",
};

export function parseBreakdown(raw: unknown): ScoreBreakdownLine[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((line) => {
      if (!line || typeof line !== "object") return null;
      const row = line as Record<string, unknown>;
      const criterion = typeof row.criterion === "string" ? row.criterion : "";
      const points = typeof row.points === "number" ? row.points : Number(row.points);
      if (!criterion || Number.isNaN(points)) return null;
      return { criterion, points };
    })
    .filter((line): line is ScoreBreakdownLine => line !== null);
}

export function bandLevel(band: PreSubmitBand | string | null | undefined) {
  switch (band) {
    case "caliente":
      return { label: bandLabels.caliente, tone: "hot" as const };
    case "templado":
      return { label: bandLabels.templado, tone: "warm" as const };
    default:
      return { label: bandLabels.frio, tone: "cold" as const };
  }
}

/** Guía operativa pieza 5: contacto humano y call según banda. */
export function postEnvioHint(band: PreSubmitBand, forceCall: boolean) {
  if (forceCall) {
    return "Override: ofrecer call 15 min aunque la banda sea más baja.";
  }
  if (band === "caliente") {
    return "Instancia 1 humana en 24 h + oferta de call 15 min.";
  }
  if (band === "templado") {
    return "Email plantilla de aterrizaje; call solo si el revisor lo pide.";
  }
  return "Solo acuse automático (pieza 3); ajustes o rechazo por email sin call.";
}

export function formatReviewPhone(
  row: Pick<SubmissionReviewQueueRow, "phone_dial_code" | "phone_number">,
) {
  const number = row.phone_number?.trim();
  if (!number) return null;
  const dial = row.phone_dial_code?.trim();
  return dial ? `${dial} ${number}` : number;
}

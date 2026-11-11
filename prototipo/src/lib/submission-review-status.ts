import type { CompanyFormData, ProjectFormData } from "@/lib/form-storage";
import { asRecord } from "@/lib/research-labels";
import { parseBreakdown, type PreSubmitBand, type ScoreBreakdownLine } from "@/lib/submission-review-score";

export type ReviewWorkflowStatus =
  | "en_revision"
  | "brief_enriquecido"
  | "necesita_ajustes"
  | "aprobado"
  | "rechazado";

export const reviewStatusOptions: { value: ReviewWorkflowStatus; label: string }[] = [
  { value: "en_revision", label: "En revisión" },
  { value: "brief_enriquecido", label: "Brief enriquecido" },
  { value: "necesita_ajustes", label: "Necesita ajustes" },
  { value: "aprobado", label: "Aprobado" },
  { value: "rechazado", label: "Rechazado" },
];

export const reviewStatusLabels: Record<ReviewWorkflowStatus, string> = Object.fromEntries(
  reviewStatusOptions.map((item) => [item.value, item.label]),
) as Record<ReviewWorkflowStatus, string>;

export function labelReviewStatus(value: string | null | undefined) {
  if (!value) return "En revisión";
  return reviewStatusLabels[value as ReviewWorkflowStatus] ?? value;
}

export type SubmissionReviewDetail = {
  submission_id: string;
  session_id: string;
  submitted_at: string | null;
  company: CompanyFormData;
  project: ProjectFormData;
  pre_submit_score: number;
  pre_submit_band: PreSubmitBand;
  score_breakdown: ScoreBreakdownLine[];
  review_status: ReviewWorkflowStatus;
  review_status_note: string | null;
  review_status_updated_at: string | null;
  account_name: string | null;
  account_email: string | null;
  is_guest: boolean;
  flow_variant: string | null;
  session_started_at: string | null;
  force_call: boolean;
  priority_bump: boolean;
  flags_note: string | null;
};

export function parseSubmissionReviewDetail(raw: Record<string, unknown>): SubmissionReviewDetail | null {
  if (typeof raw.submission_id !== "string") return null;
  const company = asRecord(raw.company) as Partial<CompanyFormData>;
  const project = asRecord(raw.project) as Partial<ProjectFormData>;
  return {
    submission_id: raw.submission_id,
    session_id: String(raw.session_id ?? ""),
    submitted_at: typeof raw.submitted_at === "string" ? raw.submitted_at : null,
    company: company as CompanyFormData,
    project: project as ProjectFormData,
    pre_submit_score: Number(raw.pre_submit_score ?? 0),
    pre_submit_band: (raw.pre_submit_band as PreSubmitBand) ?? "frio",
    score_breakdown: parseBreakdown(raw.score_breakdown),
    review_status: (raw.review_status as ReviewWorkflowStatus) ?? "en_revision",
    review_status_note: typeof raw.review_status_note === "string" ? raw.review_status_note : null,
    review_status_updated_at:
      typeof raw.review_status_updated_at === "string" ? raw.review_status_updated_at : null,
    account_name: typeof raw.account_name === "string" ? raw.account_name : null,
    account_email: typeof raw.account_email === "string" ? raw.account_email : null,
    is_guest: Boolean(raw.is_guest),
    flow_variant: typeof raw.flow_variant === "string" ? raw.flow_variant : null,
    session_started_at: typeof raw.session_started_at === "string" ? raw.session_started_at : null,
    force_call: Boolean(raw.force_call),
    priority_bump: Boolean(raw.priority_bump),
    flags_note: typeof raw.flags_note === "string" ? raw.flags_note : null,
  };
}

export function projectFieldRows(project: ProjectFormData) {
  const list = (value: string[]) => (value.length ? value.join(", ") : "—");
  return [
    { label: "Título", value: project.title?.trim() || "—" },
    { label: "Problema", value: project.problem?.trim() || "—", multiline: true },
    {
      label: "Descripción del desafío",
      value: project.challengeDescription?.trim() || "—",
      multiline: true,
    },
    { label: "Entregables", value: list(project.deliverables ?? []) },
    { label: "Vertical", value: project.vertical?.trim() || "—" },
    { label: "Sectores", value: list(project.sectors ?? []) },
    { label: "Etapa", value: project.stage?.trim() || "—" },
    { label: "Impacto", value: project.impact?.trim() || "—" },
    { label: "Roles buscados", value: list(project.roles ?? []) },
    { label: "Herramientas", value: list(project.tools ?? []) },
  ];
}

export function companyFieldRows(company: CompanyFormData, dialCode?: string) {
  const phone =
    company.phoneNumber?.trim() && dialCode?.trim()
      ? `${dialCode.trim()} ${company.phoneNumber.trim()}`
      : company.phoneNumber?.trim() || "—";
  return [
    { label: "Organización", value: company.companyName?.trim() || "—" },
    { label: "Tipo", value: company.organizationType?.trim() || "—" },
    { label: "Tamaño", value: company.organizationSize?.trim() || "—" },
    { label: "País", value: company.country?.trim() || "—" },
    { label: "Teléfono", value: phone },
  ];
}

export function reviewStatusTone(status: ReviewWorkflowStatus) {
  switch (status) {
    case "aprobado":
      return "approved" as const;
    case "rechazado":
      return "rejected" as const;
    case "necesita_ajustes":
      return "adjust" as const;
    case "brief_enriquecido":
      return "enriched" as const;
    default:
      return "review" as const;
  }
}

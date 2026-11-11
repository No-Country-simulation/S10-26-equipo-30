import type { ReviewWorkflowStatus } from "@/lib/submission-review-status";

export type ProjectPlan = "free" | "starter";
export type ProjectStatus = "pending" | "active";

export type MyProject = {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  /** Estado operativo de revisión guardado en Supabase. */
  reviewStatus: ReviewWorkflowStatus;
  plan: ProjectPlan;
  sectors: string[];
  verticals: string[];
  skills: string[];
  author: string | null;
  own: boolean;
  sessionId: string;
};

export const projectStatusLabel: Record<ProjectStatus, string> = {
  pending: "Pendiente de Evaluación",
  active: "Activo",
};

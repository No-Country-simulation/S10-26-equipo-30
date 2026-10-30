export type ProjectPlan = "free" | "starter";
export type ProjectStatus = "pending" | "active";

export type MyProject = {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
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

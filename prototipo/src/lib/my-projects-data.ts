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
};

export const projectStatusLabel: Record<ProjectStatus, string> = {
  pending: "Pendiente de Evaluación",
  active: "Activo",
};

/** Réplica de companies.nocountry.tech/my-projects (datos de demostración). */
export const myProjects: MyProject[] = [
  {
    id: "test",
    title: "Test",
    description: "test",
    status: "pending",
    plan: "free",
    sectors: ["Banca"],
    verticals: ["No Code"],
    skills: [],
  },
  {
    id: "titulo-prueba",
    title: "Título de prueba",
    description:
      "Quiero entender el flujo de la carga de un proyecto de no country para la simulación",
    status: "pending",
    plan: "free",
    sectors: ["Marketing Digital / Growth", "Agrotech", "AR / VR / Metaverso"],
    verticals: ["UX Research"],
    skills: ["ActiveCampaign"],
  },
];

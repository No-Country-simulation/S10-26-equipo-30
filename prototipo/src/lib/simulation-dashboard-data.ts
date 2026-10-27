export type SimulationInsight = {
  label: string;
  value: number;
};

export type SimulationTeam = {
  id: string;
  name: string;
  project: string;
  vertical: string;
  members: number;
  messages: number;
  meetings: number;
  deliverables: number;
  locked?: boolean;
  /** Destacar fila del equipo del research (S10-26-equipo 30) */
  highlight?: boolean;
};

export type SimulationMeta = {
  title: string;
  edition: string;
  startLabel: string;
  demoDayLabel: string;
  currentWeek: number;
  totalWeeks: number;
  weekLabels: string[];
  activeWeekIndex: number;
  statusLabel: string;
  insights: SimulationInsight[];
  projects: string[];
  verticals: string[];
  teams: SimulationTeam[];
};

/** Datos estáticos inspirados en companies.nocountry.tech/simulation (Oct 2026). */
export const simulationDashboard: SimulationMeta = {
  title: "Simulación Laboral",
  edition: "Octubre 2026",
  startLabel: "Inicio: 12 de octubre de 2026",
  demoDayLabel: "Demo Day: 13 de noviembre de 2026",
  currentWeek: 3,
  totalWeeks: 5,
  weekLabels: ["S0", "S1", "S2", "S3", "S4"],
  activeWeekIndex: 2,
  statusLabel: "SIMULACIÓN ACTIVA",
  insights: [
    { label: "Inscriptos", value: 244 },
    { label: "Países", value: 17 },
    { label: "Proyectos", value: 7 },
    { label: "Equipos", value: 34 },
  ],
  projects: [
    "Todos los proyectos",
    "OpenBridge",
    "UXFlow",
    "RepuSense",
    "HostFlow",
    "NautiFlow",
    "PriceScope",
    "EcoSurvive",
  ],
  verticals: [
    "Filtrar por vertical…",
    "Cybersecurity",
    "Web App Development",
    "Cloud",
    "Product Design",
    "Game Design",
  ],
  teams: [
    {
      id: "29",
      name: "S10-26-equipo 29",
      project: "OpenBridge",
      vertical: "Cybersecurity",
      members: 9,
      messages: 457,
      meetings: 13,
      deliverables: 4,
    },
    {
      id: "30",
      name: "S10-26-equipo 30",
      project: "UXFlow",
      vertical: "Web App Development",
      members: 9,
      messages: 372,
      meetings: 11,
      deliverables: 3,
      highlight: true,
    },
    {
      id: "32",
      name: "S10-26-equipo 32",
      project: "OpenBridge",
      vertical: "Cybersecurity",
      members: 3,
      messages: 25,
      meetings: 0,
      deliverables: 0,
    },
    {
      id: "34",
      name: "S10-26-equipo 34",
      project: "RepuSense",
      vertical: "Cloud",
      members: 6,
      messages: 74,
      meetings: 1,
      deliverables: 0,
    },
    {
      id: "1",
      name: "S10-26-equipo 1",
      project: "HostFlow",
      vertical: "Web App Development",
      members: 10,
      messages: 1261,
      meetings: 24,
      deliverables: 2,
    },
    {
      id: "17",
      name: "S10-26-equipo 17",
      project: "UXFlow",
      vertical: "Web App Development",
      members: 9,
      messages: 332,
      meetings: 28,
      deliverables: 2,
    },
    {
      id: "19",
      name: "S10-26-equipo 19",
      project: "OpenBridge",
      vertical: "Cybersecurity",
      members: 9,
      messages: 727,
      meetings: 24,
      deliverables: 3,
    },
    {
      id: "31",
      name: "S10-26-equipo 31",
      project: "EcoSurvive",
      vertical: "Game Design",
      members: 9,
      messages: 599,
      meetings: 11,
      deliverables: 3,
      locked: true,
    },
    {
      id: "11",
      name: "S10-26-equipo 11",
      project: "UXFlow",
      vertical: "Web App Development",
      members: 8,
      messages: 140,
      meetings: 3,
      deliverables: 2,
    },
    {
      id: "6",
      name: "S10-26-equipo 6",
      project: "RepuSense",
      vertical: "Cloud",
      members: 8,
      messages: 274,
      meetings: 10,
      deliverables: 2,
    },
  ],
};

export type AppRole = "tester" | "researcher" | "admin" | "marketing";

export type AuthUserSummary = {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  isAnonymous: boolean;
  role: AppRole;
  /** Equipo de research (researcher o admin): puede entrar al panel y ver todos los proyectos. */
  isResearcher: boolean;
  /** Puede ver los leads calificados de la pieza 4 (marketing, researcher o admin). */
  canSeeLeads: boolean;
};

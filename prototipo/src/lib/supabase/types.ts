export type AppRole = "tester" | "researcher" | "admin";

export type AuthUserSummary = {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  isAnonymous: boolean;
  role: AppRole;
  /** Equipo de research (researcher o admin): puede entrar al panel y ver todos los proyectos. */
  isResearcher: boolean;
};

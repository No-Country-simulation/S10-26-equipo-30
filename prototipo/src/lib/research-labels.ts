import { guidedSteps } from "@/lib/guided-steps";

const flowPieces: Record<string, string> = {
  dashboard_publico: "Tablero público",
  formulario_inicial: "Formulario inicial",
  post_envio: "Después del envío",
  recuperacion_abandonos: "Recuperación de abandonos",
  contexto_adicional: "Contexto adicional",
  aprobacion_post_aprobacion: "Aprobación y después",
};

const variants: Record<string, string> = {
  classic: "Formulario clásico",
  guided: "Preguntas guiadas",
};

const statuses: Record<string, string> = {
  in_progress: "En curso",
  submitted: "Enviado",
  abandoned: "Abandonado",
};

/** Sin eventos nuevos en este lapso, la prueba cuenta como abandonada. Cubre cerrar la pestaña. */
export const INACTIVITY_LIMIT_MS = 10 * 60 * 1000;

export function sessionStatus(
  status: string | null | undefined,
  lastActivity: string | null | undefined,
) {
  if (status !== "in_progress") return status ?? "";
  if (!lastActivity) return "in_progress";
  const at = new Date(lastActivity).getTime();
  if (Number.isNaN(at) || Date.now() - at < INACTIVITY_LIMIT_MS) return "in_progress";
  return "abandoned";
}

const roles: Record<string, string> = {
  tester: "Participante",
  researcher: "Equipo de research",
  admin: "Administración",
};

const events: Record<string, string> = {
  session_start: "Empezó la prueba",
  mode_selected: "Eligió el tipo de formulario",
  screen_view: "Abrió una pantalla",
  screen_complete: "Completó una pantalla",
  step_view: "Vio una pregunta",
  step_back: "Volvió atrás",
  step_complete: "Respondió una pregunta",
  validation_error: "Faltó un dato obligatorio",
  submit_success: "Envió el proyecto",
  post_envio_view: "Vio la confirmación de envío",
  dashboard_view: "Abrió el tablero de simulación",
};

const screens: Record<string, string> = {
  modo: "Elección del tipo de formulario",
  compania: "Información de la compañía",
  detalles: "Detalles del proyecto",
  submit: "Envío",
  "post-envio": "Confirmación",
  simulation: "Tablero de simulación",
};

const classicViews = ["modo", "compania", "detalles", "submit", "post-envio"];

const snapshotReasons: Record<string, string> = {
  checkpoint: "Guardado automático",
  step_complete: "Completó una pregunta",
  screen_complete: "Completó una pantalla",
  submit: "Al enviar",
  abandon: "Al abandonar",
  visibility_hidden: "Al salir de la pestaña",
  manual: "Guardado manual",
};

export function labelFlowPiece(value: string | null | undefined) {
  if (!value) return "—";
  return flowPieces[value] ?? value;
}

export function labelVariant(value: string | null | undefined) {
  if (!value) return "No aplica";
  return variants[value] ?? value;
}

export function labelStatus(value: string | null | undefined) {
  if (!value) return "—";
  return statuses[value] ?? value;
}

export function labelRole(value: string | null | undefined) {
  if (!value) return "—";
  return roles[value] ?? value;
}

export function labelEvent(value: string | null | undefined) {
  if (!value) return "—";
  return events[value] ?? value;
}

export function labelEventStep(
  eventType: string | null | undefined,
  stepId: string | null | undefined,
  payload: Record<string, unknown>,
  variant?: string | null,
) {
  if (eventType === "step_back") {
    const from = labelStep(typeof payload.from === "string" ? payload.from : null, variant);
    const to = labelStep(typeof payload.to === "string" ? payload.to : stepId, variant);
    if (from !== "—" && to !== "—") return `De ${from} a ${to}`;
  }
  return labelStep(stepId, variant);
}

export function labelStep(value: string | null | undefined, variant?: string | null) {
  if (!value) return "—";
  const guidedIndex = guidedSteps.findIndex((step) => step.id === value);
  if (guidedIndex >= 0) {
    return numbered(guidedSteps[guidedIndex].question, guidedIndex + 1);
  }
  const screen = screens[value];
  if (!screen) return value;
  if (value === "simulation") return screen;
  if (variant === "guided") {
    if (value === "submit") return numbered(screen, guidedSteps.length + 1);
    if (value === "post-envio") return numbered(screen, guidedSteps.length + 2);
    if (value === "modo") return screen;
  }
  const classicIndex = classicViews.indexOf(value);
  if (classicIndex >= 0) return numbered(screen, classicIndex + 1);
  return screen;
}

function numbered(label: string, position: number) {
  return `${label} ( ${position} )`;
}

export function labelSnapshotReason(value: string | null | undefined) {
  if (!value) return "—";
  return snapshotReasons[value] ?? value;
}

export function formatDuration(from: string | null | undefined, to: string | null | undefined) {
  if (!from || !to) return "—";
  const start = new Date(from).getTime();
  const end = new Date(to).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return "—";
  return formatElapsed(end - start);
}

function formatElapsed(ms: number) {
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds} s`;
  const minutes = Math.floor(seconds / 60);
  const remSeconds = seconds % 60;
  if (minutes < 60) {
    return remSeconds === 0 ? `${minutes} min` : `${minutes} min ${remSeconds} s`;
  }
  const hours = Math.floor(minutes / 60);
  const remMinutes = minutes % 60;
  if (hours < 48) {
    return remMinutes === 0 ? `${hours} h` : `${hours} h ${remMinutes} min`;
  }
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return remHours === 0 ? `${days} d` : `${days} d ${remHours} h`;
}

export function formatWhen(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export function asRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

export function textField(record: Record<string, unknown>, key: string) {
  const value = record[key];
  if (typeof value !== "string" || !value.trim()) return "—";
  return value.trim();
}

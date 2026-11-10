"use client";

import { countries, dialCodeForCountry } from "@/lib/countries";
import { organizationSizes, organizationTypes } from "@/lib/form-options";
import {
  clearDraft,
  loadDraft,
  markCompanyPrefilled,
  saveCompany,
  saveProject,
  type CompanyFormData,
  type ProjectDraft,
} from "@/lib/form-storage";
import { firstIncompleteStep, GUIDED_STEP_STORAGE_KEY, guidedSteps } from "@/lib/guided-steps";
import { createClient } from "@/lib/supabase/client";

export type FormFlowVariant = "classic" | "guided";

export type ExperienceRating = "sencilla" | "neutra" | "frustrante";

const FORM_SESSION_KEY = "nocountry-form-session-id";
const DASHBOARD_SESSION_KEY = "nocountry-dashboard-session-id";
const LAST_STEP_KEY = "nocountry-form-last-step";
const CONFIRMATION_EMAIL_KEY = "nocountry-confirmation-email";

const classicStepOrder = ["modo", "compania", "detalles", "submit", "post-envio"];

type SupabaseError = { message: string; code?: string };

function clientMeta(guest: boolean) {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    viewport: { width: window.innerWidth, height: window.innerHeight },
    guest,
  };
}

function prototypeVersion() {
  const sha = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.trim();
  return sha || "local";
}

function toError(error: SupabaseError): Error {
  if (error.code === "23503") {
    return new Error(
      "Tu perfil todavía no está en la base. Cerrá sesión y volvé a entrar.",
    );
  }
  if (error.code === "42501") {
    return new Error("No tenés permiso para guardar esta sesión. Volvé a iniciar sesión.");
  }
  if (error.code === "PGRST205") {
    return new Error(
      "El comentario todavía no está habilitado en la base. El proyecto igual quedó enviado.",
    );
  }
  return new Error(error.message);
}

/** No hay sesión de Supabase: la UI debe llevar al login en vez de mostrar el mensaje. */
export class AuthRequiredError extends Error {
  constructor() {
    super("Tenés que iniciar sesión para guardar el test.");
    this.name = "AuthRequiredError";
  }
}

export function isAuthRequired(error: unknown): error is AuthRequiredError {
  return error instanceof AuthRequiredError;
}

/** Navegación completa: el middleware revisa la sesión y no queda estado viejo en memoria. */
export function redirectToLogin(nextPath: string) {
  window.location.assign(`/login?next=${encodeURIComponent(nextPath)}`);
}

/**
 * Se perdió la sesión a mitad del formulario: se olvida el test viejo y, tras el login,
 * se vuelve a elegir el modo para abrir un test nuevo (el borrador del formulario se conserva).
 */
export function restartAfterLogin() {
  clearResearchSession();
  redirectToLogin("/cargar-proyecto/modo");
}

/** Olvida las sesiones de test del usuario anterior (pertenecen a otra cuenta). */
export function clearResearchSession() {
  sessionStorage.removeItem(FORM_SESSION_KEY);
  sessionStorage.removeItem(DASHBOARD_SESSION_KEY);
  sessionStorage.removeItem(LAST_STEP_KEY);
}

/**
 * Sesión local del navegador. No consulta `/auth/v1/user` en cada paso:
 * el token viaja en cada escritura y RLS es quien autoriza.
 * Si el access token está por vencer, el cliente lo renueva solo.
 */
async function requireUser() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (error || !user) {
    throw new AuthRequiredError();
  }
  const guest = Boolean(user.is_anonymous) || !user.email;
  return { supabase, userId: user.id, guest };
}

let persistenceTail: Promise<void> = Promise.resolve();

/** Las escrituras del formulario corren en orden, sin frenar la pantalla. */
function enqueuePersistence<T>(task: () => Promise<T>): Promise<T> {
  const result = persistenceTail.then(task, task);
  persistenceTail = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

export function flushFormPersistence(): Promise<void> {
  return persistenceTail;
}

// ---------------------------------------------------------------------------
// Autoguardado del borrador (pieza 4: sin borrador no hay recuperación posible)
// ---------------------------------------------------------------------------

const AUTOSAVE_DELAY_MS = 2_000;

export type DraftSaveStatus = "idle" | "saving" | "saved";

let lastSavedDraftSignature = "";
let pendingAutosave: { draft: ProjectDraft; stepId: string } | null = null;
let autosaveTimer: ReturnType<typeof setTimeout> | null = null;
let draftSaveStatus: DraftSaveStatus = "idle";
const draftSaveListeners = new Set<() => void>();

function setDraftSaveStatus(status: DraftSaveStatus) {
  draftSaveStatus = status;
  draftSaveListeners.forEach((listener) => listener());
}

export function subscribeToDraftSaveStatus(listener: () => void) {
  draftSaveListeners.add(listener);
  return () => {
    draftSaveListeners.delete(listener);
  };
}

export function getDraftSaveStatus() {
  return draftSaveStatus;
}

/** Toma el borrador cargado como punto de partida: solo se guardan cambios posteriores. */
export function primeDraftAutosave(draft: ProjectDraft) {
  lastSavedDraftSignature = JSON.stringify(draft);
}

/** Guarda el borrador en la base unos segundos después del último cambio. */
export function scheduleDraftAutosave(draft: ProjectDraft, stepId: string) {
  if (!formSessionId()) return;
  pendingAutosave = { draft, stepId };
  if (autosaveTimer) clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => {
    void flushDraftAutosave("autosave");
  }, AUTOSAVE_DELAY_MS);
}

/** Guarda ya lo pendiente (por ejemplo, al ocultar la pestaña). */
export function flushDraftAutosave(captureReason = "autosave"): Promise<void> {
  if (autosaveTimer) {
    clearTimeout(autosaveTimer);
    autosaveTimer = null;
  }
  const pending = pendingAutosave;
  pendingAutosave = null;
  if (!pending || JSON.stringify(pending.draft) === lastSavedDraftSignature) {
    return Promise.resolve();
  }
  setDraftSaveStatus("saving");
  return saveFormCheckpoint(pending.draft, pending.stepId, captureReason).then(
    () => setDraftSaveStatus("saved"),
    () => {
      lastSavedDraftSignature = "";
      setDraftSaveStatus("idle");
    },
  );
}

function formSessionId() {
  return sessionStorage.getItem(FORM_SESSION_KEY);
}

function stepRank(stepId: string) {
  const classic = classicStepOrder.indexOf(stepId);
  if (classic >= 0) return { flow: "classic" as const, rank: classic };
  const guided = guidedSteps.findIndex((step) => step.id === stepId);
  if (guided >= 0) return { flow: "guided" as const, rank: guided + 1 };
  return null;
}

function isBackward(fromStepId: string, toStepId: string) {
  if (fromStepId === toStepId) return false;
  if (toStepId === "modo") return true;
  const from = stepRank(fromStepId);
  const to = stepRank(toStepId);
  if (!from || !to || from.flow !== to.flow) return false;
  return to.rank < from.rank;
}

function rememberStep(stepId: string) {
  sessionStorage.setItem(LAST_STEP_KEY, stepId);
}

function claimReturnToMode() {
  const lastStep = sessionStorage.getItem(LAST_STEP_KEY);
  if (!lastStep || lastStep === "modo") return null;
  rememberStep("modo");
  return lastStep;
}

async function insertStepBack(
  supabase: Awaited<ReturnType<typeof requireUser>>["supabase"],
  sessionId: string,
  fromStepId: string,
  toStepId: string,
) {
  await supabase.from("session_events").insert({
    session_id: sessionId,
    event_type: "step_back",
    step_id: toStepId,
    payload: { from: fromStepId, to: toStepId },
  });
  await supabase
    .from("test_sessions")
    .update({ current_step_id: toStepId })
    .eq("id", sessionId)
    .eq("status", "in_progress");
}

export async function startFormTestSession(variant: FormFlowVariant) {
  const { supabase, userId, guest } = await requireUser();
  const previousId = formSessionId();

  if (previousId) {
    const lastStep = claimReturnToMode();
    if (lastStep) {
      await insertStepBack(supabase, previousId, lastStep, "modo");
    }
    await supabase
      .from("test_sessions")
      .update({
        status: "abandoned",
        completed_at: new Date().toISOString(),
      })
      .eq("id", previousId)
      .eq("user_id", userId)
      .eq("status", "in_progress");
  }

  rememberStep("modo");

  const { data, error } = await supabase
    .from("test_sessions")
    .insert({
      user_id: userId,
      flow_piece: "formulario_inicial",
      flow_variant: variant,
      status: "in_progress",
      prototype_version: prototypeVersion(),
      preview_url: window.location.href,
      client_meta: clientMeta(guest),
    })
    .select("id")
    .single();

  if (error || !data) {
    throw toError(error ?? { message: "No se pudo crear la sesión de test." });
  }

  sessionStorage.setItem(FORM_SESSION_KEY, data.id);
  lastSavedDraftSignature = "";
  setDraftSaveStatus("idle");

  const { error: eventError } = await supabase.from("session_events").insert([
    {
      session_id: data.id,
      event_type: "session_start",
      payload: { variant },
    },
    {
      session_id: data.id,
      event_type: "mode_selected",
      payload: { variant },
    },
  ]);

  if (eventError) {
    throw toError(eventError);
  }

  if (!guest) {
    const prefilled = await prefillCompanyFromLastSubmission(supabase, userId).catch(() => false);
    if (prefilled) {
      await supabase.from("session_events").insert({
        session_id: data.id,
        event_type: "company_prefilled",
        step_id: "compania",
        payload: { source: "last_submission" },
      });
    }
  }

  return data.id;
}

export type ResumeSource = "email" | "aviso";

export class ResumeUnavailableError extends Error {
  constructor(
    message: string,
    readonly alreadySubmitted = false,
  ) {
    super(message);
    this.name = "ResumeUnavailableError";
  }
}

function isCompanyComplete(company: Partial<CompanyFormData>) {
  return Boolean(
    company.companyName?.trim() &&
      company.organizationType &&
      company.organizationSize &&
      company.country &&
      company.phoneNumber?.trim(),
  );
}

/**
 * Retoma una carga sin terminar desde su último borrador en la base (misma sesión de test).
 * Devuelve la ruta del paso donde quedó.
 */
export async function resumeFormSession(sessionId: string, source: ResumeSource): Promise<string> {
  const { supabase, userId } = await requireUser();

  const { data: session } = await supabase
    .from("test_sessions")
    .select("id, status, flow_piece, flow_variant")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!session || session.flow_piece !== "formulario_inicial") {
    throw new ResumeUnavailableError(
      "No encontramos este borrador en tu cuenta. Entrá con la misma cuenta con la que empezaste.",
    );
  }
  if (session.status === "submitted") {
    throw new ResumeUnavailableError("Este desafío ya fue enviado a revisión.", true);
  }

  const { data: snapshot } = await supabase
    .from("form_draft_snapshots")
    .select("company, project, step_id, capture_reason")
    .eq("session_id", sessionId)
    .order("captured_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!snapshot) {
    throw new ResumeUnavailableError("Este borrador ya no tiene datos guardados.");
  }

  const previousId = formSessionId();
  if (previousId && previousId !== sessionId) {
    await supabase
      .from("test_sessions")
      .update({ status: "abandoned", completed_at: new Date().toISOString() })
      .eq("id", previousId)
      .eq("user_id", userId)
      .eq("status", "in_progress");
  }
  if (session.status !== "in_progress") {
    await supabase
      .from("test_sessions")
      .update({ status: "in_progress", completed_at: null })
      .eq("id", sessionId)
      .eq("user_id", userId);
  }

  clearDraft();
  saveCompany(snapshot.company);
  saveProject(snapshot.project);
  const draft = loadDraft();
  sessionStorage.setItem(FORM_SESSION_KEY, sessionId);
  lastSavedDraftSignature = JSON.stringify(draft);
  setDraftSaveStatus("idle");

  let href: string;
  let stepId: string;
  if (session.flow_variant === "guided") {
    const savedIndex = guidedSteps.findIndex((step) => step.id === snapshot.step_id);
    const index =
      savedIndex < 0
        ? firstIncompleteStep(draft)
        : Math.min(
            snapshot.capture_reason === "step_complete" ? savedIndex + 1 : savedIndex,
            guidedSteps.length - 1,
          );
    sessionStorage.setItem(GUIDED_STEP_STORAGE_KEY, String(index));
    href = "/cargar-proyecto/guiado";
    stepId = guidedSteps[index].id;
  } else {
    const toDetails = snapshot.step_id === "detalles" || isCompanyComplete(draft.company);
    href = toDetails ? "/cargar-proyecto/detalles" : "/cargar-proyecto/compania";
    stepId = toDetails ? "detalles" : "compania";
  }
  rememberStep(stepId);

  await supabase.from("session_events").insert({
    session_id: sessionId,
    event_type: "draft_resumed",
    step_id: stepId,
    payload: { source },
  });

  return href;
}

export type UnfinishedDraft = {
  sessionId: string;
  title: string;
  companyName: string;
  savedAt: string;
};

/** Última carga sin enviar del usuario con borrador guardado, de los últimos días. */
export async function findUnfinishedDraft(maxAgeDays = 7): Promise<UnfinishedDraft | null> {
  const { supabase, userId } = await requireUser();
  const since = new Date(Date.now() - maxAgeDays * 24 * 60 * 60 * 1000).toISOString();

  const { data: sessions } = await supabase
    .from("test_sessions")
    .select("id, status")
    .eq("user_id", userId)
    .eq("flow_piece", "formulario_inicial")
    .gte("last_activity_at", since)
    .order("last_activity_at", { ascending: false })
    .limit(10);
  // Lo anterior a un envío ya no cuenta: la persona terminó una carga después.
  const lastSubmitted = (sessions ?? []).findIndex((session) => session.status === "submitted");
  const ids = (lastSubmitted < 0 ? (sessions ?? []) : (sessions ?? []).slice(0, lastSubmitted))
    .map((session) => session.id)
    .filter((id) => id !== formSessionId());
  if (ids.length === 0) return null;

  const { data: snapshot } = await supabase
    .from("form_draft_snapshots")
    .select("session_id, company, project, captured_at")
    .in("session_id", ids)
    .order("captured_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!snapshot) return null;

  const company = (snapshot.company ?? {}) as Partial<CompanyFormData>;
  const project = (snapshot.project ?? {}) as Partial<ProjectDraft["project"]>;
  return {
    sessionId: snapshot.session_id,
    title: project.title?.trim() ?? "",
    companyName: company.companyName?.trim() ?? "",
    savedAt: snapshot.captured_at,
  };
}

/** Descarta valores que ya no existen en las opciones actuales del formulario. */
function sanitizeCompany(raw: Partial<Record<keyof CompanyFormData, unknown>>): CompanyFormData {
  const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");
  const oneOf = (value: unknown, allowed: readonly string[]) =>
    allowed.includes(text(value)) ? text(value) : "";
  const country = oneOf(
    raw.country,
    countries.map((c) => c.name),
  );
  return {
    companyName: text(raw.companyName),
    organizationType: oneOf(raw.organizationType, organizationTypes),
    organizationSize: oneOf(raw.organizationSize, organizationSizes),
    country,
    phoneDialCode: dialCodeForCountry(country),
    phoneNumber: text(raw.phoneNumber),
  };
}

/**
 * Para quien entró con Google: completa la organización con su último envío.
 * No pisa un borrador en curso. Filtra por usuario porque el equipo de research ve todos los envíos.
 */
async function prefillCompanyFromLastSubmission(
  supabase: ReturnType<typeof createClient>,
  userId: string,
): Promise<boolean> {
  if (loadDraft().company.companyName.trim()) return false;

  const { data, error } = await supabase
    .from("project_submissions")
    .select("company, test_sessions!inner(user_id)")
    .eq("test_sessions.user_id", userId)
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data?.company) return false;

  const company = sanitizeCompany(data.company);
  if (!company.companyName) return false;

  saveCompany(company);
  markCompanyPrefilled();
  sessionStorage.setItem(GUIDED_STEP_STORAGE_KEY, "0");
  return true;
}

const answeredClassicQuestions = new Set<string>();
let lastActivityTouch = 0;

export function viewClassicQuestion(stepId: string) {
  if (sessionStorage.getItem(LAST_STEP_KEY) === stepId) return;
  void logFormEvent("step_view", stepId).catch(() => {});
}

export function answerClassicQuestion(stepId: string, filled: boolean) {
  if (!filled || answeredClassicQuestions.has(stepId)) return;
  answeredClassicQuestions.add(stepId);
  void logFormEvent("step_complete", stepId).catch(() => {});
}

export function touchFormActivity() {
  const now = Date.now();
  if (now - lastActivityTouch < 60_000) return;
  const sessionId = formSessionId();
  if (!sessionId) return;
  lastActivityTouch = now;
  void (async () => {
    const { supabase, userId } = await requireUser();
    await supabase
      .from("test_sessions")
      .update({ last_activity_at: new Date().toISOString() })
      .eq("id", sessionId)
      .eq("user_id", userId)
      .eq("status", "in_progress");
  })().catch(() => {});
}

export async function noteReturnedToMode() {
  const sessionId = formSessionId();
  const lastStep = claimReturnToMode();
  if (!sessionId || !lastStep) return;
  const { supabase } = await requireUser();
  await insertStepBack(supabase, sessionId, lastStep, "modo");
}

export function logFormEvent(
  eventType: string,
  stepId?: string | null,
  payload: Record<string, unknown> = {},
) {
  const sessionId = formSessionId();
  if (!sessionId) return Promise.resolve();
  const stamped = { ...payload, occurred_at: new Date().toISOString() };
  return enqueuePersistence(() => writeFormEvent(sessionId, eventType, stepId, stamped));
}

async function writeFormEvent(
  sessionId: string,
  eventType: string,
  stepId?: string | null,
  payload: Record<string, unknown> = {},
) {
  const { supabase, userId } = await requireUser();
  const isView = eventType === "step_view" || eventType === "screen_view";
  if (isView && stepId) {
    const lastStep = sessionStorage.getItem(LAST_STEP_KEY);
    if (lastStep && isBackward(lastStep, stepId)) {
      await insertStepBack(supabase, sessionId, lastStep, stepId);
    }
    rememberStep(stepId);
  }

  const { error } = await supabase.from("session_events").insert({
    session_id: sessionId,
    event_type: eventType,
    step_id: stepId ?? null,
    payload,
  });
  if (error) throw toError(error);

  if (stepId) {
    await supabase
      .from("test_sessions")
      .update({ current_step_id: stepId })
      .eq("id", sessionId)
      .eq("user_id", userId)
      .eq("status", "in_progress");
  }
}

/**
 * Borrador + pregunta completada, en una sola tanda y sin bloquear el avance.
 * El paso en el que está la persona lo actualiza el `step_view` de la pregunta siguiente.
 */
export function saveGuidedStepProgress(draft: ProjectDraft, stepId: string) {
  const sessionId = formSessionId();
  if (!sessionId) return Promise.resolve();
  const occurredAt = new Date().toISOString();
  lastSavedDraftSignature = JSON.stringify(draft);
  return enqueuePersistence(async () => {
    const { supabase } = await requireUser();
    const [snapshot, event] = await Promise.all([
      supabase.from("form_draft_snapshots").insert({
        session_id: sessionId,
        company: draft.company,
        project: draft.project,
        step_id: stepId,
        capture_reason: "step_complete",
      }),
      supabase.from("session_events").insert({
        session_id: sessionId,
        event_type: "step_complete",
        step_id: stepId,
        payload: { occurred_at: occurredAt },
      }),
    ]);
    if (snapshot.error) throw toError(snapshot.error);
    if (event.error) throw toError(event.error);
  });
}

/** Se encola como el resto de las escrituras: quien llama puede avanzar sin esperarla. */
export function saveFormCheckpoint(draft: ProjectDraft, stepId: string, captureReason: string) {
  const sessionId = formSessionId();
  if (!sessionId) return Promise.resolve();
  lastSavedDraftSignature = JSON.stringify(draft);

  return enqueuePersistence(async () => {
    const { supabase } = await requireUser();
    const { error } = await supabase.from("form_draft_snapshots").insert({
      session_id: sessionId,
      company: draft.company,
      project: draft.project,
      step_id: stepId,
      capture_reason: captureReason,
    });
    if (error) throw toError(error);
  });
}

export async function submitFormTest(draft: ProjectDraft) {
  const sessionId = formSessionId();
  if (!sessionId) {
    throw new Error("No hay una sesión de test activa. Volvé a elegir el tipo de formulario.");
  }

  const { supabase, userId, guest } = await requireUser();
  const { error: submissionError } = await supabase.from("project_submissions").insert({
    session_id: sessionId,
    company: draft.company,
    project: draft.project,
  });

  if (submissionError && submissionError.code !== "23505") {
    throw toError(submissionError);
  }

  const completedAt = new Date().toISOString();
  const { error: statusError } = await supabase
    .from("test_sessions")
    .update({
      status: "submitted",
      completed_at: completedAt,
      current_step_id: "submit",
    })
    .eq("id", sessionId)
    .eq("user_id", userId);

  if (statusError) throw toError(statusError);

  await supabase.from("session_events").insert({
    session_id: sessionId,
    event_type: "submit_success",
    step_id: "submit",
    payload: {},
  });
  sessionStorage.removeItem(LAST_STEP_KEY);

  if (guest) {
    sessionStorage.removeItem(CONFIRMATION_EMAIL_KEY);
  } else {
    sessionStorage.setItem(CONFIRMATION_EMAIL_KEY, "1");
    requestConfirmationEmail(sessionId);
  }
}

/** `keepalive` deja que el pedido termine aunque la pantalla ya haya navegado al éxito. */
function requestConfirmationEmail(sessionId: string) {
  void fetch("/api/emails/submission-confirmation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId }),
    keepalive: true,
  }).catch(() => {});
}

/** Si el último envío pidió el correo de confirmación (los invitados no tienen correo). */
export function confirmationEmailRequested() {
  return typeof window !== "undefined" && sessionStorage.getItem(CONFIRMATION_EMAIL_KEY) === "1";
}

/** Opinión posterior al envío. No registra un evento: queda fuera del análisis del formulario. */
export async function loadExperienceFeedback(): Promise<{
  rating: ExperienceRating;
  comment: string;
} | null> {
  const sessionId = formSessionId();
  if (!sessionId) return null;

  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("session_experience_feedback")
    .select("rating, comment")
    .eq("session_id", sessionId)
    .maybeSingle();

  if (error) throw toError(error);
  if (!data) return null;
  const rating = data.rating;
  if (rating !== "sencilla" && rating !== "neutra" && rating !== "frustrante") return null;
  return { rating, comment: typeof data.comment === "string" ? data.comment : "" };
}

export function hasFormSession() {
  return Boolean(formSessionId());
}

export async function saveExperienceFeedback(rating: ExperienceRating, comment: string) {
  const sessionId = formSessionId();
  if (!sessionId) {
    throw new Error("No encontramos la sesión de este envío. El proyecto igual quedó enviado.");
  }

  const { supabase } = await requireUser();
  const trimmed = comment.trim();
  const { error } = await supabase.from("session_experience_feedback").insert({
    session_id: sessionId,
    rating,
    comment: trimmed ? trimmed.slice(0, 2000) : null,
  });

  if (error?.code === "23505") {
    throw new Error("Ya registramos tu comentario para este envío.");
  }
  if (error) throw toError(error);
}

let dashboardStart: Promise<void> | null = null;

export function ensureDashboardSession() {
  if (typeof window === "undefined") return Promise.resolve();
  if (sessionStorage.getItem(DASHBOARD_SESSION_KEY)) return Promise.resolve();
  dashboardStart ??= createDashboardSession();
  return dashboardStart;
}

async function createDashboardSession() {
  const { supabase, userId, guest } = await requireUser();
  const { data, error } = await supabase
    .from("test_sessions")
    .insert({
      user_id: userId,
      flow_piece: "dashboard_publico",
      status: "in_progress",
      prototype_version: prototypeVersion(),
      preview_url: window.location.href,
      client_meta: clientMeta(guest),
      current_step_id: "simulation",
    })
    .select("id")
    .single();

  if (error || !data) throw toError(error ?? { message: "No se pudo registrar el dashboard." });

  sessionStorage.setItem(DASHBOARD_SESSION_KEY, data.id);
  await supabase.from("session_events").insert({
    session_id: data.id,
    event_type: "dashboard_view",
    step_id: "simulation",
    payload: {},
  });
}

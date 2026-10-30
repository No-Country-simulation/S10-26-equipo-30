"use client";

import { createClient } from "@/lib/supabase/client";
import type { ProjectDraft } from "@/lib/form-storage";

export type FormFlowVariant = "classic" | "guided";

const FORM_SESSION_KEY = "nocountry-form-session-id";
const DASHBOARD_SESSION_KEY = "nocountry-dashboard-session-id";

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
  return new Error(error.message);
}

async function requireUser() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error("Tenés que iniciar sesión para guardar el test.");
  }
  const guest = Boolean(data.user.is_anonymous) || !data.user.email;
  return { supabase, userId: data.user.id, guest };
}

function formSessionId() {
  return sessionStorage.getItem(FORM_SESSION_KEY);
}

export async function startFormTestSession(variant: FormFlowVariant) {
  const { supabase, userId, guest } = await requireUser();
  const previousId = formSessionId();

  if (previousId) {
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

  return data.id;
}

export async function logFormEvent(
  eventType: string,
  stepId?: string | null,
  payload: Record<string, unknown> = {},
) {
  const sessionId = formSessionId();
  if (!sessionId) return;

  const { supabase, userId } = await requireUser();
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

export async function saveFormCheckpoint(
  draft: ProjectDraft,
  stepId: string,
  captureReason: string,
) {
  const sessionId = formSessionId();
  if (!sessionId) return;

  const { supabase } = await requireUser();
  const { error } = await supabase.from("form_draft_snapshots").insert({
    session_id: sessionId,
    company: draft.company,
    project: draft.project,
    step_id: stepId,
    capture_reason: captureReason,
  });
  if (error) throw toError(error);
}

export async function submitFormTest(draft: ProjectDraft) {
  const sessionId = formSessionId();
  if (!sessionId) {
    throw new Error("No hay una sesión de test activa. Volvé a elegir el tipo de formulario.");
  }

  const { supabase, userId } = await requireUser();
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

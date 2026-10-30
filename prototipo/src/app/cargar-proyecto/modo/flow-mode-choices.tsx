"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { LoadingPin } from "@/components/loading-pin";
import {
  formatRemainingTime,
  formatStepCounter,
  guidedSteps,
  progressPercent,
  remainingSeconds,
} from "@/lib/guided-steps";
import {
  isAuthRequired,
  noteReturnedToMode,
  redirectToLogin,
  startFormTestSession,
  type FormFlowVariant,
} from "@/lib/research-persistence";

/** Parámetro con el que se vuelve del login para continuar con el flujo elegido. */
const CHOSEN_FLOW_PARAM = "flujo";

const firstGuidedStep = guidedSteps[0];

const flowOptions: {
  id: FormFlowVariant;
  href: string;
  title: string;
  description: string;
  sketch: ReactNode;
}[] = [
  {
    id: "classic",
    href: "/cargar-proyecto/compania",
    title: "Formulario clásico",
    description:
      "Dos pantallas completas: información de la compañía y luego detalles del proyecto, como en el diseño original.",
    sketch: <ClassicSketch />,
  },
  {
    id: "guided",
    href: "/cargar-proyecto/guiado",
    title: "Preguntas guiadas",
    description:
      "Una pregunta por pantalla, con progreso y tiempo estimado. Misma información, recorrido más conversacional.",
    sketch: <GuidedSketch />,
  },
];

/** Primer paso del formulario clásico: todos los campos juntos en una pantalla. */
function ClassicSketch() {
  return (
    <div className="flow-sketch flow-sketch--classic" aria-hidden="true">
      <div className="flow-sketch-bar">
        <span className="flow-sketch-back">←</span>
        <span className="gradient-btn flow-sketch-btn">
          <span>Continuar</span>
          <span>→</span>
        </span>
      </div>
      <p className="section-heading flow-sketch-heading">
        <span className="section-icon">🏢</span>
        Información de la Compañía
      </p>
      <div className="flow-sketch-field">
        <span className="flow-sketch-label">
          Nombre de la Compañía<span className="field-required">*</span>
        </span>
        <span className="flow-sketch-input">Ej. InnovaSoft</span>
      </div>
      <div className="flow-sketch-row">
        <div className="flow-sketch-field">
          <span className="flow-sketch-label">
            Tipo de organización<span className="field-required">*</span>
          </span>
          <span className="flow-sketch-input">Seleccionar…</span>
        </div>
        <div className="flow-sketch-field">
          <span className="flow-sketch-label">
            Tamaño de la organización<span className="field-required">*</span>
          </span>
          <span className="flow-sketch-input">Seleccionar…</span>
        </div>
      </div>
    </div>
  );
}

/** Primera pregunta guiada: una sola pregunta con progreso y tiempo restante. */
function GuidedSketch() {
  const seconds = remainingSeconds(0);
  return (
    <div className="flow-sketch flow-sketch--guided" aria-hidden="true">
      <div className="flow-sketch-top">
        <span className="flow-sketch-step">{formatStepCounter(0)}</span>
        <span className="flow-sketch-time">{formatRemainingTime(seconds)}</span>
      </div>
      <div className="guided-track">
        <div className="guided-fill" style={{ width: `${progressPercent(0)}%` }} />
      </div>
      <p className="flow-sketch-section">{firstGuidedStep.sectionLabel}</p>
      <p className="flow-sketch-question">
        {firstGuidedStep.question}
        <span className="field-required">*</span>
      </p>
      <span className="flow-sketch-input">
        {"placeholder" in firstGuidedStep ? firstGuidedStep.placeholder : ""}
      </span>
      <div className="flow-sketch-bar">
        <span className="flow-sketch-back">← Atrás</span>
        <span className="gradient-btn flow-sketch-btn">
          <span>Continuar</span>
          <span>→</span>
        </span>
      </div>
    </div>
  );
}

export function FlowModeChoices() {
  const router = useRouter();
  const [pending, setPending] = useState<FormFlowVariant | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resumed = useRef(false);

  async function start(variant: FormFlowVariant, href: string) {
    if (pending) return;
    setPending(variant);
    setError(null);
    try {
      await startFormTestSession(variant);
      router.push(href);
    } catch (cause) {
      if (isAuthRequired(cause)) {
        // Sin sesión: primero el login, y al volver se retoma este mismo flujo.
        redirectToLogin(`/cargar-proyecto/modo?${CHOSEN_FLOW_PARAM}=${variant}`);
        return;
      }
      setError(cause instanceof Error ? cause.message : "No se pudo iniciar la sesión de test.");
      setPending(null);
    }
  }

  useEffect(() => {
    const url = new URL(window.location.href);
    const chosen = url.searchParams.get(CHOSEN_FLOW_PARAM);
    const option = flowOptions.find((candidate) => candidate.id === chosen);

    if (option) {
      // Se quita el parámetro antes de arrancar para que una recarga no repita la elección.
      url.searchParams.delete(CHOSEN_FLOW_PARAM);
      window.history.replaceState(null, "", `${url.pathname}${url.search}`);
      if (!resumed.current) {
        resumed.current = true;
        void start(option.id, option.href);
        return;
      }
    }

    void noteReturnedToMode().catch(() => {});
    // start usa solo estado estable; este efecto corre una vez al montar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {error ? <p className="form-error">{error}</p> : null}
      <div className="flow-mode-grid" role="list">
        {flowOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`flow-mode-card flow-mode-card--${option.id}`}
            role="listitem"
            disabled={pending !== null}
            onClick={() => void start(option.id, option.href)}
          >
            <h2 className="flow-mode-badge">{option.title}</h2>
            <p className="flow-mode-card-desc">{option.description}</p>
            {option.sketch}
            {pending === option.id ? (
              <span className="flow-mode-pending">
                <LoadingPin />
                Guardando sesión…
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </>
  );
}

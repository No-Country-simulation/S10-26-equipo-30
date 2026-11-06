"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  formErrorClass,
  gradientSurfaceClass,
  guidedFillClass,
  guidedTrackClass,
  requiredMarkClass,
  sectionIconClass,
} from "@/components/form-styles";
import { LoadingPin } from "@/components/loading-pin";
import { cx } from "@/lib/cx";
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

/*
  Los bocetos son contenedores de tamaño: si el alto disponible no alcanza, se quita lo menos
  importante entero (nunca se corta a la mitad). Primero la barra y el rótulo de sección,
  después el segundo bloque de campos.
*/
const sketchClass =
  "pointer-events-none relative mt-[0.2rem] flex min-h-0 flex-[1_1_auto] select-none flex-col justify-center-safe gap-[clamp(0.55rem,2.4vh,1.1rem)] overflow-hidden [container-type:size] max-[720px]:mt-0 max-[720px]:justify-start max-[720px]:gap-[0.4rem]";

const sketchFieldClass = "flex min-w-0 flex-col gap-[0.4rem] max-[720px]:gap-1";

const sketchLabelClass =
  "overflow-hidden text-[0.8rem] text-ellipsis whitespace-nowrap text-nc-muted max-[720px]:text-[0.7rem]";

const sketchInputClass =
  "block overflow-hidden rounded-[0.65rem] border border-nc-border bg-white/3 px-[0.8rem] py-[0.6rem] text-[0.9rem] text-ellipsis whitespace-nowrap text-slate-500 max-[720px]:rounded-lg max-[720px]:px-[0.6rem] max-[720px]:py-[0.38rem] max-[720px]:text-[0.78rem]";

const sketchButtonClass = `${gradientSurfaceClass} px-[1.1rem] py-2 text-[0.82rem] max-[720px]:px-[0.85rem] max-[720px]:py-[0.35rem] max-[720px]:text-[0.75rem]`;

/** Primer paso del formulario clásico: todos los campos juntos en una pantalla. */
function ClassicSketch() {
  return (
    <div className={sketchClass} aria-hidden="true">
      <div className="flex items-center justify-between gap-4 max-[720px]:absolute max-[720px]:top-0 max-[720px]:right-0 min-[721px]:[@container_(max-height:250px)]:hidden">
        <span className="text-[0.9rem] text-nc-muted max-[720px]:hidden">←</span>
        <span className={sketchButtonClass}>
          <span>Continuar</span>
          <span>→</span>
        </span>
      </div>
      <p className="flex items-center gap-[0.65rem] text-[1.05rem] font-semibold max-[720px]:min-h-8 max-[720px]:pr-[6.5rem] max-[720px]:text-[0.95rem]">
        <span
          className={cx(
            sectionIconClass,
            "max-[720px]:h-[1.6rem] max-[720px]:w-[1.6rem] max-[720px]:shrink-0 max-[720px]:text-[0.85rem]",
          )}
        >
          🏢
        </span>
        Información de la Compañía
      </p>
      <div className={cx(sketchFieldClass, "max-[720px]:[@container_(max-height:92px)]:hidden")}>
        <span className={sketchLabelClass}>
          Nombre de la Compañía<span className={requiredMarkClass}>*</span>
        </span>
        <span className={sketchInputClass}>Ej. InnovaSoft</span>
      </div>
      <div className="grid grid-cols-2 gap-3 max-[720px]:gap-2 max-[720px]:[@container_(max-height:150px)]:hidden min-[721px]:[@container_(max-height:200px)]:hidden">
        <div className={sketchFieldClass}>
          <span className={sketchLabelClass}>
            Tipo de organización<span className={requiredMarkClass}>*</span>
          </span>
          <span className={sketchInputClass}>Seleccionar…</span>
        </div>
        <div className={sketchFieldClass}>
          <span className={sketchLabelClass}>
            Tamaño de la organización<span className={requiredMarkClass}>*</span>
          </span>
          <span className={sketchInputClass}>Seleccionar…</span>
        </div>
      </div>
    </div>
  );
}

/** Primera pregunta guiada: una sola pregunta con progreso y tiempo restante. */
function GuidedSketch() {
  const seconds = remainingSeconds(0);
  return (
    <div className={sketchClass} aria-hidden="true">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-[0.9rem] font-bold tracking-[0.04em] tabular-nums">
          {formatStepCounter(0)}
        </span>
        <span className="text-[0.78rem] font-semibold text-cyan-300">
          {formatRemainingTime(seconds)}
        </span>
      </div>
      <div className={guidedTrackClass}>
        <div className={guidedFillClass} style={{ width: `${progressPercent(0)}%` }} />
      </div>
      <p className="text-[0.72rem] tracking-[0.08em] text-violet-300 uppercase max-[720px]:hidden min-[721px]:[@container_(max-height:250px)]:hidden">
        {firstGuidedStep.sectionLabel}
      </p>
      <p className="text-[1.15rem] leading-[1.25] font-semibold tracking-[-0.02em] max-[720px]:text-base">
        {firstGuidedStep.question}
        <span className={requiredMarkClass}>*</span>
      </p>
      <span
        className={cx(
          sketchInputClass,
          "max-[720px]:[@container_(max-height:130px)]:hidden min-[721px]:[@container_(max-height:150px)]:hidden",
        )}
      >
        {"placeholder" in firstGuidedStep ? firstGuidedStep.placeholder : ""}
      </span>
      <div className="flex items-center justify-between gap-4 max-[720px]:hidden min-[721px]:[@container_(max-height:250px)]:hidden">
        <span className="text-[0.9rem] text-nc-muted">← Atrás</span>
        <span className={sketchButtonClass}>
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
      {error ? <p className={formErrorClass}>{error}</p> : null}
      <div
        className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)_minmax(0,1fr)] items-stretch gap-4 min-[721px]:grid-cols-2 min-[721px]:grid-rows-[minmax(0,1fr)]"
        role="list"
      >
        {flowOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            className="flex h-full min-h-0 w-full cursor-pointer flex-col gap-[0.35rem] overflow-hidden rounded-2xl border border-nc-border bg-nc-inner px-[0.85rem] pt-[0.7rem] pb-[0.65rem] text-left transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-px hover:border-violet-500/45 hover:shadow-[0_0_0_1px_rgba(139,92,246,0.15)] focus-visible:-translate-y-px focus-visible:border-violet-500/45 focus-visible:shadow-[0_0_0_1px_rgba(139,92,246,0.15)] focus-visible:outline-none disabled:cursor-wait disabled:opacity-70"
            role="listitem"
            disabled={pending !== null}
            onClick={() => void start(option.id, option.href)}
          >
            <h2 className="self-start rounded-full border border-cyan-400/35 bg-cyan-400/8 px-[0.7rem] py-[0.28rem] text-[0.82rem] font-[650] tracking-[0.04em] text-cyan-300 uppercase">
              {option.title}
            </h2>
            <p className="line-clamp-2 flex-[0_1_auto] text-[0.78rem] leading-[1.35] text-nc-muted">
              {option.description}
            </p>
            {option.sketch}
            {pending === option.id ? (
              <span className="inline-flex items-center gap-[0.45rem] text-[0.82rem] font-semibold text-cyan-300">
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

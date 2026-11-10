"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { formErrorClass } from "@/components/form-styles";
import { LoadingPin } from "@/components/loading-pin";
import { guidedSteps } from "@/lib/guided-steps";
import {
  isAuthRequired,
  noteReturnedToMode,
  redirectToLogin,
  startFormTestSession,
  type FormFlowVariant,
} from "@/lib/research-persistence";

/** Parámetro con el que se vuelve del login para continuar con el flujo elegido. */
const CHOSEN_FLOW_PARAM = "flujo";

const flowOptions: {
  id: FormFlowVariant;
  href: string;
  title: string;
  format: string;
  reasons: string[];
}[] = [
  {
    id: "classic",
    href: "/cargar-proyecto/compania",
    title: "Formulario clásico",
    format: "Todo el formulario en 2 pantallas.",
    reasons: [
      "Ya tenés claro el desafío y querés ver todos los campos juntos.",
      "Te manejás con términos como vertical o etapa del proyecto.",
      "Preferís completarlo rápido, con menos clics.",
    ],
  },
  {
    id: "guided",
    href: "/cargar-proyecto/guiado",
    title: "Preguntas guiadas",
    format: `${guidedSteps.length} preguntas, una por pantalla.`,
    reasons: [
      "Es la primera vez que cargás un desafío.",
      "No tenés perfil técnico y preferís ir paso a paso.",
      "Querés saber en todo momento cuánto te falta.",
    ],
  },
];

export function FlowModeChoices() {
  const router = useRouter();
  const [pending, setPending] = useState<FormFlowVariant | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Next conserva esta pantalla oculta al elegir un formulario; al volver, la tarjeta no debe seguir en "Guardando sesión…".
  useLayoutEffect(() => () => setPending(null), []);

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
      <ul className="grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2">
        {flowOptions.map((option) => (
          <li
            key={option.id}
            className="group relative flex flex-col rounded-2xl border border-nc-border bg-nc-inner p-5 transition-[border-color,box-shadow] duration-150 hover:border-violet-500/45 hover:shadow-[0_0_0_1px_rgba(139,92,246,0.15)] has-[button:focus-visible]:border-violet-500/45 has-[button:focus-visible]:shadow-[0_0_0_1px_rgba(139,92,246,0.15)] has-[button:disabled]:opacity-70"
          >
            <h2 className="text-[1.1rem] font-semibold">{option.title}</h2>
            <p className="mb-4 text-[0.85rem] text-nc-muted">{option.format}</p>

            <p className="mb-2 text-xs tracking-[0.08em] text-nc-muted uppercase">Conviene si…</p>
            <ul className="mb-5 grid list-none gap-2 p-0 text-[0.88rem]">
              {option.reasons.map((reason) => (
                <li key={reason} className="flex items-start gap-2 text-slate-200">
                  <span className="font-bold text-nc-cyan" aria-hidden>
                    ✓
                  </span>
                  {reason}
                </li>
              ))}
            </ul>

            <button
              type="button"
              className="mt-auto inline-flex cursor-pointer items-center gap-[0.45rem] self-start text-[0.88rem] font-semibold text-cyan-300 outline-none after:absolute after:inset-0 after:rounded-2xl disabled:cursor-wait"
              aria-label={`Elegir ${option.title}`}
              disabled={pending !== null}
              onClick={() => void start(option.id, option.href)}
            >
              {pending === option.id ? (
                <>
                  <LoadingPin />
                  Guardando sesión…
                </>
              ) : (
                <>
                  Elegir
                  <span className="transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden>
                    →
                  </span>
                </>
              )}
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingPin } from "@/components/loading-pin";
import {
  noteReturnedToMode,
  startFormTestSession,
  type FormFlowVariant,
} from "@/lib/research-persistence";

const flowOptions = [
  {
    id: "classic" as const,
    href: "/cargar-proyecto/compania",
    title: "Formulario clásico",
    description:
      "Dos pantallas completas: información de la compañía y luego detalles del proyecto, como en el diseño original.",
    badge: "Prototipo setup",
    features: ["Esquema A + B en bloques", "Referencia form-03 / form-04", "Ideal para comparar con Figma"],
  },
  {
    id: "guided" as const,
    href: "/cargar-proyecto/guiado",
    title: "Preguntas guiadas",
    description:
      "Una pregunta por pantalla, con progreso y tiempo estimado. Misma información, recorrido más conversacional.",
    badge: "Testing UX",
    features: ["Un paso a la vez", "Barra de progreso", "Ideal para entrevistas de usabilidad"],
  },
];

export function FlowModeChoices() {
  const router = useRouter();
  const [pending, setPending] = useState<FormFlowVariant | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void noteReturnedToMode().catch(() => {});
  }, []);

  async function start(variant: FormFlowVariant, href: string) {
    setPending(variant);
    setError(null);
    try {
      await startFormTestSession(variant);
      router.push(href);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo iniciar la sesión de test.");
      setPending(null);
    }
  }

  return (
    <>
      {error ? <p className="form-error">{error}</p> : null}
      <div className="flow-mode-grid" role="list">
        {flowOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            className="flow-mode-card"
            role="listitem"
            disabled={pending !== null}
            onClick={() => void start(option.id, option.href)}
          >
            <span className="flow-mode-badge">{option.badge}</span>
            <h2 className="flow-mode-card-title">{option.title}</h2>
            <p className="flow-mode-card-desc">{option.description}</p>
            <ul className="flow-mode-features">
              {option.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <span className="flow-mode-cta">
              {pending === option.id ? <LoadingPin /> : null}
              <span>{pending === option.id ? "Guardando sesión…" : "Iniciar este flujo →"}</span>
            </span>
          </button>
        ))}
      </div>
    </>
  );
}

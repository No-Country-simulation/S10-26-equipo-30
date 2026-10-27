import Link from "next/link";
import { FormCard } from "@/components/form-card";

const flowOptions = [
  {
    id: "clasico",
    href: "/cargar-proyecto/compania",
    title: "Formulario clásico",
    description:
      "Dos pantallas completas: información de la compañía y luego detalles del proyecto, como en el diseño original.",
    badge: "Prototipo setup",
    features: ["Esquema A + B en bloques", "Referencia form-03 / form-04", "Ideal para comparar con Figma"],
  },
  {
    id: "guiado",
    href: "/cargar-proyecto/guiado",
    title: "Preguntas guiadas",
    description:
      "Una pregunta por pantalla, con progreso y tiempo estimado. Misma información, recorrido más conversacional.",
    badge: "Testing UX",
    features: ["Un paso a la vez", "Barra de progreso", "Ideal para entrevistas de usabilidad"],
  },
] as const;

export default function ElegirModoFormularioPage() {
  return (
    <main className="page-shell page-shell--wide">
      <FormCard backHref="/cargar-proyecto" hideContinue>
        <header className="flow-mode-header">
          <p className="flow-mode-eyebrow">Antes de empezar</p>
          <h1 className="flow-mode-title">¿Cómo querés cargar el proyecto?</h1>
          <p className="flow-mode-lead">
            Elegí el flujo que vas a testear. Podés volver atrás y cambiar de modelo en cualquier
            momento antes de enviar.
          </p>
        </header>

        <div className="flow-mode-grid" role="list">
          {flowOptions.map((option) => (
            <Link
              key={option.id}
              href={option.href}
              className="flow-mode-card"
              role="listitem"
            >
              <span className="flow-mode-badge">{option.badge}</span>
              <h2 className="flow-mode-card-title">{option.title}</h2>
              <p className="flow-mode-card-desc">{option.description}</p>
              <ul className="flow-mode-features">
                {option.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <span className="flow-mode-cta">Iniciar este flujo →</span>
            </Link>
          ))}
        </div>
      </FormCard>
    </main>
  );
}

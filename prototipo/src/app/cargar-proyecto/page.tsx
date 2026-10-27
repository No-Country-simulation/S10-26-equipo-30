import { FormCard } from "@/components/form-card";

const planFeatures = [
  { text: "Accedé a datos públicos de todos los equipos", included: true },
  { text: "Ver entregables finales", included: true },
  { text: "Sin costo de entrada", included: true },
  { text: "Observá perfiles y actividad en tiempo real", included: true },
  {
    text: "Entendé cómo funciona la simulación antes de invertir",
    included: true,
  },
  { text: "Sin equipos garantizados en tu proyecto", included: false },
] as const;

export default function CargarProyectoPlanPage() {
  return (
    <main className="page-shell page-shell--narrow">
      <FormCard
        backHref="/"
        continueHref="/cargar-proyecto/modo"
        continueLabel="Siguiente"
      >
        <article className="plan-card">
          <p className="plan-badge">Free Trial</p>
          <h1 className="plan-name">Gratis</h1>
          <p className="plan-tagline">Explorá sin riesgo</p>
          <ul className="plan-features">
            {planFeatures.map((feature) => (
              <li
                key={feature.text}
                className={
                  feature.included
                    ? "plan-feature plan-feature--yes"
                    : "plan-feature plan-feature--no"
                }
              >
                {feature.text}
              </li>
            ))}
          </ul>
          <p className="plan-footnote">
            Ideal para: conocer la plataforma antes de comprometerte.
          </p>
        </article>
      </FormCard>
    </main>
  );
}

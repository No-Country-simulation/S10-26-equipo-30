import { GradientButton } from "@/components/gradient-button";

const steps = [
  {
    title: "Carga tu proyecto",
    description:
      "Describe tu necesidad empresarial, proporciona contexto sobre tu desafío y explica el impacto esperado",
  },
  {
    title: "Los equipos toman el desafío",
    description:
      "Múltiples equipos reciben el desafío durante el periodo de simulación y comienzan a trabajar en soluciones",
  },
  {
    title: "Revisa las soluciones",
    description:
      "Monitorea el progreso y revisa múltiples soluciones entregadas por diferentes equipos al final de la simulación",
  },
  {
    title: "Decide los próximos pasos",
    description:
      "Continúa observando, desbloquea datos críticos o escala a experiencia premium con funciones mejoradas",
  },
] as const;

export default function Home() {
  return (
    <main className="landing-shell page-shell--wide">
      <section className="hero">
        <h1 className="hero-title">Sube tu desafío</h1>
        <p className="hero-subtitle">
          Conecta con talento calificado a través de simulaciones reales de trabajo.
        </p>
        <div className="hero-pills">
          <span className="hero-pill hero-pill--purple">⏱ 5 semanas</span>
          <span className="hero-pill hero-pill--teal">👥 100% remoto</span>
          <span className="hero-pill hero-pill--pink">📅 Inicio: Abril 2026</span>
        </div>
      </section>

      <section className="how-card">
        <div className="how-card-header">
          <h2 className="how-card-title">Cómo funciona</h2>
          <GradientButton href="/cargar-proyecto">Cargar Proyecto</GradientButton>
        </div>
        <ol className="how-steps">
          {steps.map((step, index) => (
            <li key={step.title} className="how-step">
              <span className="how-step-num">{index + 1}</span>
              <div className="how-step-body">
                <strong>{step.title}</strong>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}

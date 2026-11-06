import { FormCard } from "@/components/form-card";

const benefits = [
  "Soluciones reales de varios equipos para tu desafío",
  "Talento evaluado en acción, no solo en un CV",
  "Perfiles y actividad de los equipos en tiempo real",
  "Acceso a todos los entregables finales",
] as const;

const steps = [
  { title: "Cargás tu desafío", effort: "Te lleva unos 5 minutos." },
  { title: "Lo validamos juntos", effort: "Te escribimos por email con los próximos pasos." },
  {
    title: "Los equipos lo toman",
    effort: "Solo respondés dudas si el equipo las tiene.",
  },
  {
    title: "Recibís los entregables",
    effort: "Revisás las soluciones y decidís cómo seguir.",
  },
] as const;

const sectionTitleClass = "mb-2 text-xs tracking-[0.08em] text-nc-muted uppercase";

export default function CargarProyectoPlanPage() {
  return (
    <main className="mx-auto w-full max-w-[960px] flex-1 px-5 pt-3 pb-3">
      <FormCard
        backHref="/"
        continueHref="/cargar-proyecto/modo"
        continueLabel="Siguiente"
      >
        <article className="rounded-2xl border border-nc-border bg-nc-inner p-5">
          <header className="mb-4">
            <p className="mb-1 text-xs tracking-[0.08em] text-nc-muted uppercase">Prueba gratuita</p>
            <h1 className="mb-1 bg-[linear-gradient(135deg,#22d3ee,#818cf8)] bg-clip-text text-[2rem] leading-tight font-bold text-transparent">
              100% gratis
            </h1>
            <p className="text-nc-muted">Sin compromiso.</p>
          </header>

          <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-8">
            <section aria-labelledby="beneficios-title">
              <h2 id="beneficios-title" className={sectionTitleClass}>
                Qué recibís
              </h2>
              <ul className="grid list-none gap-3 p-0 text-[0.88rem]">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2 text-nc-muted">
                    <span className="font-bold text-nc-cyan" aria-hidden>
                      ✓
                    </span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="proceso-title">
              <h2 id="proceso-title" className={sectionTitleClass}>
                Cómo sigue
              </h2>
              <ol className="grid list-none gap-2 p-0 text-[0.88rem]">
                {steps.map((step, index) => (
                  <li key={step.title} className="flex items-start gap-3">
                    <span className="font-bold tabular-nums text-nc-cyan" aria-hidden>
                      {index + 1}
                    </span>
                    <span>
                      <span className="block text-slate-100">{step.title}</span>
                      <span className="block text-nc-muted">{step.effort}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          <p className="text-[0.85rem] text-slate-500">
            Ideal para: empresas, instituciones educativas, ONG y emprendimientos con un desafío real
            para resolver.
          </p>
        </article>
      </FormCard>
    </main>
  );
}

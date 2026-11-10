import Link from "next/link";
import { backLinkClass, formCardClass } from "@/components/form-styles";
import { GradientButton } from "@/components/gradient-button";

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

type HighlightIconName = "clock" | "users" | "calendar" | "info";

const highlights: { icon: HighlightIconName; label: string; gradientClass: string }[] = [
  { icon: "clock", label: "5 semanas", gradientClass: "from-[#a855f7] to-[#3b82f6]" },
  { icon: "users", label: "100% remoto", gradientClass: "from-[#06b6d4] to-[#14b8a6]" },
  { icon: "calendar", label: "Inicio: Diciembre 7", gradientClass: "from-[#ec4899] to-[#f43f5e]" },
  {
    icon: "info",
    label: "Tienes 9 días para subir el proyecto",
    gradientClass: "from-[#ec4899] to-[#22d3ee]",
  },
];

const sectionTitleClass = "mb-2 text-xs tracking-[0.08em] text-nc-muted uppercase";

function HighlightIcon({ name }: { name: HighlightIconName }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-[0.95rem] w-[0.95rem] shrink-0",
    "aria-hidden": true as const,
  };
  if (name === "clock") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  }
  if (name === "users") {
    return (
      <svg {...common}>
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
        <circle cx="17" cy="9" r="2.2" />
        <path d="M16 19a4.2 4.2 0 0 1 5-3.6" />
      </svg>
    );
  }
  if (name === "calendar") {
    return (
      <svg {...common}>
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M4 10h16M9 3v4M15 3v4" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </svg>
  );
}

export default function CargarProyectoPlanPage() {
  return (
    <main className="mx-auto w-full max-w-[960px] flex-1 px-5 pt-4 pb-3">
      <header className="mb-4 text-center">
        <h1 className="mb-1 text-[1.9rem] leading-tight font-bold text-white">Sube tu desafío</h1>
        <p className="mb-3 text-nc-muted">
          Conecta con talento calificado a través de simulaciones reales de trabajo.
        </p>
        <ul className="flex list-none flex-wrap justify-center gap-2 p-0">
          {highlights.map((highlight) => (
            <li
              key={highlight.label}
              className={`inline-flex items-center gap-1.5 rounded-full bg-linear-to-r px-3 py-1.5 text-[0.8rem] font-semibold text-white ${highlight.gradientClass}`}
            >
              <HighlightIcon name={highlight.icon} />
              {highlight.label}
            </li>
          ))}
        </ul>
      </header>

      <div className={formCardClass}>
        <header className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col items-start gap-1">
            <Link href="/" className={backLinkClass}>
              ← Atrás
            </Link>
            <p className="text-xs tracking-[0.08em] text-nc-muted uppercase">Prueba gratuita</p>
            <div className="flex items-baseline gap-2">
              <h2 className="bg-[linear-gradient(135deg,#22d3ee,#818cf8)] bg-clip-text text-[1.4rem] leading-tight font-bold whitespace-nowrap text-transparent">
                100% gratis
              </h2>
            </div>
          </div>
          <GradientButton href="/cargar-proyecto/modo">Siguiente</GradientButton>
        </header>

        <article className="rounded-2xl border border-nc-border bg-nc-inner p-5">
          <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-8">
            <section aria-labelledby="beneficios-title">
              <h3 id="beneficios-title" className={sectionTitleClass}>
                Qué recibís
              </h3>
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
              <h3 id="proceso-title" className={sectionTitleClass}>
                Cómo sigue
              </h3>
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
      </div>
    </main>
  );
}

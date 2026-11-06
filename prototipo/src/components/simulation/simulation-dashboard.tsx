"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";
import type { SimulationMeta, SimulationTeam } from "@/lib/simulation-dashboard-data";
import { clientTestimonials } from "@/lib/testimonials";

type SimulationDashboardProps = {
  data: SimulationMeta;
};

type MainTab = "active" | "history" | "context";

function cx(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const challengeCtaLinkClass =
  "rounded-full bg-[linear-gradient(90deg,#ec4899_0%,#8b5cf6_45%,#6366f1_100%)] font-semibold text-white shadow-[0_4px_22px_rgba(139,92,246,0.38)] transition-[filter] hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nc-cyan";

type ChallengeFlowStep = {
  n: 1 | 2 | 3 | 4 | 5;
  title: string;
  highlight?: string;
};

/**
 * Recorrido de carga del desafío — copy inclusivo (adaptado desde Paso1-ResumenDeFlujo).
 * Fila 1: título + CTA · Fila 2: los 5 pasos en una sola línea (scroll horizontal si no entra).
 */
function ChallengeFlowSummary() {
  const steps: ChallengeFlowStep[] = [
    { n: 1, title: "Cargás el desafío", highlight: "Gratis" },
    { n: 2, title: "Lo validamos juntos" },
    { n: 3, title: "Los equipos toman el desafío" },
    { n: 4, title: "Revisamos los resultados finales" },
    { n: 5, title: "Decidís los próximos pasos" },
  ];

  return (
    <div className="mb-3 rounded-xl border border-nc-border/80 bg-black/25 px-3 py-3 md:mb-4 md:px-4 md:py-3.5">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2.5 min-[480px]:flex-row min-[480px]:items-center min-[480px]:justify-between min-[480px]:gap-3">
          <p className="m-0 text-[0.62rem] font-semibold tracking-[0.06em] text-nc-muted uppercase">
            Cómo funciona · 5 pasos
          </p>
          <ChallengeUploadCta variant="inline" className="w-full shrink-0 min-[480px]:w-auto" />
        </div>

        <div
          className="-mx-1 overflow-x-auto pb-0.5 [-webkit-overflow-scrolling:touch] md:mx-0"
          aria-label="Pasos del recorrido"
        >
          <ol className="m-0 flex w-max min-w-full list-none flex-nowrap items-center gap-x-1.5 px-1 py-0 md:gap-x-2 md:px-0">
            {steps.map((step, i) => (
              <Fragment key={step.n}>
                {i > 0 ? (
                  <li className="inline-flex shrink-0 items-center text-slate-600" role="presentation" aria-hidden>
                    →
                  </li>
                ) : null}
                <li className="inline-flex shrink-0 items-baseline gap-1 text-[0.65rem] leading-snug text-slate-200 min-[480px]:text-[0.68rem] md:text-[0.7rem]">
                  <span className="font-bold tabular-nums text-cyan-200">{step.n}</span>
                  <span className="whitespace-nowrap">
                    {step.title}
                    {step.highlight ? (
                      <span className="text-nc-muted"> ({step.highlight})</span>
                    ) : null}
                  </span>
                </li>
              </Fragment>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

function ChallengeUploadCta({
  className,
  variant = "block",
}: {
  className?: string;
  /** `inline`: misma fila que pestañas (desktop); `block`: ancho completo al pie. */
  variant?: "block" | "inline";
}) {
  const isInline = variant === "inline";
  return (
    <div
      className={cx("flex flex-col gap-1", isInline && "w-full shrink-0 md:w-auto", className)}
    >
      <Link
        href="/cargar-proyecto"
        className={cx(
          "inline-flex items-center justify-center",
          challengeCtaLinkClass,
          isInline
            ? "w-full whitespace-nowrap px-4 py-2.5 text-[0.85rem] md:w-auto md:px-5 md:py-2 md:text-[0.88rem] md:leading-tight"
            : "w-full px-4 py-3 text-[0.92rem] md:py-3.5 md:text-[0.95rem]",
        )}
      >
        Subí tu desafío gratis
      </Link>
    </div>
  );
}

export function SimulationDashboard({ data }: SimulationDashboardProps) {
  const [mainTab, setMainTab] = useState<MainTab>("active");
  const [query, setQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState(data.projects[0] ?? "Todos los proyectos");
  const [verticalFilter, setVerticalFilter] = useState(
    data.verticals[0] ?? "Filtrar por vertical…",
  );
  const [featured, setFeatured] = useState<Set<string>>(() => new Set());
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const filteredTeams = useMemo(() => {
    return data.teams.filter((team) => {
      const q = query.trim().toLowerCase();
      if (q && !team.name.toLowerCase().includes(q) && !team.project.toLowerCase().includes(q)) {
        return false;
      }
      if (projectFilter !== "Todos los proyectos" && team.project !== projectFilter) {
        return false;
      }
      if (
        verticalFilter !== "Filtrar por vertical…" &&
        verticalFilter !== "Todas las verticales" &&
        team.vertical !== verticalFilter
      ) {
        return false;
      }
      return true;
    });
  }, [data.teams, query, projectFilter, verticalFilter]);

  function toggleFeatured(teamId: string) {
    setFeatured((prev) => {
      const next = new Set(prev);
      if (next.has(teamId)) {
        next.delete(teamId);
      } else {
        next.add(teamId);
      }
      return next;
    });
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
      <button
        type="button"
        className="mx-3 mt-3 flex items-center justify-center gap-2 rounded-lg bg-[linear-gradient(90deg,#24143f_0%,#3b1d6e_55%,#1a2744_100%)] px-4 py-3 text-[0.95rem] font-semibold text-white md:hidden"
        aria-expanded={detailsOpen}
        onClick={() => setDetailsOpen((open) => !open)}
      >
        Detalles de la simulación
        <span
          className={cx("text-[0.8rem] transition-transform", detailsOpen && "rotate-180")}
          aria-hidden
        >
          ▾
        </span>
      </button>

      <aside  
        className={cx(
          "relative shrink-0 overflow-hidden border-nc-border bg-nc-elevated transition-[width] duration-200 ease-out",
          "md:h-full md:self-stretch md:border-r",
          detailsOpen ? "block" : "hidden md:block",
          sidebarCollapsed ? "md:w-10" : "md:w-[24%]",
          "mx-3 mt-3 rounded-2xl border p-4 md:mx-0 md:mt-0 md:rounded-none md:border-x-0 md:border-t-0 md:p-0",
        )}
        aria-label="Resumen de simulación"
      >
        <button
          type="button"
          className={cx(
            "absolute z-10 hidden h-8 w-8 items-center justify-center rounded-md border border-nc-border bg-nc-inner text-slate-300 md:flex",
            "hover:border-nc-pink/50 hover:text-nc-pink",
            sidebarCollapsed ? "top-3 left-1/2 -translate-x-1/2" : "top-3 right-2",
          )}
          aria-expanded={!sidebarCollapsed}
          aria-controls="sim-sidebar-panel"
          onClick={() => setSidebarCollapsed((c) => !c)}
        >
          <span className="sr-only">
            {sidebarCollapsed
              ? "Expandir panel de resumen de simulación"
              : "Contraer panel de resumen"}
          </span>
          <span aria-hidden>{sidebarCollapsed ? "›" : "‹"}</span>
        </button>

        <div
          id="sim-sidebar-panel"
          className={cx(
            "h-full overflow-y-auto md:px-5 md:pb-6 md:pt-14",
            sidebarCollapsed && "md:pointer-events-none md:invisible md:opacity-0",
          )}
        >
          <h1 className="mb-3 text-[1.05rem] font-bold leading-snug tracking-tight">
            {data.title} {data.edition}
          </h1>
          <p className="mb-1 text-[0.78rem] leading-snug text-nc-muted">{data.startLabel}</p>
          <p className="mb-1 text-[0.78rem] leading-snug text-nc-muted">{data.demoDayLabel}</p>
          <p className="mt-3 mb-3 text-[0.78rem] leading-snug text-slate-300">
            Semana {data.currentWeek} de {data.totalWeeks}
          </p>

          <div className="relative mb-4 flex items-start justify-between gap-0.5 pt-1.5" role="list" aria-label="Progreso por semana">
            <span
              className="absolute top-[0.45rem] right-[8%] left-[8%] z-0 h-0.5 bg-[linear-gradient(90deg,rgba(34,211,238,0.55),rgba(139,92,246,0.45),rgba(100,116,139,0.25))]"
              aria-hidden
            />
            {data.weekLabels.map((label, index) => {
              const state =
                index < data.activeWeekIndex
                  ? "done"
                  : index === data.activeWeekIndex
                    ? "active"
                    : "upcoming";
              return (
                <div key={label} className="relative z-[1] flex flex-1 flex-col items-center gap-1.5" role="listitem">
                  <span
                    className={cx(
                      "h-[0.55rem] w-[0.55rem] rounded-full border-2 border-slate-800",
                      state === "done" && "bg-nc-cyan shadow-[0_0_8px_rgba(34,211,238,0.45)]",
                      state === "active" &&
                        "scale-[1.15] bg-nc-purple shadow-[0_0_10px_rgba(168,85,247,0.55)]",
                      state === "upcoming" && "bg-slate-700",
                    )}
                  />
                  <span
                    className={cx(
                      "text-[0.68rem]",
                      state === "done" && "text-cyan-300",
                      state === "active" && "font-semibold text-purple-200",
                      state === "upcoming" && "text-slate-500",
                    )}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="mb-4 flex items-center gap-2 text-[0.68rem] font-semibold tracking-[0.07em] text-cyan-300">
            <span
              className="h-[0.45rem] w-[0.45rem] rounded-full bg-nc-cyan shadow-[0_0_8px_rgba(34,211,238,0.65)]"
              aria-hidden
            />
            {data.statusLabel}
          </p>

          <ul className="m-0 mb-3 grid list-none grid-cols-4 gap-1.5 p-0">
            {data.insights.map((item) => (
              <li
                key={item.label}
                className="rounded-md border border-nc-border bg-black/35 px-1 py-1.5 text-center"
              >
                <span className="block text-[0.95rem] font-bold leading-none tabular-nums">
                  {item.value}
                </span>
                <span className="mt-1 block text-[0.58rem] leading-tight text-nc-muted">
                  {item.label}
                </span>
              </li>
            ))}
          </ul>

          <TestimonialRotator />

          <p className="mt-3 mb-0 text-center text-[0.62rem] leading-snug text-slate-500">
            Próxima simulación: detalle próximamente.
          </p>
        </div>
      </aside>

      <section
        className="min-h-0 min-w-0 flex-1 overflow-y-auto"
        aria-label="Equipos de la simulación"
      >
        <div className="min-h-full rounded-none border-0 bg-transparent p-0 md:bg-nc-card md:p-4">
          <ChallengeFlowSummary />

          <div className="mb-3 flex flex-col gap-3 md:mb-3.5 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-3">
            <div
              className="flex w-full min-w-0 flex-nowrap gap-2 rounded-none border-0 bg-transparent p-0 md:inline-flex md:w-auto md:shrink-0 md:flex-wrap md:gap-1.5 md:rounded-full md:border md:border-nc-border md:bg-black/45 md:p-1"
              role="tablist"
              aria-label="Vistas"
            >
              <TabButton
                selected={mainTab === "active"}
                onClick={() => setMainTab("active")}
                icon="teams"
              >
                Equipos activos
              </TabButton>
              <TabButton disabled icon="history">
                Historial
              </TabButton>
              <TabButton disabled icon="context">
                Contexto
              </TabButton>
            </div>
            {mainTab === "active" ? (
              <div className="flex w-full min-w-0 flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-2 md:flex-1 md:justify-end lg:max-w-none">
                <label className="relative flex min-h-[2.625rem] min-w-0 flex-1 items-center sm:min-w-[12rem] md:max-w-xs lg:max-w-md">
                  <span className="pointer-events-none absolute left-3 text-slate-500" aria-hidden>
                    ⌕
                  </span>
                  <span className="sr-only">Buscar equipos</span>
                  <input
                    type="search"
                    placeholder="Buscar equipos…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full rounded-lg border border-nc-border bg-nc-inner py-2.5 pr-3 pl-8 text-[0.85rem] text-inherit"
                  />
                </label>
                <select
                  className="min-h-[2.625rem] w-full min-w-0 rounded-lg border border-nc-border bg-nc-inner px-3 py-2.5 text-[0.85rem] text-inherit sm:w-auto sm:min-w-[9.5rem] sm:max-w-[12rem]"
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  aria-label="Filtrar por proyecto"
                >
                  {data.projects.map((project) => (
                    <option key={project} value={project}>
                      {project}
                    </option>
                  ))}
                </select>
                <select
                  className="min-h-[2.625rem] w-full min-w-0 rounded-lg border border-nc-border bg-nc-inner px-3 py-2.5 text-[0.85rem] text-inherit sm:w-auto sm:min-w-[10.5rem] sm:max-w-[13rem]"
                  value={verticalFilter}
                  onChange={(e) => setVerticalFilter(e.target.value)}
                  aria-label="Filtrar por vertical"
                >
                  {data.verticals.map((vertical) => (
                    <option key={vertical} value={vertical}>
                      {vertical}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
          </div>

          {mainTab === "active" ? (
            <>
              <div className="overflow-visible md:overflow-x-auto">
                <div className="hidden min-w-[46rem] grid-cols-[minmax(7.5rem,1.15fr)_minmax(5.5rem,0.85fr)_minmax(6.5rem,1fr)_repeat(4,minmax(4.25rem,0.65fr))_2rem] items-center gap-2 px-2.5 pb-2 text-[0.65rem] font-semibold tracking-wider text-slate-500 uppercase md:grid">
                  <span>Nombre</span>
                  <span>Proyecto</span>
                  <span>Vertical</span>
                  <span>Miembros</span>
                  <span>Mensajes</span>
                  <span>Reuniones</span>
                  <span>Entregables</span>
                  <span aria-hidden />
                </div>
                <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
                  {filteredTeams.map((team) => (
                    <TeamRow
                      key={team.id}
                      team={team}
                      featured={featured.has(team.id)}
                      onToggleFeatured={() => toggleFeatured(team.id)}
                    />
                  ))}
                </ul>
                {filteredTeams.length === 0 ? (
                  <p className="mt-4 text-[0.88rem] text-nc-muted">
                    No hay equipos con esos filtros.
                  </p>
                ) : null}
              </div>

              <ChallengeUploadCta className="mt-6 border-t border-nc-border/80 pt-5 md:mt-8 md:pt-6" />
            </>
          ) : (
            <p className="mt-4 text-[0.88rem] text-nc-muted">
              Vista no disponible en el prototipo.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

const TESTIMONIAL_INTERVAL_MS = 8000;

function TestimonialRotator() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || clientTestimonials.length < 2) {
      return;
    }
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % clientTestimonials.length);
    }, TESTIMONIAL_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [paused]);

  return (
    <section
      className="rounded-lg border border-nc-border bg-black/35 px-3 py-2"
      aria-roledescription="carrusel"
      aria-label="Testimonios de clientes"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <p className="mb-2 text-[0.62rem] font-semibold tracking-[0.08em] text-nc-muted uppercase">
        Casos de éxito
      </p>
      <div className="grid">
        {clientTestimonials.map((item, i) => {
          const active = i === index;
          return (
            <blockquote
              key={item.name}
              className={cx(
                "col-start-1 row-start-1 m-0 flex flex-col gap-2.5 transition-opacity duration-500",
                active ? "relative opacity-100" : "pointer-events-none opacity-0",
              )}
              aria-hidden={!active}
            >
              <p className="text-[0.72rem] leading-snug text-slate-200">“{item.quote}”</p>
              <footer className="flex gap-2.5 text-[0.68rem] leading-snug">
                <Image
                  src={item.avatarSrc}
                  alt={`${item.name}`}
                  width={40}
                  height={40}
                  className="mt-0.5 h-10 w-10 shrink-0 rounded-full border border-nc-border bg-nc-inner object-cover"
                />
                <div className="min-w-0">
                  <cite className="not-italic font-semibold text-slate-100">{item.name}</cite>
                  <span className="block text-nc-muted">
                    {item.role} at {item.org}
                  </span>
                  <span className="block text-[0.62rem] text-slate-500">
                    {item.place}, {item.date}
                  </span>
                </div>
              </footer>
            </blockquote>
          );
        })}
      </div>
      <div className="mt-3 flex justify-center gap-1.5" role="tablist" aria-label="Testimonio visible">
        {clientTestimonials.map((item, i) => (
          <button
            key={item.name}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Ver testimonio de ${item.name}`}
            className={cx(
              "h-1.5 rounded-full border-0 p-0 transition-all",
              i === index ? "w-4 bg-nc-cyan" : "w-1.5 cursor-pointer bg-slate-600 hover:bg-slate-400",
            )}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </section>
  );
}

function TabButton({
  selected,
  disabled,
  onClick,
  icon,
  children,
}: {
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  icon: "teams" | "history" | "context";
  children: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      disabled={disabled}
      title={disabled ? "Próximamente" : undefined}
      onClick={onClick}
      className={cx(
        "flex min-h-0 min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl border text-center leading-snug transition-[padding,font-size,box-shadow,transform] duration-200 md:min-h-0 md:flex-row md:rounded-full md:border-0",
        selected
          ? "flex-1 border-nc-pink bg-nc-elevated/90 px-2 py-2 text-[0.74rem] text-nc-pink shadow-[0_0_0_1px_#ec4899] md:flex-none md:bg-[linear-gradient(90deg,#ec4899_0%,#8b5cf6_45%,#6366f1_100%)] md:px-4 md:py-2 md:text-[0.82rem] md:font-medium md:text-white md:shadow-[0_4px_18px_rgba(139,92,246,0.35)]"
          : "flex-1 border-slate-500/20 bg-nc-elevated/60 px-1.5 py-1.5 text-[0.65rem] text-nc-muted md:flex-none md:scale-[0.96] md:bg-transparent md:px-2.5 md:py-1.5 md:text-[0.72rem] md:font-normal md:opacity-85",
        disabled && "cursor-not-allowed opacity-45",
        !disabled && !selected && "cursor-pointer hover:opacity-100 md:hover:bg-white/5",
      )}
    >
      <SegmentIcon name={icon} small={!selected} />
      {children}
    </button>
  );
}

function TeamRow({
  team,
  featured,
  onToggleFeatured,
}: {
  team: SimulationTeam;
  featured: boolean;
  onToggleFeatured: () => void;
}) {
  return (
    <li
      className={cx(
        "relative flex min-w-0 flex-col items-stretch gap-1 rounded-xl border border-slate-500/12 bg-black/40 px-4 py-4 pr-10 md:grid md:min-w-[46rem] md:grid-cols-[minmax(7.5rem,1.15fr)_minmax(5.5rem,0.85fr)_minmax(6.5rem,1fr)_repeat(4,minmax(4.25rem,0.65fr))_2rem] md:items-center md:gap-2 md:rounded-lg md:px-2.5 md:py-2.5 md:pr-2.5 md:text-[0.84rem]",
        team.highlight && "border-nc-cyan/35 bg-nc-cyan/5",
        team.locked && "opacity-50",
      )}
    >
      <span className="text-[0.95rem] font-semibold md:text-[0.82rem]">{team.name}</span>
      <span className="text-nc-muted md:text-[0.82rem] md:text-violet-300">{team.project}</span>
      <span className="text-[0.78rem] leading-snug text-nc-muted">{team.vertical}</span>
      <MetricCell icon="👥" value={team.members} label="Miembros" className="hidden md:inline-flex" />
      <span className="mt-2 grid grid-cols-3 pt-1.5 md:contents md:mt-0 md:pt-0">
        <MetricCell icon="💬" value={team.messages} label="Mensajes" className="justify-center md:justify-start" />
        <MetricCell icon="📹" value={team.meetings} label="Reuniones" className="justify-center md:justify-start" />
        <MetricCell icon="📄" value={team.deliverables} label="Entregables" className="justify-center md:justify-start" />
      </span>
      <button
        type="button"
        className={cx(
          "absolute top-3.5 right-3 cursor-pointer border-0 bg-transparent p-0.5 text-base leading-none text-slate-500 md:static md:justify-self-end",
          featured && "text-pink-400",
        )}
        aria-label={featured ? "Quitar destacado" : "Marcar como destacado"}
        onClick={onToggleFeatured}
        disabled={team.locked}
      >
        {team.locked ? "🔒" : featured ? "♥" : "♡"}
      </button>
    </li>
  );
}

function SegmentIcon({ name, small }: { name: "teams" | "history" | "context"; small?: boolean }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    className: cx(
      "block shrink-0 md:hidden",
      small ? "h-[1rem] w-[1rem]" : "h-[1.15rem] w-[1.15rem]",
    ),
    "aria-hidden": true as const,
  };
  if (name === "teams") {
    return (
      <svg {...common}>
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
        <circle cx="17" cy="9" r="2.2" />
        <path d="M16 19a4.2 4.2 0 0 1 5-3.6" />
      </svg>
    );
  }
  if (name === "history") {
    return (
      <svg {...common}>
        <rect x="6" y="10" width="12" height="9" rx="1.5" />
        <path d="M9 10V8a3 3 0 0 1 6 0v2" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M13 3 6 13h5l-1 8 8-12h-5l0-6z" />
    </svg>
  );
}

function MetricCell({
  icon,
  value,
  label,
  className,
}: {
  icon: string;
  value: number;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cx("inline-flex items-center gap-0.5 text-[0.8rem] text-nc-muted tabular-nums", className)}
      title={label}
    >
      <span className="text-[0.72rem] opacity-85" aria-hidden>
        {icon}
      </span>
      {value}
    </span>
  );
}

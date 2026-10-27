"use client";

import { useMemo, useState } from "react";
import type { SimulationMeta, SimulationTeam } from "@/lib/simulation-dashboard-data";

type SimulationDashboardProps = {
  data: SimulationMeta;
};

type MainTab = "active" | "history" | "context";

export function SimulationDashboard({ data }: SimulationDashboardProps) {
  const [mainTab, setMainTab] = useState<MainTab>("active");
  const [query, setQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState(data.projects[0] ?? "Todos los proyectos");
  const [verticalFilter, setVerticalFilter] = useState(
    data.verticals[0] ?? "Filtrar por vertical…",
  );
  const [featured, setFeatured] = useState<Set<string>>(() => new Set());

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
    <div className="sim-layout">
      <aside className="sim-sidebar" aria-label="Resumen de simulación">
        <h1 className="sim-sidebar-title">
          {data.title} {data.edition}
        </h1>
        <p className="sim-sidebar-meta">{data.startLabel}</p>
        <p className="sim-sidebar-meta">{data.demoDayLabel}</p>
        <p className="sim-sidebar-week">
          Semana {data.currentWeek} de {data.totalWeeks}
        </p>

        <div className="sim-stepper" role="list" aria-label="Progreso por semana">
          {data.weekLabels.map((label, index) => {
            const state =
              index < data.activeWeekIndex
                ? "done"
                : index === data.activeWeekIndex
                  ? "active"
                  : "upcoming";
            return (
              <div key={label} className="sim-stepper-item" role="listitem">
                <span className={`sim-stepper-node sim-stepper-node--${state}`} />
                <span className={`sim-stepper-label sim-stepper-label--${state}`}>{label}</span>
              </div>
            );
          })}
        </div>

        <p className="sim-status">
          <span className="sim-status-dot" aria-hidden />
          {data.statusLabel}
        </p>

        <ul className="sim-sidebar-insights">
          {data.insights.map((item) => (
            <li key={item.label} className="sim-sidebar-insight">
              <span className="sim-sidebar-insight-value">{item.value}</span>
              <span className="sim-sidebar-insight-label">{item.label}</span>
            </li>
          ))}
        </ul>
      </aside>

      <section className="sim-main" aria-label="Equipos de la simulación">
        <div className="sim-segment" role="tablist" aria-label="Vistas">
          <button
            type="button"
            role="tab"
            aria-selected={mainTab === "active"}
            className={mainTab === "active" ? "sim-segment-btn is-active" : "sim-segment-btn"}
            onClick={() => setMainTab("active")}
          >
            Equipos activos
          </button>
          <button
            type="button"
            role="tab"
            className="sim-segment-btn sim-segment-btn--disabled"
            disabled
            title="Próximamente"
          >
            Historial
          </button>
          <button
            type="button"
            role="tab"
            className="sim-segment-btn sim-segment-btn--disabled"
            disabled
            title="Próximamente"
          >
            Contexto
          </button>
        </div>

        {mainTab === "active" ? (
          <>
            <div className="sim-toolbar">
              <label className="sim-search">
                <span className="sim-search-icon" aria-hidden>
                  ⌕
                </span>
                <span className="sr-only">Buscar equipos</span>
                <input
                  type="search"
                  placeholder="Buscar equipos…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <select
                className="sim-select"
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
                className="sim-select sim-select--vertical"
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

            <div className="sim-table-wrap">
              <div className="sim-table-head">
                <span>Nombre</span>
                <span>Proyecto</span>
                <span>Vertical</span>
                <span>Miembros</span>
                <span>Mensajes</span>
                <span>Reuniones</span>
                <span>Entregables</span>
                <span className="sim-table-head-action" aria-hidden />
              </div>
              <ul className="sim-team-list">
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
                <p className="sim-empty">No hay equipos con esos filtros.</p>
              ) : null}
            </div>
          </>
        ) : (
          <p className="sim-empty">Vista no disponible en el prototipo.</p>
        )}
      </section>
    </div>
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
      className={
        team.highlight
          ? "sim-team-row sim-team-row--highlight"
          : team.locked
            ? "sim-team-row sim-team-row--locked"
            : "sim-team-row"
      }
    >
      <span className="sim-team-name">{team.name}</span>
      <span className="sim-team-project">{team.project}</span>
      <span className="sim-team-vertical">{team.vertical}</span>
      <MetricCell icon="👥" value={team.members} label="Miembros" />
      <MetricCell icon="💬" value={team.messages} label="Mensajes" />
      <MetricCell icon="📹" value={team.meetings} label="Reuniones" />
      <MetricCell icon="📄" value={team.deliverables} label="Entregables" />
      <button
        type="button"
        className={featured ? "sim-fav is-active" : "sim-fav"}
        aria-label={featured ? "Quitar destacado" : "Marcar como destacado"}
        onClick={onToggleFeatured}
        disabled={team.locked}
      >
        {team.locked ? "🔒" : featured ? "♥" : "♡"}
      </button>
    </li>
  );
}

function MetricCell({ icon, value, label }: { icon: string; value: number; label: string }) {
  return (
    <span className="sim-metric" title={label}>
      <span className="sim-metric-icon" aria-hidden>
        {icon}
      </span>
      {value}
    </span>
  );
}

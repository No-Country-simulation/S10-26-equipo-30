"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { GradientButton } from "@/components/gradient-button";
import type { SimulationMeta, SimulationTeam } from "@/lib/simulation-dashboard-data";

type SimulationDashboardProps = {
  data: SimulationMeta;
};

type MainTab = "active" | "history" | "context";

export function SimulationDashboard({ data }: SimulationDashboardProps) {
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [mainTab, setMainTab] = useState<MainTab>("active");
  const [query, setQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState(data.projects[0] ?? "Todos los proyectos");
  const [verticalFilter, setVerticalFilter] = useState(
    data.verticals[0] ?? "Todas las verticales",
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
      if (verticalFilter !== "Todas las verticales" && team.vertical !== verticalFilter) {
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
    <div className="sim-dashboard">
      <button
        type="button"
        className="sim-details-toggle"
        aria-expanded={detailsOpen}
        onClick={() => setDetailsOpen((open) => !open)}
      >
        <span>Detalles de la simulación</span>
        <span className="sim-details-chevron" aria-hidden>
          {detailsOpen ? "▾" : "▸"}
        </span>
      </button>

      {detailsOpen ? (
        <section className="sim-details-panel" aria-label="Resumen de simulación">
          <div className="sim-details-grid">
            <div className="sim-details-main">
              <p className="sim-details-eyebrow">{data.edition}</p>
              <h1 className="sim-details-title">{data.title}</h1>
              <p className="sim-details-dates">
                {data.startLabel} · {data.demoDayLabel}
              </p>
              <p className="sim-details-week">
                Semana {data.currentWeek} de {data.totalWeeks}
              </p>
              <div className="sim-week-track" role="list" aria-label="Progreso por semana">
                {data.weekLabels.map((label, index) => (
                  <span
                    key={label}
                    role="listitem"
                    className={
                      index === data.activeWeekIndex
                        ? "sim-week-pill sim-week-pill--active"
                        : index < data.activeWeekIndex
                          ? "sim-week-pill sim-week-pill--done"
                          : "sim-week-pill"
                    }
                  >
                    {label}
                  </span>
                ))}
              </div>
              <span className="sim-status-badge">{data.statusLabel}</span>
            </div>

            <div className="sim-insights">
              <h2 className="sim-insights-title">Indicadores</h2>
              <ul className="sim-insights-grid">
                {data.insights.map((item) => (
                  <li key={item.label} className="sim-insight-card">
                    <span className="sim-insight-value">{item.value}</span>
                    <span className="sim-insight-label">{item.label}</span>
                  </li>
                ))}
              </ul>
              <GradientButton href="/cargar-proyecto" className="sim-cta-upload">
                Cargar proyecto
              </GradientButton>
            </div>
          </div>
        </section>
      ) : null}

      <section className="sim-workspace" aria-label="Equipos de la simulación">
        <div className="sim-main-tabs" role="tablist" aria-label="Vistas">
          <button
            type="button"
            role="tab"
            aria-selected={mainTab === "active"}
            className={mainTab === "active" ? "sim-main-tab is-active" : "sim-main-tab"}
            onClick={() => setMainTab("active")}
          >
            Equipos activos
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mainTab === "history"}
            className="sim-main-tab sim-main-tab--locked"
            disabled
            title="Próximamente"
          >
            Historial 🔒
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mainTab === "context"}
            className="sim-main-tab sim-main-tab--locked"
            disabled
            title="Próximamente"
          >
            Contexto 🔒
          </button>
        </div>

        {mainTab === "active" ? (
          <>
            <div className="sim-toolbar">
              <label className="sim-search">
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
                className="sim-select"
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
              <div className="sim-table-head" aria-hidden>
                <span>Nombre</span>
                <span>Proyecto</span>
                <span>Vertical</span>
                <span>Miembros</span>
                <span>Mensajes</span>
                <span>Reuniones</span>
                <span>Entregables</span>
                <span />
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

      <p className="sim-prototype-note">
        Datos de demostración basados en{" "}
        <Link href="https://companies.nocountry.tech/simulation" target="_blank" rel="noreferrer">
          companies.nocountry.tech/simulation
        </Link>
        . Métricas y equipos hardcodeados para testing UX (pieza 1).
      </p>
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
      <span aria-hidden>{icon}</span>
      {value}
    </span>
  );
}

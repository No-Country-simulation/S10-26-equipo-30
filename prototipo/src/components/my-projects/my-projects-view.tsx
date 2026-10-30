"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  myProjects,
  projectStatusLabel,
  type MyProject,
  type ProjectPlan,
  type ProjectStatus,
} from "@/lib/my-projects-data";

type PlanFilter = "all" | ProjectPlan;
type QuickFilter = "all" | ProjectStatus;

export function MyProjectsView() {
  const [query, setQuery] = useState("");
  const [planFilter, setPlanFilter] = useState<PlanFilter>("all");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const total = myProjects.length;
  const activeCount = myProjects.filter((project) => project.status === "active").length;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return myProjects.filter((project) => {
      if (planFilter !== "all" && project.plan !== planFilter) return false;
      if (quickFilter !== "all" && project.status !== quickFilter) return false;
      if (!q) return true;
      return (
        project.title.toLowerCase().includes(q) ||
        project.description.toLowerCase().includes(q)
      );
    });
  }, [query, planFilter, quickFilter]);

  return (
    <div className="mp-view">
      <section className="mp-toolbar" aria-label="Resumen de proyectos">
        <div className="mp-stat">
          <span className="mp-stat-label">Total de proyectos</span>
          <span className="mp-stat-badge mp-stat-badge--pink">{total}</span>
        </div>
        <div className="mp-stat">
          <span className="mp-stat-label">Activos</span>
          <span className="mp-stat-badge mp-stat-badge--cyan">{activeCount}</span>
        </div>
        <label className="mp-search">
          <span className="mp-search-icon" aria-hidden>
            ⌕
          </span>
          <span className="sr-only">Buscar proyecto</span>
          <input
            type="search"
            placeholder="Buscar proyecto…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label className="mp-quick">
          <span>Acceso rápido:</span>
          <select
            value={quickFilter}
            onChange={(event) => setQuickFilter(event.target.value as QuickFilter)}
            aria-label="Acceso rápido"
          >
            <option value="all">Ver todos</option>
            <option value="pending">Pendientes</option>
            <option value="active">Activos</option>
          </select>
        </label>
        <div className="mp-plans" role="group" aria-label="Filtrar por plan">
          <PlanButton current={planFilter} value="all" onSelect={setPlanFilter}>
            Todos
          </PlanButton>
          <PlanButton current={planFilter} value="free" onSelect={setPlanFilter}>
            Free
          </PlanButton>
          <PlanButton current={planFilter} value="starter" onSelect={setPlanFilter}>
            Starter
          </PlanButton>
        </div>
      </section>

      {visible.length === 0 ? (
        <p className="mp-empty">No hay proyectos con esos filtros.</p>
      ) : (
        <ul className="mp-grid">
          {visible.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              expanded={expandedId === project.id}
              onToggle={() =>
                setExpandedId((current) => (current === project.id ? null : project.id))
              }
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function PlanButton({
  current,
  value,
  onSelect,
  children,
}: {
  current: PlanFilter;
  value: PlanFilter;
  onSelect: (value: PlanFilter) => void;
  children: string;
}) {
  return (
    <button
      type="button"
      className={current === value ? "mp-plan is-active" : "mp-plan"}
      aria-pressed={current === value}
      onClick={() => onSelect(value)}
    >
      {children}
    </button>
  );
}

function ProjectCard({
  project,
  expanded,
  onToggle,
}: {
  project: MyProject;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <li className="mp-card">
      <div className="mp-card-head">
        <h2 className="mp-card-title">{project.title}</h2>
        <span className={`mp-status mp-status--${project.status}`}>
          {projectStatusLabel[project.status]}
        </span>
      </div>
      <p className={expanded ? "mp-card-desc is-expanded" : "mp-card-desc"}>{project.description}</p>
      <div className="mp-card-rule" />
      <ChipGroup label="Sector" chips={project.sectors} />
      <ChipGroup label="Vertical" chips={project.verticals} />
      {project.skills.length > 0 ? (
        <ChipGroup label="Skills:" chips={project.skills} tone="skill" />
      ) : null}
      <div className="mp-card-footer">
        <button type="button" className="mp-more" onClick={onToggle}>
          {expanded ? "Ver menos" : "Ver más"}
        </button>
        <Link href="/cargar-proyecto" className="mp-edit">
          <span aria-hidden>✎</span> Editar
        </Link>
      </div>
    </li>
  );
}

function ChipGroup({
  label,
  chips,
  tone = "neutral",
}: {
  label: string;
  chips: string[];
  tone?: "neutral" | "skill";
}) {
  if (chips.length === 0) return null;
  return (
    <div className="mp-group">
      <p className="mp-group-label">{label}</p>
      <ul className="mp-chips">
        {chips.map((chip) => (
          <li key={chip} className={tone === "skill" ? "mp-chip mp-chip--skill" : "mp-chip"}>
            {chip}
          </li>
        ))}
      </ul>
    </div>
  );
}

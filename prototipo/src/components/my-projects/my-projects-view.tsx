"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { asRecord, textField } from "@/lib/research-labels";
import {
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
  const [projects, setProjects] = useState<MyProject[]>([]);
  const [fullView, setFullView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      const supabase = createClient();
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        if (!cancelled) {
          setError("Tenés que iniciar sesión para ver los proyectos.");
          setLoading(false);
        }
        return;
      }

      const [submissionRes, sessionRes, profileRes] = await Promise.all([
        supabase
          .from("project_submissions")
          .select("id, session_id, company, project")
          .order("submitted_at", { ascending: false }),
        supabase.from("test_sessions").select("id, user_id"),
        supabase.from("profiles").select("id, full_name, email, role"),
      ]);

      if (cancelled) return;
      const firstError = [submissionRes, sessionRes, profileRes].find((result) => result.error);
      if (firstError?.error) {
        setError(firstError.error.message);
        setLoading(false);
        return;
      }

      const profiles = (profileRes.data ?? []) as {
        id: string;
        full_name: string | null;
        email: string | null;
        role: string;
      }[];
      const me = profiles.find((person) => person.id === authData.user.id);
      const seesEveryone = me?.role === "researcher" || me?.role === "admin";
      const ownerBySession = new Map(
        ((sessionRes.data ?? []) as { id: string; user_id: string }[]).map((session) => [
          session.id,
          session.user_id,
        ]),
      );
      const nameByUser = new Map(
        profiles.map((person) => [
          person.id,
          person.full_name?.trim() || person.email?.trim() || "Invitado",
        ]),
      );

      const loaded = ((submissionRes.data ?? []) as {
        id: string;
        session_id: string;
        company: unknown;
        project: unknown;
      }[]).map((row) => {
        const project = asRecord(row.project);
        const company = asRecord(row.company);
        const ownerId = ownerBySession.get(row.session_id) ?? "";
        const vertical = textField(project, "vertical");
        const title = textField(project, "title");
        const companyName = textField(company, "companyName");
        return {
          id: row.id,
          title: title !== "—" ? title : companyName !== "—" ? companyName : "Sin título",
          description:
            textField(project, "problem") !== "—"
              ? textField(project, "problem")
              : textField(project, "challengeDescription") !== "—"
                ? textField(project, "challengeDescription")
                : "Sin descripción",
          status: "pending" as const,
          plan: "free" as const,
          sectors: stringList(project.sectors),
          verticals: vertical === "—" ? [] : [vertical],
          skills: stringList(project.tools),
          author: seesEveryone ? (nameByUser.get(ownerId) ?? "Invitado") : null,
          own: ownerId === authData.user.id,
          sessionId: row.session_id,
        };
      });

      setFullView(seesEveryone);
      setProjects(loaded);
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const total = projects.length;
  const activeCount = projects.filter((project) => project.status === "active").length;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((project) => {
      if (planFilter !== "all" && project.plan !== planFilter) return false;
      if (quickFilter !== "all" && project.status !== quickFilter) return false;
      if (!q) return true;
      return (
        project.title.toLowerCase().includes(q) ||
        project.description.toLowerCase().includes(q) ||
        (project.author?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [projects, query, planFilter, quickFilter]);

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

      {fullView ? (
        <p className="mp-scope">Proyectos cargados por todas las personas.</p>
      ) : null}

      {loading ? (
        <p className="mp-empty">Cargando proyectos…</p>
      ) : error ? (
        <p className="form-error">{error}</p>
      ) : visible.length === 0 ? (
        <p className="mp-empty">
          {projects.length === 0
            ? "Todavía no hay proyectos cargados."
            : "No hay proyectos con esos filtros."}
        </p>
      ) : (
        <ul className="mp-grid">
          {visible.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              expanded={expandedId === project.id}
              trailHref={fullView ? `/panel?sesion=${project.sessionId}` : null}
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
  trailHref,
  onToggle,
}: {
  project: MyProject;
  expanded: boolean;
  trailHref: string | null;
  onToggle: () => void;
}) {
  return (
    <li className="mp-card">
      <div className="mp-card-head">
        <div>
          <h2 className="mp-card-title">{project.title}</h2>
          {project.author ? <p className="mp-card-author">Cargado por {project.author}</p> : null}
        </div>
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
        {trailHref ? (
          <Link href={trailHref} className="mp-more">
            Ver más
          </Link>
        ) : (
          <button type="button" className="mp-more" onClick={onToggle}>
            {expanded ? "Ver menos" : "Ver más"}
          </button>
        )}
        {project.own ? (
          <Link href="/cargar-proyecto" className="mp-edit">
            <span aria-hidden>✎</span> Editar
          </Link>
        ) : (
          <span />
        )}
      </div>
    </li>
  );
}

function stringList(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
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

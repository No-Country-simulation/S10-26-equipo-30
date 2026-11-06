"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formErrorClass } from "@/components/form-styles";
import { cx } from "@/lib/cx";
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

const statLabelClass = "text-[0.72rem] font-[650] tracking-[0.06em] text-slate-300 uppercase";

const statBadgeClass =
  "min-w-[1.7rem] rounded-[0.4rem] px-[0.45rem] py-[0.15rem] text-center text-[0.95rem] leading-[1.2] font-bold";

const toolbarControlClass =
  "w-full rounded-[0.55rem] border border-nc-border bg-[rgba(7,11,18,0.65)] px-3 py-2 text-[0.85rem] text-slate-100";

const moreLinkClass = "cursor-pointer border-0 bg-transparent text-[0.88rem] text-slate-300";

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
    <div className="flex flex-col gap-5">
      <section
        className="flex flex-wrap items-center gap-x-[1.1rem] gap-y-[0.85rem] rounded-[0.9rem] border border-nc-border bg-[rgba(12,18,28,0.72)] px-4 py-[0.85rem]"
        aria-label="Resumen de proyectos"
      >
        <div className="flex items-center gap-[0.55rem]">
          <span className={statLabelClass}>Total de proyectos</span>
          <span className={cx(statBadgeClass, "bg-pink-500/16 text-pink-300")}>{total}</span>
        </div>
        <div className="flex items-center gap-[0.55rem]">
          <span className={statLabelClass}>Activos</span>
          <span className={cx(statBadgeClass, "bg-cyan-400/12 text-cyan-300")}>{activeCount}</span>
        </div>
        <label className="relative min-w-40 flex-[1_1_12rem]">
          <span
            className="pointer-events-none absolute top-1/2 left-[0.7rem] -translate-y-1/2 text-slate-500"
            aria-hidden
          >
            ⌕
          </span>
          <span className="sr-only">Buscar proyecto</span>
          <input
            type="search"
            className={cx(toolbarControlClass, "pl-[1.9rem]")}
            placeholder="Buscar proyecto…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label className="flex items-center gap-[0.45rem] text-[0.85rem] text-slate-400">
          <span>Acceso rápido:</span>
          <select
            className={cx(toolbarControlClass, "min-w-[8.5rem]")}
            value={quickFilter}
            onChange={(event) => setQuickFilter(event.target.value as QuickFilter)}
            aria-label="Acceso rápido"
          >
            <option value="all">Ver todos</option>
            <option value="pending">Pendientes</option>
            <option value="active">Activos</option>
          </select>
        </label>
        <div
          className="inline-flex gap-[0.35rem] min-[861px]:ml-auto"
          role="group"
          aria-label="Filtrar por plan"
        >
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
        <p className="mb-[0.9rem] text-[0.8rem] text-slate-400">
          Proyectos cargados por todas las personas.
        </p>
      ) : null}

      {loading ? (
        <p className="text-nc-muted">Cargando proyectos…</p>
      ) : error ? (
        <p className={formErrorClass}>{error}</p>
      ) : visible.length === 0 ? (
        <p className="text-nc-muted">
          {projects.length === 0
            ? "Todavía no hay proyectos cargados."
            : "No hay proyectos con esos filtros."}
        </p>
      ) : (
        <ul className="grid list-none grid-cols-1 gap-4 min-[861px]:grid-cols-2">
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
      className={cx(
        "cursor-pointer rounded-full border-0 px-[0.85rem] py-[0.4rem] text-[0.85rem]",
        current === value ? "bg-violet-600 font-semibold text-white" : "bg-transparent text-slate-400",
      )}
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
    <li className="flex min-h-88 flex-col gap-3 rounded-[0.9rem] border border-slate-400/16 bg-[rgba(10,16,28,0.88)] px-[1.15rem] pt-[1.1rem] pb-[0.9rem]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[1.2rem] font-bold">{project.title}</h2>
          {project.author ? (
            <p className="mt-1 text-[0.8rem] text-slate-400">Cargado por {project.author}</p>
          ) : null}
        </div>
        <span
          className={cx(
            "flex-none rounded-[0.4rem] px-[0.55rem] py-1 text-[0.72rem] font-[650]",
            project.status === "active"
              ? "bg-emerald-400/14 text-emerald-300"
              : "bg-yellow-400/16 text-amber-200",
          )}
        >
          {projectStatusLabel[project.status]}
        </span>
      </div>
      <p
        className={cx(
          "text-[0.92rem] leading-[1.45] text-slate-300",
          !expanded && "line-clamp-3",
        )}
      >
        {project.description}
      </p>
      <div className="h-px bg-slate-400/16" />
      <ChipGroup label="Sector" chips={project.sectors} />
      <ChipGroup label="Vertical" chips={project.verticals} />
      {project.skills.length > 0 ? (
        <ChipGroup label="Skills:" chips={project.skills} tone="skill" />
      ) : null}
      <div className="mt-auto flex items-center justify-between pt-[0.4rem]">
        {trailHref ? (
          <Link href={trailHref} className={moreLinkClass}>
            Ver más
          </Link>
        ) : (
          <button type="button" className={moreLinkClass} onClick={onToggle}>
            {expanded ? "Ver menos" : "Ver más"}
          </button>
        )}
        {project.own ? (
          <Link
            href="/cargar-proyecto"
            className={cx(
              moreLinkClass,
              "inline-flex items-center gap-[0.35rem] rounded-lg border border-slate-400/28 px-[0.7rem] py-[0.35rem]",
            )}
          >
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
    <div>
      <p className="mb-[0.4rem] text-[0.68rem] tracking-[0.07em] text-slate-400 uppercase">{label}</p>
      <ul className="flex list-none flex-wrap gap-[0.4rem]">
        {chips.map((chip) => (
          <li
            key={chip}
            className={cx(
              "rounded-[0.45rem] border px-[0.6rem] py-[0.28rem] text-[0.78rem]",
              tone === "skill"
                ? "border-indigo-500/45 bg-indigo-600/28 text-indigo-100"
                : "border-slate-400/22 bg-slate-900/70 text-slate-200",
            )}
          >
            {chip}
          </li>
        ))}
      </ul>
    </div>
  );
}

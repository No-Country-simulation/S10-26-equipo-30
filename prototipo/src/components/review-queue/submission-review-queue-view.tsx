"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import {
  labelReviewStatus,
  reviewStatusTone,
  type ReviewWorkflowStatus,
} from "@/lib/submission-review-status";
import { fieldLabelClass, fieldTextareaClass, formErrorClass } from "@/components/form-styles";
import { cx } from "@/lib/cx";
import { formatWhenArgentina, labelVariant } from "@/lib/research-labels";
import {
  BAND_THRESHOLDS,
  bandLevel,
  formatReviewPhone,
  parseBreakdown,
  postEnvioHint,
  type PreSubmitBand,
  type SubmissionReviewQueueRow,
} from "@/lib/submission-review-score";
import { createClient } from "@/lib/supabase/client";

const mutedTextClass = "leading-normal text-nc-muted";
const cardClass = "rounded-[0.9rem] border border-nc-border bg-[rgba(12,18,28,0.75)] px-5 py-4";
const termClass = "text-[0.72rem] font-[650] tracking-[0.04em] text-slate-400 uppercase";
const valueClass = "text-[0.88rem] break-words text-slate-100";
const smallButtonClass =
  "cursor-pointer rounded-full border border-nc-border bg-transparent px-3 py-[0.35rem] text-[0.8rem] text-slate-200 transition-colors hover:border-violet-500/50 hover:bg-violet-500/15 disabled:cursor-not-allowed disabled:opacity-50";
const primaryButtonClass =
  "cursor-pointer rounded-full border border-violet-500/50 bg-violet-500/25 px-4 py-[0.45rem] text-[0.85rem] font-semibold text-slate-100 transition-colors hover:bg-violet-500/35 disabled:cursor-wait disabled:opacity-60";

const bandToneClass = {
  hot: "border-rose-400/45 bg-rose-400/15 text-rose-100",
  warm: "border-amber-400/40 bg-amber-400/15 text-amber-200",
  cold: "border-slate-400/30 bg-slate-400/10 text-slate-300",
} as const;

const reviewStatusToneClass = {
  review: "border-amber-400/40 bg-amber-400/15 text-amber-200",
  enriched: "border-cyan-400/40 bg-cyan-400/15 text-cyan-200",
  adjust: "border-orange-400/40 bg-orange-400/15 text-orange-200",
  approved: "border-emerald-400/40 bg-emerald-400/15 text-emerald-200",
  rejected: "border-rose-400/40 bg-rose-400/15 text-rose-200",
} as const;

async function fetchQueue(): Promise<{ rows: SubmissionReviewQueueRow[]; error: string | null }> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("submission_review_queue");
  if (error) {
    return {
      rows: [],
      error:
        "No se pudo leer la cola de revisión. Si la migración de la pieza 5 todavía no está aplicada, pedile al equipo que la corra.",
    };
  }
  return {
    rows: ((data ?? []) as SubmissionReviewQueueRow[]).map((row) => ({
      ...row,
      score_breakdown: parseBreakdown(row.score_breakdown),
    })),
    error: null,
  };
}

export function SubmissionReviewQueueView() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<SubmissionReviewQueueRow[]>([]);
  const [bandFilter, setBandFilter] = useState<PreSubmitBand | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void fetchQueue().then((result) => {
      if (cancelled) return;
      setError(result.error);
      if (!result.error) setRows(result.rows);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const counts = useMemo(() => {
    const caliente = rows.filter((r) => r.pre_submit_band === "caliente").length;
    const templado = rows.filter((r) => r.pre_submit_band === "templado").length;
    const frio = rows.filter((r) => r.pre_submit_band === "frio").length;
    return { caliente, templado, frio, all: rows.length };
  }, [rows]);

  const visible = useMemo(() => {
    if (bandFilter === "all") return rows;
    return rows.filter((row) => row.pre_submit_band === bandFilter);
  }, [bandFilter, rows]);

  if (loading) {
    return <p className={mutedTextClass}>Cargando la cola de revisión…</p>;
  }

  return (
    <div>
      <header className="mb-8">
        <p className="mb-1 text-xs tracking-[0.08em] text-nc-muted uppercase">Contexto adicional</p>
        <h1 className="mb-2 text-[1.7rem]">Cola de revisión</h1>
        <p className={cx(mutedTextClass, "max-w-[52rem]")}>
          Proyectos ya enviados, ordenados por <strong className="font-semibold text-slate-200">score pre-envío</strong>{" "}
          (pieza 5). El puntaje se calcula al hacer submit con el formulario y la telemetría de la sesión — antes de
          cualquier WhatsApp o email de aterrizaje. Umbrales piloto: caliente ≥{BAND_THRESHOLDS.caliente}, templado ≥
          {BAND_THRESHOLDS.templado}.
        </p>
        <nav className="mt-4 flex flex-wrap gap-3 text-[0.85rem]">
          <Link href="/panel" className="font-semibold text-nc-cyan hover:underline">
            Panel de research
          </Link>
          <Link href="/panel/leads" className="font-semibold text-nc-cyan hover:underline">
            Leads (abandonos)
          </Link>
        </nav>
      </header>

      {error ? <p className={formErrorClass}>{error}</p> : null}

      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        <Stat value={String(counts.all)} label="En cola" />
        <Stat value={String(counts.caliente)} label="Caliente" />
        <Stat value={String(counts.templado)} label="Templado" />
        <Stat value={String(counts.frio)} label="Frío" />
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {(
          [
            ["all", `Todos (${counts.all})`],
            ["caliente", `Caliente (${counts.caliente})`],
            ["templado", `Templado (${counts.templado})`],
            ["frio", `Frío (${counts.frio})`],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={cx(
              smallButtonClass,
              bandFilter === value && "border-violet-500/50 bg-violet-500/20",
            )}
            onClick={() => setBandFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className={mutedTextClass}>
          {rows.length === 0
            ? "Todavía no hay proyectos enviados en este entorno."
            : "No hay envíos en esa banda."}
        </p>
      ) : (
        <ul className="flex list-none flex-col gap-4 p-0">
          {visible.map((row) => (
            <li key={row.submission_id}>
              <ReviewCard
                row={row}
                breakdownOpen={openId === row.submission_id}
                onToggleBreakdown={() =>
                  setOpenId((current) => (current === row.submission_id ? null : row.submission_id))
                }
                onSaved={() => setReloadKey((k) => k + 1)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className={cardClass}>
      <p className="m-0 text-[1.35rem] font-semibold text-slate-100">{value}</p>
      <p className="m-0 text-[0.78rem] text-nc-muted">{label}</p>
    </div>
  );
}

function ReviewCard({
  row,
  breakdownOpen,
  onToggleBreakdown,
  onSaved,
}: {
  row: SubmissionReviewQueueRow;
  breakdownOpen: boolean;
  onToggleBreakdown: () => void;
  onSaved: () => void;
}) {
  const band = bandLevel(row.pre_submit_band);
  const phone = formatReviewPhone(row);
  const breakdown = row.score_breakdown ?? [];
  const [flagsOpen, setFlagsOpen] = useState(false);

  return (
    <article className={cardClass}>
      <ReviewCardHeader row={row} band={band} onToggleBreakdown={onToggleBreakdown} breakdownOpen={breakdownOpen} />

      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field term="Organización">
          {[row.company_name, row.organization_type, row.country].filter(Boolean).join(" · ") || "—"}
        </Field>
        <Field term="Cuenta">
          {row.account_name || "Sin nombre"}
          {row.is_guest ? " (invitado)" : ""}
          {row.account_email ? ` · ${row.account_email}` : ""}
        </Field>
        <Field term="Teléfono">{phone ?? "—"}</Field>
        <Field term="Formulario">{labelVariant(row.flow_variant)}</Field>
        <Field term="Estado de revisión">
          <span
            className={cx(
              "inline-flex rounded-full border px-2 py-0.5 text-[0.78rem] font-medium",
              reviewStatusToneClass[
                reviewStatusTone((row.review_status as ReviewWorkflowStatus) ?? "en_revision")
              ],
            )}
          >
            {labelReviewStatus(row.review_status)}
          </span>
        </Field>
        <Field term="Problema (extracto)" className="sm:col-span-2">
          {row.problem_excerpt || "—"}
        </Field>
      </dl>

      <p className={cx("mt-3 text-[0.82rem]", mutedTextClass)}>
        <span className="text-slate-300">Post-envío sugerido:</span> {postEnvioHint(row.pre_submit_band, row.force_call)}
      </p>

      {breakdownOpen ? (
        <div className="mt-4 rounded-lg border border-nc-border/80 bg-black/20 px-4 py-3">
          <p className="mb-2 text-[0.75rem] font-semibold tracking-wide text-slate-400 uppercase">Desglose del score</p>
          {breakdown.length === 0 ? (
            <p className={mutedTextClass}>Sin criterios registrados.</p>
          ) : (
            <ul className="m-0 list-none space-y-1 p-0">
              {breakdown.map((line) => (
                <li
                  key={`${line.criterion}-${line.points}`}
                  className="flex justify-between gap-3 text-[0.85rem] text-slate-200"
                >
                  <span>{line.criterion}</span>
                  <span className={line.points < 0 ? "text-rose-300" : "text-emerald-200"}>
                    {line.points > 0 ? "+" : ""}
                    {line.points}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={`/panel/revision/${row.submission_id}`} className={primaryButtonClass}>
          Abrir proyecto
        </Link>
        <button type="button" className={smallButtonClass} onClick={() => setFlagsOpen((v) => !v)}>
          {flagsOpen ? "Cerrar overrides" : "Overrides del revisor"}
        </button>
        {row.priority_bump ? (
          <span className="rounded-full border border-violet-400/40 bg-violet-400/10 px-2 py-0.5 text-[0.75rem] text-violet-200">
            Prioridad subida
          </span>
        ) : null}
        {row.force_call ? (
          <span className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-2 py-0.5 text-[0.75rem] text-cyan-200">
            Call forzada
          </span>
        ) : null}
      </div>

      {flagsOpen ? (
        <FlagsForm
          row={row}
          onCancel={() => setFlagsOpen(false)}
          onSaved={() => {
            setFlagsOpen(false);
            onSaved();
          }}
        />
      ) : null}
    </article>
  );
}

function ReviewCardHeader({
  row,
  band,
  onToggleBreakdown,
  breakdownOpen,
}: {
  row: SubmissionReviewQueueRow;
  band: ReturnType<typeof bandLevel>;
  onToggleBreakdown: () => void;
  breakdownOpen: boolean;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="m-0 text-[1.05rem]">
          <Link
            href={`/panel/revision/${row.submission_id}`}
            className="text-slate-100 hover:text-nc-cyan hover:underline"
          >
            {row.project_title || "Sin título"}
          </Link>
        </h2>
        <p className="m-0 text-[0.85rem] text-nc-muted">
          Enviado {formatWhenArgentina(row.submitted_at)}
          {row.priority_bump ? " · orden con boost" : ""}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cx(
            "rounded-full border px-2.5 py-0.5 text-[0.75rem] font-semibold",
            bandToneClass[band.tone],
          )}
        >
          {band.label} · {row.pre_submit_score} pts
        </span>
        <button type="button" className={smallButtonClass} onClick={onToggleBreakdown}>
          {breakdownOpen ? "Ocultar desglose" : "Ver desglose"}
        </button>
      </div>
    </div>
  );
}

function Field({
  term,
  children,
  className,
}: {
  term: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className={termClass}>{term}</dt>
      <dd className={cx("m-0", valueClass)}>{children}</dd>
    </div>
  );
}

function FlagsForm({
  row,
  onCancel,
  onSaved,
}: {
  row: SubmissionReviewQueueRow;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [forceCall, setForceCall] = useState(row.force_call);
  const [priorityBump, setPriorityBump] = useState(row.priority_bump);
  const [note, setNote] = useState(row.flags_note ?? "");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFormError(null);
    const supabase = createClient();
    const { error } = await supabase.rpc("set_submission_review_flags", {
      p_submission_id: row.submission_id,
      p_force_call: forceCall,
      p_priority_bump: priorityBump,
      p_note: note.trim() || null,
    });
    setSaving(false);
    if (error) {
      setFormError("No se pudieron guardar los overrides.");
      return;
    }
    onSaved();
  }

  return (
    <form
      className="mt-4 rounded-lg border border-nc-border/80 bg-black/25 px-4 py-4"
      onSubmit={(event) => void submit(event)}
    >
      <p className="mb-3 text-[0.85rem] text-slate-200">
        No recalcula el formulario: solo ajusta operación (pieza 5).
      </p>
      <label className="mb-2 flex items-center gap-2 text-[0.85rem] text-slate-200">
        <input
          type="checkbox"
          checked={forceCall}
          onChange={(e) => setForceCall(e.target.checked)}
          className="accent-violet-400"
        />
        Forzar oferta de call 15 min
      </label>
      <label className="mb-3 flex items-center gap-2 text-[0.85rem] text-slate-200">
        <input
          type="checkbox"
          checked={priorityBump}
          onChange={(e) => setPriorityBump(e.target.checked)}
          className="accent-violet-400"
        />
        Subir prioridad en la cola
      </label>
      <label className={fieldLabelClass}>
        Nota interna
        <textarea
          className={fieldTextareaClass}
          rows={2}
          maxLength={2000}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </label>
      {formError ? <p className={formErrorClass}>{formError}</p> : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="submit" className={primaryButtonClass} disabled={saving}>
          {saving ? "Guardando…" : "Guardar"}
        </button>
        <button type="button" className={smallButtonClass} onClick={onCancel} disabled={saving}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

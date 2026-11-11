"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { fieldLabelClass, fieldTextareaClass, formErrorClass } from "@/components/form-styles";
import { cx } from "@/lib/cx";
import { formatDuration, formatWhenArgentina, labelVariant } from "@/lib/research-labels";
import {
  bandLevel,
  postEnvioHint,
} from "@/lib/submission-review-score";
import {
  companyFieldRows,
  labelReviewStatus,
  parseSubmissionReviewDetail,
  projectFieldRows,
  reviewStatusOptions,
  reviewStatusTone,
  type ReviewWorkflowStatus,
  type SubmissionReviewDetail,
} from "@/lib/submission-review-status";
import { createClient } from "@/lib/supabase/client";

const mutedTextClass = "leading-normal text-nc-muted";
const cardClass = "rounded-[0.9rem] border border-nc-border bg-[rgba(12,18,28,0.75)] px-5 py-4";
const termClass = "text-[0.72rem] font-[650] tracking-[0.04em] text-slate-400 uppercase";
const valueClass = "text-[0.88rem] break-words whitespace-pre-wrap text-slate-100";
const selectClass =
  "w-full rounded-lg border border-nc-border bg-[rgba(7,11,18,0.65)] px-3 py-2 text-[0.9rem] text-slate-100";
const primaryButtonClass =
  "cursor-pointer rounded-full border border-violet-500/50 bg-violet-500/25 px-4 py-[0.45rem] text-[0.85rem] font-semibold text-slate-100 transition-colors hover:bg-violet-500/35 disabled:cursor-wait disabled:opacity-60";

const statusToneClass = {
  review: "border-amber-400/40 bg-amber-400/15 text-amber-200",
  enriched: "border-cyan-400/40 bg-cyan-400/15 text-cyan-200",
  adjust: "border-orange-400/40 bg-orange-400/15 text-orange-200",
  approved: "border-emerald-400/40 bg-emerald-400/15 text-emerald-200",
  rejected: "border-rose-400/40 bg-rose-400/15 text-rose-200",
} as const;

const bandToneClass = {
  hot: "border-rose-400/45 bg-rose-400/15 text-rose-100",
  warm: "border-amber-400/40 bg-amber-400/15 text-amber-200",
  cold: "border-slate-400/30 bg-slate-400/10 text-slate-300",
} as const;

async function loadDetail(submissionId: string): Promise<{
  detail: SubmissionReviewDetail | null;
  error: string | null;
}> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("submission_review_detail", {
    p_submission_id: submissionId,
  });
  if (error) {
    const denied =
      error.message.includes("not_allowed") ||
      error.message.includes("permission") ||
      error.code === "PGRST116";
    return {
      detail: null,
      error: denied
        ? "No se encontró el envío o no tenés permiso para verlo."
        : "No se pudo cargar el proyecto. ¿Corriste la migración de estado de revisión?",
    };
  }
  const row = Array.isArray(data) && data[0] ? parseSubmissionReviewDetail(data[0] as Record<string, unknown>) : null;
  return { detail: row, error: row ? null : "No se encontró el envío." };
}

export function SubmissionReviewDetailView({ submissionId }: { submissionId: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<SubmissionReviewDetail | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void loadDetail(submissionId).then((result) => {
      if (cancelled) return;
      setError(result.error);
      setDetail(result.detail);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [submissionId, reloadKey]);

  if (loading) {
    return <p className={mutedTextClass}>Cargando el proyecto…</p>;
  }

  if (error || !detail) {
    return (
      <div>
        <p className={formErrorClass}>{error ?? "No se pudo cargar el envío."}</p>
        <Link href="/panel/revision" className="mt-3 inline-block text-nc-cyan">
          ← Volver a la cola
        </Link>
      </div>
    );
  }

  const band = bandLevel(detail.pre_submit_band);
  const statusTone = reviewStatusTone(detail.review_status);
  const title = detail.project.title?.trim() || "Sin título";

  return (
    <div>
      <header className="mb-6">
        <Link href="/panel/revision" className="text-[0.85rem] text-nc-cyan hover:underline">
          ← Cola de revisión
        </Link>
        <h1 className="mt-2 mb-1 text-[1.7rem]">{title}</h1>
        <p className={mutedTextClass}>
          Enviado {formatWhenArgentina(detail.submitted_at)}
          {detail.session_started_at
            ? ` · ${formatDuration(detail.session_started_at, detail.submitted_at)} en el formulario`
            : ""}
          {" · "}
          {labelVariant(detail.flow_variant)}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span
            className={cx(
              "rounded-full border px-2.5 py-0.5 text-[0.75rem] font-semibold",
              bandToneClass[band.tone],
            )}
          >
            {band.label} · {detail.pre_submit_score} pts
          </span>
          <span
            className={cx(
              "rounded-full border px-2.5 py-0.5 text-[0.75rem] font-semibold",
              statusToneClass[statusTone],
            )}
          >
            {labelReviewStatus(detail.review_status)}
          </span>
        </div>
        <p className={cx("mt-3 max-w-[52rem] text-[0.82rem]", mutedTextClass)}>
          {postEnvioHint(detail.pre_submit_band, detail.force_call)}
        </p>
        <p className="mt-2 text-[0.85rem]">
          <Link
            href={`/panel?sesion=${detail.session_id}`}
            className="font-semibold text-nc-cyan hover:underline"
          >
            Ver telemetría de la sesión en el panel →
          </Link>
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(17rem,22rem)]">
        <div className="flex flex-col gap-5">
          <Section title="Cuenta y contacto">
            <dl className="grid gap-3 sm:grid-cols-2">
              <DataField label="Nombre">{detail.account_name || "—"}</DataField>
              <DataField label="Correo">
                {detail.account_email || "—"}
                {detail.is_guest ? " (invitado)" : ""}
              </DataField>
            </dl>
          </Section>

          <Section title="Organización">
            <dl className="grid gap-3">
              {companyFieldRows(detail.company, detail.company.phoneDialCode).map((row) => (
                <DataField key={row.label} label={row.label}>
                  {row.value}
                </DataField>
              ))}
            </dl>
          </Section>

          <Section title="Proyecto y brief">
            <dl className="grid gap-3">
              {projectFieldRows(detail.project).map((row) => (
                <DataField key={row.label} label={row.label} multiline={row.multiline}>
                  {row.value}
                </DataField>
              ))}
            </dl>
          </Section>

          {detail.score_breakdown.length > 0 ? (
            <Section title="Desglose del score pre-envío">
              <ul className="m-0 list-none space-y-1 p-0">
                {detail.score_breakdown.map((line) => (
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
            </Section>
          ) : null}
        </div>

        <aside className="lg:sticky lg:top-4 lg:self-start">
          <StatusEditor
            detail={detail}
            onSaved={() => {
              setLoading(true);
              setReloadKey((k) => k + 1);
              void loadDetail(submissionId).then((result) => {
                setError(result.error);
                setDetail(result.detail);
                setLoading(false);
              });
            }}
          />
        </aside>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={cardClass}>
      <h2 className="m-0 mb-4 text-[1rem] font-semibold text-slate-100">{title}</h2>
      {children}
    </section>
  );
}

function DataField({
  label,
  children,
  multiline,
}: {
  label: string;
  children: React.ReactNode;
  multiline?: boolean;
}) {
  return (
    <div>
      <dt className={termClass}>{label}</dt>
      <dd className={cx("m-0 mt-0.5", valueClass, !multiline && "whitespace-normal")}>{children}</dd>
    </div>
  );
}

function StatusEditor({ detail, onSaved }: { detail: SubmissionReviewDetail; onSaved: () => void }) {
  const [status, setStatus] = useState<ReviewWorkflowStatus>(detail.review_status);
  const [note, setNote] = useState(detail.review_status_note ?? "");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [emailNotice, setEmailNotice] = useState<string | null>(null);

  useEffect(() => {
    setStatus(detail.review_status);
    setNote(detail.review_status_note ?? "");
    setSaved(false);
  }, [detail.review_status, detail.review_status_note, detail.submission_id]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFormError(null);
    setSaved(false);
    setEmailNotice(null);
    const previousStatus = detail.review_status;
    const supabase = createClient();
    const { error } = await supabase.rpc("set_submission_review_status", {
      p_submission_id: detail.submission_id,
      p_review_status: status,
      p_note: note.trim() || null,
    });
    if (error) {
      setSaving(false);
      setFormError("No se pudo guardar el estado. Revisá la migración o tus permisos.");
      return;
    }

    let notice: string | null = null;
    if (status === "aprobado" && previousStatus !== "aprobado") {
      const emailRes = await fetch("/api/emails/approval-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId: detail.submission_id }),
      });
      const emailJson = (await emailRes.json().catch(() => ({}))) as {
        status?: string;
        reason?: string;
        error?: string;
        to?: string;
      };
      if (emailRes.ok && emailJson.status === "sent") {
        notice = emailJson.to
          ? `Correo de aprobación enviado a ${emailJson.to}.`
          : "Correo de aprobación enviado.";
      } else if (emailJson.status === "skipped") {
        if (emailJson.reason === "owner_no_email" || emailJson.reason === "owner_guest") {
          notice = "Estado guardado. No hay correo del decisor (invitado o sin email).";
        } else if (emailJson.reason === "resend_not_configured") {
          notice = "Estado guardado. Resend no está configurado: no se envió el correo.";
        } else {
          notice = "Estado guardado. El correo de aprobación no se envió.";
        }
      } else if (!emailRes.ok) {
        notice = "Estado guardado, pero falló el correo de aprobación. Probá de nuevo más tarde.";
      }
    }

    setSaving(false);
    setSaved(true);
    setEmailNotice(notice);
    onSaved();
  }

  return (
    <form className={cardClass} onSubmit={(event) => void submit(event)}>
      <h2 className="m-0 mb-1 text-[1rem] font-semibold text-slate-100">Estado de revisión</h2>
      <p className={cx("m-0 mb-4 text-[0.8rem]", mutedTextClass)}>
        Lo ve el equipo y el decisor en Mis Proyectos. Si marcás <strong className="text-slate-300">Aprobado</strong>,
        se envía el correo post-aprobación (pieza 6) con CTA a Mis Proyectos.
      </p>
      {detail.review_status_updated_at ? (
        <p className={cx("mb-3 text-[0.78rem]", mutedTextClass)}>
          Última actualización: {formatWhenArgentina(detail.review_status_updated_at)}
        </p>
      ) : null}
      <label className={fieldLabelClass}>
        Estado
        <select
          className={selectClass}
          value={status}
          onChange={(e) => setStatus(e.target.value as ReviewWorkflowStatus)}
        >
          {reviewStatusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
      <label className={cx(fieldLabelClass, "mt-3 block")}>
        Nota (opcional)
        <textarea
          className={fieldTextareaClass}
          rows={4}
          maxLength={2000}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Contexto para el equipo o mensaje resumido al decisor."
        />
      </label>
      {formError ? <p className={formErrorClass}>{formError}</p> : null}
      {saved ? <p className="m-0 text-[0.82rem] text-emerald-300">Estado guardado.</p> : null}
      {emailNotice ? <p className="mt-2 text-[0.8rem] text-slate-300">{emailNotice}</p> : null}
      <button type="submit" className={cx(primaryButtonClass, "mt-4 w-full")} disabled={saving}>
        {saving ? "Guardando…" : "Guardar estado"}
      </button>
    </form>
  );
}

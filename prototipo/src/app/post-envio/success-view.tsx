"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { formErrorClass } from "@/components/form-styles";
import { GradientButton } from "@/components/gradient-button";
import { cx } from "@/lib/cx";
import { REVIEW_TIME_LABEL } from "@/lib/email/submission-confirmation";
import { clearDraft } from "@/lib/form-storage";
import {
  confirmationEmailRequested,
  hasFormSession,
  isAuthRequired,
  loadExperienceFeedback,
  logFormEvent,
  saveExperienceFeedback,
  type ExperienceRating,
} from "@/lib/research-persistence";

const experienceOptions: { id: ExperienceRating; emoji: string; label: string; hint?: string }[] = [
  { id: "sencilla", emoji: "😊", label: "Sencilla" },
  { id: "neutra", emoji: "😐", label: "Neutra" },
  { id: "frustrante", emoji: "😣", label: "Frustrante", hint: "Difícil de comprender" },
];

const exitLinkClass = "text-[0.85rem] text-nc-muted hover:text-slate-100";

/** El indicador lo deja el envío, antes de llegar a esta pantalla. */
function subscribeToNothing() {
  return () => {};
}

export function SuccessView() {
  const searchParams = useSearchParams();
  const emailRequested = useSyncExternalStore(
    subscribeToNothing,
    confirmationEmailRequested,
    () => false,
  );
  const [canComment, setCanComment] = useState(false);
  const [rating, setRating] = useState<ExperienceRating | null>(null);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("enviado") === "1") {
      clearDraft();
      void logFormEvent("post_envio_view", "post-envio").catch(() => {});
    }
  }, [searchParams]);

  useEffect(() => {
    if (!hasFormSession()) return;
    setCanComment(true);
    void loadExperienceFeedback()
      .then((existing) => {
        if (!existing) return;
        setRating(existing.rating);
        setComment(existing.comment);
        setSaved(true);
      })
      .catch((cause) => {
        if (isAuthRequired(cause)) setCanComment(false);
      });
  }, []);

  async function sendFeedback() {
    if (!rating || saving || saved) return;
    setSaving(true);
    setFeedbackError(null);
    try {
      await saveExperienceFeedback(rating, comment);
      setSaved(true);
    } catch (cause) {
      if (isAuthRequired(cause)) {
        setCanComment(false);
        return;
      }
      setFeedbackError(cause instanceof Error ? cause.message : "No se pudo guardar el comentario.");
    } finally {
      setSaving(false);
    }
  }

  const chosen = experienceOptions.find((option) => option.id === rating);

  return (
    <section className="flex min-h-0 flex-col gap-[0.85rem] max-sm:gap-[0.6rem]" aria-label="Proyecto enviado">
      <div className="flex flex-col items-start gap-[0.3rem]">
        <p className="inline-flex items-center gap-[0.45rem] self-start text-[0.82rem] font-semibold text-emerald-400">
          <span
            className="inline-flex h-[1.35rem] w-[1.35rem] items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-400/14 text-[0.72rem]"
            aria-hidden
          >
            ✓
          </span>
          Proyecto enviado
        </p>
        <p className="text-[0.78rem] leading-[1.35] text-nc-muted opacity-80">
          {emailRequested
            ? `Te enviamos un correo con el resumen y los próximos pasos. Te escribimos dentro de ${REVIEW_TIME_LABEL} para validarlo juntos.`
            : `Como entraste como invitado no te llega un correo: seguí el estado desde Mis proyectos. Lo revisamos dentro de ${REVIEW_TIME_LABEL}.`}
        </p>
      </div>

      {canComment || saved ? (
        <h1
          id="experience-title"
          className="text-[clamp(1.2rem,2.6vw,1.65rem)] leading-tight tracking-[-0.02em]"
        >
          ¿Cómo fue tu experiencia cargando el proyecto?
        </h1>
      ) : null}

      {saved ? (
        <div className="flex flex-col items-start gap-[0.85rem]">
          <p className="leading-[1.45] text-nc-muted" role="status">
            Gracias. Guardamos
            {chosen ? ` «${chosen.label}»` : " tu respuesta"}
            {comment.trim() ? " y el comentario." : "."}
          </p>
          <a className={exitLinkClass} href="/mis-proyectos">
            Ver mis proyectos
          </a>
        </div>
      ) : canComment ? (
        <form
          className="flex min-h-0 flex-col gap-3 max-sm:gap-[0.6rem]"
          onSubmit={(event) => {
            event.preventDefault();
            void sendFeedback();
          }}
        >
          <div className="grid grid-cols-3 gap-[0.65rem]" role="radiogroup" aria-label="Experiencia de carga">
            {experienceOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={rating === option.id}
                className={cx(
                  "flex min-h-[5.25rem] cursor-pointer flex-col items-center justify-center gap-[0.15rem] rounded-[0.85rem] border bg-nc-card px-[0.4rem] py-[0.65rem] outline-none max-sm:min-h-[4.6rem] max-sm:px-1 max-sm:py-[0.45rem]",
                  rating === option.id
                    ? "border-purple-500 shadow-[0_0_0_1px_#a855f7]"
                    : "border-nc-border hover:border-violet-500/70 focus-visible:border-violet-500/70",
                )}
                onClick={() => setRating(option.id)}
              >
                <span className="text-[1.55rem] leading-none max-sm:text-[1.35rem]" aria-hidden>
                  {option.emoji}
                </span>
                <span className="text-[0.92rem] font-[650] max-sm:text-[0.78rem]">{option.label}</span>
                {option.hint ? (
                  <span className="text-center text-[0.72rem] leading-[1.25] text-nc-muted">
                    {option.hint}
                  </span>
                ) : null}
              </button>
            ))}
          </div>

          <label className="flex flex-col gap-[0.35rem] text-[0.85rem] text-nc-muted">
            Tu comentario sobre tu experiencia nos ayuda a mejorar
            <textarea
              className="h-[4.25rem] w-full resize-none rounded-[0.65rem] border border-nc-border bg-nc-card px-3 py-[0.6rem] text-[0.92rem] text-slate-100 max-sm:h-[3.4rem]"
              value={comment}
              maxLength={2000}
              rows={2}
              placeholder="Contanos qué te resultó claro o qué te trabó"
              onChange={(event) => setComment(event.target.value)}
            />
          </label>

          {feedbackError ? <p className={formErrorClass}>{feedbackError}</p> : null}

          <div className="flex items-center justify-between gap-3 max-sm:flex-col max-sm:items-stretch">
            <GradientButton
              type="submit"
              arrow="none"
              busy={saving}
              disabled={!rating || saving}
              className="max-sm:w-full"
            >
              {saving ? "Guardando…" : "Enviar comentario"}
            </GradientButton>
            <a className={exitLinkClass} href="/mis-proyectos">
              Ver mis proyectos
            </a>
          </div>
        </form>
      ) : (
        <a className={exitLinkClass} href="/mis-proyectos">
          Ver mis proyectos
        </a>
      )}
    </section>
  );
}

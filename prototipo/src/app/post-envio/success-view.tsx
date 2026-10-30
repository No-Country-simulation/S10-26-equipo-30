"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { GradientButton } from "@/components/gradient-button";
import { clearDraft } from "@/lib/form-storage";
import {
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

export function SuccessView() {
  const searchParams = useSearchParams();
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
    <section className="finish-card" aria-label="Proyecto enviado">
      <div className="finish-sent">
        <p className="finish-status">
          <span className="finish-check" aria-hidden>
            ✓
          </span>
          Proyecto enviado
        </p>
        <p className="finish-mail">Te enviamos un correo con información sobre los próximos pasos.</p>
      </div>

      {canComment || saved ? (
        <h1 id="experience-title" className="finish-question">
          ¿Cómo fue tu experiencia cargando el proyecto?
        </h1>
      ) : null}

      {saved ? (
        <div className="finish-done">
          <p className="experience-thanks" role="status">
            Gracias. Guardamos
            {chosen ? ` «${chosen.label}»` : " tu respuesta"}
            {comment.trim() ? " y el comentario." : "."}
          </p>
          <a className="finish-exit" href="/mis-proyectos">
            Ver mis proyectos
          </a>
        </div>
      ) : canComment ? (
        <form
          className="finish-form"
          onSubmit={(event) => {
            event.preventDefault();
            void sendFeedback();
          }}
        >
          <div className="experience-options" role="radiogroup" aria-label="Experiencia de carga">
            {experienceOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={rating === option.id}
                className={rating === option.id ? "experience-option is-selected" : "experience-option"}
                onClick={() => setRating(option.id)}
              >
                <span className="experience-emoji" aria-hidden>
                  {option.emoji}
                </span>
                <span className="experience-label">{option.label}</span>
                {option.hint ? <span className="experience-hint">{option.hint}</span> : null}
              </button>
            ))}
          </div>

          <label className="experience-comment">
            Tu comentario sobre tu experiencia nos ayuda a mejorar
            <textarea
              value={comment}
              maxLength={2000}
              rows={2}
              placeholder="Contanos qué te resultó claro o qué te trabó"
              onChange={(event) => setComment(event.target.value)}
            />
          </label>

          {feedbackError ? <p className="form-error">{feedbackError}</p> : null}

          <div className="finish-actions">
            <GradientButton type="submit" arrow="none" busy={saving} disabled={!rating || saving}>
              {saving ? "Guardando…" : "Enviar comentario"}
            </GradientButton>
            <a className="finish-exit" href="/mis-proyectos">
              Ver mis proyectos
            </a>
          </div>
        </form>
      ) : (
        <a className="finish-exit" href="/mis-proyectos">
          Ver mis proyectos
        </a>
      )}
    </section>
  );
}

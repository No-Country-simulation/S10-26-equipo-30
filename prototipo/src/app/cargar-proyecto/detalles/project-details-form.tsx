"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormCard } from "@/components/form-card";
import { MultiSelect } from "@/components/multi-select";
import {
  businessSectors,
  deliverables,
  impactOptions,
  projectStages,
  roles,
  tools,
  verticals,
} from "@/lib/form-options";
import { loadDraft, saveProject, type ProjectFormData } from "@/lib/form-storage";
import {
  answerClassicQuestion,
  logFormEvent,
  submitFormTest,
  touchFormActivity,
  viewClassicQuestion,
} from "@/lib/research-persistence";

const TITLE_MAX = 100;
const PROBLEM_MAX = 512;
const DESCRIPTION_MAX = 10000;

export function ProjectDetailsForm() {
  const router = useRouter();
  const [form, setForm] = useState<ProjectFormData>(() => loadDraft().project);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const draft = loadDraft();
    if (!draft.company.companyName) {
      router.replace("/cargar-proyecto/compania");
      return;
    }
    setForm(draft.project);
    void logFormEvent("screen_view", "detalles", { screen: "detalles" }).catch(() => {});
  }, [router]);

  function update<K extends keyof ProjectFormData>(key: K, value: ProjectFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const missing = [
      !form.title.trim() ? "title" : "",
      !form.problem.trim() ? "problem" : "",
      !form.challengeDescription.trim() ? "description" : "",
      form.deliverables.length === 0 ? "deliverables" : "",
      !form.vertical ? "vertical" : "",
      form.sectors.length === 0 ? "sectors" : "",
      !form.stage ? "stage" : "",
      !form.impact ? "impact" : "",
    ].filter(Boolean);
    if (missing.length > 0) {
      setError("Completá todos los campos obligatorios.");
      void logFormEvent("validation_error", missing[0], { missing }).catch(() => {});
      return;
    }
    setError(null);
    setSubmitting(true);
    saveProject(form);
    try {
      await submitFormTest(loadDraft());
      router.push("/post-envio?enviado=1");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo guardar el envío.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} onChange={touchFormActivity}>
      <FormCard
        backHref="/cargar-proyecto/compania"
        backIconOnly
        continueLabel={submitting ? "Publicando…" : "Publicar Proyecto"}
        continueType="submit"
        continueDisabled={submitting}
        continueBusy={submitting}
      >
        <h1 className="section-heading">
          <span className="section-icon" aria-hidden>
            📄
          </span>
          Detalles del Proyecto
        </h1>

        {error ? <p className="form-error">{error}</p> : null}

        <div className="form-grid">
          <label className="field">
            <span className="field-label">
              Título del Proyecto<span className="field-required">*</span>
            </span>
            <input
              className="field-input"
              type="text"
              maxLength={TITLE_MAX}
              value={form.title}
              onFocus={() => viewClassicQuestion("title")}
              onChange={(e) => update("title", e.target.value)}
              onBlur={(e) => answerClassicQuestion("title", Boolean(e.target.value.trim()))}
              placeholder="ej. Plataforma de E-commerce para PYMES"
              required
            />
            <p className="field-meta">
              {form.title.length}/{TITLE_MAX}
            </p>
          </label>

          <label className="field">
            <span className="field-label">
              ¿Qué problema quieres resolver?<span className="field-required">*</span>
            </span>
            <input
              className="field-input"
              type="text"
              maxLength={PROBLEM_MAX}
              value={form.problem}
              onFocus={() => viewClassicQuestion("problem")}
              onChange={(e) => update("problem", e.target.value)}
              onBlur={(e) => answerClassicQuestion("problem", Boolean(e.target.value.trim()))}
              placeholder="Ej. Reducir abandono en onboarding de usuarios"
              required
            />
            <p className="field-meta">
              {form.problem.length}/{PROBLEM_MAX}
            </p>
          </label>

          <label className="field">
            <span className="field-label">
              Descripción del Desafío<span className="field-required">*</span>
            </span>
            <textarea
              className="field-textarea"
              maxLength={DESCRIPTION_MAX}
              rows={6}
              value={form.challengeDescription}
              onFocus={() => viewClassicQuestion("description")}
              onChange={(e) => update("challengeDescription", e.target.value)}
              onBlur={(e) => answerClassicQuestion("description", Boolean(e.target.value.trim()))}
              placeholder="Ej. Somos una startup B2B SaaS en etapa MVP. Notamos que muchos usuarios abandonan el onboarding antes de completar la primera acción clave..."
              required
            />
            <p className="field-meta">
              {form.challengeDescription.length}/{DESCRIPTION_MAX}
            </p>
          </label>

          <MultiSelect
            label="¿Qué esperas que los equipos entreguen?"
            required
            options={deliverables}
            value={form.deliverables}
            onOpen={() => viewClassicQuestion("deliverables")}
            onChange={(v) => {
              update("deliverables", v);
              answerClassicQuestion("deliverables", v.length > 0);
              touchFormActivity();
            }}
            max={5}
            placeholder="Selecciona entregables"
          />

          <div className="form-grid-2">
            <label className="field">
              <span className="field-label">
                Vertical<span className="field-required">*</span>
              </span>
              <select
                className="field-select"
                value={form.vertical}
                onFocus={() => viewClassicQuestion("vertical")}
                onChange={(e) => {
                  update("vertical", e.target.value);
                  answerClassicQuestion("vertical", Boolean(e.target.value));
                }}
                required
              >
                <option value="">Selecciona una vertical</option>
                {verticals.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>

            <MultiSelect
              label="Sector/es de negocio"
              required
              options={businessSectors}
              value={form.sectors}
              onOpen={() => viewClassicQuestion("sectors")}
              onChange={(v) => {
                update("sectors", v);
                answerClassicQuestion("sectors", v.length > 0);
                touchFormActivity();
              }}
              max={5}
              placeholder="Selecciona sectores"
            />

            <label className="field">
              <span className="field-label">
                Etapa del proyecto<span className="field-required">*</span>
              </span>
              <select
                className="field-select"
                value={form.stage}
                onFocus={() => viewClassicQuestion("stage")}
                onChange={(e) => {
                  update("stage", e.target.value);
                  answerClassicQuestion("stage", Boolean(e.target.value));
                }}
                required
              >
                <option value="">Selecciona la etapa</option>
                {projectStages.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="field-label">
                ¿Qué impacto tendría resolver esto?<span className="field-required">*</span>
              </span>
              <select
                className="field-select"
                value={form.impact}
                onFocus={() => viewClassicQuestion("impact")}
                onChange={(e) => {
                  update("impact", e.target.value);
                  answerClassicQuestion("impact", Boolean(e.target.value));
                }}
                required
              >
                <option value="">Selecciona el impacto</option>
                {impactOptions.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </label>

            <MultiSelect
              label="Roles de interés"
              optional
              options={roles}
              value={form.roles}
              onOpen={() => viewClassicQuestion("roles")}
              onChange={(v) => {
                update("roles", v);
                answerClassicQuestion("roles", v.length > 0);
                touchFormActivity();
              }}
              max={7}
              placeholder="Selecciona roles"
            />

            <MultiSelect
              label="Tools de interés"
              optional
              options={tools}
              value={form.tools}
              onOpen={() => viewClassicQuestion("tools")}
              onChange={(v) => {
                update("tools", v);
                answerClassicQuestion("tools", v.length > 0);
                touchFormActivity();
              }}
              max={10}
              placeholder="Selecciona herramientas"
            />
          </div>
        </div>
      </FormCard>
    </form>
  );
}

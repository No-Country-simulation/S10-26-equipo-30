"use client";

import { FormEvent, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ClassicStepProgress } from "@/components/classic-step-progress";
import { FormCard } from "@/components/form-card";
import { GroupedSelect } from "@/components/grouped-select";
import {
  fieldInputClass,
  fieldLabelClass,
  fieldMetaClass,
  fieldTextareaClass,
  formErrorClass,
  formGrid2Class,
  formGridClass,
  requiredMarkClass,
  sectionHeadingClass,
  sectionIconClass,
} from "@/components/form-styles";
import { MultiSelect } from "@/components/multi-select";
import {
  businessSectorGroups,
  deliverableDescriptions,
  deliverables,
  impactGroups,
  projectStageGroups,
  roleGroups,
  toolGroups,
  verticalGroups,
} from "@/lib/form-options";
import { loadDraft, saveProject, type ProjectFormData } from "@/lib/form-storage";
import {
  answerClassicQuestion,
  flushFormPersistence,
  isAuthRequired,
  logFormEvent,
  restartAfterLogin,
  submitFormTest,
  touchFormActivity,
  viewClassicQuestion,
} from "@/lib/research-persistence";
import { useDraftAutosave } from "@/lib/use-draft-autosave";

const TITLE_MAX = 100;
const PROBLEM_MAX = 512;
const DESCRIPTION_MAX = 10000;

export function ProjectDetailsForm() {
  const router = useRouter();
  const [form, setForm] = useState<ProjectFormData>(() => loadDraft().project);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Next conserva esta pantalla oculta al enviar; al volver, el botón no debe seguir en "Enviando…".
  useLayoutEffect(() => () => setSubmitting(false), []);

  const autosaveDraft = useMemo(() => ({ company: loadDraft().company, project: form }), [form]);
  useDraftAutosave(autosaveDraft, "detalles");

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
      await flushFormPersistence();
      await submitFormTest(loadDraft());
      router.push("/post-envio?enviado=1");
    } catch (cause) {
      if (isAuthRequired(cause)) {
        restartAfterLogin();
        return;
      }
      setError(cause instanceof Error ? cause.message : "No se pudo guardar el envío.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} onChange={touchFormActivity}>
      <FormCard
        variant="shell"
        backHref="/cargar-proyecto/compania"
        backIconOnly
        continueLabel={submitting ? "Enviando…" : "Enviar a revisión"}
        continueType="submit"
        continueDisabled={submitting}
        continueBusy={submitting}
      >
        <ClassicStepProgress step={2} />

        <h1 className={sectionHeadingClass}>
          <span className={sectionIconClass} aria-hidden>
            📄
          </span>
          Detalles del Proyecto
        </h1>

        {error ? <p className={formErrorClass}>{error}</p> : null}

        <div className={formGridClass}>
          <label>
            <span className={fieldLabelClass}>
              Título del Proyecto<span className={requiredMarkClass}>*</span>
            </span>
            <input
              className={fieldInputClass}
              type="text"
              maxLength={TITLE_MAX}
              value={form.title}
              onFocus={() => viewClassicQuestion("title")}
              onChange={(e) => update("title", e.target.value)}
              onBlur={(e) => answerClassicQuestion("title", Boolean(e.target.value.trim()))}
              placeholder="ej. Plataforma de E-commerce para PYMES"
              required
            />
            <p className={fieldMetaClass}>
              {form.title.length}/{TITLE_MAX}
            </p>
          </label>

          <label>
            <span className={fieldLabelClass}>
              ¿Qué problema quieres resolver?<span className={requiredMarkClass}>*</span>
            </span>
            <input
              className={fieldInputClass}
              type="text"
              maxLength={PROBLEM_MAX}
              value={form.problem}
              onFocus={() => viewClassicQuestion("problem")}
              onChange={(e) => update("problem", e.target.value)}
              onBlur={(e) => answerClassicQuestion("problem", Boolean(e.target.value.trim()))}
              placeholder="Ej. Reducir abandono en onboarding de usuarios"
              required
            />
            <p className={fieldMetaClass}>
              {form.problem.length}/{PROBLEM_MAX}
            </p>
          </label>

          <label>
            <span className={fieldLabelClass}>
              Descripción del Desafío<span className={requiredMarkClass}>*</span>
            </span>
            <textarea
              className={fieldTextareaClass}
              maxLength={DESCRIPTION_MAX}
              rows={4}
              value={form.challengeDescription}
              onFocus={() => viewClassicQuestion("description")}
              onChange={(e) => update("challengeDescription", e.target.value)}
              onBlur={(e) => answerClassicQuestion("description", Boolean(e.target.value.trim()))}
              placeholder="Ej. Somos una startup B2B SaaS en etapa MVP. Notamos que muchos usuarios abandonan el onboarding antes de completar la primera acción clave..."
              required
            />
            <p className={fieldMetaClass}>
              {form.challengeDescription.length}/{DESCRIPTION_MAX}
            </p>
          </label>

          <MultiSelect
            label="¿Qué te gustaría recibir al final?"
            required
            options={deliverables}
            descriptions={deliverableDescriptions}
            value={form.deliverables}
            onOpen={() => viewClassicQuestion("deliverables")}
            onChange={(v) => {
              update("deliverables", v);
              answerClassicQuestion("deliverables", v.length > 0);
              touchFormActivity();
            }}
            max={5}
            placeholder="Elegí qué te gustaría recibir"
          />

          <div className={formGrid2Class}>
            <GroupedSelect
              label="¿En qué área necesitás ayuda?"
              required
              groups={verticalGroups}
              value={form.vertical}
              onOpen={() => viewClassicQuestion("vertical")}
              onChange={(v) => {
                update("vertical", v);
                answerClassicQuestion("vertical", Boolean(v));
                touchFormActivity();
              }}
              placeholder="Elegí la que más se acerque"
            />

            <MultiSelect
              label="¿A qué se dedica tu organización?"
              required
              groups={businessSectorGroups}
              value={form.sectors}
              onOpen={() => viewClassicQuestion("sectors")}
              onChange={(v) => {
                update("sectors", v);
                answerClassicQuestion("sectors", v.length > 0);
                touchFormActivity();
              }}
              max={5}
              placeholder="Elegí uno o más sectores"
            />

            <GroupedSelect
              label="¿En qué punto está tu proyecto?"
              required
              groups={projectStageGroups}
              value={form.stage}
              onOpen={() => viewClassicQuestion("stage")}
              onChange={(v) => {
                update("stage", v);
                answerClassicQuestion("stage", Boolean(v));
                touchFormActivity();
              }}
              placeholder="Elegí la que más se acerque"
            />

            <GroupedSelect
              label="¿Qué te gustaría lograr al resolverlo?"
              required
              groups={impactGroups}
              value={form.impact}
              onOpen={() => viewClassicQuestion("impact")}
              onChange={(v) => {
                update("impact", v);
                answerClassicQuestion("impact", Boolean(v));
                touchFormActivity();
              }}
              placeholder="Elegí el objetivo principal"
            />

            <MultiSelect
              label="¿Qué perfiles te gustaría en el equipo?"
              optional
              groups={roleGroups}
              value={form.roles}
              onOpen={() => viewClassicQuestion("roles")}
              onChange={(v) => {
                update("roles", v);
                answerClassicQuestion("roles", v.length > 0);
                touchFormActivity();
              }}
              max={7}
              placeholder="Si no sabés, dejalo vacío"
            />

            <MultiSelect
              label="¿El equipo debería usar alguna herramienta?"
              optional
              groups={toolGroups}
              value={form.tools}
              onOpen={() => viewClassicQuestion("tools")}
              onChange={(v) => {
                update("tools", v);
                answerClassicQuestion("tools", v.length > 0);
                touchFormActivity();
              }}
              max={10}
              placeholder="Por ejemplo Excel, Canva o WordPress"
            />
          </div>
        </div>
      </FormCard>
    </form>
  );
}

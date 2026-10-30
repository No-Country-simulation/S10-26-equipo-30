"use client";

import { FormEvent, useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GradientButton } from "@/components/gradient-button";
import { MultiSelect } from "@/components/multi-select";
import { dialCodeForCountry } from "@/lib/countries";
import {
  canStayOnStep,
  firstIncompleteStep,
  formatRemainingTime,
  formatStepCounter,
  GUIDED_STEP_STORAGE_KEY,
  guidedSteps,
  isStepFilled,
  progressPercent,
  remainingSeconds,
  type GuidedStep,
} from "@/lib/guided-steps";
import {
  DRAFT_STORAGE_KEY,
  loadDraft,
  saveCompany,
  saveProject,
  type CompanyFormData,
  type ProjectDraft,
  type ProjectFormData,
} from "@/lib/form-storage";
import { logFormEvent, saveFormCheckpoint, submitFormTest, touchFormActivity } from "@/lib/research-persistence";

type GuidedSession = {
  draft: ProjectDraft;
  stepIndex: number;
};

const SERVER_SESSION: GuidedSession = {
  draft: {
    company: {
      companyName: "",
      organizationType: "",
      organizationSize: "",
      country: "",
      phoneDialCode: "",
      phoneNumber: "",
    },
    project: {
      title: "",
      problem: "",
      challengeDescription: "",
      deliverables: [],
      vertical: "",
      sectors: [],
      stage: "",
      impact: "",
      roles: [],
      tools: [],
    },
  },
  stepIndex: 0,
};

let cachedSignature: string | null = null;
let cachedSession: GuidedSession = SERVER_SESSION;

function subscribeToGuidedSession() {
  return () => {};
}

function readGuidedSession(): GuidedSession {
  const draft = loadDraft();
  const fallback = firstIncompleteStep(draft);
  const raw = sessionStorage.getItem(GUIDED_STEP_STORAGE_KEY);
  const saved = raw == null ? Number.NaN : Number(raw);
  const stepIndex =
    Number.isInteger(saved) &&
    saved >= 0 &&
    saved < guidedSteps.length &&
    canStayOnStep(draft, saved)
      ? saved
      : fallback;
  return { draft, stepIndex };
}

function getGuidedSession(): GuidedSession {
  const signature = `${sessionStorage.getItem(DRAFT_STORAGE_KEY) ?? ""}\n${sessionStorage.getItem(GUIDED_STEP_STORAGE_KEY) ?? ""}`;
  if (signature === cachedSignature) return cachedSession;
  cachedSignature = signature;
  cachedSession = readGuidedSession();
  return cachedSession;
}

function getServerGuidedSession(): GuidedSession {
  return SERVER_SESSION;
}

export function GuidedForm() {
  const router = useRouter();
  const stored = useSyncExternalStore(
    subscribeToGuidedSession,
    getGuidedSession,
    getServerGuidedSession,
  );
  const [local, setLocal] = useState<GuidedSession | null>(null);
  const session = local ?? (stored === SERVER_SESSION ? null : stored);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const stepIndex = session?.stepIndex ?? 0;
  const draft = session?.draft ?? SERVER_SESSION.draft;
  const step = guidedSteps[stepIndex];
  const total = guidedSteps.length;
  const isLast = stepIndex === total - 1;
  const filled = isStepFilled(step, draft);
  const canContinue = !step.required || filled;

  useEffect(() => {
    if (!session) return;
    saveCompany(session.draft.company);
    saveProject(session.draft.project);
    sessionStorage.setItem(GUIDED_STEP_STORAGE_KEY, String(session.stepIndex));
  }, [session]);

  const ready = session !== null;

  useEffect(() => {
    if (!ready || !step) return;
    void logFormEvent("step_view", step.id).catch(() => {});
  }, [ready, step]);

  useEffect(() => {
    if (!ready) return;
    const root = document.getElementById("guided-field");
    const focusable = root?.querySelector<HTMLElement>(
      "input:not([readonly]), textarea, select, button",
    );
    focusable?.focus();
  }, [ready, stepIndex]);

  function edit(updater: (current: GuidedSession) => GuidedSession) {
    if (!session) return;
    const base = session;
    setError(null);
    setLocal((current) => updater(current ?? base));
  }

  function updateCompany<K extends keyof CompanyFormData>(key: K, value: CompanyFormData[K]) {
    edit((current) => ({
      ...current,
      draft: {
        ...current.draft,
        company: { ...current.draft.company, [key]: value },
      },
    }));
  }

  function updateProject<K extends keyof ProjectFormData>(key: K, value: ProjectFormData[K]) {
    edit((current) => ({
      ...current,
      draft: {
        ...current.draft,
        project: { ...current.draft.project, [key]: value },
      },
    }));
  }

  function onCountryChange(country: string) {
    const dial = dialCodeForCountry(country);
    edit((current) => ({
      ...current,
      draft: {
        ...current.draft,
        company: {
          ...current.draft.company,
          country,
          phoneDialCode: dial || current.draft.company.phoneDialCode,
        },
      },
    }));
  }

  function goBack() {
    edit((current) => ({ ...current, stepIndex: Math.max(0, current.stepIndex - 1) }));
  }

  async function goNext() {
    if (submitting) return;
    if (!session || !canContinue) {
      setError("Completá este paso para continuar.");
      void logFormEvent("validation_error", step.id).catch(() => {});
      return;
    }
    saveCompany(session.draft.company);
    saveProject(session.draft.project);
    const draft = loadDraft();
    setError(null);
    setSubmitting(true);
    try {
      if (isLast) {
        await submitFormTest(draft);
        sessionStorage.removeItem(GUIDED_STEP_STORAGE_KEY);
        router.push("/post-envio?enviado=1");
        return;
      }
      await saveFormCheckpoint(draft, step.id, "step_complete");
      await logFormEvent("step_complete", step.id);
      edit((current) => ({ ...current, stepIndex: current.stepIndex + 1 }));
      setSubmitting(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo guardar este paso.");
      setSubmitting(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    goNext();
  }

  if (!session) {
    return <div className="form-card">Cargando…</div>;
  }

  const continueLabel = isLast ? "Publicar Proyecto" : !step.required && !filled ? "Omitir" : "Continuar";

  return (
    <form onSubmit={onSubmit} onChange={touchFormActivity}>
      <div className="form-card guided-card">
        <header className="guided-progress">
          <div className="guided-progress-top">
            <p className="guided-step-count">{formatStepCounter(stepIndex)}</p>
            <p className="guided-time" aria-live="polite">
              {formatRemainingTime(remainingSeconds(stepIndex))}
            </p>
          </div>
          <div
            className="guided-track"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={total}
            aria-valuenow={stepIndex + 1}
            aria-valuetext={formatStepCounter(stepIndex)}
          >
            <div className="guided-fill" style={{ width: `${progressPercent(stepIndex)}%` }} />
          </div>
          <p className="guided-section">{step.sectionLabel}</p>
        </header>

        <div className="guided-body">
          <h1 className="guided-question">
            {step.question}
            {step.required ? (
              <span className="field-required">*</span>
            ) : (
              <span className="guided-optional"> Opcional</span>
            )}
          </h1>
          {step.hint ? <p className="guided-hint">{step.hint}</p> : null}
          {error ? <p className="form-error">{error}</p> : null}
          <div id="guided-field" className="guided-field">
            <StepField
              step={step}
              draft={draft}
              onCompany={updateCompany}
              onProject={updateProject}
              onCountry={onCountryChange}
            />
          </div>
        </div>

        <div className="guided-nav">
          {stepIndex === 0 ? (
            <Link href="/cargar-proyecto/modo" className="form-back-link">
              ← Atrás
            </Link>
          ) : (
            <button type="button" className="form-back-link guided-back" onClick={goBack} disabled={submitting}>
              ← Atrás
            </button>
          )}
          <GradientButton type="submit" disabled={!canContinue} busy={submitting}>
            {submitting ? (isLast ? "Publicando…" : "Guardando…") : continueLabel}
          </GradientButton>
        </div>
      </div>
    </form>
  );
}

function StepField({
  step,
  draft,
  onCompany,
  onProject,
  onCountry,
}: {
  step: GuidedStep;
  draft: ProjectDraft;
  onCompany: <K extends keyof CompanyFormData>(key: K, value: CompanyFormData[K]) => void;
  onProject: <K extends keyof ProjectFormData>(key: K, value: ProjectFormData[K]) => void;
  onCountry: (country: string) => void;
}) {
  if (step.scope === "company" && step.kind === "text") {
    return (
      <input
        className="field-input"
        type="text"
        value={draft.company.companyName}
        placeholder={step.placeholder}
        onChange={(event) => onCompany("companyName", event.target.value)}
        required
      />
    );
  }

  if (step.scope === "company" && step.kind === "select") {
    const value = draft.company[step.key];
    return (
      <select
        className="field-select"
        value={value}
        onChange={(event) =>
          step.key === "country" ? onCountry(event.target.value) : onCompany(step.key, event.target.value)
        }
        required
      >
        <option value="">{step.placeholder}</option>
        {step.options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  if (step.scope === "company" && step.kind === "phone") {
    return (
      <div className="phone-row">
        <input
          className="field-input phone-dial"
          type="text"
          readOnly
          value={draft.company.phoneDialCode || "---"}
          aria-label="Código de área"
        />
        <input
          className="field-input"
          type="tel"
          inputMode="numeric"
          value={draft.company.phoneNumber}
          placeholder={step.placeholder}
          onChange={(event) => onCompany("phoneNumber", event.target.value)}
          required
        />
      </div>
    );
  }

  if (step.scope === "project" && (step.kind === "text" || step.kind === "textarea")) {
    const value = draft.project[step.key];
    if (step.kind === "textarea") {
      return (
        <>
          <textarea
            className="field-textarea"
            rows={6}
            maxLength={step.maxLength}
            value={value}
            placeholder={step.placeholder}
            onChange={(event) => onProject(step.key, event.target.value)}
            required
          />
          <p className="field-meta">
            {value.length}/{step.maxLength}
          </p>
        </>
      );
    }
    return (
      <>
        <input
          className="field-input"
          type="text"
          maxLength={step.maxLength}
          value={value}
          placeholder={step.placeholder}
          onChange={(event) => onProject(step.key, event.target.value)}
          required
        />
        <p className="field-meta">
          {value.length}/{step.maxLength}
        </p>
      </>
    );
  }

  if (step.scope === "project" && step.kind === "select") {
    return (
      <select
        className="field-select"
        value={draft.project[step.key]}
        onChange={(event) => onProject(step.key, event.target.value)}
        required
      >
        <option value="">{step.placeholder}</option>
        {step.options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  if (step.scope === "project" && step.kind === "multiselect") {
    return (
      <MultiSelect
        label={step.question}
        hideLabel
        required={step.required}
        optional={!step.required}
        options={step.options}
        value={draft.project[step.key]}
        onChange={(value) => onProject(step.key, value)}
        max={step.max}
        placeholder={step.placeholder}
      />
    );
  }

  return null;
}

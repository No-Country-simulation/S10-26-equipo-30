"use client";

import { FormEvent, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  backLinkClass,
  fieldInputClass,
  fieldMetaClass,
  fieldTextareaClass,
  formCardShellClass,
  formErrorClass,
  guidedFillClass,
  guidedTrackClass,
  phoneDialClass,
  phoneRowClass,
  requiredMarkClass,
} from "@/components/form-styles";
import { DraftSaveIndicator } from "@/components/draft-save-indicator";
import { GradientButton } from "@/components/gradient-button";
import { GroupedSelect } from "@/components/grouped-select";
import { MultiSelect } from "@/components/multi-select";
import { PrefilledNotice } from "@/components/prefilled-notice";
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
  wasCompanyPrefilled,
  type CompanyFormData,
  type ProjectDraft,
  type ProjectFormData,
} from "@/lib/form-storage";
import {
  flushFormPersistence,
  isAuthRequired,
  logFormEvent,
  restartAfterLogin,
  saveGuidedStepProgress,
  submitFormTest,
  touchFormActivity,
} from "@/lib/research-persistence";
import { useDraftAutosave } from "@/lib/use-draft-autosave";

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

  // Next conserva esta pantalla oculta al enviar; al volver, el botón no debe seguir en "Enviando…".
  useLayoutEffect(() => () => setSubmitting(false), []);
  const advanceLock = useRef<number | null>(null);

  const stepIndex = session?.stepIndex ?? 0;
  const draft = session?.draft ?? SERVER_SESSION.draft;
  const step = guidedSteps[stepIndex];
  const total = guidedSteps.length;
  const isLast = stepIndex === total - 1;
  const filled = isStepFilled(step, draft);
  const canContinue = !step.required || filled;

  useDraftAutosave(session ? session.draft : null, step.id);

  useEffect(() => {
    if (!session) return;
    saveCompany(session.draft.company);
    saveProject(session.draft.project);
    sessionStorage.setItem(GUIDED_STEP_STORAGE_KEY, String(session.stepIndex));
  }, [session]);

  const ready = session !== null;

  useEffect(() => {
    if (advanceLock.current !== null && advanceLock.current !== stepIndex) {
      advanceLock.current = null;
    }
  }, [stepIndex]);

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
    advanceLock.current = null;
    edit((current) => ({ ...current, stepIndex: Math.max(0, current.stepIndex - 1) }));
  }

  function reportSaveError(cause: unknown, message: string) {
    if (isAuthRequired(cause)) {
      restartAfterLogin();
      return;
    }
    setError(cause instanceof Error ? cause.message : message);
  }

  async function goNext() {
    if (submitting || advanceLock.current !== null) return;
    if (!session || !canContinue) {
      setError("Completá este paso para continuar.");
      void logFormEvent("validation_error", step.id).catch(() => {});
      return;
    }
    saveCompany(session.draft.company);
    saveProject(session.draft.project);
    const draft = loadDraft();
    setError(null);

    if (!isLast) {
      const completedStepId = step.id;
      advanceLock.current = stepIndex;
      edit((current) => ({ ...current, stepIndex: current.stepIndex + 1 }));
      void saveGuidedStepProgress(draft, completedStepId).catch((cause) => {
        reportSaveError(cause, "No se pudo guardar el paso anterior.");
      });
      return;
    }

    setSubmitting(true);
    try {
      await flushFormPersistence();
      await submitFormTest(draft);
      sessionStorage.removeItem(GUIDED_STEP_STORAGE_KEY);
      router.push("/post-envio?enviado=1");
    } catch (cause) {
      reportSaveError(cause, "No se pudo guardar este paso.");
      setSubmitting(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    goNext();
  }

  if (!session) {
    return <div className={formCardShellClass}>Cargando…</div>;
  }

  const continueLabel = isLast ? "Enviar a revisión" : !step.required && !filled ? "Omitir" : "Continuar";

  return (
    <form onSubmit={onSubmit} onChange={touchFormActivity}>
      <div className={`${formCardShellClass} flex flex-col`}>
        <header className="mb-6">
          <div className="mb-[0.65rem] flex items-baseline justify-between gap-4">
            <p className="text-[0.95rem] font-bold tracking-[0.04em] tabular-nums">
              {formatStepCounter(stepIndex)}
            </p>
            <p className="text-[0.85rem] font-semibold text-cyan-300" aria-live="polite">
              {formatRemainingTime(remainingSeconds(stepIndex))}
            </p>
          </div>
          <div
            className={guidedTrackClass}
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={total}
            aria-valuenow={stepIndex + 1}
            aria-valuetext={formatStepCounter(stepIndex)}
          >
            <div className={guidedFillClass} style={{ width: `${progressPercent(stepIndex)}%` }} />
          </div>
          <div className="mt-[0.85rem] flex items-baseline justify-between gap-4">
            <p className="text-xs tracking-[0.08em] text-violet-300 uppercase">{step.sectionLabel}</p>
            <DraftSaveIndicator />
          </div>
        </header>

        <div>
          <h1 className="mb-[0.45rem] text-[clamp(1.35rem,3vw,1.75rem)] leading-[1.25] font-semibold tracking-[-0.02em]">
            {step.question}
            {step.required ? (
              <span className={requiredMarkClass}>*</span>
            ) : (
              <span className="ml-[0.45rem] align-middle text-[0.78rem] font-medium tracking-normal text-slate-400">
                {" "}
                Opcional
              </span>
            )}
          </h1>
          {step.hint ? (
            <p className="mb-5 text-[0.92rem] leading-normal text-nc-muted">{step.hint}</p>
          ) : null}
          {step.scope === "company" && wasCompanyPrefilled() ? <PrefilledNotice /> : null}
          {error ? <p className={formErrorClass}>{error}</p> : null}
          <div id="guided-field">
            <StepField
              step={step}
              draft={draft}
              onCompany={updateCompany}
              onProject={updateProject}
              onCountry={onCountryChange}
            />
          </div>
        </div>

        <div className="mt-7 flex items-center justify-between gap-4">
          {stepIndex === 0 ? (
            <Link href="/cargar-proyecto/modo" className={backLinkClass}>
              ← Atrás
            </Link>
          ) : (
            <button
              type="button"
              className={`${backLinkClass} cursor-pointer border-0 bg-transparent p-0`}
              onClick={goBack}
              disabled={submitting}
            >
              ← Atrás
            </button>
          )}
          <GradientButton type="submit" disabled={!canContinue} busy={submitting}>
            {submitting ? (isLast ? "Enviando…" : "Guardando…") : continueLabel}
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
        className={fieldInputClass}
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
        className={fieldInputClass}
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
      <div className={phoneRowClass}>
        <input
          className={phoneDialClass}
          type="text"
          readOnly
          value={draft.company.phoneDialCode || "---"}
          aria-label="Código de área"
        />
        <input
          className={fieldInputClass}
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
            className={fieldTextareaClass}
            rows={6}
            maxLength={step.maxLength}
            value={value}
            placeholder={step.placeholder}
            onChange={(event) => onProject(step.key, event.target.value)}
            required
          />
          <p className={fieldMetaClass}>
            {value.length}/{step.maxLength}
          </p>
        </>
      );
    }
    return (
      <>
        <input
          className={fieldInputClass}
          type="text"
          maxLength={step.maxLength}
          value={value}
          placeholder={step.placeholder}
          onChange={(event) => onProject(step.key, event.target.value)}
          required
        />
        <p className={fieldMetaClass}>
          {value.length}/{step.maxLength}
        </p>
      </>
    );
  }

  if (step.scope === "project" && step.kind === "select") {
    if (step.groups) {
      return (
        <GroupedSelect
          label={step.question}
          hideLabel
          required={step.required}
          groups={step.groups}
          value={draft.project[step.key]}
          onChange={(value) => onProject(step.key, value)}
          placeholder={step.placeholder}
        />
      );
    }
    return (
      <select
        className={fieldInputClass}
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
        descriptions={step.descriptions}
        groups={step.groups}
        value={draft.project[step.key]}
        onChange={(value) => onProject(step.key, value)}
        max={step.max}
        placeholder={step.placeholder}
      />
    );
  }

  return null;
}

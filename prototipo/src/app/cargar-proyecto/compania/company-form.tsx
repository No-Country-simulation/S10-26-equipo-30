"use client";

import { FormEvent, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ClassicStepProgress } from "@/components/classic-step-progress";
import { FormCard } from "@/components/form-card";
import { InfoTooltip } from "@/components/info-tooltip";
import { PrefilledNotice } from "@/components/prefilled-notice";
import {
  fieldInputClass,
  fieldLabelClass,
  formErrorClass,
  formGrid2Class,
  formGridClass,
  phoneDialClass,
  phoneRowClass,
  requiredMarkClass,
  sectionHeadingClass,
  sectionIconClass,
} from "@/components/form-styles";
import { countries, dialCodeForCountry } from "@/lib/countries";
import { organizationSizes, organizationTypes } from "@/lib/form-options";
import {
  loadDraft,
  saveCompany,
  wasCompanyPrefilled,
  type CompanyFormData,
} from "@/lib/form-storage";
import {
  answerClassicQuestion,
  isAuthRequired,
  logFormEvent,
  restartAfterLogin,
  saveFormCheckpoint,
  touchFormActivity,
  viewClassicQuestion,
} from "@/lib/research-persistence";
import { useDraftAutosave } from "@/lib/use-draft-autosave";

/** El indicador solo cambia al iniciar una carga nueva, antes de entrar a esta pantalla. */
function subscribeToNothing() {
  return () => {};
}

const NEXT_STEP_HREF = "/cargar-proyecto/detalles";

export function CompanyForm() {
  const router = useRouter();
  const [form, setForm] = useState<CompanyFormData>(() => loadDraft().company);
  const [error, setError] = useState<string | null>(null);
  const prefilled = useSyncExternalStore(subscribeToNothing, wasCompanyPrefilled, () => false);
  const autosaveDraft = useMemo(() => ({ company: form, project: loadDraft().project }), [form]);
  useDraftAutosave(autosaveDraft, "compania");

  useEffect(() => {
    setForm(loadDraft().company);
    void logFormEvent("screen_view", "compania", { screen: "compania" }).catch(() => {});
  }, []);

  useEffect(() => {
    router.prefetch(NEXT_STEP_HREF);
  }, [router]);

  function update<K extends keyof CompanyFormData>(key: K, value: CompanyFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onCountryChange(country: string) {
    const dial = dialCodeForCountry(country);
    setForm((prev) => ({
      ...prev,
      country,
      phoneDialCode: dial || prev.phoneDialCode,
    }));
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const missing = [
      !form.companyName.trim() ? "company-name" : "",
      !form.organizationType ? "organization-type" : "",
      !form.organizationSize ? "organization-size" : "",
      !form.country ? "country" : "",
      !form.phoneNumber.trim() ? "phone" : "",
    ].filter(Boolean);
    if (missing.length > 0) {
      setError("Completá todos los campos obligatorios.");
      void logFormEvent("validation_error", missing[0], { missing }).catch(() => {});
      return;
    }
    setError(null);
    saveCompany(form);
    const draft = loadDraft();
    router.push(NEXT_STEP_HREF);

    // El envío final lleva todos los datos; estas escrituras son para research y no frenan el avance.
    const onBackgroundError = (cause: unknown) => {
      if (isAuthRequired(cause)) restartAfterLogin();
    };
    void saveFormCheckpoint(draft, "compania", "screen_complete").catch(onBackgroundError);
    void logFormEvent("screen_complete", "compania", { screen: "compania" }).catch(onBackgroundError);
  }

  return (
    <form onSubmit={onSubmit} onChange={touchFormActivity}>
      <FormCard
        variant="compact"
        backHref="/cargar-proyecto/modo"
        backIconOnly
        continueLabel="Continuar"
        continueType="submit"
      >
        <ClassicStepProgress step={1} />

        <h1 className={sectionHeadingClass}>
          <span className={sectionIconClass} aria-hidden>
            🏢
          </span>
          Información de la Organización
        </h1>

        {prefilled ? <PrefilledNotice /> : null}
        {error ? <p className={formErrorClass}>{error}</p> : null}

        <div className={formGridClass}>
          <label>
            <span className={fieldLabelClass}>
              Nombre de la Organización<span className={requiredMarkClass}>*</span>
            </span>
            <input
              className={fieldInputClass}
              type="text"
              value={form.companyName}
              onFocus={() => viewClassicQuestion("company-name")}
              onChange={(e) => update("companyName", e.target.value)}
              onBlur={(e) => answerClassicQuestion("company-name", Boolean(e.target.value.trim()))}
              placeholder="Ej. InnovaSoft"
              required
            />
          </label>

          <div className={formGrid2Class}>
            <label>
              <span className={fieldLabelClass}>
                Tipo de organización<span className={requiredMarkClass}>*</span>
              </span>
              <select
                className={fieldInputClass}
                value={form.organizationType}
                onFocus={() => viewClassicQuestion("organization-type")}
                onChange={(e) => {
                  update("organizationType", e.target.value);
                  answerClassicQuestion("organization-type", Boolean(e.target.value));
                }}
                required
              >
                <option value="">Seleccionar…</option>
                {organizationTypes.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className={fieldLabelClass}>
                Tamaño de la organización<span className={requiredMarkClass}>*</span>
              </span>
              <select
                className={fieldInputClass}
                value={form.organizationSize}
                onFocus={() => viewClassicQuestion("organization-size")}
                onChange={(e) => {
                  update("organizationSize", e.target.value);
                  answerClassicQuestion("organization-size", Boolean(e.target.value));
                }}
                required
              >
                <option value="">Seleccionar…</option>
                {organizationSizes.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className={formGrid2Class}>
            <label>
              <span className={fieldLabelClass}>
                País<span className={requiredMarkClass}>*</span>
              </span>
              <select
                className={fieldInputClass}
                value={form.country}
                onFocus={() => viewClassicQuestion("country")}
                onChange={(e) => {
                  onCountryChange(e.target.value);
                  answerClassicQuestion("country", Boolean(e.target.value));
                }}
                required
              >
                <option value="">Selecciona un país</option>
                {countries.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="relative">
              <span className={fieldLabelClass}>
                Teléfono Personal<span className={requiredMarkClass}>*</span>
                <InfoTooltip id="phone-usage" label="¿Para qué usamos tu teléfono?">
                  Lo usamos solo para escribirte por WhatsApp sobre este desafío, por ejemplo para
                  confirmarte que lo recibimos o ajustar juntos el brief. Lo ve únicamente el equipo de
                  No Country y podés pedirnos que no te contactemos cuando quieras.
                </InfoTooltip>
              </span>
              <div className={phoneRowClass}>
                <input
                  className={phoneDialClass}
                  type="text"
                  readOnly
                  value={form.phoneDialCode || "---"}
                  aria-label="Código de área"
                />
                <input
                  className={fieldInputClass}
                  type="tel"
                  inputMode="numeric"
                  value={form.phoneNumber}
                  onFocus={() => viewClassicQuestion("phone")}
                  onChange={(e) => update("phoneNumber", e.target.value)}
                  onBlur={(e) => answerClassicQuestion("phone", Boolean(e.target.value.trim()))}
                  placeholder="3751364441"
                  aria-describedby="phone-usage"
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </FormCard>
    </form>
  );
}

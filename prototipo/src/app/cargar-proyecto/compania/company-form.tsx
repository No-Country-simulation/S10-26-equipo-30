"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormCard } from "@/components/form-card";
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
import { loadDraft, saveCompany, type CompanyFormData } from "@/lib/form-storage";
import {
  answerClassicQuestion,
  isAuthRequired,
  logFormEvent,
  restartAfterLogin,
  saveFormCheckpoint,
  touchFormActivity,
  viewClassicQuestion,
} from "@/lib/research-persistence";

export function CompanyForm() {
  const router = useRouter();
  const [form, setForm] = useState<CompanyFormData>(() => loadDraft().company);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm(loadDraft().company);
    void logFormEvent("screen_view", "compania", { screen: "compania" }).catch(() => {});
  }, []);

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

  async function onSubmit(e: FormEvent) {
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
    setSubmitting(true);
    saveCompany(form);
    try {
      const draft = loadDraft();
      await saveFormCheckpoint(draft, "compania", "screen_complete");
      await logFormEvent("screen_complete", "compania", { screen: "compania" });
      router.push("/cargar-proyecto/detalles");
    } catch (cause) {
      if (isAuthRequired(cause)) {
        restartAfterLogin();
        return;
      }
      setError(cause instanceof Error ? cause.message : "No se pudo guardar este paso.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} onChange={touchFormActivity}>
      <FormCard
        variant="shell"
        backHref="/cargar-proyecto/modo"
        backIconOnly
        continueLabel={submitting ? "Guardando…" : "Continuar"}
        continueType="submit"
        continueDisabled={submitting}
        continueBusy={submitting}
      >
        <h1 className={sectionHeadingClass}>
          <span className={sectionIconClass} aria-hidden>
            🏢
          </span>
          Información de la Compañía
        </h1>

        {error ? <p className={formErrorClass}>{error}</p> : null}

        <div className={formGridClass}>
          <label>
            <span className={fieldLabelClass}>
              Nombre de la Compañía<span className={requiredMarkClass}>*</span>
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

          <div>
            <span className={fieldLabelClass}>
              Teléfono Personal<span className={requiredMarkClass}>*</span>
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
                required
              />
            </div>
          </div>
        </div>
      </FormCard>
    </form>
  );
}

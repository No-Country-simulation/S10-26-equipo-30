"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormCard } from "@/components/form-card";
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
        backHref="/cargar-proyecto/modo"
        backIconOnly
        continueLabel={submitting ? "Guardando…" : "Continuar"}
        continueType="submit"
        continueDisabled={submitting}
        continueBusy={submitting}
      >
        <h1 className="section-heading">
          <span className="section-icon" aria-hidden>
            🏢
          </span>
          Información de la Compañía
        </h1>

        {error ? <p className="form-error">{error}</p> : null}

        <div className="form-grid">
          <label className="field">
            <span className="field-label">
              Nombre de la Compañía<span className="field-required">*</span>
            </span>
            <input
              className="field-input"
              type="text"
              value={form.companyName}
              onFocus={() => viewClassicQuestion("company-name")}
              onChange={(e) => update("companyName", e.target.value)}
              onBlur={(e) => answerClassicQuestion("company-name", Boolean(e.target.value.trim()))}
              placeholder="Ej. InnovaSoft"
              required
            />
          </label>

          <div className="form-grid-2">
            <label className="field">
              <span className="field-label">
                Tipo de organización<span className="field-required">*</span>
              </span>
              <select
                className="field-select"
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

            <label className="field">
              <span className="field-label">
                Tamaño de la organización<span className="field-required">*</span>
              </span>
              <select
                className="field-select"
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

          <label className="field">
            <span className="field-label">
              País<span className="field-required">*</span>
            </span>
            <select
              className="field-select"
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

          <div className="field">
            <span className="field-label">
              Teléfono Personal<span className="field-required">*</span>
            </span>
            <div className="phone-row">
              <input
                className="field-input phone-dial"
                type="text"
                readOnly
                value={form.phoneDialCode || "---"}
                aria-label="Código de área"
              />
              <input
                className="field-input"
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

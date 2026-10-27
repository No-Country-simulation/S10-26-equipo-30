"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormCard } from "@/components/form-card";
import { countries, dialCodeForCountry } from "@/lib/countries";
import { organizationSizes, organizationTypes } from "@/lib/form-options";
import { loadDraft, saveCompany, type CompanyFormData } from "@/lib/form-storage";

export function CompanyForm() {
  const router = useRouter();
  const [form, setForm] = useState<CompanyFormData>(() => loadDraft().company);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm(loadDraft().company);
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

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (
      !form.companyName.trim() ||
      !form.organizationType ||
      !form.organizationSize ||
      !form.country ||
      !form.phoneNumber.trim()
    ) {
      setError("Completá todos los campos obligatorios.");
      return;
    }
    setError(null);
    saveCompany(form);
    router.push("/cargar-proyecto/detalles");
  }

  return (
    <form onSubmit={onSubmit}>
      <FormCard
        backHref="/cargar-proyecto/modo"
        backIconOnly
        continueLabel="Continuar"
        continueType="submit"
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
              onChange={(e) => update("companyName", e.target.value)}
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
                onChange={(e) => update("organizationType", e.target.value)}
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
                onChange={(e) => update("organizationSize", e.target.value)}
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
              onChange={(e) => onCountryChange(e.target.value)}
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
                onChange={(e) => update("phoneNumber", e.target.value)}
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

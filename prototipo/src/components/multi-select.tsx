"use client";

import { useEffect, useId, useRef, useState } from "react";

type MultiSelectProps = {
  id?: string;
  label: string;
  hideLabel?: boolean;
  required?: boolean;
  optional?: boolean;
  options: readonly string[];
  value: string[];
  onChange: (value: string[]) => void;
  onOpen?: () => void;
  max: number;
  placeholder?: string;
};

export function MultiSelect({
  id: idProp,
  label,
  hideLabel = false,
  required,
  optional,
  options,
  value,
  onChange,
  onOpen,
  max,
  placeholder = "Seleccionar…",
}: MultiSelectProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const filtered = options.filter(
    (opt) =>
      opt.toLowerCase().includes(query.toLowerCase()) &&
      (value.includes(opt) || value.length < max),
  );

  function toggle(opt: string) {
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt));
      return;
    }
    if (value.length >= max) return;
    onChange([...value, opt]);
  }

  const triggerLabel =
    value.length === 0
      ? placeholder
      : `${value.length} seleccionado${value.length === 1 ? "" : "s"}`;

  return (
    <div className="field" ref={rootRef}>
      {hideLabel ? null : (
        <label htmlFor={id} className="field-label">
          {label}
          {required ? <span className="field-required">*</span> : null}
          {optional ? <span className="field-optional"> (opcional)</span> : null}
          {max > 1 ? <span className="field-optional"> (Max {max})</span> : null}
        </label>
      )}
      <div className="multi-select-root">
        <button
          type="button"
          id={id}
          className="multi-select-trigger"
          onClick={() =>
            setOpen((current) => {
              if (!current) onOpen?.();
              return !current;
            })
          }
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={hideLabel ? label : undefined}
        >
          <span className={value.length ? "" : "multi-select-placeholder"}>
            {triggerLabel}
          </span>
          <span className="multi-select-chevron" aria-hidden>
            ▾
          </span>
        </button>
        {value.length > 0 ? (
          <div className="multi-select-tags" aria-label="Seleccionados">
            {value.map((v) => (
              <button
                key={v}
                type="button"
                className="multi-select-tag"
                onClick={() => toggle(v)}
              >
                {v}
                <span aria-hidden> ×</span>
              </button>
            ))}
          </div>
        ) : null}
        {open ? (
          <div className="multi-select-panel">
            <input
              type="search"
              className="multi-select-search"
              placeholder="Buscar…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <ul className="multi-select-list" role="listbox">
              {filtered.map((opt) => {
                const selected = value.includes(opt);
                const disabled = !selected && value.length >= max;
                return (
                  <li key={opt}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      disabled={disabled}
                      className={`multi-select-option${selected ? " is-selected" : ""}`}
                      onClick={() => toggle(opt)}
                    >
                      <span className="multi-select-check">{selected ? "✓" : ""}</span>
                      {opt}
                    </button>
                  </li>
                );
              })}
              {filtered.length === 0 ? (
                <li className="multi-select-empty">Sin resultados</li>
              ) : null}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}

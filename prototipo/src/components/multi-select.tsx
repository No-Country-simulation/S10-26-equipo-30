"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  fieldLabelClass,
  optionalMarkClass,
  requiredMarkClass,
} from "@/components/form-styles";
import { cx } from "@/lib/cx";

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
    <div ref={rootRef}>
      {hideLabel ? null : (
        <label htmlFor={id} className={fieldLabelClass}>
          {label}
          {required ? <span className={requiredMarkClass}>*</span> : null}
          {optional ? <span className={optionalMarkClass}> (opcional)</span> : null}
          {max > 1 ? <span className={optionalMarkClass}> (Max {max})</span> : null}
        </label>
      )}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          id={id}
          className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-[0.65rem] border border-nc-border bg-nc-inner px-[0.85rem] py-[0.7rem] text-left text-[0.95rem] text-slate-100"
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
          <span className={value.length ? undefined : "text-slate-500"}>{triggerLabel}</span>
          <span className="text-xs text-slate-500" aria-hidden>
            ▾
          </span>
        </button>
        {value.length > 0 ? (
          <div className="flex flex-wrap gap-[0.4rem]" aria-label="Seleccionados">
            {value.map((v) => (
              <button
                key={v}
                type="button"
                className="inline-flex cursor-pointer items-center gap-[0.15rem] rounded-full border border-indigo-500/35 bg-indigo-500/12 px-[0.55rem] py-1 text-xs text-violet-300 transition-colors hover:border-indigo-500/50 hover:bg-indigo-500/20"
                onClick={() => toggle(v)}
              >
                {v}
                <span aria-hidden> ×</span>
              </button>
            ))}
          </div>
        ) : null}
        {open ? (
          <div className="relative z-20 overflow-hidden rounded-[0.65rem] border border-nc-border bg-[#0a101a] shadow-[0_16px_48px_rgba(0,0,0,0.45)]">
            <input
              type="search"
              className="w-full border-0 border-b border-nc-border bg-transparent px-[0.85rem] py-[0.65rem] text-slate-100 outline-none"
              placeholder="Buscar…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <ul className="m-0 max-h-[220px] list-none overflow-y-auto py-[0.35rem]" role="listbox">
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
                      className={cx(
                        "flex w-full cursor-pointer items-start gap-2 border-0 bg-transparent px-[0.85rem] py-2 text-left text-[0.85rem] enabled:hover:bg-indigo-500/12 disabled:cursor-not-allowed disabled:opacity-40",
                        selected ? "text-violet-300" : "text-slate-100",
                      )}
                      onClick={() => toggle(opt)}
                    >
                      <span className="w-4 shrink-0 text-nc-cyan">{selected ? "✓" : ""}</span>
                      {opt}
                    </button>
                  </li>
                );
              })}
              {filtered.length === 0 ? (
                <li className="px-[0.85rem] py-3 text-[0.85rem] text-slate-500">Sin resultados</li>
              ) : null}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  dropdownPanelClass,
  dropdownPanelSideClass,
  fieldControlSizeClass,
  fieldLabelClass,
  optionalMarkClass,
  requiredMarkClass,
} from "@/components/form-styles";
import { cx } from "@/lib/cx";
import type { SelectOptionGroup } from "@/lib/form-options";
import { normalizeSearch } from "@/lib/search";
import { useDropdownPlacement } from "@/lib/use-dropdown-placement";

type MultiSelectProps = {
  id?: string;
  label: string;
  hideLabel?: boolean;
  required?: boolean;
  optional?: boolean;
  /** Lista simple de opciones. Se ignora si se pasan `groups`. */
  options?: readonly string[];
  /** Línea de ayuda que se muestra debajo de cada opción y también se busca. */
  descriptions?: Readonly<Record<string, string>>;
  /** Opciones agrupadas con título y descripción. */
  groups?: readonly SelectOptionGroup[];
  value: string[];
  onChange: (value: string[]) => void;
  onOpen?: () => void;
  max: number;
  placeholder?: string;
};

/** Alto máximo del panel (buscador más lista), con y sin grupos. */
const PANEL_HEIGHT = 280;
const GROUPED_PANEL_HEIGHT = 320;

export function MultiSelect({
  id: idProp,
  label,
  hideLabel = false,
  required,
  optional,
  options = [],
  descriptions,
  groups,
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
  const anchorRef = useRef<HTMLDivElement>(null);
  const { placement, measure } = useDropdownPlacement(
    anchorRef,
    open,
    groups ? GROUPED_PANEL_HEIGHT : PANEL_HEIGHT,
  );

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const allGroups: readonly SelectOptionGroup[] = groups ?? [
    {
      options: options.map((opt) => ({ label: opt, description: descriptions?.[opt] })),
    },
  ];

  const search = normalizeSearch(query);
  const filteredGroups = allGroups
    .map((group) => ({
      ...group,
      options: group.options.filter(
        (opt) =>
          (normalizeSearch(opt.label).includes(search) ||
            normalizeSearch(opt.description ?? "").includes(search)) &&
          (value.includes(opt.label) || value.length < max),
      ),
    }))
    .filter((group) => group.options.length > 0);

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
    <div
      ref={rootRef}
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
    >
      {hideLabel ? null : (
        <label htmlFor={id} className={fieldLabelClass}>
          {label}
          {required ? <span className={requiredMarkClass}>*</span> : null}
          {optional ? <span className={optionalMarkClass}> (opcional)</span> : null}
          {max > 1 ? <span className={optionalMarkClass}> (Max {max})</span> : null}
        </label>
      )}
      <div className="flex flex-col gap-2">
        <div ref={anchorRef} className="relative">
          <button
            type="button"
            id={id}
            className={`flex w-full cursor-pointer items-center justify-between gap-2 border border-nc-border bg-nc-inner text-left text-slate-100 ${fieldControlSizeClass}`}
            onClick={() => {
              if (!open) {
                onOpen?.();
                measure();
              }
              setOpen(!open);
            }}
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-label={hideLabel ? label : undefined}
          >
            <span className={value.length ? undefined : "text-slate-500"}>{triggerLabel}</span>
            <span className="text-xs text-slate-500" aria-hidden>
              ▾
            </span>
          </button>
          {open ? (
            <div
              className={cx(dropdownPanelClass, dropdownPanelSideClass[placement.side])}
              style={{ maxHeight: placement.maxHeight }}
            >
              <input
                type="search"
                className="w-full shrink-0 border-0 border-b border-nc-border bg-transparent px-[0.85rem] py-[0.65rem] text-slate-100 outline-none"
                placeholder="Buscar…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div
                className="min-h-0 flex-1 overflow-y-auto py-[0.35rem]"
                role="listbox"
                aria-label={label}
                aria-multiselectable
              >
                {filteredGroups.map((group, index) => (
                  <div
                    key={group.label ?? `sin-titulo-${index}`}
                    role="group"
                    aria-label={group.label}
                    className={cx(!group.label && index > 0 && "mt-1 border-t border-nc-border pt-1")}
                  >
                    {group.label ? (
                      <p
                        className="px-[0.85rem] pt-2 pb-1 text-[0.7rem] tracking-[0.08em] text-violet-300 uppercase"
                        aria-hidden
                      >
                        {group.label}
                      </p>
                    ) : null}
                    {group.options.map((opt) => {
                      const selected = value.includes(opt.label);
                      const disabled = !selected && value.length >= max;
                      return (
                        <button
                          key={opt.label}
                          type="button"
                          role="option"
                          aria-selected={selected}
                          disabled={disabled}
                          className={cx(
                            "flex w-full cursor-pointer items-start gap-2 border-0 bg-transparent px-[0.85rem] py-2 text-left text-[0.85rem] enabled:hover:bg-indigo-500/12 disabled:cursor-not-allowed disabled:opacity-40",
                            selected ? "text-violet-300" : "text-slate-100",
                          )}
                          onClick={() => toggle(opt.label)}
                        >
                          <span className="w-4 shrink-0 text-nc-cyan">{selected ? "✓" : ""}</span>
                          {opt.description ? (
                            <span>
                              <span className="block">{opt.label}</span>
                              <span className="block text-[0.78rem] leading-[1.35] text-nc-muted">
                                {opt.description}
                              </span>
                            </span>
                          ) : (
                            opt.label
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
                {filteredGroups.length === 0 ? (
                  <p className="px-[0.85rem] py-3 text-[0.85rem] text-slate-500">Sin resultados</p>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
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
      </div>
    </div>
  );
}

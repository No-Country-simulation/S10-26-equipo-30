"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  dropdownPanelClass,
  dropdownPanelSideClass,
  fieldControlSizeClass,
  fieldLabelClass,
  requiredMarkClass,
} from "@/components/form-styles";
import { cx } from "@/lib/cx";
import type { SelectOptionGroup } from "@/lib/form-options";
import { normalizeSearch } from "@/lib/search";
import { useDropdownPlacement } from "@/lib/use-dropdown-placement";

/** Alto máximo del panel: buscador más lista. */
const PANEL_HEIGHT = 320;

type GroupedSelectProps = {
  id?: string;
  label: string;
  hideLabel?: boolean;
  required?: boolean;
  groups: readonly SelectOptionGroup[];
  value: string;
  onChange: (value: string) => void;
  onOpen?: () => void;
  placeholder?: string;
};

/** Selector de una sola opción con grupos, descripción en cada opción y buscador. */
export function GroupedSelect({
  id: idProp,
  label,
  hideLabel = false,
  required,
  groups,
  value,
  onChange,
  onOpen,
  placeholder = "Seleccionar…",
}: GroupedSelectProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const { placement, measure } = useDropdownPlacement(anchorRef, open, PANEL_HEIGHT);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const search = normalizeSearch(query);
  const filteredGroups = groups
    .map((group) => ({
      ...group,
      options: group.options.filter(
        (option) =>
          normalizeSearch(option.label).includes(search) ||
          normalizeSearch(option.description ?? "").includes(search),
      ),
    }))
    .filter((group) => group.options.length > 0);

  function select(option: string) {
    onChange(option);
    setOpen(false);
    setQuery("");
  }

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
        </label>
      )}
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
          <span className={value ? undefined : "text-slate-500"}>{value || placeholder}</span>
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
            <div className="min-h-0 flex-1 overflow-y-auto py-[0.35rem]" role="listbox" aria-label={label}>
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
                  {group.options.map((option) => {
                    const selected = option.label === value;
                    return (
                      <button
                        key={option.label}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        className={cx(
                          "flex w-full cursor-pointer items-start gap-2 border-0 bg-transparent px-[0.85rem] py-2 text-left text-[0.85rem] hover:bg-indigo-500/12",
                          selected ? "text-violet-300" : "text-slate-100",
                        )}
                        onClick={() => select(option.label)}
                      >
                        <span className="w-4 shrink-0 text-nc-cyan">{selected ? "✓" : ""}</span>
                        <span>
                          <span className="block">{option.label}</span>
                          {option.description ? (
                            <span className="block text-[0.78rem] leading-[1.35] text-nc-muted">
                              {option.description}
                            </span>
                          ) : null}
                        </span>
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
    </div>
  );
}

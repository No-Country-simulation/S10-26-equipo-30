"use client";

import { useId, useState, type ReactNode } from "react";
import { cx } from "@/lib/cx";

type InfoTooltipProps = {
  /** Texto del botón para lectores de pantalla, por ejemplo "¿Para qué usamos tu teléfono?". */
  label: string;
  children: ReactNode;
  /** Se pasa al campo que explica (`aria-describedby`) para que lo lean al enfocarlo. */
  id?: string;
};

/**
 * Ícono "i" que abre un globo de ayuda con mouse, teclado o toque, y se cierra con Escape.
 * El globo se ubica sobre el contenedor posicionado más cercano (`relative`), no sobre el ícono,
 * para que no se salga de la pantalla en celular.
 */
export function InfoTooltip({ label, children, id }: InfoTooltipProps) {
  const generatedId = useId();
  const tooltipId = id ?? generatedId;
  const [open, setOpen] = useState(false);

  return (
    <span onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        className="ml-[0.35rem] inline-flex h-[1.05rem] w-[1.05rem] cursor-help items-center justify-center rounded-full border border-nc-muted/60 align-[-0.15em] text-[0.65rem] font-bold text-nc-muted transition-colors hover:border-nc-cyan hover:text-nc-cyan focus-visible:border-nc-cyan focus-visible:text-nc-cyan focus-visible:outline-none"
        aria-label={label}
        aria-describedby={tooltipId}
        aria-expanded={open}
        onClick={() => setOpen(true)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
      >
        i
      </button>
      <span
        id={tooltipId}
        role="tooltip"
        className={cx(
          "absolute bottom-full left-0 z-20 w-full max-w-[22rem] pb-2",
          open ? "block" : "hidden",
        )}
      >
        <span className="block rounded-xl border border-nc-border bg-nc-elevated px-[0.85rem] py-[0.7rem] text-[0.8rem] leading-[1.45] text-slate-200 shadow-[0_12px_32px_rgba(0,0,0,0.45)]">
          {children}
        </span>
      </span>
    </span>
  );
}

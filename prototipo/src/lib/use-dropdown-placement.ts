"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";

const GAP = 8;
const MIN_PANEL_HEIGHT = 160;

export type DropdownPlacement = { side: "bottom" | "top"; maxHeight: number };

/**
 * Decide si un desplegable se abre hacia abajo o hacia arriba según el espacio libre
 * en la ventana, y limita su alto a ese espacio. `measure` se llama al abrir; mientras
 * está abierto se recalcula con scroll y resize.
 */
export function useDropdownPlacement(
  anchorRef: RefObject<HTMLElement | null>,
  open: boolean,
  panelHeight: number,
) {
  const [placement, setPlacement] = useState<DropdownPlacement>({
    side: "bottom",
    maxHeight: panelHeight,
  });

  const measure = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    const below = window.innerHeight - rect.bottom - GAP;
    const above = rect.top - GAP;
    const side = below >= panelHeight || below >= above ? "bottom" : "top";
    const available = side === "bottom" ? below : above;
    setPlacement({
      side,
      maxHeight: Math.max(MIN_PANEL_HEIGHT, Math.min(panelHeight, available)),
    });
  }, [anchorRef, panelHeight]);

  useEffect(() => {
    if (!open) return;
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open, measure]);

  return { placement, measure };
}

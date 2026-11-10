"use client";

import { useSyncExternalStore } from "react";
import { getDraftSaveStatus, subscribeToDraftSaveStatus } from "@/lib/research-persistence";

export function DraftSaveIndicator() {
  const status = useSyncExternalStore(subscribeToDraftSaveStatus, getDraftSaveStatus, () => "idle");
  if (status === "idle") return null;
  return (
    <p className="text-[0.75rem] text-nc-muted" role="status">
      {status === "saving" ? (
        "Guardando borrador…"
      ) : (
        <>
          <span className="text-emerald-400" aria-hidden>
            ✓
          </span>{" "}
          Borrador guardado
        </>
      )}
    </p>
  );
}

"use client";

import { useEffect, useRef } from "react";
import type { ProjectDraft } from "@/lib/form-storage";
import {
  flushDraftAutosave,
  primeDraftAutosave,
  scheduleDraftAutosave,
} from "@/lib/research-persistence";

/**
 * Guarda el borrador en la base mientras la persona escribe, y enseguida si oculta o cierra
 * la pestaña. El primer valor es el borrador cargado: no se guarda si no cambió.
 */
export function useDraftAutosave(draft: ProjectDraft | null, stepId: string) {
  const primed = useRef(false);

  useEffect(() => {
    if (!draft) return;
    if (!primed.current) {
      primed.current = true;
      primeDraftAutosave(draft);
      return;
    }
    scheduleDraftAutosave(draft, stepId);
  }, [draft, stepId]);

  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState === "hidden") {
        void flushDraftAutosave("visibility_hidden");
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      primed.current = false;
      void flushDraftAutosave();
    };
  }, []);
}

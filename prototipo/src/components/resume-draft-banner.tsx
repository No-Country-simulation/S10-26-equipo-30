"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { findUnfinishedDraft, type UnfinishedDraft } from "@/lib/research-persistence";

const DISMISSED_KEY = "nocountry-resume-banner-dismissed";

/** Ofrece retomar la última carga sin enviar. Si falla la consulta, no muestra nada. */
export function ResumeDraftBanner() {
  const [draft, setDraft] = useState<UnfinishedDraft | null>(null);

  useEffect(() => {
    let cancelled = false;
    findUnfinishedDraft()
      .then((found) => {
        if (cancelled || !found) return;
        if (sessionStorage.getItem(DISMISSED_KEY) === found.sessionId) return;
        setDraft(found);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!draft) return null;

  const name = draft.title || draft.companyName;

  return (
    <div
      className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-xl border border-cyan-400/25 bg-cyan-400/8 px-4 py-[0.6rem] text-[0.85rem]"
      role="status"
    >
      <p className="text-cyan-100">
        Tenés un desafío sin terminar{name ? <>: <strong>{name}</strong></> : null}. Guardamos tu
        borrador durante 7 días.
      </p>
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="cursor-pointer text-nc-muted hover:text-slate-100"
          onClick={() => {
            sessionStorage.setItem(DISMISSED_KEY, draft.sessionId);
            setDraft(null);
          }}
        >
          Empezar de nuevo
        </button>
        <Link
          href={`/cargar-proyecto/retomar?sesion=${draft.sessionId}&origen=aviso`}
          className="font-semibold text-nc-cyan hover:underline"
        >
          Continuar →
        </Link>
      </div>
    </div>
  );
}

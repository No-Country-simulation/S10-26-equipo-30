"use client";

import { useState } from "react";
import { loginErrorClass } from "@/app/login/login-styles";
import { createClient } from "@/lib/supabase/client";

type GuestSignInButtonProps = {
  nextPath: string;
};

export function GuestSignInButton({ nextPath }: GuestSignInButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function continueAsGuest() {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInAnonymously({
        options: {
          data: { guest: true, full_name: "Invitado" },
        },
      });
      if (signInError) {
        const msg = signInError.message.toLowerCase();
        if (msg.includes("anonymous") && msg.includes("disabled")) {
          setError(
            "El acceso de invitado no está habilitado en Supabase (Authentication → Providers → Anonymous).",
          );
        } else {
          setError(signInError.message);
        }
        setLoading(false);
        return;
      }
      window.location.assign(nextPath);
    } catch {
      setError("No se pudo continuar como invitado.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2.5">
      <button
        type="button"
        className="inline-flex w-full cursor-pointer items-center justify-center rounded-[0.65rem] border border-nc-border bg-transparent px-4 py-3 text-[0.95rem] font-semibold text-slate-100 transition-colors enabled:hover:border-slate-400/40 enabled:hover:bg-slate-400/10 disabled:cursor-wait disabled:opacity-70"
        onClick={() => void continueAsGuest()}
        disabled={loading}
      >
        {loading ? "Entrando…" : "Continuar como invitado"}
      </button>
      {error ? <p className={loginErrorClass}>{error}</p> : null}
    </div>
  );
}

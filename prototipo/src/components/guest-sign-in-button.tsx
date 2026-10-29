"use client";

import { useState } from "react";
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
    <div className="google-signin-wrap">
      <button
        type="button"
        className="guest-signin-btn"
        onClick={() => void continueAsGuest()}
        disabled={loading}
      >
        {loading ? "Entrando…" : "Continuar como invitado"}
      </button>
      {error ? <p className="form-error">{error}</p> : null}
    </div>
  );
}

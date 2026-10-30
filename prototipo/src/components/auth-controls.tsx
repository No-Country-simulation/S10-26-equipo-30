"use client";

import Link from "next/link";
import type { AuthUserSummary } from "@/lib/supabase/types";
import { createClient } from "@/lib/supabase/client";
import { clearResearchSession } from "@/lib/research-persistence";

type AuthControlsProps = {
  user: AuthUserSummary | null;
  supabaseEnabled: boolean;
};

export function AuthControls({ user, supabaseEnabled }: AuthControlsProps) {
  if (!supabaseEnabled) {
    return (
      <span className="auth-pill auth-pill--muted" title="Configurá Supabase en .env.local">
        Auth off
      </span>
    );
  }

  if (!user) {
    return (
      <Link href="/login?next=/cargar-proyecto" className="auth-signin-link">
        Iniciar sesión
      </Link>
    );
  }

  const label =
    user.fullName ||
    (user.isAnonymous ? "Invitado" : user.email.split("@")[0] || "Tester");

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    clearResearchSession();
    // Recarga completa: Next deja montadas las páginas anteriores y seguirían creyendo que hay sesión.
    window.location.assign("/");
  }

  return (
    <div className="auth-user">
      {user.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={user.avatarUrl} alt="" className="auth-avatar" width={32} height={32} />
      ) : (
        <span className="auth-avatar auth-avatar--fallback" aria-hidden>
          {label.charAt(0).toUpperCase()}
        </span>
      )}
      <span className="auth-user-label" title={user.isAnonymous ? "Sesión de invitado" : user.email}>
        {label}
      </span>
      <Link href="/panel" className="auth-panel-link">
        Panel
      </Link>
      <button type="button" className="auth-signout" onClick={() => void signOut()}>
        Salir
      </button>
    </div>
  );
}

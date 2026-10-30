"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { GuestSignInButton } from "@/components/guest-sign-in-button";

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/cargar-proyecto";
  }
  return raw;
}

type LoginPanelProps = {
  configured: boolean;
};

export function LoginPanel({ configured }: LoginPanelProps) {
  const searchParams = useSearchParams();
  const nextPath = safeNextPath(searchParams.get("next"));
  const errorParam = searchParams.get("error");

  const errorMessage =
    errorParam === "config"
      ? "Supabase no está configurado en este entorno."
      : errorParam === "oauth"
        ? "No se pudo completar el inicio de sesión con Google."
        : errorParam === "google_disabled"
          ? "Google no está habilitado en Supabase (Authentication → Providers → Google)."
          : null;

  return (
    <div className="form-card login-card">
      <Link href="/" className="form-back-link">
        ← Volver
      </Link>
      <h1 className="login-title">Identificá tu sesión de test</h1>
      <p className="login-lead">
        Entrá con Google para identificar tu cuenta, o seguí como invitado si preferís no
        vincularla. En ambos casos el recorrido del formulario se guarda para el research.
      </p>

      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

      {configured ? (
        <>
          <GoogleSignInButton nextPath={nextPath} />
          <GuestSignInButton nextPath={nextPath} />
        </>
      ) : (
        <p className="login-config-hint">
          Configurá <code>NEXT_PUBLIC_SUPABASE_URL</code> y{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> (local: <code>.env.local</code>; Vercel:
          Environment Variables).
        </p>
      )}

      <p className="login-footnote">
        Con Google registramos el email para el research interno. Como invitado no pedimos cuenta:
        igual se guarda el formulario, asociado a una sesión anónima.
      </p>
    </div>
  );
}

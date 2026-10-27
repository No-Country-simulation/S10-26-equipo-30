"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { GoogleSignInButton } from "@/components/google-sign-in-button";

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
        Usamos Google para saber qué cuenta del equipo o participante está probando el flujo.
        Los datos del formulario se asociarán a esta sesión en etapas posteriores.
      </p>

      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

      {configured ? (
        <GoogleSignInButton nextPath={nextPath} />
      ) : (
        <p className="login-config-hint">
          Configurá <code>NEXT_PUBLIC_SUPABASE_URL</code> y{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> (local: <code>.env.local</code>; Vercel:
          Environment Variables).
        </p>
      )}

      <p className="login-footnote">
        Al continuar aceptás que registramos tu email de Google para research interno del equipo
        UXFlow.
      </p>
    </div>
  );
}

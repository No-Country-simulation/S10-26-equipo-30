import { Suspense } from "react";
import { LoginPanel } from "@/app/login/login-panel";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default function LoginPage() {
  const configured = isSupabaseConfigured();

  return (
    <main className="page-shell page-shell--narrow">
      <Suspense
        fallback={
          <div className="form-card login-card">
            <p className="login-lead">Cargando…</p>
          </div>
        }
      >
        <LoginPanel configured={configured} />
      </Suspense>
    </main>
  );
}

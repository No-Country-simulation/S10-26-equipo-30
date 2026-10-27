import { Suspense } from "react";
import { LoginPageContent } from "@/app/login/login-page-content";

export default function LoginPage() {
  return (
    <main className="page-shell page-shell--narrow">
      <Suspense
        fallback={
          <div className="form-card login-card">
            <p className="login-lead">Cargando…</p>
          </div>
        }
      >
        <LoginPageContent />
      </Suspense>
    </main>
  );
}

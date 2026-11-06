import { Suspense } from "react";
import { LoginPageContent } from "@/app/login/login-page-content";
import { loginCardClass } from "@/app/login/login-styles";

export default function LoginPage() {
  return (
    <main className="mx-auto w-full max-w-[720px] flex-1 px-5 pt-8 pb-16">
      <Suspense
        fallback={
          <div className={loginCardClass}>
            <p className="m-0 text-[0.9rem] leading-relaxed text-nc-muted">Cargando…</p>
          </div>
        }
      >
        <LoginPageContent />
      </Suspense>
    </main>
  );
}

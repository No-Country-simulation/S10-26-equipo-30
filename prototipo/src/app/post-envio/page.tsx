import { Suspense } from "react";
import { SuccessView } from "./success-view";

export default function PostEnvioPage() {
  return (
    <main className="page-shell page-shell--wide">
      <Suspense fallback={<div className="form-card">Cargando…</div>}>
        <SuccessView />
      </Suspense>
    </main>
  );
}

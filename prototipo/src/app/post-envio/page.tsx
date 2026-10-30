import { Suspense } from "react";
import { SuccessView } from "./success-view";

export default function PostEnvioPage() {
  return (
    <main className="finish-page">
      <Suspense fallback={<div className="form-card">Cargando…</div>}>
        <SuccessView />
      </Suspense>
    </main>
  );
}

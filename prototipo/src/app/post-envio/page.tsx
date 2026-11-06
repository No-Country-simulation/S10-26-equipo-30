import { Suspense } from "react";
import { formCardClass } from "@/components/form-styles";
import { SuccessView } from "./success-view";

export default function PostEnvioPage() {
  return (
    <main className="mx-auto flex min-h-0 w-full max-w-[40rem] flex-1 flex-col justify-center overflow-hidden px-5 pt-3 pb-4 max-sm:px-[0.9rem] max-sm:pt-2 max-sm:pb-[0.7rem]">
      <Suspense fallback={<div className={formCardClass}>Cargando…</div>}>
        <SuccessView />
      </Suspense>
    </main>
  );
}

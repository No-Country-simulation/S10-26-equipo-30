import { Suspense } from "react";
import { formCardClass, formShellClass } from "@/components/form-styles";
import { ResumeDraft } from "./resume-draft";

export default function RetomarPage() {
  return (
    <main className={formShellClass}>
      <Suspense fallback={<div className={formCardClass}>Recuperando tu borrador…</div>}>
        <ResumeDraft />
      </Suspense>
    </main>
  );
}

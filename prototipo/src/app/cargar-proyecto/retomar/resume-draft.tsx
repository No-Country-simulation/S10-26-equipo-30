"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { backLinkClass, formCardClass } from "@/components/form-styles";
import { GradientButton } from "@/components/gradient-button";
import { LoadingPin } from "@/components/loading-pin";
import {
  isAuthRequired,
  redirectToLogin,
  resumeFormSession,
  ResumeUnavailableError,
  type ResumeSource,
} from "@/lib/research-persistence";

type Problem = { message: string; alreadySubmitted: boolean };

export function ResumeDraft() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sesion") ?? "";
  const [failure, setFailure] = useState<Problem | null>(null);
  const problem: Problem | null = sessionId
    ? failure
    : { message: "El enlace para retomar está incompleto.", alreadySubmitted: false };
  // Next conserva esta pantalla oculta al navegar: el borrador se retoma una sola vez.
  const started = useRef(false);

  useEffect(() => {
    if (started.current || !sessionId) return;
    started.current = true;

    const source: ResumeSource = searchParams.get("origen") === "email" ? "email" : "aviso";
    resumeFormSession(sessionId, source)
      .then((href) => router.replace(href))
      .catch((cause) => {
        if (isAuthRequired(cause)) {
          redirectToLogin(`/cargar-proyecto/retomar?${searchParams.toString()}`);
          return;
        }
        setFailure({
          message:
            cause instanceof Error ? cause.message : "No pudimos recuperar tu borrador.",
          alreadySubmitted: cause instanceof ResumeUnavailableError && cause.alreadySubmitted,
        });
      });
  }, [router, searchParams, sessionId]);

  if (!problem) {
    return (
      <div className={`${formCardClass} flex items-center gap-3 text-nc-muted`} role="status">
        <LoadingPin />
        Recuperando tu borrador…
      </div>
    );
  }

  return (
    <div className={formCardClass}>
      <h1 className="mb-2 text-[1.25rem] font-semibold">No pudimos retomar este borrador</h1>
      <p className="mb-6 text-[0.92rem] leading-normal text-nc-muted">{problem.message}</p>
      <div className="flex flex-wrap items-center gap-4">
        {problem.alreadySubmitted ? (
          <GradientButton href="/mis-proyectos">Ver mis proyectos</GradientButton>
        ) : (
          <GradientButton href="/cargar-proyecto">Empezar una carga nueva</GradientButton>
        )}
        <Link href="/" className={backLinkClass}>
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

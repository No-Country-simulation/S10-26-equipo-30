"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { GradientButton } from "@/components/gradient-button";
import { clearDraft } from "@/lib/form-storage";

export function SuccessView() {
  const searchParams = useSearchParams();
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (searchParams.get("enviado") === "1") {
      setShowToast(true);
      clearDraft();
      const timer = window.setTimeout(() => setShowToast(false), 5000);
      return () => window.clearTimeout(timer);
    }
  }, [searchParams]);

  return (
    <>
      {showToast ? (
        <div className="toast" role="status">
          <span aria-hidden>✓</span>
          Proyecto creado correctamente
        </div>
      ) : null}

      <div className="form-card">
        <div className="success-layout">
          <div>
            <div className="success-icon-wrap" aria-hidden>
              ✓
            </div>
            <h1 className="success-title">¡Proyecto Enviado!</h1>
            <p className="success-subtitle">
              Tu proyecto ha sido enviado exitosamente para revisión
            </p>
          </div>

          <div>
            <h2 className="next-steps-title">¿Qué sigue ahora?</h2>
            <div className="next-step">
              <span className="next-step-icon next-step-icon--blue" aria-hidden>
                🔍
              </span>
              <div>
                <strong>Revisión</strong>
                <p>El equipo de No Country revisará tu proyecto cuidadosamente.</p>
              </div>
            </div>
            <div className="next-step">
              <span className="next-step-icon next-step-icon--green" aria-hidden>
                ✓
              </span>
              <div>
                <strong>Aprobación</strong>
                <p>
                  Si todo está correcto, tu proyecto será incluido en la próxima simulación
                  disponible.
                </p>
              </div>
            </div>
            <div className="next-step">
              <span className="next-step-icon next-step-icon--yellow" aria-hidden>
                !
              </span>
              <div>
                <strong>Ajustes</strong>
                <p>
                  Te contactaremos si necesitamos que realices cambios antes de su lanzamiento.
                </p>
              </div>
            </div>
            <div className="warning-box">
              Si el proyecto no cumple con los requisitos o viola alguna de las normas de No
              Country, será rechazado y recibirás una notificación.
            </div>
          </div>
        </div>

        <div className="success-footer">
          <GradientButton href="/">Ver Mis Proyectos</GradientButton>
        </div>
      </div>
    </>
  );
}

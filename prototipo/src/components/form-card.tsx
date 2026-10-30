import Link from "next/link";
import type { ReactNode } from "react";
import { GradientButton } from "./gradient-button";

type FormCardProps = {
  backHref?: string;
  backLabel?: string;
  backIconOnly?: boolean;
  onContinue?: () => void;
  continueHref?: string;
  continueLabel?: string;
  continueDisabled?: boolean;
  continueBusy?: boolean;
  continueType?: "button" | "submit";
  hideContinue?: boolean;
  children: ReactNode;
};

export function FormCard({
  backHref,
  backLabel = "Atrás",
  backIconOnly = false,
  onContinue,
  continueHref,
  continueLabel = "Continuar",
  continueDisabled,
  continueBusy = false,
  continueType = "button",
  hideContinue = false,
  children,
}: FormCardProps) {
  return (
    <div className="form-card">
      <div className="form-card-nav">
        {backHref ? (
          <Link
            href={backHref}
            className={
              backIconOnly ? "form-back-link form-back-link--icon" : "form-back-link"
            }
            aria-label={backIconOnly ? backLabel : undefined}
          >
            {backIconOnly ? "←" : `← ${backLabel}`}
          </Link>
        ) : (
          <span />
        )}
        {hideContinue ? null : continueHref ? (
          <GradientButton href={continueHref}>{continueLabel}</GradientButton>
        ) : continueType === "submit" ? (
          <GradientButton type="submit" disabled={continueDisabled} busy={continueBusy}>
            {continueLabel}
          </GradientButton>
        ) : (
          <GradientButton type="button" onClick={onContinue} disabled={continueDisabled} busy={continueBusy}>
            {continueLabel}
          </GradientButton>
        )}
      </div>
      {children}
    </div>
  );
}

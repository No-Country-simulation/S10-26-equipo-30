import Link from "next/link";
import type { ReactNode } from "react";
import {
  backLinkClass,
  formCardClass,
  formCardCompactClass,
  formCardFitClass,
  formCardShellClass,
} from "@/components/form-styles";
import { cx } from "@/lib/cx";
import { GradientButton } from "./gradient-button";

type FormCardProps = {
  /**
   * `shell`: dentro de las pantallas de formulario · `compact`: como `shell` pero con menos aire
   * vertical · `fit`: ocupa el alto disponible sin scroll.
   */
  variant?: "default" | "shell" | "compact" | "fit";
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

const cardClassByVariant = {
  default: formCardClass,
  shell: formCardShellClass,
  compact: formCardCompactClass,
  fit: formCardFitClass,
} as const;

const headerMarginByVariant = {
  default: "mb-7",
  shell: "mb-7",
  compact: "mb-4",
  fit: "mb-[0.45rem] shrink-0",
} as const;

export function FormCard({
  variant = "default",
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
    <div className={cardClassByVariant[variant]}>
      <div
        className={cx("flex items-center justify-between gap-4", headerMarginByVariant[variant])}
      >
        {backHref ? (
          <Link
            href={backHref}
            className={cx(
              backLinkClass,
              backIconOnly &&
                "inline-flex h-9 w-9 items-center justify-center text-[1.15rem] leading-none",
            )}
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

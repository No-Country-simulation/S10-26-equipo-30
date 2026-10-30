import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { LoadingPin } from "@/components/loading-pin";

type GradientButtonProps = ComponentPropsWithoutRef<"button"> & {
  href?: string;
  arrow?: "left" | "right" | "none";
  busy?: boolean;
};

export function GradientButton({
  href,
  arrow = "right",
  busy = false,
  children,
  className = "",
  disabled,
  ...props
}: GradientButtonProps) {
  const content = (
    <>
      {arrow === "left" ? <span aria-hidden>←</span> : null}
      {busy ? <LoadingPin /> : null}
      <span>{children}</span>
      {arrow === "right" && !busy ? <span aria-hidden>→</span> : null}
    </>
  );

  const classes = `gradient-btn${busy ? " is-busy" : ""} ${className}`.trim();

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={classes}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      {...props}
    >
      {content}
    </button>
  );
}

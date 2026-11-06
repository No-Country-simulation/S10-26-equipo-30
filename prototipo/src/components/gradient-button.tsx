import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { gradientSurfaceClass } from "@/components/form-styles";
import { LoadingPin } from "@/components/loading-pin";
import { cx } from "@/lib/cx";

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
      {busy ? <LoadingPin tone="light" /> : null}
      <span>{children}</span>
      {arrow === "right" && !busy ? <span aria-hidden>→</span> : null}
    </>
  );

  const classes = cx(
    gradientSurfaceClass,
    "px-[1.35rem] py-[0.65rem] text-[0.9rem] transition-[opacity,transform] duration-150 not-disabled:hover:-translate-y-px not-disabled:hover:opacity-92",
    busy ? "disabled:cursor-wait" : "disabled:cursor-not-allowed disabled:opacity-45",
    className,
  );

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

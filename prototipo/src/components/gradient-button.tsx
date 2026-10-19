import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

type GradientButtonProps = ComponentPropsWithoutRef<"button"> & {
  href?: string;
  arrow?: "left" | "right" | "none";
};

export function GradientButton({
  href,
  arrow = "right",
  children,
  className = "",
  ...props
}: GradientButtonProps) {
  const content = (
    <>
      {arrow === "left" ? <span aria-hidden>←</span> : null}
      <span>{children}</span>
      {arrow === "right" ? <span aria-hidden>→</span> : null}
    </>
  );

  const classes = `gradient-btn ${className}`.trim();

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
      {content}
    </button>
  );
}

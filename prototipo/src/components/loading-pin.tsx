import { cx } from "@/lib/cx";

export function LoadingPin({ tone = "cyan" }: { tone?: "cyan" | "light" }) {
  return (
    <span
      className={cx(
        "inline-block h-[0.9rem] w-[0.9rem] flex-none animate-spin rounded-full border-2",
        tone === "light" ? "border-white/40 border-t-white" : "border-cyan-400/35 border-t-cyan-400",
      )}
      aria-hidden
    />
  );
}

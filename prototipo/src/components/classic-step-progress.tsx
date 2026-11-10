import { guidedFillClass, guidedTrackClass } from "@/components/form-styles";

const CLASSIC_TOTAL_STEPS = 2;

export function ClassicStepProgress({ step }: { step: number }) {
  const label = `Paso ${step}/${CLASSIC_TOTAL_STEPS}`;
  return (
    <div className="mb-6">
      <p className="mb-[0.65rem] text-[0.95rem] font-bold tracking-[0.04em] tabular-nums">{label}</p>
      <div
        className={guidedTrackClass}
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={CLASSIC_TOTAL_STEPS}
        aria-valuenow={step}
        aria-valuetext={label}
      >
        <div
          className={guidedFillClass}
          style={{ width: `${Math.round((step / CLASSIC_TOTAL_STEPS) * 100)}%` }}
        />
      </div>
    </div>
  );
}

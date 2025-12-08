type Props = {
  active: number;
};

const steps = ["Connect", "Detect", "See value"];

export default function ProgressSteps({ active }: Props) {
  return (
    <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
      {steps.map((step, idx) => {
        const current = idx + 1 <= active;
        return (
          <div key={step} className="flex items-center gap-2">
            <span
              className={`grid h-7 w-7 place-items-center rounded-full border text-sm ${
                current
                  ? "border-green-400 bg-green-400/20 text-green-200"
                  : "border-white/20 bg-white/5 text-white/60"
              }`}
            >
              {idx + 1}
            </span>
            <span className={current ? "text-white" : ""}>{step}</span>
            {idx < steps.length - 1 && <span className="text-white/30">→</span>}
          </div>
        );
      })}
    </div>
  );
}

import type { UploadResult } from "@/lib/api";

type Props = {
  anomalies?: UploadResult["anomalies"];
};

export default function AlertList({ anomalies }: Props) {
  const has = anomalies && anomalies.length > 0;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <p className="text-sm uppercase tracking-[0.2em] text-brand-100">Alerts</p>
      {!has && <p className="mt-3 text-sm text-[var(--muted)]">No anomalies detected yet.</p>}
      {has && (
        <ul className="mt-3 space-y-2">
          {anomalies!.map((a) => (
            <li
              key={a.date}
              className={`rounded-xl border px-3 py-2 ${
                Math.abs(a.z_score) >= 3
                  ? "border-red-400/40 bg-red-500/15"
                  : "border-amber-300/30 bg-amber-400/10"
              }`}
            >
              <p className="text-sm font-semibold text-white">{a.message}</p>
              <p className="text-xs text-white/80">z-score {a.z_score}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

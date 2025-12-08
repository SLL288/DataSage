import { useEffect, useState } from "react";
import type { UploadResult } from "@/lib/api";
import { fetchWeeklySummary } from "@/lib/api";

type Props = {
  narrative?: string;
  tags?: string[];
  onExplain?: () => void;
  loadingExplain?: boolean;
};

export default function SummaryCard({ narrative, tags, onExplain, loadingExplain }: Props) {
  const [weekly, setWeekly] = useState<string>("Weekly PDF summary generator placeholder.");

  useEffect(() => {
    fetchWeeklySummary()
      .then((r) => setWeekly(r.summary))
      .catch(() => {});
  }, []);

  const actionTone = narrative?.toLowerCase().includes("drop") ? "red" : "green";

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 p-5 shadow-lg">
      <div className="flex items-center justify-between">
        <p className="text-sm uppercase tracking-[0.2em] text-brand-100">Narrative Summary</p>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            actionTone === "red" ? "bg-red-500/20 text-red-200" : "bg-green-500/20 text-green-200"
          }`}
        >
          {actionTone === "red" ? "Action required" : "Growing"}
        </span>
      </div>
      <p className="mt-3 text-lg text-white">{narrative || "Upload data to generate an insight narrative."}</p>
      {tags && tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          {tags.map((t) => (
            <span key={t} className="rounded-full bg-white/10 px-3 py-1 text-white/80">
              {t}
            </span>
          ))}
        </div>
      )}
      <button
        className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10 transition disabled:opacity-60"
        onClick={onExplain}
        disabled={loadingExplain}
      >
        {loadingExplain ? "Explaining..." : "Explain this period"}
        <span className="text-brand-100">→</span>
      </button>
      <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4">
        <p className="text-xs uppercase tracking-[0.15em] text-[var(--muted)]">Weekly PDF Email</p>
        <p className="text-sm text-white">{weekly}</p>
      </div>
    </div>
  );
}

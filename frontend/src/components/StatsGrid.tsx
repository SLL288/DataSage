import type { UploadResult } from "@/lib/api";

type Props = {
  metrics?: UploadResult["metrics"];
  series?: UploadResult["timeseries"];
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function StatsGrid({ metrics, series }: Props) {
  if (!metrics) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-[var(--muted)]">
        Upload data to see totals, growth, and projections.
      </div>
    );
  }

  const dateRange =
    series && series.length
      ? `${series[0].date} → ${series[series.length - 1].date}`
      : "No dates";

  const stats = [
    { label: "Total income", value: currency.format(metrics.total_revenue), tone: "green" },
    { label: "Total expenses", value: currency.format(metrics.total_cost || 0), tone: "red" },
    { label: "Net result", value: currency.format(metrics.total_profit || metrics.total_revenue - (metrics.total_cost || 0)), tone: "green" },
    { label: "Time range", value: dateRange, tone: "neutral" },
  ];

  return (
    <div className="grid gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-4 shadow-inner"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-brand-100">{s.label}</p>
          <p
            className={`mt-2 text-2xl font-semibold ${
              s.tone === "green" ? "text-green-300" : s.tone === "red" ? "text-red-300" : "text-white"
            }`}
          >
            {s.value}
          </p>
          {s.label === "Time range" && <span className="text-xs text-[var(--muted)]">Autodetected from your data</span>}
        </div>
      ))}
    </div>
  );
}

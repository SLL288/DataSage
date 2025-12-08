import { useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { UploadResult } from "@/lib/api";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

type Props = {
  series?: UploadResult["timeseries"];
};

export default function ChartPanel({ series }: Props) {
  useEffect(() => {
    // Chart.js registers only once; hook present to make React strict-mode happy.
  }, []);

  if (!series?.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-[var(--muted)]">
        Time-series view will render after uploading data with a date column.
      </div>
    );
  }

  const data = {
    labels: series.map((p) => p.date),
    datasets: [
      {
        label: "Revenue",
        data: series.map((p) => p.revenue),
        fill: true,
        borderColor: "#2f6bff",
        backgroundColor: "rgba(47, 107, 255, 0.2)",
        tension: 0.3,
        pointRadius: 3,
      },
    ],
  };

  const options = {
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: "#9fb0cf" } },
      y: { ticks: { color: "#9fb0cf" }, grid: { color: "rgba(255,255,255,0.08)" } },
    },
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm uppercase tracking-[0.2em] text-brand-100">Performance</p>
        <p className="text-sm text-[var(--muted)]">Auto-generated from your upload</p>
      </div>
      <div className="mt-4">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}

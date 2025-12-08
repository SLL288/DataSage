import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import type { UploadResult } from "@/lib/api";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type Props = {
  categories?: UploadResult["categories"];
};

export default function CategoryChart({ categories }: Props) {
  if (!categories?.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-[var(--muted)]">
        Upload data to see top categories.
      </div>
    );
  }

  const data = {
    labels: categories.map((c) => c.name),
    datasets: [
      {
        label: "Revenue",
        data: categories.map((c) => c.total),
        backgroundColor: categories.map((_, idx) => (idx === 0 ? "rgba(74, 222, 128, 0.6)" : "rgba(59,130,246,0.6)")),
        borderRadius: 12,
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
        <p className="text-sm uppercase tracking-[0.2em] text-brand-100">Top categories</p>
        <p className="text-xs text-[var(--muted)]">Ranked by revenue</p>
      </div>
      <div className="mt-4">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}

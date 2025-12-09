export type UploadResult = {
  schema: {
    date?: string;
    revenue?: string;
    cost?: string;
    profit?: string;
    product?: string;
    qty?: string;
  };
  metrics: {
    total_revenue: number;
    total_cost: number;
    total_profit: number;
    avg_daily_revenue: number;
    weekly_growth_pct: number;
    projections: number[];
  };
  timeseries: { date: string; revenue: number }[];
  anomalies: { date: string; value: number; z_score: number; message: string }[];
  narrative: string;
  columns: string[];
  categories: { name: string; total: number }[];
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://datasage-api.onrender.com";

export async function uploadCsv(
  file: File,
  mapping?: { date_column?: string; revenue_column?: string; category_column?: string }
): Promise<UploadResult> {
  const form = new FormData();
  form.append("file", file);
  if (mapping?.date_column) form.append("date_column", mapping.date_column);
  if (mapping?.revenue_column) form.append("revenue_column", mapping.revenue_column);
  if (mapping?.category_column) form.append("category_column", mapping.category_column);

  const res = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const raw = await res.text();
    let detail: any = raw;
    try {
      detail = JSON.parse(raw);
    } catch {
      // ignore
    }
    const err = new Error(typeof detail === "string" ? detail : detail?.message || "Upload failed");
    (err as any).detail = detail;
    throw err;
  }
  return (await res.json()) as UploadResult;
}

export async function fetchWeeklySummary(): Promise<{ summary: string }> {
  const res = await fetch(`${API_BASE}/alerts/weekly-summary`);
  if (!res.ok) throw new Error("Unable to fetch summary");
  return res.json();
}

export async function explainPeriod(payload: {
  metrics: UploadResult["metrics"];
  anomalies: UploadResult["anomalies"];
  categories: UploadResult["categories"];
  period?: string;
}): Promise<{ explanation: string; tags: string[] }> {
  const res = await fetch(`${API_BASE}/explain`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json();
}

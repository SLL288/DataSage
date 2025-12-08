'use client';

import { useMemo, useState } from "react";
import UploadCard from "@/components/UploadCard";
import StatsGrid from "@/components/StatsGrid";
import ChartPanel from "@/components/ChartPanel";
import AlertList from "@/components/AlertList";
import SummaryCard from "@/components/SummaryCard";
import type { UploadResult } from "@/lib/api";
import ProgressSteps from "@/components/ProgressSteps";
import { ChartSkeleton, FeedSkeleton, KpiSkeleton } from "@/components/Skeletons";
import MappingForm from "@/components/MappingForm";
import CategoryChart from "@/components/CategoryChart";
import Filters from "@/components/Filters";
import { explainPeriod, uploadCsv } from "@/lib/api";

export default function HomePage() {
  const [result, setResult] = useState<UploadResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [needsMapping, setNeedsMapping] = useState(false);
  const [lastFile, setLastFile] = useState<File | null>(null);
  const [explainText, setExplainText] = useState<string | null>(null);
  const [explainTags, setExplainTags] = useState<string[]>([]);
  const [explaining, setExplaining] = useState(false);
  const [dateRange, setDateRange] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const hasData = Boolean(result);
  const step = useMemo(() => (loading ? 2 : hasData ? 3 : 1), [loading, hasData]);

  const runUpload = async (file: File, mapping?: { date_column?: string; revenue_column?: string; category_column?: string }) => {
    setLastFile(file);
    setLoading(true);
    setError(null);
    setExplainText(null);
    try {
      const res = await uploadCsv(file, mapping);
      setResult(res);
      setColumns(res.columns || []);
      setNeedsMapping(false);
    } catch (err) {
      const detail = (err as any).detail;
      if (detail?.columns) {
        setColumns(detail.columns);
        setNeedsMapping(true);
      }
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSample = async () => {
    setError(null);
    const res = await fetch("/sample.csv");
    const text = await res.text();
    const file = new File([text], "sample.csv", { type: "text/csv" });
    await runUpload(file);
  };

  const filteredSeries = useMemo(() => {
    if (!result?.timeseries) return [];
    if (dateRange === "all") return result.timeseries;
    const days = parseInt(dateRange, 10);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return result.timeseries.filter((p) => new Date(p.date) >= cutoff);
  }, [result, dateRange]);

  const filteredCategories = useMemo(() => {
    if (!result?.categories) return [];
    if (categoryFilter === "all") return result.categories;
    return result.categories.filter((c) => c.name === categoryFilter);
  }, [result, categoryFilter]);

  const handleExplain = async () => {
    if (!result) return;
    setExplaining(true);
    try {
      const res = await explainPeriod({
        metrics: result.metrics,
        anomalies: result.anomalies,
        categories: result.categories,
        period: `${filteredSeries[0]?.date || ""} to ${filteredSeries.slice(-1)[0]?.date || ""}`,
      });
      setExplainText(res.explanation);
      setExplainTags(res.tags);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setExplaining(false);
    }
  };

  return (
    <main className="space-y-10">
      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-brand-700/30 via-brand-500/10 to-white/5 p-8 shadow-2xl">
        <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.2em] text-brand-100">Auto dashboards</p>
            <h1 className="text-3xl font-semibold text-white">Upload your spreadsheet. Get instant business insights.</h1>
            <p className="max-w-2xl text-base text-[var(--muted)]">
              Cashflow, trends and explanations generated automatically — no formulas, no BI team. CSV, Excel, and Google Sheets-ready.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSample}
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-700 shadow-lg hover:-translate-y-0.5 hover:shadow-brand-500/40 transition"
              >
                Try with sample data
              </button>
              <a
                href="#upload"
                className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition"
              >
                Upload your own file
              </a>
            </div>
            <ProgressSteps active={step} />
            <div className="mt-4 grid gap-3 text-sm text-[var(--muted)] md:grid-cols-3">
              <div>Upload CSV / connect Google Sheets</div>
              <div>We analyze and build a dashboard</div>
              <div>Get AI explanations of trends & anomalies</div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 p-5 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-transparent to-white/5" />
            <p className="text-xs uppercase tracking-[0.25em] text-brand-100">Mock dashboard</p>
            <div className="mt-3 grid gap-3">
              <div className="flex gap-3">
                <div className="flex-1 rounded-2xl bg-white/5 p-3">
                  <p className="text-xs text-[var(--muted)]">Total revenue</p>
                  <p className="text-xl font-semibold text-green-300">$84,200</p>
                </div>
                <div className="flex-1 rounded-2xl bg-white/5 p-3">
                  <p className="text-xs text-[var(--muted)]">Net result</p>
                  <p className="text-xl font-semibold text-white">$22,400</p>
                </div>
              </div>
              <div className="h-32 rounded-2xl bg-gradient-to-r from-brand-500/30 to-white/10" />
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/90">
                “Revenue grew 12% WoW driven by Alpha and Bravo. Watch spend in Fuel: up 25% and pressuring margin.”
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="upload" className="space-y-4">
        <UploadCard onUpload={runUpload} loading={loading} error={error} />
        {needsMapping && columns.length > 0 && <MappingForm columns={columns} onSubmit={(mapping) => lastFile && runUpload(lastFile, mapping)} />}
        <div className="relative grid gap-4 md:grid-cols-3">
          <div className="pointer-events-none absolute inset-0 -z-10 motion-safe:animate-pulse">
            <div className="mx-auto h-16 w-16 rotate-90 border-l-2 border-dashed border-brand-500/50" />
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-[var(--muted)]">
            <p className="text-white">Google Sheets</p>
            <p>One-click OAuth stub; wire token exchange in backend.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-[var(--muted)]">
            <p className="text-white">Shopify</p>
            <p>Connect store → sync orders to Postgres/Supabase.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-[var(--muted)]">
            <p className="text-white">Stripe</p>
            <p>Stub billing tier; hook into customer portal as needed.</p>
          </div>
        </div>
      </section>

      <section id="dashboard" className="space-y-4">
        <Filters
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          category={categoryFilter}
          onCategoryChange={setCategoryFilter}
          categories={result?.categories || []}
        />
        <div className="grid gap-4 md:grid-cols-[1.1fr_1.7fr_1fr]">
          <div className="space-y-4">
            {loading && !hasData ? (
              <>
                <KpiSkeleton />
                <KpiSkeleton />
              </>
            ) : (
              <StatsGrid metrics={result?.metrics} series={filteredSeries} />
            )}
          </div>

          <div className="space-y-4">
            {loading && !hasData ? <ChartSkeleton /> : <ChartPanel series={filteredSeries} />}
            <CategoryChart categories={filteredCategories} />
          </div>

          <div className="space-y-4">
            {loading && !hasData ? (
              <FeedSkeleton />
            ) : (
              <>
                <SummaryCard narrative={explainText || result?.narrative} tags={explainTags} onExplain={handleExplain} loadingExplain={explaining} />
                <AlertList anomalies={result?.anomalies} />
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm uppercase tracking-[0.2em] text-brand-100">Predictions</p>
                  <p className="mt-2 text-sm text-[var(--muted)] text-green-200">
                    Growth path: {result?.metrics?.projections.join(", ") || "Upload to unlock forecasts."}
                  </p>
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    Replace with model-driven forecasts and store in Postgres for alerting.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-[var(--muted)]">
        <p className="text-white">Data usage</p>
        <p>Your data is processed on our server and not shared with third parties. Connect a Cloudflare Workers AI key to generate explanations; only summaries are sent.</p>
      </section>
    </main>
  );
}

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
import { explainPeriod, exportPdf, importGoogleSheet, uploadCsv } from "@/lib/api";

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
  const [sheetUrl, setSheetUrl] = useState("");
  const [downloading, setDownloading] = useState(false);

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

  const handleGoogleSheetImport = async () => {
    if (!sheetUrl) {
      setError("Please paste a Google Sheet CSV export link.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await importGoogleSheet(sheetUrl);
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

  const handlePdf = async () => {
    if (!result) return;
    setDownloading(true);
    try {
      const blob = await exportPdf({
        metrics: result.metrics,
        timeseries: result.timeseries,
        categories: result.categories,
        anomalies: result.anomalies,
        narrative: explainText || result.narrative,
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "datasage-summary.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setDownloading(false);
    }
  };

  const scrollToApp = () => {
    document.getElementById("app")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleUploadCta = () => {
    scrollToApp();
    const input = document.getElementById("upload-input") as HTMLInputElement | null;
    if (input) {
      input.click();
    }
  };

  const handleSampleCta = async () => {
    await handleSample();
    scrollToApp();
  };

  return (
    <main className="landing">
      <div className="page">
        <header className="topbar">
          <div className="logo">
            <div className="logo-mark">DS</div>
            <div>
              <div className="logo-text-main">Datasage</div>
              <div className="logo-text-sub">Auto dashboards for operators</div>
            </div>
          </div>
          <div className="topbar-right">
            <div className="badge-beta">Beta - Free for early users</div>
            <button className="topbar-link" onClick={scrollToApp}>
              Open dashboard app -&gt;
            </button>
          </div>
        </header>

        <section className="hero-section">
          <div className="hero-main">
            <div className="hero-label">
              <span className="hero-label-dot" />
              <span>Upload spreadsheet -&gt; See investor-ready view in seconds</span>
            </div>
            <h1 className="hero-title">
              Auto dashboards from your <span className="hero-highlight">CSV, Excel, and Google Sheets</span>.
            </h1>
            <p className="hero-subtitle">
              Skip manual charts and formulas. Datasage detects revenue, costs, dates, and categories, then builds a clean dashboard with AI-generated narratives for your team and investors.
            </p>

            <div className="hero-cta-row">
              <button className="btn-primary" onClick={handleSampleCta}>
                Try with sample data
                <span>-&gt;</span>
              </button>
              <button className="btn-secondary" onClick={handleUploadCta}>
                Upload my own spreadsheet
              </button>
            </div>
            <div className="hero-note">
              <strong>Free while in beta.</strong> Designed for founders, operators, mining projects, and small business dashboards.
            </div>

            <div className="hero-mini">
              <div className="mini-chip">Fast: upload to insights in ~30 seconds</div>
              <div className="mini-chip">Time-series, categories, and AI explanation</div>
              <div className="mini-chip">Data processed server-side, not sold or shared</div>
            </div>
          </div>

          <aside className="hero-mock">
            <div className="mock-header">
              <div className="mock-header-left">
                <div className="mock-title">Mock dashboard</div>
                <div className="mock-sub">Sample view generated from a monthly revenue sheet</div>
              </div>
              <div className="mock-tag">AI narrative on</div>
            </div>

            <div className="mock-body">
              <div className="mock-metrics">
                <div className="metric-row">
                  <div>
                    <div className="metric-label">Total revenue</div>
                    <div className="metric-value">$84,200</div>
                  </div>
                  <span className="metric-chip">+12% vs. last period</span>
                </div>
                <div className="metric-row">
                  <div>
                    <div className="metric-label">Net result</div>
                    <div className="metric-value">$22,400</div>
                  </div>
                  <span className="metric-chip" style={{ background: "rgba(220, 38, 38, 0.12)", borderColor: "rgba(220, 38, 38, 0.5)", color: "#fecaca" }}>
                    Margin 26.6%
                  </span>
                </div>

                <div className="mock-chart">
                  <div className="chart-line" />
                  <div className="chart-spark" />
                </div>
              </div>

              <div className="mock-narrative">
                <label>AI narrative</label>
                <p>
                  Revenue grew <span className="accent">12% week over week</span>, driven mainly by segments <span className="accent">Alpha</span> and <span className="accent">Bravo</span>. Spend in <span className="accent">Fuel</span> increased 25% and is pressuring margin.
                </p>
                <p>
                  If this pattern continues, you will cross last month&apos;s revenue in about 9 days. Consider tightening costs on low ROI categories.
                </p>
              </div>
            </div>

            <div className="mock-footer">
              <span>Upload real data to replace this mock with your own numbers.</span>
              <span>Weekly PDF export - Alert stubs ready</span>
            </div>
          </aside>
        </section>

        <section className="section">
          <h2 className="section-title">How Datasage works</h2>
          <p className="section-sub">No schema setup, no BI consultant. Just upload your spreadsheet and let Datasage handle the structure, charting, and commentary.</p>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-label">Step 1</div>
              <div className="step-title">Connect your data</div>
              <div className="step-body">Upload a CSV/Excel file or connect a published Google Sheet link. We detect date, amount, category, and entity columns automatically.</div>
            </div>
            <div className="step-card">
              <div className="step-label">Step 2</div>
              <div className="step-title">We detect the structure</div>
              <div className="step-body">Datasage infers metrics (revenue, cost, profit), time ranges, and grouping columns (for projects, stores, lines). No manual mapping required for typical business sheets.</div>
            </div>
            <div className="step-card">
              <div className="step-label">Step 3</div>
              <div className="step-title">You see the dashboard and story</div>
              <div className="step-body">You get charts, tables, and an AI narrative of what changed. Export to PDF or share the view with investors and team members.</div>
            </div>
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Built for people who live in spreadsheets</h2>
          <p className="section-sub">If your dashboard today is a big Excel file you email around, Datasage turns that into a clean, always up to date view without rebuilding anything in Power BI or Looker.</p>
          <div className="pill-row">
            <div className="pill">Founders tracking runway and revenue</div>
            <div className="pill">Operators monitoring daily or weekly cashflow</div>
            <div className="pill">Mining and exploration projects summarizing lines</div>
            <div className="pill">Agencies reporting to clients</div>
            <div className="pill">Side projects and indie SaaS</div>
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Pricing</h2>
          <p className="section-sub">Early beta is free while we harden the product. Paid tiers will remain friendly for solo operators and small teams.</p>

          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="pricing-tag">Beta</div>
              <div className="pricing-title">Early access</div>
              <div className="pricing-price">$0</div>
              <div className="pricing-note">Free for early users while in beta.</div>
              <ul className="pricing-list">
                <li>Upload CSV / Excel or Google Sheets</li>
                <li>Auto detected metrics and charts</li>
                <li>AI narrative of trends and anomalies (with your AI key)</li>
                <li>Export as screenshot or PDF (manual for now)</li>
              </ul>
              <button className="btn-secondary" onClick={scrollToApp}>
                Start in beta -&gt;
              </button>
            </div>

            <div className="pricing-card">
              <div className="pricing-title">Planned Pro tier</div>
              <div className="pricing-sub">Coming soon</div>
              <div className="pricing-note">Indicative only - we will confirm pricing with early users first.</div>
              <ul className="pricing-list">
                <li>Auto refresh from live Sheets / data source</li>
                <li>Scheduled weekly PDF summaries by email</li>
                <li>Multiple saved dashboards per account</li>
                <li>Team and investor sharing links</li>
                <li>Priority support and onboarding help</li>
              </ul>
              <div className="hero-note">Want input on pricing or features? Reply to the invite email and tell us how you would use it.</div>
            </div>
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">FAQ</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <div className="faq-q">Is my data safe?</div>
              <p>Your files are processed on our server for dashboard generation. We do not sell or share your data with third parties. If you connect an AI key (for example Cloudflare Workers AI), only the minimum needed summary is sent for narrative generation.</p>
            </div>
            <div className="faq-item">
              <div className="faq-q">What formats do you support?</div>
              <p>CSV, Excel, and Google Sheets (via published CSV link). We are starting with simple transactions style tables (date, amount, category, and so on) and expanding from there.</p>
            </div>
            <div className="faq-item">
              <div className="faq-q">Do I need to clean my data first?</div>
              <p>You will get the best results if your sheet has clear column names and one row per transaction or record. We try to infer common patterns automatically so you do not have to restructure everything.</p>
            </div>
            <div className="faq-item">
              <div className="faq-q">Can I use this for mining or project dashboards?</div>
              <p>Yes. Datasage is helpful for project based sheets where you want line by line performance (for example different mines, locations, or initiatives) summarized quickly for owners and investors.</p>
            </div>
          </div>
        </section>

        <section id="app" className="section">
          <h2 className="section-title">Try the app</h2>
          <p className="section-sub">Below this section, you can render your existing upload and dashboard UI. Hook the hero buttons above to this workflow.</p>
          <div className="app-shell space-y-6">
            <div className="space-y-3">
              <ProgressSteps active={step} />
              <p className="app-header-note">We auto detect your date and revenue/amount columns. Works best with daily or weekly data.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <UploadCard inputId="upload-input" onUpload={runUpload} loading={loading} error={error} />
                {needsMapping && columns.length > 0 && <MappingForm columns={columns} onSubmit={(mapping) => lastFile && runUpload(lastFile, mapping)} />}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-white">Or paste a Google Sheet CSV link</p>
                  <p className="text-xs text-[var(--text-muted)]">Use Share -&gt; Anyone with the link -&gt; Viewer, or publish to CSV and paste here.</p>
                  <div className="mt-3 flex flex-col gap-2 md:flex-row">
                    <input
                      value={sheetUrl}
                      onChange={(e) => setSheetUrl(e.target.value)}
                      placeholder="https://docs.google.com/spreadsheets/d/.../pub?output=csv"
                      className="flex-1 rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-sm text-white"
                    />
                    <button
                      onClick={handleGoogleSheetImport}
                      className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-700 shadow-lg hover:-translate-y-0.5 transition disabled:opacity-60"
                      disabled={loading}
                    >
                      Connect Google Sheet
                    </button>
                  </div>
                </div>
              </div>

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
                        <p className="mt-2 text-sm text-[var(--text-muted)] text-green-200">
                          Growth path: {result?.metrics?.projections.join(", ") || "Upload to unlock forecasts."}
                        </p>
                        <button
                          className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10 transition disabled:opacity-60"
                          onClick={handlePdf}
                          disabled={!result || downloading}
                        >
                          {downloading ? "Preparing PDF..." : "Download PDF"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-[var(--text-muted)]">
                <p className="text-white">Data usage</p>
                <p>Your data is processed on our server and not shared with third parties. Connect a Cloudflare Workers AI key to generate explanations; only summaries are sent.</p>
              </div>
            </div>
          </div>
        </section>

        <footer className="footer">
          <div>&copy; {new Date().getFullYear()} Datasage. All rights reserved.</div>
          <div className="footer-links">
            <a href="mailto:datasage.team@gmail.com">Contact</a>
            <span>-</span>
            <a href="#">Privacy</a>
            <span>-</span>
            <a href="#">Terms</a>
          </div>
        </footer>
      </div>

      <style jsx global>{`
        :root {
          --bg: #020617;
          --bg-soft: #020817;
          --card: #020617;
          --border-subtle: #1f2937;
          --accent: #fbbf24;
          --accent-soft: rgba(251, 191, 36, 0.1);
          --text-main: #e5e7eb;
          --text-muted: #9ca3af;
          --danger: #f97373;
          --radius-xl: 18px;
          --radius-lg: 14px;
          --shadow-soft: 0 18px 45px rgba(15, 23, 42, 0.7);
          --font-main: -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, -system-ui, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif;
          --muted: var(--text-muted);
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: var(--font-main);
          background:
            radial-gradient(circle at top, #1f2937 0, #020617 55%) fixed,
            radial-gradient(circle at bottom, #111827 0, #020617 55%) fixed,
            #020617;
          color: var(--text-main);
          min-height: 100vh;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        .page {
          max-width: 1120px;
          margin: 0 auto;
          padding: 24px 16px 80px;
        }

        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 4px 16px;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .logo-mark {
          width: 28px;
          height: 28px;
          border-radius: 999px;
          background: radial-gradient(circle at 30% 20%, #fef9c3 0, #facc15 40%, #b45309 90%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          color: #111827;
          box-shadow: 0 8px 18px rgba(250, 204, 21, 0.5);
        }

        .logo-text-main {
          font-weight: 600;
          letter-spacing: 0.03em;
          font-size: 17px;
        }

        .logo-text-sub {
          font-size: 11px;
          color: var(--text-muted);
        }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 13px;
          color: var(--text-muted);
        }

        .badge-beta {
          padding: 3px 8px;
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.5);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.07em;
        }

        .topbar-link {
          padding: 6px 10px;
          border-radius: 999px;
          border: 1px solid transparent;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          background: transparent;
          color: inherit;
        }

        .topbar-link:hover {
          border-color: rgba(148, 163, 184, 0.5);
          background: rgba(15, 23, 42, 0.7);
        }

        .hero-section {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.1fr);
          gap: 20px;
          margin-top: 10px;
          align-items: stretch;
        }

        @media (max-width: 860px) {
          .hero-section {
            grid-template-columns: minmax(0, 1fr);
          }
          .hero-mock {
            order: -1;
          }
        }

        .hero-main {
          padding: 14px 0 0;
        }

        .hero-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 4px 10px 4px 5px;
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid rgba(148, 163, 184, 0.6);
          margin-bottom: 14px;
          font-size: 12px;
          color: var(--text-muted);
        }

        .hero-label-dot {
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: #22c55e;
          box-shadow: 0 0 12px rgba(34, 197, 94, 0.9);
        }

        .hero-title {
          font-size: clamp(28px, 4vw, 36px);
          line-height: 1.1;
          letter-spacing: -0.03em;
          margin-bottom: 10px;
        }

        .hero-highlight {
          color: var(--accent);
        }

        .hero-subtitle {
          font-size: 14px;
          color: var(--text-muted);
          max-width: 460px;
          line-height: 1.5;
          margin-bottom: 18px;
        }

        .hero-cta-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
          margin-bottom: 14px;
        }

        .btn-primary {
          padding: 10px 18px;
          border-radius: 999px;
          border: none;
          background: linear-gradient(135deg, #facc15, #f97316);
          color: #111827;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 12px 30px rgba(248, 181, 0, 0.35);
          transition: transform 0.08s ease, box-shadow 0.08s ease;
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 16px 40px rgba(248, 181, 0, 0.45);
        }

        .btn-secondary {
          padding: 9px 14px;
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.7);
          background: rgba(15, 23, 42, 0.8);
          color: var(--text-main);
          font-size: 13px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .btn-secondary:hover {
          background: rgba(15, 23, 42, 0.95);
        }

        .hero-note {
          font-size: 11px;
          color: var(--text-muted);
        }

        .hero-note strong {
          color: #e5e7eb;
        }

        .hero-mini {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 18px;
        }

        .mini-chip {
          padding: 7px 10px;
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.5);
          font-size: 11px;
          color: var(--text-muted);
        }

        .hero-mock {
          background: radial-gradient(circle at top left, #1e293b 0, #020617 60%);
          border-radius: 22px;
          border: 1px solid rgba(148, 163, 184, 0.4);
          padding: 16px 16px 18px;
          box-shadow: var(--shadow-soft);
          position: relative;
          overflow: hidden;
        }

        .mock-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }

        .mock-header-left {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .mock-title {
          font-size: 14px;
          font-weight: 600;
        }

        .mock-sub {
          font-size: 11px;
          color: var(--text-muted);
        }

        .mock-pill-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .mock-pill {
          padding: 5px 8px;
          border-radius: 999px;
          font-size: 11px;
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid rgba(148, 163, 184, 0.5);
          color: var(--text-muted);
        }

        .mock-tag {
          padding: 4px 8px;
          border-radius: 999px;
          background: var(--accent-soft);
          color: var(--accent);
          font-size: 11px;
        }

        .mock-body {
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(0, 1.05fr);
          gap: 12px;
        }

        @media (max-width: 720px) {
          .mock-body {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        .mock-metrics {
          background: rgba(15, 23, 42, 0.9);
          border-radius: var(--radius-lg);
          padding: 10px 10px 9px;
          border: 1px solid rgba(55, 65, 81, 0.9);
        }

        .metric-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 7px;
        }

        .metric-label {
          font-size: 11px;
          color: var(--text-muted);
        }

        .metric-value {
          font-size: 16px;
          font-weight: 600;
        }

        .metric-chip {
          font-size: 11px;
          padding: 3px 6px;
          border-radius: 999px;
          background: rgba(22, 163, 74, 0.12);
          color: #4ade80;
          border: 1px solid rgba(22, 163, 74, 0.5);
        }

        .mock-chart {
          margin-top: 8px;
          height: 80px;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(248, 250, 252, 0.02), rgba(55, 65, 81, 0.3));
          position: relative;
          overflow: hidden;
        }

        .chart-line {
          position: absolute;
          inset: 12px 10px 10px 10px;
          border-radius: 999px;
          border: 1px dashed rgba(148, 163, 184, 0.4);
        }

        .chart-spark {
          position: absolute;
          inset: 20px 16px 18px 16px;
          border-radius: 999px;
          background:
            radial-gradient(circle at 0% 80%, rgba(96, 165, 250, 0.3) 0, transparent 55%),
            radial-gradient(circle at 20% 50%, rgba(52, 211, 153, 0.3) 0, transparent 55%),
            radial-gradient(circle at 55% 30%, rgba(248, 181, 0, 0.34) 0, transparent 60%),
            radial-gradient(circle at 100% 50%, rgba(248, 181, 0, 0.2) 0, transparent 60%);
          opacity: 0.95;
        }

        .mock-narrative {
          background: rgba(15, 23, 42, 0.9);
          border-radius: var(--radius-lg);
          padding: 10px 11px 9px;
          border: 1px solid rgba(55, 65, 81, 0.9);
          display: flex;
          flex-direction: column;
          gap: 7px;
          font-size: 11.5px;
        }

        .mock-narrative label {
          text-transform: uppercase;
          letter-spacing: 0.11em;
          font-size: 10px;
          color: var(--text-muted);
        }

        .mock-narrative p {
          line-height: 1.5;
        }

        .mock-narrative span.accent {
          color: var(--accent);
        }

        .mock-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 10px;
          font-size: 11px;
          color: var(--text-muted);
        }

        @media (max-width: 640px) {
          .mock-footer {
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
          }
        }

        .section {
          margin-top: 42px;
        }

        .section-title {
          font-size: 17px;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .section-sub {
          font-size: 13px;
          color: var(--text-muted);
          max-width: 500px;
          margin-bottom: 16px;
        }

        .steps-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        @media (max-width: 840px) {
          .steps-grid {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        .step-card {
          background: rgba(15, 23, 42, 0.9);
          border-radius: var(--radius-xl);
          padding: 12px 12px 12px;
          border: 1px solid rgba(55, 65, 81, 0.9);
        }

        .step-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--text-muted);
          margin-bottom: 4px;
        }

        .step-title {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .step-body {
          font-size: 12px;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .pill-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 6px;
        }

        .pill {
          padding: 5px 9px;
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.5);
          font-size: 11px;
          color: var(--text-muted);
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.1fr);
          gap: 12px;
        }

        @media (max-width: 860px) {
          .pricing-grid {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        .pricing-card {
          background: rgba(15, 23, 42, 0.9);
          border-radius: var(--radius-xl);
          padding: 14px 14px 16px;
          border: 1px solid rgba(55, 65, 81, 0.9);
        }

        .pricing-tag {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 8px;
          border-radius: 999px;
          background: rgba(34, 197, 94, 0.09);
          border: 1px solid rgba(34, 197, 94, 0.4);
          color: #4ade80;
          font-size: 11px;
          margin-bottom: 6px;
        }

        .pricing-title {
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 2px;
        }

        .pricing-sub {
          font-size: 12px;
          color: var(--text-muted);
          margin-bottom: 8px;
        }

        .pricing-price {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 2px;
        }

        .pricing-note {
          font-size: 11px;
          color: var(--text-muted);
          margin-bottom: 10px;
        }

        .pricing-list {
          list-style: none;
          font-size: 12px;
          color: var(--text-muted);
          display: grid;
          gap: 5px;
          margin-bottom: 10px;
        }

        .pricing-list li::before {
          content: "- ";
          color: var(--accent);
        }

        .faq-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        @media (max-width: 860px) {
          .faq-grid {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        .faq-item {
          background: rgba(15, 23, 42, 0.9);
          border-radius: var(--radius-xl);
          padding: 10px 12px 12px;
          border: 1px solid rgba(55, 65, 81, 0.9);
          font-size: 12px;
          color: var(--text-muted);
        }

        .faq-q {
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 4px;
          color: #e5e7eb;
        }

        .footer {
          border-top: 1px solid rgba(55, 65, 81, 0.9);
          margin-top: 26px;
          padding-top: 14px;
          font-size: 11px;
          color: var(--text-muted);
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          gap: 8px;
        }

        .footer-links {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .footer a {
          color: var(--text-muted);
        }

        .app-shell {
          background: rgba(15, 23, 42, 0.78);
          border-radius: var(--radius-xl);
          border: 1px solid rgba(55, 65, 81, 0.9);
          padding: 16px;
          box-shadow: var(--shadow-soft);
        }

        .app-header-note {
          font-size: 12px;
          color: var(--text-muted);
        }
      `}</style>
    </main>
  );
}

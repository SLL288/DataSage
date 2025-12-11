import { useRef } from "react";

type Props = {
  onUpload: (file: File) => void;
  loading?: boolean;
  error?: string | null;
  inputId?: string;
};

export default function UploadCard({ onUpload, loading, error, inputId }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    if (!evt.target.files?.length) return;
    const file = evt.target.files[0];
    onUpload(file);
    evt.target.value = "";
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm uppercase tracking-[0.2em] text-brand-100">Step 1 · Zero decisions</p>
          <p className="text-lg font-semibold text-white">Connect your sheet</p>
          <p className="text-sm text-[var(--muted)]">We’ll auto-detect sales, costs, dates, and build everything for you.</p>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          className="group relative overflow-hidden rounded-full bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:-translate-y-0.5 hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={loading}
        >
          {loading ? "Connecting..." : "Upload your own file"}
          <span className="absolute inset-y-0 right-0 grid w-10 place-items-center bg-white/15 text-lg transition group-hover:translate-x-1 motion-safe:animate-pulse">
            →
          </span>
        </button>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleChange}
          className="hidden"
        />
      </div>
      <div className="mt-4 flex items-center gap-3 text-xs text-[var(--muted)]">
        <div className="h-1 w-16 animate-pulse rounded-full bg-brand-500/70" />
        <span>Auto-progress: Connect → Detect → Dashboard</span>
      </div>
      {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
    </div>
  );
}

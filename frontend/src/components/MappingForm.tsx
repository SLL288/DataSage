type Props = {
  columns: string[];
  onSubmit: (mapping: { date_column: string; revenue_column: string; category_column?: string }) => void;
};

export default function MappingForm({ columns, onSubmit }: Props) {
  const handleSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    const formData = new FormData(evt.currentTarget);
    const mapping = {
      date_column: String(formData.get("date_column") || ""),
      revenue_column: String(formData.get("revenue_column") || ""),
      category_column: String(formData.get("category_column") || ""),
    };
    onSubmit(mapping);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-amber-300/30 bg-amber-400/10 p-5">
      <p className="text-sm font-semibold text-white">Help us map your columns</p>
      <p className="text-xs text-white/80">We couldn’t auto-detect. Pick the right columns and we’ll re-run.</p>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <label className="text-sm text-white">
          Date column
          <select name="date_column" className="mt-1 w-full rounded-lg border border-white/20 bg-black/30 p-2 text-sm text-white">
            <option value="">Select</option>
            {columns.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-white">
          Amount / Revenue
          <select name="revenue_column" className="mt-1 w-full rounded-lg border border-white/20 bg-black/30 p-2 text-sm text-white">
            <option value="">Select</option>
            {columns.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-white">
          Category (optional)
          <select name="category_column" className="mt-1 w-full rounded-lg border border-white/20 bg-black/30 p-2 text-sm text-white">
            <option value="">Select</option>
            {columns.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button
        type="submit"
        className="mt-4 rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-700 shadow-lg hover:-translate-y-0.5 transition"
      >
        Re-run with mapping
      </button>
    </form>
  );
}

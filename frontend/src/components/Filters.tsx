type Props = {
  dateRange: string;
  onDateRangeChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  categories: { name: string; total: number }[];
};

const ranges = [
  { value: "all", label: "All time" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
];

export default function Filters({ dateRange, onDateRangeChange, category, onCategoryChange, categories }: Props) {
  return (
    <div className="flex flex-wrap gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white">
      <label className="flex items-center gap-2">
        Date range
        <select
          value={dateRange}
          onChange={(e) => onDateRangeChange(e.target.value)}
          className="rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-white"
        >
          {ranges.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2">
        Category
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-white"
        >
          <option value="all">All</option>
          {categories.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

import { Minus, Plus } from "lucide-react";

export default function GuestPicker({
  value,
  onChange,
  max = 16,
  min = 1,
  label = "Guests",
  description,
}: {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  min?: number;
  label?: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div>
        <p className="text-sm font-semibold text-ink-900">{label}</p>
        {description && <p className="text-xs text-ink-500">{description}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`Decrease ${label.toLowerCase()}`}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-ink-300 text-ink-700 disabled:opacity-30 hover:border-ink-900 cursor-pointer disabled:cursor-not-allowed"
        >
          <Minus size={14} />
        </button>
        <span className="w-4 text-center font-tabular text-sm font-semibold text-ink-900">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label={`Increase ${label.toLowerCase()}`}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-ink-300 text-ink-700 disabled:opacity-30 hover:border-ink-900 cursor-pointer disabled:cursor-not-allowed"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

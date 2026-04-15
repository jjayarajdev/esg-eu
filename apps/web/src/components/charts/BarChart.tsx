/**
 * Horizontal bar chart — used for status distribution, taxonomy breakdown, etc.
 */
interface Bar {
  label: string;
  value: number;
  color: string;
}

interface Props {
  bars: Bar[];
  maxValue?: number;
  showValues?: boolean;
}

export function BarChart({ bars, maxValue, showValues = true }: Props) {
  const max = maxValue || Math.max(...bars.map((b) => b.value), 1);

  return (
    <div className="space-y-2.5">
      {bars.map((bar, i) => (
        <div key={i}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-600">{bar.label}</span>
            {showValues && <span className="text-slate-400 tabular-nums">{bar.value.toLocaleString()}</span>}
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${(bar.value / max) * 100}%`, backgroundColor: bar.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

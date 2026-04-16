/**
 * Peer Benchmarking Chart — compares company metrics against industry averages.
 * Uses mock industry data for demonstration.
 */

interface BenchmarkItem {
  metric: string;
  yourValue: number;
  industryAvg: number;
  industryBest: number;
  unit: string;
  lowerIsBetter: boolean;
}

interface Props {
  items: BenchmarkItem[];
}

export function BenchmarkChart({ items }: Props) {
  return (
    <div className="space-y-4">
      {items.map((item) => {
        const max = Math.max(item.yourValue, item.industryAvg, item.industryBest) * 1.2;
        const yourPct = (item.yourValue / max) * 100;
        const avgPct = (item.industryAvg / max) * 100;
        const bestPct = (item.industryBest / max) * 100;

        const isGood = item.lowerIsBetter
          ? item.yourValue <= item.industryAvg
          : item.yourValue >= item.industryAvg;

        return (
          <div key={item.metric}>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-700 font-medium">{item.metric}</span>
              <span className={`font-semibold ${isGood ? 'text-emerald-600' : 'text-red-600'}`}>
                {item.yourValue.toLocaleString()} {item.unit}
                {isGood ? ' ✓' : ' ▲'}
              </span>
            </div>
            <div className="relative h-6 bg-slate-100 rounded-full overflow-hidden">
              {/* Industry best marker */}
              <div className="absolute top-0 h-full w-0.5 bg-emerald-400 z-10" style={{ left: `${bestPct}%` }}
                title={`Industry best: ${item.industryBest}`} />
              {/* Industry average marker */}
              <div className="absolute top-0 h-full w-0.5 bg-slate-400 z-10" style={{ left: `${avgPct}%` }}
                title={`Industry avg: ${item.industryAvg}`} />
              {/* Your value bar */}
              <div className={`h-full rounded-full transition-all duration-700 ${isGood ? 'bg-emerald-500' : 'bg-amber-500'}`}
                style={{ width: `${yourPct}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>You: {item.yourValue.toLocaleString()}</span>
              <span>Avg: {item.industryAvg.toLocaleString()}</span>
              <span>Best: {item.industryBest.toLocaleString()}</span>
            </div>
          </div>
        );
      })}
      <div className="flex items-center gap-4 text-[10px] text-slate-400 pt-2 border-t border-slate-100">
        <span className="flex items-center gap-1"><span className="w-3 h-1.5 bg-emerald-500 rounded-full" /> Your company</span>
        <span className="flex items-center gap-1"><span className="w-px h-3 bg-slate-400" /> Industry average</span>
        <span className="flex items-center gap-1"><span className="w-px h-3 bg-emerald-400" /> Industry best</span>
      </div>
    </div>
  );
}

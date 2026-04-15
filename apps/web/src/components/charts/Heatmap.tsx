/**
 * ESRS Data Completeness Heatmap — shows which standards have data.
 */
interface Cell {
  label: string;
  value: number; // 0-100 completeness
  category: 'environmental' | 'social' | 'governance' | 'cross_cutting';
}

interface Props {
  cells: Cell[];
}

const CAT_COLORS = {
  environmental: { bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-700' },
  social: { bg: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-700' },
  governance: { bg: 'bg-amber-500', light: 'bg-amber-50', text: 'text-amber-700' },
  cross_cutting: { bg: 'bg-slate-500', light: 'bg-slate-50', text: 'text-slate-700' },
};

function getIntensity(value: number): string {
  if (value === 0) return 'bg-slate-100';
  if (value < 25) return 'bg-red-200';
  if (value < 50) return 'bg-orange-200';
  if (value < 75) return 'bg-yellow-200';
  if (value < 100) return 'bg-emerald-200';
  return 'bg-emerald-400';
}

export function Heatmap({ cells }: Props) {
  return (
    <div>
      <div className="grid grid-cols-6 gap-1.5">
        {cells.map((cell) => (
          <div
            key={cell.label}
            className={`${getIntensity(cell.value)} rounded-lg p-2 text-center transition-colors hover:ring-2 hover:ring-slate-300`}
            title={`${cell.label}: ${cell.value}% complete`}
          >
            <div className="text-xs font-bold text-slate-700">{cell.label}</div>
            <div className="text-[10px] text-slate-500">{cell.value}%</div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-3 text-[10px] text-slate-400">
        <span>Coverage:</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-slate-100 rounded" /> 0%</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-200 rounded" /> &lt;25%</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-orange-200 rounded" /> &lt;50%</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-200 rounded" /> &lt;75%</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-200 rounded" /> &lt;100%</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-400 rounded" /> 100%</span>
      </div>
    </div>
  );
}

/**
 * Small circular progress ring — used for department completion, data coverage, etc.
 */
interface Props {
  value: number; // 0-100
  size?: number;
  label?: string;
  color?: string;
}

export function ProgressRing({ value, size = 56, label, color = '#3b82f6' }: Props) {
  const thickness = 5;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={thickness} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={thickness} strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="transition-all duration-700"
        />
        <text x={size / 2} y={size / 2 + 4} textAnchor="middle" fontSize="12" fontWeight="bold" className="fill-slate-700">
          {Math.round(value)}%
        </text>
      </svg>
      {label && <span className="text-[10px] text-slate-500 text-center leading-tight">{label}</span>}
    </div>
  );
}

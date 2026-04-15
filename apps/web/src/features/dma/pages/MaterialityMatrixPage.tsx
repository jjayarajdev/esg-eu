import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../../lib/api-client';

interface Topic {
  standard_code: string;
  standard_name: string;
  standard_category: string;
  impact_score: number;
  financial_score: number;
  is_material: boolean;
}

interface MatrixData {
  topics: Topic[];
  thresholds: { impact: number; financial: number };
  summary: { total: number; material: number; nonMaterial: number };
}

const CATEGORY_COLORS: Record<string, string> = {
  environmental: '#10b981',
  social: '#3b82f6',
  governance: '#f59e0b',
};

const MATRIX_SIZE = 400;
const PADDING = 40;
const MAX_SCORE = 25;

export function MaterialityMatrixPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<MatrixData | null>(null);

  useEffect(() => {
    if (id) loadMatrix();
  }, [id]);

  async function loadMatrix() {
    const res = await api<{ data: MatrixData }>(`/dma/${id}/matrix`);
    setData(res.data);
  }

  if (!data) return <p>Loading matrix...</p>;

  const scale = (val: number) => PADDING + (val / MAX_SCORE) * (MATRIX_SIZE - PADDING * 2);
  const thresholdX = scale(data.thresholds.financial);
  const thresholdY = MATRIX_SIZE - scale(data.thresholds.impact);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button onClick={() => navigate('/dma')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>&larr;</button>
        <h2 style={{ margin: 0 }}>Materiality Matrix</h2>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <SummaryCard label="Total Topics" value={data.summary.total} color="#6b7280" />
        <SummaryCard label="Material" value={data.summary.material} color="#10b981" />
        <SummaryCard label="Not Material" value={data.summary.nonMaterial} color="#d1d5db" />
      </div>

      <div style={{ display: 'flex', gap: '3rem', alignItems: 'flex-start' }}>
        {/* Matrix scatter plot (SVG) */}
        <div>
          <svg width={MATRIX_SIZE} height={MATRIX_SIZE} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', background: '#fafafa' }}>
            {/* Grid lines */}
            {[5, 10, 15, 20].map((v) => (
              <g key={v}>
                <line x1={scale(v)} y1={PADDING} x2={scale(v)} y2={MATRIX_SIZE - PADDING} stroke="#f3f4f6" />
                <line x1={PADDING} y1={MATRIX_SIZE - scale(v)} x2={MATRIX_SIZE - PADDING} y2={MATRIX_SIZE - scale(v)} stroke="#f3f4f6" />
                <text x={scale(v)} y={MATRIX_SIZE - PADDING + 15} textAnchor="middle" fontSize="10" fill="#9ca3af">{v}</text>
                <text x={PADDING - 8} y={MATRIX_SIZE - scale(v) + 4} textAnchor="end" fontSize="10" fill="#9ca3af">{v}</text>
              </g>
            ))}

            {/* Threshold lines (dashed) */}
            <line x1={thresholdX} y1={PADDING} x2={thresholdX} y2={MATRIX_SIZE - PADDING}
              stroke="#ef4444" strokeWidth="1" strokeDasharray="4 4" />
            <line x1={PADDING} y1={thresholdY} x2={MATRIX_SIZE - PADDING} y2={thresholdY}
              stroke="#ef4444" strokeWidth="1" strokeDasharray="4 4" />

            {/* Material zone highlight */}
            <rect
              x={thresholdX} y={PADDING}
              width={MATRIX_SIZE - PADDING - thresholdX}
              height={thresholdY - PADDING}
              fill="#fef2f2" opacity={0.5}
            />

            {/* Topic dots */}
            {data.topics.map((t) => {
              const cx = scale(t.financial_score);
              const cy = MATRIX_SIZE - scale(t.impact_score);
              return (
                <g key={t.standard_code}>
                  <circle
                    cx={cx} cy={cy} r={t.is_material ? 14 : 10}
                    fill={CATEGORY_COLORS[t.standard_category] || '#6b7280'}
                    opacity={t.is_material ? 0.9 : 0.4}
                    stroke={t.is_material ? '#000' : 'none'}
                    strokeWidth={1}
                  />
                  <text x={cx} y={cy + 4} textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">
                    {t.standard_code}
                  </text>
                </g>
              );
            })}

            {/* Axis labels */}
            <text x={MATRIX_SIZE / 2} y={MATRIX_SIZE - 5} textAnchor="middle" fontSize="11" fill="#374151" fontWeight="600">
              Financial Materiality →
            </text>
            <text x={12} y={MATRIX_SIZE / 2} textAnchor="middle" fontSize="11" fill="#374151" fontWeight="600"
              transform={`rotate(-90, 12, ${MATRIX_SIZE / 2})`}>
              Impact Materiality →
            </text>
          </svg>
        </div>

        {/* Topic detail table */}
        <div style={{ flex: 1 }}>
          <h3>Topic Details</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                <th style={thStyle}>Topic</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Impact</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Financial</th>
                <th style={thStyle}>Result</th>
              </tr>
            </thead>
            <tbody>
              {data.topics.map((t) => (
                <tr key={t.standard_code} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={tdStyle}>
                    <span style={{
                      display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                      background: CATEGORY_COLORS[t.standard_category], marginRight: 6,
                    }} />
                    <strong>{t.standard_code}</strong> {t.standard_name}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {t.impact_score}/25
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {t.financial_score}/25
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem',
                      fontWeight: 600, textTransform: 'uppercase',
                      background: t.is_material ? '#10b981' : '#d1d5db',
                      color: t.is_material ? 'white' : '#6b7280',
                    }}>
                      {t.is_material ? 'Material' : 'Not Material'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Legend */}
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
            {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
              <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block' }} />
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ padding: '1rem 1.5rem', border: '1px solid #e5e7eb', borderRadius: '8px', borderTop: `3px solid ${color}` }}>
      <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{label}</div>
      <div style={{ fontSize: '2rem', fontWeight: 700 }}>{value}</div>
    </div>
  );
}

const thStyle: React.CSSProperties = { padding: '0.5rem', fontWeight: 600 };
const tdStyle: React.CSSProperties = { padding: '0.5rem' };

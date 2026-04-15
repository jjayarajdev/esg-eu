import { useEffect, useState } from 'react';
import { api } from '../../../lib/api-client';
import { useAuth } from '../../../providers/AuthProvider';

interface DataPoint {
  id: string;
  metric_code: string;
  metric_name: string;
  standard_code: string;
  numeric_value: number | null;
  text_value: string | null;
  boolean_value: boolean | null;
  status: string;
  data_source: string | null;
  variance_pct: number | null;
  created_at: string;
}

interface Period {
  id: string;
  name: string;
}

const STATUS_COLORS: Record<string, string> = {
  draft: '#6b7280',
  submitted: '#f59e0b',
  approved: '#10b981',
  rejected: '#ef4444',
  published: '#3b82f6',
};

export function DataCollectionPage() {
  const { tenant } = useAuth();
  const [periods, setPeriods] = useState<Period[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tenant) loadPeriods();
  }, [tenant]);

  useEffect(() => {
    if (selectedPeriod) loadDataPoints();
  }, [selectedPeriod]);

  async function loadPeriods() {
    const res = await api<{ data: Period[] }>('/data/periods');
    setPeriods(res.data);
    if (res.data.length > 0) setSelectedPeriod(res.data[0].id);
  }

  async function loadDataPoints() {
    setLoading(true);
    const res = await api<{ data: DataPoint[]; pagination: { totalCount: number } }>(
      `/data/points?reportingPeriodId=${selectedPeriod}&pageSize=50`,
    );
    setDataPoints(res.data);
    setTotal(res.pagination.totalCount);
    setLoading(false);
  }

  async function ingestMockData(connectorType: string) {
    if (!selectedPeriod) return;
    await api('/ingest/' + connectorType, {
      method: 'POST',
      body: { reportingPeriodId: selectedPeriod, payload: {} },
    });
    loadDataPoints();
  }

  if (!tenant) return <p>Select a tenant to view data.</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Data Collection</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => ingestMockData('mock_enablon')} style={btnStyle}>
            Import Enablon Data
          </button>
          <button onClick={() => ingestMockData('mock_successfactors')} style={btnStyle}>
            Import SuccessFactors Data
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>Reporting Period: </label>
        <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
          {periods.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <span style={{ marginLeft: '1rem', color: '#6b7280' }}>
          {total} data points
        </span>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
              <th style={thStyle}>Standard</th>
              <th style={thStyle}>Metric</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Value</th>
              <th style={thStyle}>Source</th>
              <th style={thStyle}>Variance</th>
              <th style={thStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {dataPoints.map((dp) => (
              <tr key={dp.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={tdStyle}>
                  <span style={{ background: '#f0f9ff', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>
                    {dp.standard_code}
                  </span>
                </td>
                <td style={tdStyle}>{dp.metric_name}</td>
                <td style={{ ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                  {dp.numeric_value !== null
                    ? Number(dp.numeric_value).toLocaleString()
                    : dp.text_value || (dp.boolean_value !== null ? String(dp.boolean_value) : '—')}
                </td>
                <td style={tdStyle}>
                  <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                    {dp.data_source || 'manual'}
                  </span>
                </td>
                <td style={tdStyle}>
                  {dp.variance_pct !== null ? (
                    <span style={{ color: dp.variance_pct > 0 ? '#ef4444' : '#10b981' }}>
                      {dp.variance_pct > 0 ? '+' : ''}{Number(dp.variance_pct).toFixed(1)}%
                    </span>
                  ) : '—'}
                </td>
                <td style={tdStyle}>
                  <span style={{
                    background: STATUS_COLORS[dp.status] || '#6b7280',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                  }}>
                    {dp.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: '0.5rem 1rem',
  background: '#3b82f6',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.8rem',
};

const thStyle: React.CSSProperties = { padding: '0.75rem 0.5rem', fontWeight: 600 };
const tdStyle: React.CSSProperties = { padding: '0.75rem 0.5rem' };

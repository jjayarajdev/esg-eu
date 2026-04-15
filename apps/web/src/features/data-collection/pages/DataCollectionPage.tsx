import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../lib/api-client';
import { useAuth } from '../../../providers/AuthProvider';

interface DataPoint {
  id: string; metric_code: string; metric_name: string; standard_code: string;
  numeric_value: number | null; text_value: string | null; boolean_value: boolean | null;
  status: string; data_source: string | null; variance_pct: number | null;
}
interface Period { id: string; name: string; }

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  submitted: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  published: 'bg-blue-100 text-blue-700',
};

export function DataCollectionPage() {
  const { tenant } = useAuth();
  const navigate = useNavigate();
  const [periods, setPeriods] = useState<Period[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState<string | null>(null);

  useEffect(() => { if (tenant) loadPeriods(); }, [tenant]);
  useEffect(() => { if (selectedPeriod) loadDataPoints(); }, [selectedPeriod]);

  async function loadPeriods() {
    const res = await api<{ data: Period[] }>('/data/periods');
    setPeriods(res.data);
    if (res.data.length > 0) setSelectedPeriod(res.data[0].id);
  }

  async function loadDataPoints() {
    setLoading(true);
    const res = await api<{ data: DataPoint[]; pagination: { totalCount: number } }>(
      `/data/points?reportingPeriodId=${selectedPeriod}&pageSize=100`,
    );
    setDataPoints(res.data);
    setTotal(res.pagination.totalCount);
    setLoading(false);
  }

  async function ingestMockData(connectorType: string) {
    if (!selectedPeriod) return;
    setImporting(connectorType);
    await api('/ingest/' + connectorType, {
      method: 'POST', body: { reportingPeriodId: selectedPeriod, payload: {} },
    });
    setImporting(null);
    loadDataPoints();
  }

  if (!tenant) return <p className="text-slate-500">Select a tenant to view data.</p>;

  const sources = dataPoints.reduce((acc, dp) => {
    const src = dp.data_source || 'manual';
    acc[src] = (acc[src] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button onClick={() => navigate('/data/new')}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg font-medium transition-colors">
          Enter Data
        </button>
        <button onClick={() => navigate('/data/upload')}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm rounded-lg font-medium transition-colors">
          Upload CSV
        </button>
        <div className="h-6 w-px bg-slate-200" />
        {['mock_enablon', 'mock_successfactors', 'mock_ecovadis', 'mock_ethicspoint', 'mock_sphera'].map((c) => {
          const label = c.replace('mock_', '');
          return (
            <button key={c} onClick={() => ingestMockData(c)} disabled={importing === c}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-lg transition-colors disabled:opacity-50">
              {importing === c ? '...' : label.charAt(0).toUpperCase() + label.slice(1)}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mb-5">
        <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm">
          {periods.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <span className="text-sm text-slate-500">{total} data points</span>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-400">Loading...</div>
      ) : dataPoints.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
          <div className="text-slate-500">No data yet. Import or enter manually.</div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-left font-medium text-slate-500">Standard</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Metric</th>
                <th className="px-4 py-3 text-right font-medium text-slate-500">Value</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Source</th>
                <th className="px-4 py-3 text-right font-medium text-slate-500">YoY</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {dataPoints.map((dp) => (
                <tr key={dp.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">{dp.standard_code}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{dp.metric_name}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium">
                    {dp.numeric_value !== null ? Number(dp.numeric_value).toLocaleString() : dp.text_value || '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">{dp.data_source || 'manual'}</td>
                  <td className="px-4 py-3 text-right text-xs">
                    {dp.variance_pct !== null ? (
                      <span className={dp.variance_pct > 0 ? 'text-red-600' : 'text-emerald-600'}>
                        {dp.variance_pct > 0 ? '+' : ''}{Number(dp.variance_pct).toFixed(1)}%
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[dp.status] || ''}`}>{dp.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

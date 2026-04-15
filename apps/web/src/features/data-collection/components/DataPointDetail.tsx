import { useEffect, useState } from 'react';
import { api } from '../../../lib/api-client';

interface Props {
  dataPointId: string;
  onClose: () => void;
}

interface AuditEntry {
  id: string;
  action: string;
  entity_type: string;
  changes: any;
  created_at: string;
  user_id: string;
}

interface DataPointFull {
  id: string;
  metric_code: string;
  metric_name: string;
  standard_code: string;
  numeric_value: number | null;
  text_value: string | null;
  status: string;
  confidence_level: string | null;
  data_source: string | null;
  prior_period_value: number | null;
  variance_pct: number | null;
  variance_explanation: string | null;
  version: number;
  created_at: string;
  updated_at: string;
}

const CONFIDENCE_INFO: Record<string, { label: string; desc: string; color: string }> = {
  measured: { label: 'Measured', desc: 'Direct measurement from monitoring equipment or meters', color: 'bg-emerald-100 text-emerald-700' },
  calculated: { label: 'Calculated', desc: 'Derived from other measured data using standard formulas', color: 'bg-blue-100 text-blue-700' },
  estimated: { label: 'Estimated', desc: 'Best estimate based on available information and assumptions', color: 'bg-amber-100 text-amber-700' },
};

export function DataPointDetail({ dataPointId, onClose }: Props) {
  const [dp, setDp] = useState<DataPointFull | null>(null);
  const [history, setHistory] = useState<AuditEntry[]>([]);

  useEffect(() => {
    loadDetail();
    loadHistory();
  }, [dataPointId]);

  async function loadDetail() {
    const res = await api<{ data: DataPointFull }>(`/data/points/${dataPointId}`);
    setDp(res.data);
  }

  async function loadHistory() {
    const res = await api<{ data: AuditEntry[] }>(`/data/points/${dataPointId}/history`);
    setHistory(res.data);
  }

  if (!dp) return null;

  const conf = CONFIDENCE_INFO[dp.confidence_level || ''] || CONFIDENCE_INFO.estimated;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-[600px] max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-start">
          <div>
            <h3 className="font-bold text-slate-800">{dp.metric_name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">{dp.standard_code}</span>
              <span className="text-xs font-mono text-slate-400">{dp.metric_code}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
        </div>

        {/* Value + provenance */}
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-slate-500 mb-1">Current Value</div>
              <div className="text-3xl font-bold text-slate-800 tabular-nums">
                {dp.numeric_value !== null ? Number(dp.numeric_value).toLocaleString() : dp.text_value || '—'}
              </div>
            </div>
            {dp.prior_period_value !== null && (
              <div>
                <div className="text-xs text-slate-500 mb-1">Prior Period</div>
                <div className="text-3xl font-bold text-slate-400 tabular-nums">
                  {Number(dp.prior_period_value).toLocaleString()}
                </div>
                {dp.variance_pct !== null && (
                  <span className={`text-sm font-medium ${Number(dp.variance_pct) > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {Number(dp.variance_pct) > 0 ? '+' : ''}{Number(dp.variance_pct).toFixed(1)}% YoY
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Calculation transparency */}
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Data Provenance</div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-xs text-slate-500">Source System</div>
              <div className="font-medium text-slate-800 capitalize">{(dp.data_source || 'manual').replace('mock_', '').replace(/_/g, ' ')}</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-xs text-slate-500">Data Quality</div>
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${conf.color}`}>{conf.label}</span>
              <div className="text-[10px] text-slate-400 mt-0.5">{conf.desc}</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-xs text-slate-500">Status</div>
              <div className="font-medium text-slate-800 capitalize">{dp.status}</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-xs text-slate-500">Version</div>
              <div className="font-medium text-slate-800">v{dp.version}</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-xs text-slate-500">Created</div>
              <div className="font-medium text-slate-800">{new Date(dp.created_at).toLocaleString()}</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-xs text-slate-500">Last Updated</div>
              <div className="font-medium text-slate-800">{new Date(dp.updated_at).toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Audit trail timeline */}
        <div className="px-6 py-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Audit Trail</div>
          {history.length === 0 ? (
            <p className="text-sm text-slate-400">No audit entries recorded.</p>
          ) : (
            <div className="space-y-0">
              {history.map((entry, i) => (
                <div key={entry.id} className="flex gap-3">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 ${
                      entry.action === 'created' ? 'bg-emerald-500' :
                      entry.action === 'updated' ? 'bg-blue-500' :
                      entry.action === 'approved' ? 'bg-emerald-500' :
                      entry.action === 'rejected' ? 'bg-red-500' : 'bg-slate-300'
                    }`} />
                    {i < history.length - 1 && <div className="w-px flex-1 bg-slate-200 my-1" />}
                  </div>
                  {/* Entry content */}
                  <div className="pb-4">
                    <div className="text-sm font-medium text-slate-700 capitalize">{entry.action}</div>
                    <div className="text-xs text-slate-400">{new Date(entry.created_at).toLocaleString()}</div>
                    {entry.changes && (
                      <div className="mt-1 text-xs bg-slate-50 rounded px-2 py-1 font-mono text-slate-500">
                        {typeof entry.changes === 'string' ? entry.changes :
                          Object.entries(entry.changes).map(([k, v]: [string, any]) => (
                            <div key={k}>
                              {k}: {v?.old !== undefined ? `${v.old} → ${v.new}` : JSON.stringify(v)}
                            </div>
                          ))
                        }
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

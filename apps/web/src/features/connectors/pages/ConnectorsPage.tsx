import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../lib/api-client';
import { useAuth } from '../../../providers/AuthProvider';

interface Connector { connectorType: string; displayName: string; }
interface Run {
  id: string; connector_type: string; status: string;
  records_received: number; records_accepted: number; records_rejected: number;
  started_at: string; completed_at: string | null;
}

const TYPE_COLORS: Record<string, string> = {
  mock_enablon: 'border-t-emerald-500',
  mock_successfactors: 'border-t-blue-500',
  mock_sap_s4hana: 'border-t-indigo-500',
  mock_ecovadis: 'border-t-teal-500',
  mock_ethicspoint: 'border-t-amber-500',
  mock_sphera: 'border-t-orange-500',
  mock_workday: 'border-t-cyan-500',
  mock_cdp: 'border-t-lime-500',
  mock_celonis: 'border-t-pink-500',
  mock_coupa: 'border-t-violet-500',
  mock_powerbi: 'border-t-yellow-500',
  csv_upload: 'border-t-slate-500',
};

const DOMAIN_MAP: Record<string, string> = {
  mock_enablon: 'HSE&S / Environmental',
  mock_successfactors: 'HR / Workforce',
  mock_sap_s4hana: 'ERP / Financial',
  mock_ecovadis: 'Procurement / Supply Chain',
  mock_ethicspoint: 'Legal / Governance',
  mock_sphera: 'Product Safety / EHS',
  mock_workday: 'HR / People',
  mock_cdp: 'Climate Disclosure',
  mock_celonis: 'Process Mining',
  mock_coupa: 'Procurement',
  mock_powerbi: 'Business Intelligence',
  csv_upload: 'Manual Import',
};

export function ConnectorsPage() {
  const { tenant } = useAuth();
  const navigate = useNavigate();
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);

  useEffect(() => {
    if (tenant) { loadConnectors(); loadRuns(); }
  }, [tenant]);

  async function loadConnectors() {
    const res = await api<{ data: Connector[] }>('/connectors');
    setConnectors(res.data);
  }

  async function loadRuns() {
    const res = await api<{ data: Run[] }>('/connectors/runs');
    setRuns(res.data);
  }

  if (!tenant) return <p className="text-slate-500">Select a tenant to view connectors.</p>;

  return (
    <div>
      {/* Adapter grid */}
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Available Adapters</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
        {connectors.map((c) => (
          <div key={c.connectorType}
            onClick={() => navigate(`/connectors/${c.connectorType}`)}
            className={`bg-white rounded-xl border border-slate-200 border-t-4 ${TYPE_COLORS[c.connectorType] || 'border-t-slate-300'} p-4 hover:shadow-md transition-shadow cursor-pointer`}>
            <div className="font-medium text-slate-800 text-sm">{c.displayName}</div>
            <div className="text-xs text-slate-400 mt-0.5">{DOMAIN_MAP[c.connectorType] || c.connectorType}</div>
            <div className="mt-2">
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Available
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Run history */}
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Ingestion History</h3>
      {runs.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-300">
          <p className="text-slate-400">No ingestion runs yet. Import data from the Data Collection page.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-left font-medium text-slate-500">Connector</th>
                <th className="px-4 py-3 text-right font-medium text-slate-500">Accepted</th>
                <th className="px-4 py-3 text-right font-medium text-slate-500">Rejected</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Status</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((r) => (
                <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <span className="font-medium text-slate-700 capitalize">{r.connector_type.replace('mock_', '').replace(/_/g, ' ')}</span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-emerald-600 font-medium">{r.records_accepted}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    <span className={r.records_rejected > 0 ? 'text-red-600 font-medium' : 'text-slate-300'}>{r.records_rejected}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      r.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                      r.status === 'partial' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                    }`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {new Date(r.started_at).toLocaleString()}
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

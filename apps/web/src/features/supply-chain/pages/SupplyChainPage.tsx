import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../lib/api-client';
import { useAuth } from '../../../providers/AuthProvider';

interface Campaign {
  id: string; name: string; description: string; deadline: string; status: string;
  metrics_requested: string[]; created_at: string;
  inviteCounts?: { total: number; submitted: number; pending: number };
  invites?: any[]; metricsDetail?: any[];
}

// Common VSME metrics for supply chain data requests
const METRIC_PRESETS = [
  { label: 'Environmental (GHG + Energy)', codes: ['E1_6_GHG_SCOPE1', 'E1_6_GHG_SCOPE2_LOCATION', 'E1_5_ENERGY_CONSUMPTION_TOTAL', 'E1_5_ENERGY_RENEWABLE_PCT'] },
  { label: 'Social (Workforce)', codes: ['S1_6_EMPLOYEES_TOTAL', 'S1_14_TRIR', 'S1_16_GENDER_PAY_GAP'] },
  { label: 'Supply Chain Due Diligence', codes: ['S2_4_FORCED_LABOUR_INCIDENTS', 'S2_4_CHILD_LABOUR_INCIDENTS', 'S2_4_SUPPLIERS_ASSESSED_PCT'] },
  { label: 'Governance', codes: ['G1_4_CORRUPTION_INCIDENTS', 'G1_1_WHISTLEBLOWER_REPORTS'] },
];

export function SupplyChainPage() {
  const { tenant } = useAuth();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selected, setSelected] = useState<Campaign | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => { if (tenant) loadCampaigns(); }, [tenant]);

  async function loadCampaigns() {
    const res = await api<{ data: Campaign[] }>('/supply-chain/campaigns');
    setCampaigns(res.data);
  }

  async function loadCampaign(id: string) {
    const res = await api<{ data: Campaign }>(`/supply-chain/campaigns/${id}`);
    setSelected(res.data);
  }

  async function createCampaign() {
    if (!newName || selectedMetrics.length === 0) return;
    const res = await api<{ data: Campaign }>('/supply-chain/campaigns', {
      method: 'POST', body: { name: newName, description: newDesc, deadline: newDeadline || null, metricsRequested: selectedMetrics },
    });
    setShowCreate(false); setNewName(''); setNewDesc(''); setSelectedMetrics([]);
    loadCampaigns();
    loadCampaign(res.data.id);
  }

  async function inviteSupplier() {
    if (!selected || !inviteName || !inviteEmail) return;
    const res = await api<{ data: any }>(`/supply-chain/campaigns/${selected.id}/invite`, {
      method: 'POST', body: { supplierName: inviteName, supplierEmail: inviteEmail },
    });
    setInviteName(''); setInviteEmail('');
    alert(`Portal link: ${window.location.origin}${res.data.portalUrl}`);
    loadCampaign(selected.id);
  }

  function toggleMetric(code: string) {
    setSelectedMetrics((prev) => prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]);
  }

  if (!tenant) return <p className="text-slate-500">Select a tenant first.</p>;

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Request ESG data from your suppliers via a simplified VSME portal. Suppliers receive a unique link to submit metrics — no account required.
        </p>
        <button onClick={() => setShowCreate(!showCreate)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium flex-shrink-0">
          {showCreate ? 'Cancel' : 'New Campaign'}
        </button>
      </div>

      {/* Create campaign form */}
      {showCreate && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-5">
          <h3 className="font-semibold text-slate-800 mb-3">Create Data Request Campaign</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Campaign Name</label>
              <input value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="Q4 2024 Supplier ESG Survey" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Deadline</label>
              <input type="date" value={newDeadline} onChange={(e) => setNewDeadline(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
              <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" rows={2} placeholder="Please provide your ESG metrics for our CSRD supply chain reporting..." />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-medium text-slate-600 mb-2">Metrics to request (select presets or individual):</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {METRIC_PRESETS.map((preset) => (
                <button key={preset.label} onClick={() => setSelectedMetrics((prev) => [...new Set([...prev, ...preset.codes])])}
                  className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs rounded-lg">{preset.label}</button>
              ))}
            </div>
            {selectedMetrics.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedMetrics.map((code) => (
                  <span key={code} onClick={() => toggleMetric(code)}
                    className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded cursor-pointer hover:bg-red-100 hover:text-red-600 font-mono">{code} ×</span>
                ))}
              </div>
            )}
          </div>
          <button onClick={createCampaign} disabled={!newName || selectedMetrics.length === 0}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg font-medium disabled:opacity-40">Create Campaign</button>
        </div>
      )}

      <div className="flex gap-5">
        {/* Campaign list */}
        <div className="w-80 flex-shrink-0 space-y-2">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Campaigns</h3>
          {campaigns.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-300">
              <p className="text-slate-400 text-sm">No campaigns yet.</p>
            </div>
          ) : campaigns.map((c) => (
            <div key={c.id} onClick={() => loadCampaign(c.id)}
              className={`bg-white rounded-lg border p-4 cursor-pointer transition-all ${
                selected?.id === c.id ? 'border-blue-500 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}>
              <div className="font-medium text-slate-800 text-sm">{c.name}</div>
              <div className="text-xs text-slate-400 mt-1">{c.metrics_requested?.length || 0} metrics requested</div>
              {c.inviteCounts && (
                <div className="flex gap-3 mt-2 text-xs">
                  <span className="text-emerald-600">{c.inviteCounts.submitted} submitted</span>
                  <span className="text-amber-600">{c.inviteCounts.pending} pending</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Campaign detail */}
        {selected ? (
          <div className="flex-1 space-y-4">
            {/* Invite form */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-800 mb-3">Invite Supplier</h3>
              <div className="flex gap-3">
                <input value={inviteName} onChange={(e) => setInviteName(e.target.value)} className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="Supplier name" />
                <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="contact@supplier.com" />
                <button onClick={inviteSupplier} disabled={!inviteName || !inviteEmail}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium disabled:opacity-40">Send Invite</button>
              </div>
            </div>

            {/* Supplier status */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-800 mb-3">Invited Suppliers</h3>
              {(selected.invites?.length || 0) === 0 ? (
                <p className="text-slate-400 text-sm">No suppliers invited yet.</p>
              ) : (
                <div className="space-y-2">
                  {selected.invites?.map((inv: any) => (
                    <div key={inv.id} className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-lg">
                      <div>
                        <div className="font-medium text-slate-700 text-sm">{inv.supplier_name}</div>
                        <div className="text-xs text-slate-400">{inv.supplier_email}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          inv.status === 'submitted' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {inv.status}
                        </span>
                        {inv.status === 'pending' && (
                          <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/portal/${inv.access_token}`)}
                            className="text-[10px] text-blue-600 hover:underline">Copy link</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Requested metrics */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-800 mb-3">Requested Metrics</h3>
              <div className="flex flex-wrap gap-1.5">
                {selected.metricsDetail?.map((m: any) => (
                  <span key={m.code} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                    <span className="font-mono">{m.code}</span> — {m.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-200 min-h-[300px]">
            Select a campaign or create a new one
          </div>
        )}
      </div>
    </div>
  );
}

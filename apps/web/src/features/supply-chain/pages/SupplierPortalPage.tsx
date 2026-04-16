import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface MetricDef {
  code: string; name: string; description: string; unit: string; standardCode: string;
}

interface PortalData {
  supplier_name: string; supplier_email: string; campaign_name: string;
  description: string; deadline: string; status: string; metricsDetail: MetricDef[];
}

export function SupplierPortalPage() {
  const { token } = useParams<{ token: string }>();
  const [portal, setPortal] = useState<PortalData | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (token) loadPortal(); }, [token]);

  async function loadPortal() {
    try {
      const res = await fetch(`/api/v1/supply-chain/portal/${token}`);
      const data = await res.json();
      if (data.data) {
        setPortal(data.data);
        if (data.data.status === 'submitted') setSubmitted(true);
      } else {
        setError('Invalid or expired portal link.');
      }
    } catch { setError('Unable to load portal.'); }
  }

  async function handleSubmit() {
    if (!token || !portal) return;
    setSubmitting(true);
    try {
      const responses = portal.metricsDetail.map((m) => ({
        metricCode: m.code,
        numericValue: values[m.code] ? parseFloat(values[m.code]) : undefined,
        notes: notes[m.code] || undefined,
      })).filter((r) => r.numericValue !== undefined);

      await fetch(`/api/v1/supply-chain/portal/${token}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses }),
      });
      setSubmitted(true);
    } catch (err: any) { setError(err.message); }
    finally { setSubmitting(false); }
  }

  // Standalone layout — no sidebar, no app shell
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-lg flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">ESG Suite</h1>
              <div className="text-[10px] text-slate-400">Supplier Data Portal</div>
            </div>
          </div>
          <div className="text-xs text-slate-400">Powered by ESRS/VSME</div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto py-8 px-6">
        {error ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">!</div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Unable to Load Portal</h2>
            <p className="text-slate-500">{error}</p>
          </div>
        ) : !portal ? (
          <div className="text-center py-16 text-slate-400">Loading portal...</div>
        ) : submitted ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-emerald-600">OK</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Data Submitted Successfully</h2>
            <p className="text-slate-500 mb-2">Thank you, {portal.supplier_name}.</p>
            <p className="text-sm text-slate-400">Your ESG data has been received for the "{portal.campaign_name}" campaign.</p>
          </div>
        ) : (
          <div>
            {/* Campaign info */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
              <h2 className="text-xl font-bold text-slate-800">{portal.campaign_name}</h2>
              {portal.description && <p className="text-sm text-slate-500 mt-2">{portal.description}</p>}
              <div className="flex gap-4 mt-3 text-sm">
                <span className="text-slate-500">Responding as: <strong>{portal.supplier_name}</strong></span>
                {portal.deadline && <span className="text-slate-500">Deadline: <strong>{new Date(portal.deadline).toLocaleDateString()}</strong></span>}
              </div>
            </div>

            {/* Metrics form */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-800 mb-4">Requested ESG Metrics</h3>
              <p className="text-sm text-slate-500 mb-6">Please provide the following sustainability data for your organization. Leave blank any metrics you cannot report.</p>

              <div className="space-y-5">
                {portal.metricsDetail.map((metric) => (
                  <div key={metric.code} className="border-b border-slate-100 pb-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-medium text-slate-700 text-sm">{metric.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{metric.description}</div>
                      </div>
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-mono flex-shrink-0">{metric.standardCode}</span>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="number" step="any"
                            value={values[metric.code] || ''}
                            onChange={(e) => setValues((prev) => ({ ...prev, [metric.code]: e.target.value }))}
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                            placeholder={`Enter value${metric.unit ? ` (${metric.unit})` : ''}`}
                          />
                          {metric.unit && <span className="text-xs text-slate-400 w-16">{metric.unit}</span>}
                        </div>
                      </div>
                      <input
                        type="text"
                        value={notes[metric.code] || ''}
                        onChange={(e) => setNotes((prev) => ({ ...prev, [metric.code]: e.target.value }))}
                        className="w-48 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        placeholder="Notes (optional)"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-between items-center">
                <span className="text-xs text-slate-400">
                  {Object.values(values).filter((v) => v).length} of {portal.metricsDetail.length} metrics filled
                </span>
                <button onClick={handleSubmit} disabled={submitting || Object.values(values).filter((v) => v).length === 0}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium disabled:opacity-40">
                  {submitting ? 'Submitting...' : 'Submit Data'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 mt-12 py-4 text-center text-xs text-slate-400">
        Data submitted through this portal is processed in accordance with GDPR and the ESRS VSME standard.
      </footer>
    </div>
  );
}

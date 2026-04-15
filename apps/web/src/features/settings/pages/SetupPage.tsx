import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../lib/api-client';
import { useAuth } from '../../../providers/AuthProvider';

interface Period { id: string; name: string; period_type: string; start_date: string; end_date: string; is_current: boolean; }
interface TenantDetail { id: string; name: string; slug: string; subscription_tier: string; company_size: string | null; csrd_wave: number | null; country_code: string | null; employee_count: number | null; }

export function SetupPage() {
  const { tenant, createTenant } = useAuth();
  const navigate = useNavigate();
  const [periods, setPeriods] = useState<Period[]>([]);
  const [tenantDetail, setTenantDetail] = useState<TenantDetail | null>(null);

  // New tenant form
  const [showNewTenant, setShowNewTenant] = useState(false);
  const [tName, setTName] = useState('');
  const [tSlug, setTSlug] = useState('');
  const [tCountry, setTCountry] = useState('NL');
  const [tWave, setTWave] = useState('1');
  const [tSize, setTSize] = useState('large');
  const [tEmployees, setTEmployees] = useState('');

  // New period form
  const [showNewPeriod, setShowNewPeriod] = useState(false);
  const [pName, setPName] = useState('');
  const [pType, setPType] = useState('annual');
  const [pStart, setPStart] = useState('');
  const [pEnd, setPEnd] = useState('');

  useEffect(() => { if (tenant) { loadPeriods(); loadTenant(); } }, [tenant]);

  async function loadPeriods() {
    const res = await api<{ data: Period[] }>('/data/periods');
    setPeriods(res.data);
  }

  async function loadTenant() {
    try {
      const res = await api<{ data: TenantDetail }>('/tenants/me');
      setTenantDetail(res.data);
    } catch {}
  }

  async function handleCreateTenant() {
    if (!tName) return;
    const slug = tSlug || tName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    try {
      await api('/tenants', {
        method: 'POST',
        body: { name: tName, slug, countryCode: tCountry, csrdWave: parseInt(tWave), companySize: tSize, employeeCount: tEmployees ? parseInt(tEmployees) : null },
      });
      window.location.reload();
    } catch (err: any) { alert(err.message); }
  }

  async function handleCreatePeriod() {
    if (!pName || !pStart || !pEnd) return;
    try {
      await api('/data/periods', {
        method: 'POST',
        body: { name: pName, periodType: pType, startDate: pStart, endDate: pEnd, isCurrent: true },
      });
      setPName(''); setPStart(''); setPEnd('');
      setShowNewPeriod(false);
      loadPeriods();
    } catch (err: any) { alert(err.message); }
  }

  function prefillPeriod(type: string, year: number, month?: number) {
    if (type === 'annual') {
      setPName(`FY ${year}`);
      setPType('annual');
      setPStart(`${year}-01-01`);
      setPEnd(`${year}-12-31`);
    } else if (type === 'quarterly' && month !== undefined) {
      const q = Math.ceil(month / 3);
      const startMonth = (q - 1) * 3 + 1;
      const endMonth = q * 3;
      const endDay = new Date(year, endMonth, 0).getDate();
      setPName(`Q${q} ${year}`);
      setPType('quarterly');
      setPStart(`${year}-${String(startMonth).padStart(2, '0')}-01`);
      setPEnd(`${year}-${String(endMonth).padStart(2, '0')}-${endDay}`);
    } else if (type === 'semi_annual') {
      const half = (month || 1) <= 6 ? 1 : 2;
      setPName(`H${half} ${year}`);
      setPType('semi_annual');
      setPStart(half === 1 ? `${year}-01-01` : `${year}-07-01`);
      setPEnd(half === 1 ? `${year}-06-30` : `${year}-12-31`);
    }
    setShowNewPeriod(true);
  }

  return (
    <div className="max-w-3xl">
      {/* Tenant info */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-semibold text-slate-800">Organization</h3>
          <button onClick={() => setShowNewTenant(!showNewTenant)}
            className="text-sm text-blue-600 hover:underline">
            {showNewTenant ? 'Cancel' : '+ New Tenant'}
          </button>
        </div>

        {tenantDetail ? (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-slate-500">Name:</span> <span className="font-medium">{tenantDetail.name}</span></div>
            <div><span className="text-slate-500">Country:</span> <span className="font-medium">{tenantDetail.country_code || '—'}</span></div>
            <div><span className="text-slate-500">CSRD Wave:</span> <span className="font-medium">{tenantDetail.csrd_wave ? `Wave ${tenantDetail.csrd_wave}` : '—'}</span></div>
            <div><span className="text-slate-500">Size:</span> <span className="font-medium capitalize">{tenantDetail.company_size || '—'}</span></div>
            <div><span className="text-slate-500">Employees:</span> <span className="font-medium">{tenantDetail.employee_count?.toLocaleString() || '—'}</span></div>
            <div><span className="text-slate-500">Tier:</span> <span className="font-medium capitalize">{tenantDetail.subscription_tier.replace(/_/g, ' ')}</span></div>
          </div>
        ) : (
          <p className="text-slate-400 text-sm">No tenant selected.</p>
        )}

        {showNewTenant && (
          <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Company Name *</label>
                <input value={tName} onChange={(e) => { setTName(e.target.value); setTSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_')); }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="Acme Corporation" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Slug</label>
                <input value={tSlug} onChange={(e) => setTSlug(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono" placeholder="acme_corp" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Country</label>
                <select value={tCountry} onChange={(e) => setTCountry(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                  {['NL','DE','FR','ES','IT','BE','AT','SE','DK','FI','IE','PT','PL','CZ','RO','GB','CH','NO','US'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">CSRD Wave</label>
                <select value={tWave} onChange={(e) => setTWave(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                  <option value="1">Wave 1 — Large PIEs (&gt;500 emp)</option>
                  <option value="2">Wave 2 — Large (&gt;1,000 emp)</option>
                  <option value="3">Wave 3 — Listed SMEs</option>
                  <option value="4">Wave 4 — Non-EU (&gt;450M EUR)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Company Size</label>
                <select value={tSize} onChange={(e) => setTSize(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                  <option value="pie">Public Interest Entity (PIE)</option>
                  <option value="large">Large</option>
                  <option value="sme">SME</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Employees</label>
                <input type="number" value={tEmployees} onChange={(e) => setTEmployees(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="34500" />
              </div>
            </div>
            <button onClick={handleCreateTenant}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium">
              Create Tenant
            </button>
          </div>
        )}
      </div>

      {/* Reporting Periods */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-semibold text-slate-800">Reporting Periods</h3>
          <button onClick={() => setShowNewPeriod(!showNewPeriod)}
            className="text-sm text-blue-600 hover:underline">
            {showNewPeriod ? 'Cancel' : '+ New Period'}
          </button>
        </div>

        {/* Quick create buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-xs text-slate-500 self-center mr-1">Quick create:</span>
          {[2024, 2025, 2026].map((y) => (
            <button key={`fy${y}`} onClick={() => prefillPeriod('annual', y)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-lg">
              FY {y}
            </button>
          ))}
          {[1, 2, 3, 4].map((q) => (
            <button key={`q${q}`} onClick={() => prefillPeriod('quarterly', 2025, q * 3 - 2)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-lg">
              Q{q} 2025
            </button>
          ))}
          {[1, 2].map((h) => (
            <button key={`h${h}`} onClick={() => prefillPeriod('semi_annual', 2025, h === 1 ? 1 : 7)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-lg">
              H{h} 2025
            </button>
          ))}
        </div>

        {showNewPeriod && (
          <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Period Name *</label>
                <input value={pName} onChange={(e) => setPName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="FY 2024" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
                <select value={pType} onChange={(e) => setPType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                  <option value="annual">Annual</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="semi_annual">Semi-Annual</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Start Date *</label>
                <input type="date" value={pStart} onChange={(e) => setPStart(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">End Date *</label>
                <input type="date" value={pEnd} onChange={(e) => setPEnd(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
            </div>
            <button onClick={handleCreatePeriod}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium">
              Create Period
            </button>
          </div>
        )}

        {/* Existing periods */}
        {periods.length === 0 ? (
          <p className="text-sm text-slate-400">No reporting periods. Create one to start collecting data.</p>
        ) : (
          <div className="space-y-2">
            {periods.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-lg">
                <div>
                  <span className="font-medium text-slate-800 text-sm">{p.name}</span>
                  <span className="text-xs text-slate-400 ml-2">{p.start_date} to {p.end_date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-xs rounded capitalize">{p.period_type}</span>
                  {p.is_current && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">Current</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Flow guide */}
      <div className="mt-6 bg-blue-50 rounded-xl border border-blue-200 p-5">
        <h3 className="font-semibold text-blue-800 mb-3">Application Flow</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          {[
            { step: '1', label: 'Create Tenant', desc: 'Set up your organization (above)', done: !!tenant },
            { step: '2', label: 'Create Reporting Period', desc: 'e.g., FY 2024 or Q1 2025', done: periods.length > 0 },
            { step: '3', label: 'Import/Enter Data', desc: 'Connect sources or enter manually', link: '/data' },
            { step: '4', label: 'Run DMA', desc: 'Score 10 ESRS topics for materiality', link: '/dma' },
            { step: '5', label: 'Generate Report', desc: 'Create ESRS report with AI narratives', link: '/reports' },
            { step: '6', label: 'Export iXBRL', desc: 'Download ESEF-formatted report', link: '/reports' },
          ].map((s) => (
            <div key={s.step} className="flex items-start gap-3 py-1.5"
              onClick={() => s.link && navigate(s.link)}
              style={{ cursor: s.link ? 'pointer' : 'default' }}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                s.done ? 'bg-emerald-500 text-white' : 'bg-blue-200 text-blue-700'
              }`}>{s.done ? '\u2713' : s.step}</span>
              <div>
                <span className={`font-medium ${s.link ? 'text-blue-700 hover:underline' : 'text-slate-800'}`}>{s.label}</span>
                <span className="text-slate-500 ml-1">— {s.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { api, setTenantId } from '../lib/api-client';

interface Props {
  onComplete: () => void;
}

const EU_COUNTRIES = [
  { code: 'NL', name: 'Netherlands' }, { code: 'DE', name: 'Germany' }, { code: 'FR', name: 'France' },
  { code: 'ES', name: 'Spain' }, { code: 'IT', name: 'Italy' }, { code: 'BE', name: 'Belgium' },
  { code: 'AT', name: 'Austria' }, { code: 'SE', name: 'Sweden' }, { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' }, { code: 'IE', name: 'Ireland' }, { code: 'PT', name: 'Portugal' },
  { code: 'PL', name: 'Poland' }, { code: 'CZ', name: 'Czech Republic' }, { code: 'RO', name: 'Romania' },
  { code: 'GB', name: 'United Kingdom' }, { code: 'CH', name: 'Switzerland' }, { code: 'NO', name: 'Norway' },
];
const AU_COUNTRIES = [{ code: 'AU', name: 'Australia' }, { code: 'NZ', name: 'New Zealand' }];
const GLOBAL_COUNTRIES = [{ code: 'US', name: 'United States' }, { code: 'CA', name: 'Canada' }, { code: 'SG', name: 'Singapore' }, { code: 'HK', name: 'Hong Kong' }, { code: 'JP', name: 'Japan' }];

const JURISDICTION_OPTIONS = [
  {
    code: 'EU', name: 'European Union', flag: '🇪🇺',
    framework: 'CSRD / ESRS', desc: 'Double materiality, 12 ESRS standards, iXBRL, EU Taxonomy',
    countries: EU_COUNTRIES, waves: [
      { value: '1', label: 'Wave 1 — Large PIEs (>500 emp)', timeline: 'Reporting now' },
      { value: '2', label: 'Wave 2 — Large (>1,000 emp)', timeline: 'FY2027' },
      { value: '3', label: 'Wave 3 — Listed SMEs', timeline: 'FY2028' },
      { value: '4', label: 'Wave 4 — Non-EU (>€450M)', timeline: 'FY2028' },
    ],
  },
  {
    code: 'AU', name: 'Australia', flag: '🇦🇺',
    framework: 'AASB S2 (ISSB-based)', desc: 'Climate-focused, financial materiality, GHG Protocol, NGER',
    countries: AU_COUNTRIES, waves: [
      { value: '1', label: 'Group 1 — Large (>$500M rev)', timeline: 'FY starting Jan 2025' },
      { value: '2', label: 'Group 2 — Mid-size (>$200M rev)', timeline: 'FY starting Jul 2026' },
      { value: '3', label: 'Group 3 — Smaller (>$50M rev)', timeline: 'FY starting Jul 2027' },
    ],
  },
  {
    code: 'GLOBAL', name: 'Global (ISSB)', flag: '🌍',
    framework: 'IFRS S1 & S2', desc: 'Voluntary global baseline, climate + sustainability',
    countries: [...AU_COUNTRIES, ...EU_COUNTRIES, ...GLOBAL_COUNTRIES].sort((a, b) => a.name.localeCompare(b.name)),
    waves: [
      { value: '1', label: 'Voluntary adopter', timeline: 'Any period' },
    ],
  },
];

export function OnboardingWizard({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [jurisdiction, setJurisdiction] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [country, setCountry] = useState('');
  const [wave, setWave] = useState('1');
  const [size, setSize] = useState('large');
  const [employees, setEmployees] = useState('');
  const [periodYear, setPeriodYear] = useState('2024');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedJuris = JURISDICTION_OPTIONS.find((j) => j.code === jurisdiction);

  async function handleFinish() {
    setLoading(true);
    setError('');
    try {
      const slug = companyName.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const tenantRes = await api<{ data: { id: string } }>('/tenants', {
        method: 'POST',
        body: {
          name: companyName, slug, countryCode: country,
          csrdWave: parseInt(wave), companySize: size,
          employeeCount: employees ? parseInt(employees) : null,
        },
      });
      setTenantId(tenantRes.data.id);
      await api('/data/periods', {
        method: 'POST',
        body: { name: `FY ${periodYear}`, periodType: 'annual', startDate: `${periodYear}-01-01`, endDate: `${periodYear}-12-31`, isCurrent: true },
      });
      onComplete();
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }

  const steps = [
    // Step 0: Welcome
    <div key="welcome" className="text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome to ESG Suite</h2>
      <p className="text-slate-500 mb-8 max-w-md mx-auto">
        Set up your organization for sustainability compliance reporting. Supports CSRD/ESRS, AASB S2, and ISSB frameworks.
      </p>
      <button onClick={() => setStep(1)} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
        Get Started
      </button>
    </div>,

    // Step 1: Jurisdiction
    <div key="jurisdiction" className="max-w-lg mx-auto">
      <h2 className="text-xl font-bold text-slate-800 mb-1">Reporting Jurisdiction</h2>
      <p className="text-sm text-slate-500 mb-6">Which regulatory framework applies to your organization?</p>
      <div className="space-y-3">
        {JURISDICTION_OPTIONS.map((j) => (
          <label key={j.code}
            className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
              jurisdiction === j.code ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
            }`}>
            <input type="radio" name="jurisdiction" value={j.code} checked={jurisdiction === j.code}
              onChange={() => { setJurisdiction(j.code); setCountry(j.countries[0]?.code || ''); setWave('1'); }}
              className="mt-1" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">{j.flag}</span>
                <span className="font-semibold text-slate-800">{j.name}</span>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded font-mono">{j.framework}</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">{j.desc}</div>
            </div>
          </label>
        ))}
      </div>
      <div className="flex justify-between mt-8">
        <button onClick={() => setStep(0)} className="px-4 py-2 text-slate-500 hover:text-slate-700">Back</button>
        <button onClick={() => setStep(2)} disabled={!jurisdiction}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-40">Continue</button>
      </div>
    </div>,

    // Step 2: Company details
    <div key="company" className="max-w-md mx-auto">
      <h2 className="text-xl font-bold text-slate-800 mb-1">Your Organization</h2>
      <p className="text-sm text-slate-500 mb-6">Tell us about your company.</p>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Company Name *</label>
          <input value={companyName} onChange={(e) => setCompanyName(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., AkzoNobel, BHP, Siemens" autoFocus />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
          <select value={country} onChange={(e) => setCountry(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm">
            {selectedJuris?.countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Number of Employees</label>
          <input type="number" value={employees} onChange={(e) => setEmployees(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm" placeholder="e.g., 34500" />
        </div>
      </div>
      <div className="flex justify-between mt-8">
        <button onClick={() => setStep(1)} className="px-4 py-2 text-slate-500">Back</button>
        <button onClick={() => setStep(3)} disabled={!companyName}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-40">Continue</button>
      </div>
    </div>,

    // Step 3: Wave/Group classification
    <div key="wave" className="max-w-md mx-auto">
      <h2 className="text-xl font-bold text-slate-800 mb-1">
        {jurisdiction === 'EU' ? 'CSRD Wave' : jurisdiction === 'AU' ? 'Reporting Group' : 'Adoption Status'}
      </h2>
      <p className="text-sm text-slate-500 mb-6">This determines your reporting timeline.</p>
      <div className="space-y-2">
        {selectedJuris?.waves.map((w) => (
          <label key={w.value}
            className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
              wave === w.value ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
            }`}>
            <input type="radio" name="wave" value={w.value} checked={wave === w.value}
              onChange={(e) => setWave(e.target.value)} className="mt-1" />
            <div>
              <div className="font-medium text-sm text-slate-800">{w.label}</div>
              <div className="text-xs text-slate-500">{w.timeline}</div>
            </div>
          </label>
        ))}
      </div>
      <div className="flex justify-between mt-8">
        <button onClick={() => setStep(2)} className="px-4 py-2 text-slate-500">Back</button>
        <button onClick={() => setStep(4)} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">Continue</button>
      </div>
    </div>,

    // Step 4: Reporting period
    <div key="period" className="max-w-md mx-auto">
      <h2 className="text-xl font-bold text-slate-800 mb-1">Reporting Period</h2>
      <p className="text-sm text-slate-500 mb-6">Which fiscal year are you reporting on?</p>
      <div className="grid grid-cols-3 gap-3">
        {['2023', '2024', '2025', '2026'].map((y) => (
          <button key={y} onClick={() => setPeriodYear(y)}
            className={`py-4 rounded-xl border-2 text-center font-bold text-lg transition-colors ${
              periodYear === y ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
            }`}>
            FY {y}
          </button>
        ))}
      </div>
      {error && <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
      <div className="flex justify-between mt-8">
        <button onClick={() => setStep(3)} className="px-4 py-2 text-slate-500">Back</button>
        <button onClick={handleFinish} disabled={loading}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium disabled:opacity-50">
          {loading ? 'Setting up...' : 'Create & Start'}
        </button>
      </div>
    </div>,
  ];

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-lg">
        {step > 0 && (
          <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={`h-1.5 w-10 rounded-full transition-colors ${
                s < step ? 'bg-emerald-500' : s === step ? 'bg-blue-500' : 'bg-slate-200'
              }`} />
            ))}
          </div>
        )}
        {steps[step]}
      </div>
    </div>
  );
}

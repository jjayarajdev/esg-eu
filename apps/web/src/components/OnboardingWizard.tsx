import { useState } from 'react';
import { api, setTenantId } from '../lib/api-client';

interface Props {
  onComplete: () => void;
}

const COUNTRIES = [
  { code: 'NL', name: 'Netherlands' }, { code: 'DE', name: 'Germany' }, { code: 'FR', name: 'France' },
  { code: 'ES', name: 'Spain' }, { code: 'IT', name: 'Italy' }, { code: 'BE', name: 'Belgium' },
  { code: 'AT', name: 'Austria' }, { code: 'SE', name: 'Sweden' }, { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' }, { code: 'IE', name: 'Ireland' }, { code: 'PT', name: 'Portugal' },
  { code: 'PL', name: 'Poland' }, { code: 'CZ', name: 'Czech Republic' }, { code: 'RO', name: 'Romania' },
  { code: 'GB', name: 'United Kingdom' }, { code: 'CH', name: 'Switzerland' }, { code: 'NO', name: 'Norway' },
  { code: 'US', name: 'United States' },
];

export function OnboardingWizard({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [companyName, setCompanyName] = useState('');
  const [country, setCountry] = useState('NL');
  const [wave, setWave] = useState('1');
  const [size, setSize] = useState('large');
  const [employees, setEmployees] = useState('');
  const [periodYear, setPeriodYear] = useState('2024');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleFinish() {
    setLoading(true);
    setError('');
    try {
      const slug = companyName.toLowerCase().replace(/[^a-z0-9]/g, '_');

      // Create tenant
      const tenantRes = await api<{ data: { id: string } }>('/tenants', {
        method: 'POST',
        body: {
          name: companyName, slug, countryCode: country,
          csrdWave: parseInt(wave), companySize: size,
          employeeCount: employees ? parseInt(employees) : null,
        },
      });
      setTenantId(tenantRes.data.id);

      // Create reporting period
      await api('/data/periods', {
        method: 'POST',
        body: {
          name: `FY ${periodYear}`,
          periodType: 'annual',
          startDate: `${periodYear}-01-01`,
          endDate: `${periodYear}-12-31`,
          isCurrent: true,
        },
      });

      onComplete();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const steps = [
    // Step 0: Welcome
    <div key="welcome" className="text-center">
      <div className="text-5xl mb-4">ESG</div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome to EU ESG Platform</h2>
      <p className="text-slate-500 mb-8 max-w-md mx-auto">
        Let's set up your organization for ESRS compliance reporting. This takes about 30 seconds.
      </p>
      <button onClick={() => setStep(1)}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
        Get Started
      </button>
    </div>,

    // Step 1: Company
    <div key="company" className="max-w-md mx-auto">
      <h2 className="text-xl font-bold text-slate-800 mb-1">Your Organization</h2>
      <p className="text-sm text-slate-500 mb-6">Tell us about your company.</p>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Company Name *</label>
          <input value={companyName} onChange={(e) => setCompanyName(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., AkzoNobel, BASF, Siemens" autoFocus />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Headquarters Country</label>
          <select value={country} onChange={(e) => setCountry(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm">
            {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Number of Employees</label>
          <input type="number" value={employees} onChange={(e) => setEmployees(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm"
            placeholder="e.g., 34500" />
        </div>
      </div>
      <div className="flex justify-between mt-8">
        <button onClick={() => setStep(0)} className="px-4 py-2 text-slate-500 hover:text-slate-700">Back</button>
        <button onClick={() => setStep(2)} disabled={!companyName}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-40">
          Continue
        </button>
      </div>
    </div>,

    // Step 2: CSRD Classification
    <div key="csrd" className="max-w-md mx-auto">
      <h2 className="text-xl font-bold text-slate-800 mb-1">CSRD Classification</h2>
      <p className="text-sm text-slate-500 mb-6">This determines your reporting timeline and requirements.</p>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Which CSRD wave applies to you?</label>
          <div className="space-y-2">
            {[
              { value: '1', label: 'Wave 1', desc: 'Large public-interest entities (>500 employees, already under NFRD)', timeline: 'Reporting now (FY2024)' },
              { value: '2', label: 'Wave 2', desc: 'All large EU companies (>1,000 employees)', timeline: 'First report FY2027' },
              { value: '3', label: 'Wave 3', desc: 'Listed SMEs on EU-regulated markets', timeline: 'First report FY2028' },
              { value: '4', label: 'Wave 4', desc: 'Non-EU companies with >EUR 450M EU turnover', timeline: 'First report FY2028' },
            ].map((w) => (
              <label key={w.value}
                className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                  wave === w.value ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                }`}>
                <input type="radio" name="wave" value={w.value} checked={wave === w.value}
                  onChange={(e) => setWave(e.target.value)} className="mt-1" />
                <div>
                  <div className="font-medium text-sm text-slate-800">{w.label} — {w.desc}</div>
                  <div className="text-xs text-slate-500">{w.timeline}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Company Size</label>
          <select value={size} onChange={(e) => setSize(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm">
            <option value="pie">Public Interest Entity (PIE)</option>
            <option value="large">Large Company</option>
            <option value="sme">SME</option>
          </select>
        </div>
      </div>
      <div className="flex justify-between mt-8">
        <button onClick={() => setStep(1)} className="px-4 py-2 text-slate-500 hover:text-slate-700">Back</button>
        <button onClick={() => setStep(3)}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
          Continue
        </button>
      </div>
    </div>,

    // Step 3: Reporting Period
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
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}
      <div className="flex justify-between mt-8">
        <button onClick={() => setStep(2)} className="px-4 py-2 text-slate-500 hover:text-slate-700">Back</button>
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
        {/* Step indicator */}
        {step > 0 && (
          <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-1.5 w-12 rounded-full transition-colors ${
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

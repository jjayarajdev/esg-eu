import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../lib/api-client';
import { useAuth } from '../../../providers/AuthProvider';

interface Period {
  id: string;
  name: string;
}

// Metric definitions from the ESRS taxonomy (loaded client-side for form generation)
const METRIC_OPTIONS = [
  { group: 'E1 — Climate Change', metrics: [
    { code: 'E1_6_GHG_SCOPE1', name: 'Scope 1 GHG emissions', unit: 'tCO2e' },
    { code: 'E1_6_GHG_SCOPE2_LOCATION', name: 'Scope 2 GHG emissions (location)', unit: 'tCO2e' },
    { code: 'E1_6_GHG_SCOPE2_MARKET', name: 'Scope 2 GHG emissions (market)', unit: 'tCO2e' },
    { code: 'E1_6_GHG_SCOPE3_TOTAL', name: 'Total Scope 3 GHG emissions', unit: 'tCO2e' },
    { code: 'E1_5_ENERGY_CONSUMPTION_TOTAL', name: 'Total energy consumption', unit: 'MWh' },
    { code: 'E1_5_ENERGY_CONSUMPTION_RENEWABLE', name: 'Renewable energy consumption', unit: 'MWh' },
    { code: 'E1_5_ENERGY_RENEWABLE_PCT', name: 'Share of renewable energy', unit: '%' },
  ]},
  { group: 'E2 — Pollution', metrics: [
    { code: 'E2_4_AIR_POLLUTANTS', name: 'Air pollutant emissions', unit: 'tonnes' },
    { code: 'E2_4_WATER_POLLUTANTS', name: 'Water pollutant discharges', unit: 'tonnes' },
  ]},
  { group: 'E3 — Water', metrics: [
    { code: 'E3_4_WATER_CONSUMPTION_TOTAL', name: 'Total water consumption', unit: 'ML' },
  ]},
  { group: 'E5 — Circular Economy', metrics: [
    { code: 'E5_5_WASTE_TOTAL', name: 'Total waste generated', unit: 'tonnes' },
    { code: 'E5_5_WASTE_HAZARDOUS', name: 'Hazardous waste', unit: 'tonnes' },
    { code: 'E5_5_WASTE_RECYCLING_RATE', name: 'Waste recycling rate', unit: '%' },
  ]},
  { group: 'S1 — Own Workforce', metrics: [
    { code: 'S1_6_EMPLOYEES_TOTAL', name: 'Total employees', unit: 'headcount' },
    { code: 'S1_6_EMPLOYEES_FEMALE', name: 'Female employees', unit: 'headcount' },
    { code: 'S1_9_WOMEN_MANAGEMENT_PCT', name: 'Women in management', unit: '%' },
    { code: 'S1_16_GENDER_PAY_GAP', name: 'Gender pay gap', unit: '%' },
    { code: 'S1_14_TRIR', name: 'Total recordable incident rate', unit: 'rate' },
    { code: 'S1_13_TRAINING_HOURS_PER_EMPLOYEE', name: 'Training hours per employee', unit: 'hours' },
  ]},
  { group: 'G1 — Business Conduct', metrics: [
    { code: 'G1_3_ANTICORRUPTION_TRAINING_PCT', name: 'Anti-corruption training', unit: '%' },
    { code: 'G1_4_CORRUPTION_INCIDENTS', name: 'Corruption incidents', unit: 'count' },
    { code: 'G1_6_ONTIME_PAYMENT_PCT', name: 'On-time payment rate', unit: '%' },
  ]},
];

export function DataEntryPage() {
  const { tenant } = useAuth();
  const navigate = useNavigate();
  const [periods, setPeriods] = useState<Period[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedMetric, setSelectedMetric] = useState('');
  const [value, setValue] = useState('');
  const [confidence, setConfidence] = useState('measured');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (tenant) loadPeriods();
  }, [tenant]);

  async function loadPeriods() {
    const res = await api<{ data: Period[] }>('/data/periods');
    setPeriods(res.data);
    if (res.data.length > 0) setSelectedPeriod(res.data[0].id);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPeriod || !selectedMetric || !value) return;

    setSubmitting(true);
    setMessage(null);
    try {
      await api('/data/points', {
        method: 'POST',
        body: {
          metricCode: selectedMetric,
          reportingPeriodId: selectedPeriod,
          numericValue: parseFloat(value),
          confidenceLevel: confidence,
          dataSource: 'manual_entry',
        },
      });
      setMessage({ type: 'success', text: `Metric ${selectedMetric} saved successfully.` });
      setValue('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  const selectedDef = METRIC_OPTIONS
    .flatMap((g) => g.metrics)
    .find((m) => m.code === selectedMetric);

  if (!tenant) return <p>Select a tenant first.</p>;

  return (
    <div style={{ maxWidth: '600px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button onClick={() => navigate('/data')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>
          &larr;
        </button>
        <h2 style={{ margin: 0 }}>Enter Data Point</h2>
      </div>

      {message && (
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: '6px',
          marginBottom: '1rem',
          background: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
          color: message.type === 'success' ? '#065f46' : '#991b1b',
          border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
        }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Reporting Period</label>
          <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} style={inputStyle}>
            {periods.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>ESRS Metric</label>
          <select value={selectedMetric} onChange={(e) => setSelectedMetric(e.target.value)} style={inputStyle}>
            <option value="">Select a metric...</option>
            {METRIC_OPTIONS.map((group) => (
              <optgroup key={group.group} label={group.group}>
                {group.metrics.map((m) => (
                  <option key={m.code} value={m.code}>{m.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {selectedDef && (
          <>
            <div style={fieldStyle}>
              <label style={labelStyle}>
                Value {selectedDef.unit && <span style={{ color: '#6b7280', fontWeight: 400 }}>({selectedDef.unit})</span>}
              </label>
              <input
                type="number"
                step="any"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={`Enter value in ${selectedDef.unit}`}
                style={inputStyle}
                required
              />
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Data Quality</label>
              <select value={confidence} onChange={(e) => setConfidence(e.target.value)} style={inputStyle}>
                <option value="measured">Measured (direct measurement)</option>
                <option value="calculated">Calculated (derived from other data)</option>
                <option value="estimated">Estimated (best estimate)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting || !value}
              style={{
                ...primaryBtn,
                opacity: submitting || !value ? 0.5 : 1,
                marginTop: '1rem',
              }}
            >
              {submitting ? 'Saving...' : 'Save Data Point'}
            </button>
          </>
        )}
      </form>
    </div>
  );
}

const fieldStyle: React.CSSProperties = { marginBottom: '1rem' };
const labelStyle: React.CSSProperties = { display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.875rem' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.875rem' };
const primaryBtn: React.CSSProperties = { padding: '0.6rem 1.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem' };

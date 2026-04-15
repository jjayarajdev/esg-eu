import { useEffect, useState } from 'react';
import { api } from '../../../lib/api-client';
import { useAuth } from '../../../providers/AuthProvider';

interface Activity {
  id: string; nace_code: string; activity_name: string; environmental_objective: string;
  turnover_eur: number | null; capex_eur: number | null; opex_eur: number | null;
  step_eligibility: boolean | null; step_technical: any; step_dnsh: any; step_social: boolean | null;
  is_aligned: boolean | null;
}

interface Assessment {
  id: string; status: string; activities: Activity[];
  turnover_aligned_pct: number | null; capex_aligned_pct: number | null; opex_aligned_pct: number | null;
}

const ENV_OBJECTIVES_LABELS: Record<string, string> = {
  climate_mitigation: 'Climate Mitigation', climate_adaptation: 'Climate Adaptation',
  water_protection: 'Water Protection', circular_economy: 'Circular Economy',
  pollution_prevention: 'Pollution Prevention', biodiversity: 'Biodiversity',
};

const DNSH_OBJECTIVES = ['climate_mitigation', 'climate_adaptation', 'water_protection', 'circular_economy', 'pollution_prevention', 'biodiversity'];

export function TaxonomyPage() {
  const { tenant } = useAuth();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [sampleActivities, setSampleActivities] = useState<any[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [periods, setPeriods] = useState<any[]>([]);

  useEffect(() => { if (tenant) { loadAssessments(); loadSamples(); loadPeriods(); } }, [tenant]);

  async function loadAssessments() {
    const res = await api<{ data: any[] }>('/taxonomy');
    setAssessments(res.data);
    if (res.data.length > 0) loadAssessment(res.data[0].id);
  }
  async function loadAssessment(id: string) {
    const res = await api<{ data: Assessment }>(`/taxonomy/${id}`);
    setAssessment(res.data);
    if (res.data.activities.length > 0 && !selectedActivity) setSelectedActivity(res.data.activities[0]);
  }
  async function loadSamples() {
    const res = await api<{ data: any[] }>('/taxonomy/activities');
    setSampleActivities(res.data);
  }
  async function loadPeriods() {
    const res = await api<{ data: any[] }>('/data/periods');
    setPeriods(res.data);
  }

  async function createAssessment() {
    if (periods.length === 0) { alert('Create a reporting period first.'); return; }
    const res = await api<{ data: Assessment }>('/taxonomy', { method: 'POST', body: { reportingPeriodId: periods[0].id } });
    setAssessment(res.data);
    setAssessments((prev) => [res.data, ...prev]);
  }

  async function addActivity(sample: any) {
    if (!assessment) return;
    await api(`/taxonomy/${assessment.id}/activities`, {
      method: 'POST', body: { naceCode: sample.naceCode, activityName: sample.name, environmentalObjective: sample.objective },
    });
    loadAssessment(assessment.id);
  }

  async function updateScreening(field: string, value: any) {
    if (!assessment || !selectedActivity) return;
    await api(`/taxonomy/${assessment.id}/activities/${selectedActivity.id}/screen`, {
      method: 'PUT', body: { [field]: value },
    });
    const res = await api<{ data: Assessment }>(`/taxonomy/${assessment.id}`);
    setAssessment(res.data);
    setSelectedActivity(res.data.activities.find((a) => a.id === selectedActivity.id) || null);
  }

  async function calculateKPIs() {
    if (!assessment) return;
    await api(`/taxonomy/${assessment.id}/calculate`, { method: 'POST' });
    loadAssessment(assessment.id);
  }

  if (!tenant) return <p className="text-slate-500">Select a tenant first.</p>;

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-sm text-slate-500 mt-1">Classify your economic activities against the EU Taxonomy's 6 environmental objectives.</p>
        </div>
        {!assessment && <button onClick={createAssessment} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium">New Assessment</button>}
        {assessment && <button onClick={calculateKPIs} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg font-medium">Calculate KPIs</button>}
      </div>

      {/* KPI summary */}
      {assessment && (assessment.turnover_aligned_pct !== null) && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Turnover Aligned', value: assessment.turnover_aligned_pct },
            { label: 'CapEx Aligned', value: assessment.capex_aligned_pct },
            { label: 'OpEx Aligned', value: assessment.opex_aligned_pct },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-white rounded-xl border border-slate-200 border-t-4 border-t-emerald-500 p-4">
              <div className="text-sm text-slate-500">{kpi.label}</div>
              <div className="text-3xl font-bold text-slate-800">{Number(kpi.value).toFixed(1)}%</div>
            </div>
          ))}
        </div>
      )}

      {assessment ? (
        <div className="flex gap-5">
          {/* Activities list */}
          <div className="w-72 flex-shrink-0">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Activities</h3>
            {assessment.activities.map((a) => (
              <div key={a.id} onClick={() => setSelectedActivity(a)}
                className={`p-3 rounded-lg border mb-2 cursor-pointer transition-all ${
                  selectedActivity?.id === a.id ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                }`}>
                <div className="text-xs font-mono text-slate-400">{a.nace_code}</div>
                <div className="text-sm font-medium text-slate-700 mt-0.5">{a.activity_name}</div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`w-2 h-2 rounded-full ${a.is_aligned === true ? 'bg-emerald-500' : a.is_aligned === false ? 'bg-red-400' : 'bg-slate-300'}`} />
                  <span className="text-[10px] text-slate-400">{a.is_aligned === true ? 'Aligned' : a.is_aligned === false ? 'Not aligned' : 'Not screened'}</span>
                </div>
              </div>
            ))}
            {/* Add from samples */}
            <div className="mt-3 pt-3 border-t border-slate-200">
              <div className="text-xs text-slate-500 mb-2">Add activity:</div>
              <select onChange={(e) => {
                const s = sampleActivities.find((sa) => sa.naceCode === e.target.value);
                if (s) addActivity(s);
                e.target.value = '';
              }} className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs">
                <option value="">Select NACE activity...</option>
                {sampleActivities.map((s) => (
                  <option key={s.naceCode} value={s.naceCode}>{s.naceCode} — {s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Decision tree */}
          {selectedActivity ? (
            <div className="flex-1 bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-800 mb-1">{selectedActivity.nace_code} — {selectedActivity.activity_name}</h3>
              <p className="text-xs text-slate-400 mb-4">Objective: {ENV_OBJECTIVES_LABELS[selectedActivity.environmental_objective]}</p>

              {/* SVG Decision Tree */}
              <svg width="100%" height="60" viewBox="0 0 700 60" className="mb-4">
                {[
                  { x: 0, label: 'Eligible', done: selectedActivity.step_eligibility === true, fail: selectedActivity.step_eligibility === false },
                  { x: 175, label: 'Technical', done: selectedActivity.step_technical && Object.values(selectedActivity.step_technical).every(Boolean), fail: selectedActivity.step_technical && !Object.values(selectedActivity.step_technical).every(Boolean) },
                  { x: 350, label: 'DNSH', done: selectedActivity.step_dnsh && Object.values(selectedActivity.step_dnsh).every(Boolean), fail: selectedActivity.step_dnsh && !Object.values(selectedActivity.step_dnsh).every(Boolean) },
                  { x: 525, label: 'Social', done: selectedActivity.step_social === true, fail: selectedActivity.step_social === false },
                ].map((step, i) => (
                  <g key={step.label}>
                    <rect x={step.x} y={10} width={140} height={40} rx={8}
                      fill={step.done ? '#10b981' : step.fail ? '#ef4444' : '#f1f5f9'}
                      stroke={step.done ? '#059669' : step.fail ? '#dc2626' : '#cbd5e1'} strokeWidth={1.5} />
                    <text x={step.x + 70} y={35} textAnchor="middle" fontSize="12" fontWeight="600"
                      fill={step.done || step.fail ? 'white' : '#64748b'}>
                      {step.done ? `✓ ${step.label}` : step.fail ? `✗ ${step.label}` : step.label}
                    </text>
                    {i < 3 && <line x1={step.x + 140} y1={30} x2={step.x + 175} y2={30} stroke="#cbd5e1" strokeWidth={2} markerEnd="url(#arrow)" />}
                  </g>
                ))}
                <defs><marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-auto">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#cbd5e1" /></marker></defs>
              </svg>

              {/* Step forms */}
              <div className="space-y-4">
                {/* Step 1: Eligibility */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-semibold text-slate-700">Step 1: Eligibility</div>
                      <div className="text-xs text-slate-400">Is this activity listed in the EU Taxonomy?</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => updateScreening('stepEligibility', true)}
                        className={`px-3 py-1 rounded text-xs font-medium ${selectedActivity.step_eligibility === true ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-300'}`}>Yes</button>
                      <button onClick={() => updateScreening('stepEligibility', false)}
                        className={`px-3 py-1 rounded text-xs font-medium ${selectedActivity.step_eligibility === false ? 'bg-red-500 text-white' : 'bg-white border border-slate-300'}`}>No</button>
                    </div>
                  </div>
                </div>

                {/* Step 2: Technical Screening */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="text-sm font-semibold text-slate-700 mb-2">Step 2: Technical Screening Criteria</div>
                  <div className="space-y-2">
                    {['Meets quantitative threshold', 'Uses best available technology', 'Lifecycle assessment completed'].map((criteria) => (
                      <label key={criteria} className="flex items-center gap-2 text-sm">
                        <input type="checkbox"
                          checked={selectedActivity.step_technical?.[criteria] || false}
                          onChange={(e) => updateScreening('stepTechnical', { ...(selectedActivity.step_technical || {}), [criteria]: e.target.checked })}
                          className="rounded" />
                        <span className="text-slate-600">{criteria}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Step 3: DNSH */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="text-sm font-semibold text-slate-700 mb-2">Step 3: Do No Significant Harm (DNSH)</div>
                  <div className="grid grid-cols-2 gap-2">
                    {DNSH_OBJECTIVES.filter((o) => o !== selectedActivity.environmental_objective).map((obj) => (
                      <label key={obj} className="flex items-center gap-2 text-sm">
                        <input type="checkbox"
                          checked={selectedActivity.step_dnsh?.[obj] || false}
                          onChange={(e) => updateScreening('stepDnsh', { ...(selectedActivity.step_dnsh || {}), [obj]: e.target.checked })}
                          className="rounded" />
                        <span className="text-slate-600">{ENV_OBJECTIVES_LABELS[obj]}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Step 4: Social Safeguards */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-semibold text-slate-700">Step 4: Minimum Social Safeguards</div>
                      <div className="text-xs text-slate-400">OECD Guidelines & UN Guiding Principles on Business and Human Rights</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => updateScreening('stepSocial', true)}
                        className={`px-3 py-1 rounded text-xs font-medium ${selectedActivity.step_social === true ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-300'}`}>Compliant</button>
                      <button onClick={() => updateScreening('stepSocial', false)}
                        className={`px-3 py-1 rounded text-xs font-medium ${selectedActivity.step_social === false ? 'bg-red-500 text-white' : 'bg-white border border-slate-300'}`}>Non-compliant</button>
                    </div>
                  </div>
                </div>

                {/* Financial data */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="text-sm font-semibold text-slate-700 mb-2">Financial Data (EUR)</div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Turnover', field: 'turnoverEur', value: selectedActivity.turnover_eur },
                      { label: 'CapEx', field: 'capexEur', value: selectedActivity.capex_eur },
                      { label: 'OpEx', field: 'opexEur', value: selectedActivity.opex_eur },
                    ].map((f) => (
                      <div key={f.field}>
                        <label className="block text-xs text-slate-500 mb-1">{f.label}</label>
                        <input type="number" defaultValue={f.value || ''} onBlur={(e) => updateScreening(f.field, parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm" placeholder="0" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Result */}
                <div className={`rounded-lg p-4 text-center text-sm font-semibold ${
                  selectedActivity.is_aligned === true ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  selectedActivity.is_aligned === false ? 'bg-red-50 text-red-700 border border-red-200' :
                  'bg-slate-50 text-slate-400 border border-slate-200'
                }`}>
                  {selectedActivity.is_aligned === true ? '✓ TAXONOMY ALIGNED' :
                   selectedActivity.is_aligned === false ? '✗ NOT ALIGNED' : 'Complete all 4 steps to determine alignment'}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-200 min-h-[400px]">
              Add an activity to start screening
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
          <div className="text-4xl mb-3">TAX</div>
          <p className="text-slate-500 mb-4">No taxonomy assessments yet.</p>
          <button onClick={createAssessment} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium">Create Assessment</button>
        </div>
      )}
    </div>
  );
}

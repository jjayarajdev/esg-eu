import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../lib/api-client';
import { useAuth } from '../../../providers/AuthProvider';

interface DmaAssessment {
  id: string;
  name: string;
  status: string;
  methodology: any;
  created_at: string;
  finalized_at: string | null;
  topics?: Array<{ standard_code: string; standard_name: string; standard_category: string; impact_score: number | null; financial_score: number | null; is_material: boolean | null }>;
}

interface Period { id: string; name: string; }

const STATUS_CONFIG: Record<string, { bg: string; label: string }> = {
  draft: { bg: 'bg-slate-100 text-slate-600', label: 'Draft' },
  in_progress: { bg: 'bg-amber-100 text-amber-700', label: 'In Progress' },
  finalized: { bg: 'bg-emerald-100 text-emerald-700', label: 'Finalized' },
};

const CAT_COLORS: Record<string, string> = {
  environmental: 'bg-emerald-500',
  social: 'bg-blue-500',
  governance: 'bg-amber-500',
};

export function DmaListPage() {
  const { tenant } = useAuth();
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<DmaAssessment[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (tenant) { loadAssessments(); loadPeriods(); }
  }, [tenant]);

  async function loadAssessments() {
    const res = await api<{ data: DmaAssessment[] }>('/dma');
    // Load full details for each assessment
    const detailed = await Promise.all(
      res.data.map((a) => api<{ data: DmaAssessment }>(`/dma/${a.id}`).then((r) => r.data)),
    );
    setAssessments(detailed);
  }

  async function loadPeriods() {
    const res = await api<{ data: Period[] }>('/data/periods');
    setPeriods(res.data);
  }

  async function createAssessment() {
    if (periods.length === 0) { alert('Create a reporting period first.'); return; }
    setCreating(true);
    try {
      const res = await api<{ data: DmaAssessment }>('/dma', {
        method: 'POST',
        body: { reportingPeriodId: periods[0].id, name: `${periods[0].name} Double Materiality Assessment` },
      });
      navigate(`/dma/${res.data.id}`);
    } catch (err: any) { alert(err.message); }
    finally { setCreating(false); }
  }

  if (!tenant) return <p className="text-slate-500">Select a tenant first.</p>;

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-slate-500 text-sm mt-1 max-w-2xl">
            The Double Materiality Assessment determines which ESRS topics are material for your organization.
            Score each of the 10 topical standards on <strong>impact materiality</strong> (how you affect the world)
            and <strong>financial materiality</strong> (how sustainability risks affect your business).
          </p>
        </div>
        <button onClick={createAssessment} disabled={creating}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition-colors flex-shrink-0 disabled:opacity-50">
          {creating ? 'Creating...' : 'New Assessment'}
        </button>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { step: '1', title: 'Score Topics', desc: 'Rate severity, likelihood, magnitude, and probability for each ESRS standard', color: 'border-t-blue-500' },
          { step: '2', title: 'Review Matrix', desc: 'Visualize impact vs. financial materiality on a scatter plot', color: 'border-t-violet-500' },
          { step: '3', title: 'Finalize', desc: 'Lock material topics — they flow into reporting and data collection', color: 'border-t-emerald-500' },
        ].map((s) => (
          <div key={s.step} className={`bg-white rounded-xl border border-slate-200 border-t-4 ${s.color} p-5`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-600">{s.step}</span>
              <span className="font-semibold text-slate-800">{s.title}</span>
            </div>
            <p className="text-sm text-slate-500">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Assessments */}
      {assessments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
          <div className="text-4xl mb-3">DMA</div>
          <p className="text-slate-500 mb-4">No assessments yet. Create one to begin scoring ESRS topics.</p>
          <button onClick={createAssessment} disabled={creating}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition-colors">
            Create First Assessment
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {assessments.map((a) => {
            const scored = a.topics?.filter((t) => t.impact_score !== null).length || 0;
            const total = a.topics?.length || 10;
            const material = a.topics?.filter((t) => t.is_material === true).length || 0;
            const statusCfg = STATUS_CONFIG[a.status] || STATUS_CONFIG.draft;

            return (
              <div key={a.id}
                onClick={() => navigate(a.status === 'finalized' ? `/dma/${a.id}/matrix` : `/dma/${a.id}`)}
                className="bg-white rounded-xl border border-slate-200 p-5 cursor-pointer hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-semibold text-slate-800">{a.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Created {new Date(a.created_at).toLocaleDateString()}
                      {a.finalized_at && ` \u2014 Finalized ${new Date(a.finalized_at).toLocaleDateString()}`}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${statusCfg.bg}`}>
                    {statusCfg.label}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>{scored}/{total} topics scored</span>
                    {a.status === 'finalized' && <span className="text-emerald-600 font-medium">{material} material topics</span>}
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full">
                    <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${(scored / total) * 100}%` }} />
                  </div>
                </div>

                {/* Topic pills */}
                {a.topics && (
                  <div className="flex flex-wrap gap-1.5">
                    {a.topics.map((t) => (
                      <span key={t.standard_code} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${
                        t.is_material === true ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' :
                        t.is_material === false ? 'bg-slate-50 text-slate-400' :
                        t.impact_score !== null ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${CAT_COLORS[t.standard_category] || 'bg-slate-300'}`} />
                        {t.standard_code}
                        {t.impact_score !== null && <span className="text-[10px] opacity-60">{t.impact_score}/{t.financial_score}</span>}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

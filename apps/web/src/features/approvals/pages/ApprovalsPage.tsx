import { useEffect, useState } from 'react';
import { api } from '../../../lib/api-client';
import { useAuth } from '../../../providers/AuthProvider';

interface Workflow {
  id: string;
  entity_type: string;
  entity_id: string;
  status: string;
  current_step_order: number;
  total_steps: number;
  created_at: string;
  steps?: Step[];
}

interface Step {
  id: string;
  step_order: number;
  step_name: string;
  required_role: string;
  status: string;
  decision: string | null;
  comments: string | null;
  decided_at: string | null;
}

const WF_STATUS: Record<string, { bg: string; label: string }> = {
  pending: { bg: 'bg-amber-100 text-amber-700', label: 'Pending' },
  approved: { bg: 'bg-emerald-100 text-emerald-700', label: 'Approved' },
  rejected: { bg: 'bg-red-100 text-red-700', label: 'Rejected' },
};

const STEP_COLORS: Record<string, string> = {
  active: 'border-l-blue-500 bg-blue-50',
  completed: 'border-l-emerald-500',
  pending: 'border-l-slate-200',
};

export function ApprovalsPage() {
  const { tenant } = useAuth();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selected, setSelected] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tenant) loadWorkflows();
  }, [tenant]);

  async function loadWorkflows() {
    setLoading(true);
    const res = await api<{ data: Workflow[] }>('/workflows');
    setWorkflows(res.data);
    setLoading(false);
  }

  async function viewWorkflow(id: string) {
    const res = await api<{ data: Workflow }>(`/workflows/${id}`);
    setSelected(res.data);
  }

  async function approveStep(workflowId: string, stepId: string) {
    const comment = prompt('Approval comment (optional):') || 'Approved via platform';
    await api(`/workflows/${workflowId}/steps/${stepId}/approve`, {
      method: 'POST', body: { comments: comment },
    });
    viewWorkflow(workflowId);
    loadWorkflows();
  }

  async function rejectStep(workflowId: string, stepId: string) {
    const reason = prompt('Rejection reason (required):');
    if (!reason) return;
    await api(`/workflows/${workflowId}/steps/${stepId}/reject`, {
      method: 'POST', body: { comments: reason },
    });
    viewWorkflow(workflowId);
    loadWorkflows();
  }

  if (!tenant) return <p className="text-slate-500">Select a tenant to view approvals.</p>;

  const pendingCount = workflows.filter((w) => w.status === 'pending').length;
  const approvedCount = workflows.filter((w) => w.status === 'approved').length;
  const rejectedCount = workflows.filter((w) => w.status === 'rejected').length;

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 border-t-4 border-t-amber-500 p-4">
          <div className="text-sm text-slate-500">Pending Review</div>
          <div className="text-3xl font-bold text-slate-800 mt-1">{pendingCount}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 border-t-4 border-t-emerald-500 p-4">
          <div className="text-sm text-slate-500">Approved</div>
          <div className="text-3xl font-bold text-slate-800 mt-1">{approvedCount}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 border-t-4 border-t-red-500 p-4">
          <div className="text-sm text-slate-500">Rejected</div>
          <div className="text-3xl font-bold text-slate-800 mt-1">{rejectedCount}</div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-400">Loading workflows...</div>
      ) : workflows.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
          <div className="text-4xl mb-3">OK</div>
          <p className="text-slate-500 mb-2">No approval workflows yet.</p>
          <p className="text-sm text-slate-400">Submit data points for approval to create workflows.</p>
        </div>
      ) : (
        <div className="flex gap-6">
          {/* Workflow list */}
          <div className="w-80 flex-shrink-0 space-y-2">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Workflows</h3>
            {workflows.map((wf) => {
              const st = WF_STATUS[wf.status] || WF_STATUS.pending;
              return (
                <div key={wf.id} onClick={() => viewWorkflow(wf.id)}
                  className={`bg-white rounded-lg border p-4 cursor-pointer transition-all ${
                    selected?.id === wf.id ? 'border-blue-500 shadow-md ring-1 ring-blue-200' : 'border-slate-200 hover:border-slate-300'
                  }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-slate-800 text-sm capitalize">{wf.entity_type.replace('_', ' ')}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Step {wf.current_step_order}/{wf.total_steps}
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${st.bg}`}>
                      {st.label}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 bg-slate-100 rounded-full">
                    <div className={`h-full rounded-full transition-all ${
                      wf.status === 'approved' ? 'bg-emerald-500' : wf.status === 'rejected' ? 'bg-red-500' : 'bg-blue-500'
                    }`} style={{ width: `${(wf.current_step_order / wf.total_steps) * 100}%` }} />
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1.5">
                    {new Date(wf.created_at).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Step detail */}
          {selected ? (
            <div className="flex-1">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-800 capitalize">{selected.entity_type.replace('_', ' ')} Approval</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Entity ID: {selected.entity_id.slice(0, 8)}...</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${(WF_STATUS[selected.status] || WF_STATUS.pending).bg}`}>
                    {selected.status}
                  </span>
                </div>

                <div className="space-y-3">
                  {selected.steps?.map((step) => {
                    const colorCls = step.decision === 'approved' ? STEP_COLORS.completed :
                      step.decision === 'rejected' ? 'border-l-red-500 bg-red-50' :
                      step.status === 'active' ? STEP_COLORS.active : STEP_COLORS.pending;

                    return (
                      <div key={step.id} className={`border-l-4 rounded-lg border border-slate-100 p-4 ${colorCls}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-600">
                                {step.step_order}
                              </span>
                              <span className="font-medium text-slate-800 text-sm">{step.step_name}</span>
                            </div>
                            <div className="text-xs text-slate-400 mt-1 ml-8">
                              Required role: <span className="font-medium capitalize">{step.required_role.replace('_', ' ')}</span>
                              {step.decision && (
                                <span className={`ml-2 font-semibold ${step.decision === 'approved' ? 'text-emerald-600' : 'text-red-600'}`}>
                                  {step.decision}
                                </span>
                              )}
                              {step.decided_at && (
                                <span className="ml-2">{new Date(step.decided_at).toLocaleString()}</span>
                              )}
                            </div>
                            {step.comments && (
                              <div className="ml-8 mt-2 text-sm text-slate-600 bg-white rounded px-3 py-2 border border-slate-100 italic">
                                "{step.comments}"
                              </div>
                            )}
                          </div>

                          {step.status === 'active' && (
                            <div className="flex gap-2 flex-shrink-0">
                              <button onClick={() => approveStep(selected.id, step.id)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-lg font-medium transition-colors">
                                Approve
                              </button>
                              <button onClick={() => rejectStep(selected.id, step.id)}
                                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg font-medium transition-colors">
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-200 min-h-[300px]">
              Select a workflow to view details
            </div>
          )}
        </div>
      )}
    </div>
  );
}

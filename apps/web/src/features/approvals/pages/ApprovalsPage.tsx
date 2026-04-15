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

export function ApprovalsPage() {
  const { tenant } = useAuth();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selected, setSelected] = useState<Workflow | null>(null);

  useEffect(() => {
    if (tenant) loadWorkflows();
  }, [tenant]);

  async function loadWorkflows() {
    const res = await api<{ data: Workflow[] }>('/workflows');
    setWorkflows(res.data);
  }

  async function viewWorkflow(id: string) {
    const res = await api<{ data: Workflow }>(`/workflows/${id}`);
    setSelected(res.data);
  }

  async function approveStep(workflowId: string, stepId: string) {
    await api(`/workflows/${workflowId}/steps/${stepId}/approve`, {
      method: 'POST',
      body: { comments: 'Approved via UI' },
    });
    viewWorkflow(workflowId);
    loadWorkflows();
  }

  async function rejectStep(workflowId: string, stepId: string) {
    const reason = prompt('Rejection reason:');
    if (!reason) return;
    await api(`/workflows/${workflowId}/steps/${stepId}/reject`, {
      method: 'POST',
      body: { comments: reason },
    });
    viewWorkflow(workflowId);
    loadWorkflows();
  }

  if (!tenant) return <p>Select a tenant to view approvals.</p>;

  return (
    <div>
      <h2>Approval Workflows</h2>

      <div style={{ display: 'flex', gap: '2rem' }}>
        <div style={{ flex: 1 }}>
          <h3>Workflows</h3>
          {workflows.length === 0 ? (
            <p style={{ color: '#6b7280' }}>No workflows yet. Submit data points to create approval flows.</p>
          ) : (
            workflows.map((wf) => (
              <div
                key={wf.id}
                onClick={() => viewWorkflow(wf.id)}
                style={{
                  padding: '1rem',
                  border: `1px solid ${selected?.id === wf.id ? '#3b82f6' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  marginBottom: '0.5rem',
                  cursor: 'pointer',
                  background: selected?.id === wf.id ? '#f0f9ff' : 'white',
                }}
              >
                <div style={{ fontWeight: 600 }}>{wf.entity_type}</div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                  Step {wf.current_step_order}/{wf.total_steps} &middot;{' '}
                  <span style={{
                    color: wf.status === 'approved' ? '#10b981' : wf.status === 'rejected' ? '#ef4444' : '#f59e0b',
                  }}>
                    {wf.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {selected && (
          <div style={{ flex: 2 }}>
            <h3>Workflow Steps</h3>
            {selected.steps?.map((step) => (
              <div
                key={step.id}
                style={{
                  padding: '1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  marginBottom: '0.5rem',
                  borderLeft: `4px solid ${
                    step.decision === 'approved' ? '#10b981' :
                    step.decision === 'rejected' ? '#ef4444' :
                    step.status === 'active' ? '#3b82f6' : '#d1d5db'
                  }`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <strong>Step {step.step_order}: {step.step_name}</strong>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                      Role: {step.required_role} &middot; Status: {step.status}
                      {step.decision && ` (${step.decision})`}
                    </div>
                    {step.comments && (
                      <div style={{ fontSize: '0.8rem', marginTop: '0.25rem', fontStyle: 'italic' }}>
                        "{step.comments}"
                      </div>
                    )}
                  </div>
                  {step.status === 'active' && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => approveStep(selected.id, step.id)}
                        style={{ ...btnStyle, background: '#10b981' }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => rejectStep(selected.id, step.id)}
                        style={{ ...btnStyle, background: '#ef4444' }}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: '0.4rem 0.8rem',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.8rem',
};

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../lib/api-client';
import { useAuth } from '../../../providers/AuthProvider';

interface DmaAssessment {
  id: string;
  name: string;
  status: string;
  created_at: string;
  finalized_at: string | null;
}

interface Period {
  id: string;
  name: string;
}

export function DmaListPage() {
  const { tenant } = useAuth();
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<DmaAssessment[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (tenant) {
      loadAssessments();
      loadPeriods();
    }
  }, [tenant]);

  async function loadAssessments() {
    const res = await api<{ data: DmaAssessment[] }>('/dma');
    setAssessments(res.data);
  }

  async function loadPeriods() {
    const res = await api<{ data: Period[] }>('/data/periods');
    setPeriods(res.data);
  }

  async function createAssessment() {
    if (periods.length === 0) {
      alert('Create a reporting period first (Data Collection > enter a period).');
      return;
    }
    setCreating(true);
    try {
      const res = await api<{ data: DmaAssessment }>('/dma', {
        method: 'POST',
        body: {
          reportingPeriodId: periods[0].id,
          name: `${periods[0].name} Double Materiality Assessment`,
        },
      });
      navigate(`/dma/${res.data.id}`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  }

  if (!tenant) return <p>Select a tenant first.</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Double Materiality Assessment</h2>
        <button onClick={createAssessment} disabled={creating} style={primaryBtn}>
          {creating ? 'Creating...' : 'New Assessment'}
        </button>
      </div>

      <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
        Score each ESRS topic on impact materiality (how you affect the world) and financial materiality
        (how sustainability risks affect your business). Topics meeting the threshold become material and
        require reporting.
      </p>

      {assessments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', border: '1px dashed #d1d5db', borderRadius: '8px' }}>
          <p style={{ color: '#6b7280' }}>No assessments yet. Create one to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {assessments.map((a) => (
            <div
              key={a.id}
              onClick={() => navigate(a.status === 'finalized' ? `/dma/${a.id}/matrix` : `/dma/${a.id}`)}
              style={{
                padding: '1rem 1.5rem',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{a.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                  Created {new Date(a.created_at).toLocaleDateString()}
                  {a.finalized_at && ` — Finalized ${new Date(a.finalized_at).toLocaleDateString()}`}
                </div>
              </div>
              <span style={{
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                background: a.status === 'finalized' ? '#10b981' : a.status === 'in_progress' ? '#f59e0b' : '#6b7280',
                color: 'white',
              }}>
                {a.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const primaryBtn: React.CSSProperties = {
  padding: '0.5rem 1rem', background: '#3b82f6', color: 'white',
  border: 'none', borderRadius: '6px', cursor: 'pointer',
};

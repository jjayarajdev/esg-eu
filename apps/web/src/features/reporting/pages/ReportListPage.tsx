import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../lib/api-client';
import { useAuth } from '../../../providers/AuthProvider';

interface Report {
  id: string;
  status: string;
  metadata: { name: string; sections: any[] };
  created_at: string;
}

interface DmaAssessment { id: string; name: string; status: string; }
interface Period { id: string; name: string; }

export function ReportListPage() {
  const { tenant } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [dmaList, setDmaList] = useState<DmaAssessment[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (tenant) { loadReports(); loadDma(); loadPeriods(); }
  }, [tenant]);

  async function loadReports() {
    const res = await api<{ data: Report[] }>('/reports');
    setReports(res.data);
  }
  async function loadDma() {
    const res = await api<{ data: DmaAssessment[] }>('/dma');
    setDmaList(res.data.filter((d) => d.status === 'finalized'));
  }
  async function loadPeriods() {
    const res = await api<{ data: Period[] }>('/data/periods');
    setPeriods(res.data);
  }

  async function createReport() {
    if (dmaList.length === 0) { alert('Finalize a DMA assessment first.'); return; }
    if (periods.length === 0) { alert('Create a reporting period first.'); return; }
    setCreating(true);
    try {
      const res = await api<{ data: Report }>('/reports', {
        method: 'POST',
        body: {
          reportingPeriodId: periods[0].id,
          name: `${periods[0].name} ESRS Sustainability Report`,
          dmaAssessmentId: dmaList[0].id,
        },
      });
      navigate(`/reports/${res.data.id}`);
    } catch (err: any) { alert(err.message); }
    finally { setCreating(false); }
  }

  if (!tenant) return <p>Select a tenant first.</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>ESRS Reports</h2>
        <button onClick={createReport} disabled={creating} style={primaryBtn}>
          {creating ? 'Creating...' : 'Create Report from DMA'}
        </button>
      </div>

      {reports.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', border: '1px dashed #d1d5db', borderRadius: '8px' }}>
          <p style={{ color: '#6b7280' }}>No reports yet. Complete a DMA assessment, then create a report.</p>
        </div>
      ) : (
        reports.map((r) => (
          <div key={r.id} onClick={() => navigate(`/reports/${r.id}`)}
            style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '0.75rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600 }}>{r.metadata.name}</div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                {r.metadata.sections.length} sections | Created {new Date(r.created_at).toLocaleDateString()}
              </div>
            </div>
            <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' as const,
              background: r.status === 'finalized' ? '#10b981' : r.status === 'generated' ? '#3b82f6' : '#6b7280', color: 'white' }}>
              {r.status}
            </span>
          </div>
        ))
      )}
    </div>
  );
}

const primaryBtn: React.CSSProperties = { padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' };

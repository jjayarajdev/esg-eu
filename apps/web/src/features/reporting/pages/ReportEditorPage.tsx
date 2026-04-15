import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../../lib/api-client';

interface Section {
  standardCode: string;
  standardName: string;
  category: string;
  status: string;
  dataPoints: Array<{ metricCode: string; metricName: string; value: number | null; unit: string | null }>;
  narrative: string;
  narrativeSource: string;
}

interface Report {
  id: string;
  status: string;
  metadata: { name: string; sections: Section[] };
}

const CAT_COLORS: Record<string, string> = { environmental: '#10b981', social: '#3b82f6', governance: '#f59e0b' };

export function ReportEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [editNarrative, setEditNarrative] = useState('');

  useEffect(() => { if (id) loadReport(); }, [id]);
  useEffect(() => {
    if (report) setEditNarrative(report.metadata.sections[selectedIdx]?.narrative || '');
  }, [selectedIdx, report]);

  async function loadReport() {
    const res = await api<{ data: Report }>(`/reports/${id}`);
    setReport(res.data);
  }

  async function generateAll() {
    setGenerating(true);
    try {
      await api(`/reports/${id}/generate`, { method: 'POST' });
      await loadReport();
    } catch (err: any) { alert(err.message); }
    finally { setGenerating(false); }
  }

  async function generateSection(standardCode: string) {
    setGenerating(true);
    try {
      await api(`/reports/${id}/sections/${standardCode}/generate`, { method: 'POST' });
      await loadReport();
    } catch (err: any) { alert(err.message); }
    finally { setGenerating(false); }
  }

  async function saveNarrative() {
    if (!report) return;
    const section = report.metadata.sections[selectedIdx];
    await api(`/reports/${id}/sections/${section.standardCode}`, {
      method: 'PUT',
      body: { narrative: editNarrative },
    });
    await loadReport();
  }

  async function exportFile(path: string, filename: string) {
    try {
      const res = await fetch(`/api/v1${path}`, {
        headers: { 'X-Tenant-Id': (window as any).__tenantId || '' },
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) { alert(err.message); }
  }

  async function finalize() {
    try {
      await api(`/reports/${id}/finalize`, { method: 'POST' });
      await loadReport();
    } catch (err: any) { alert(err.message); }
  }

  if (!report) return <p>Loading...</p>;
  const section = report.metadata.sections[selectedIdx];
  const allGenerated = report.metadata.sections.every((s) => s.status !== 'pending');

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <button onClick={() => navigate('/reports')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>&larr;</button>
        <h2 style={{ margin: 0, flex: 1 }}>{report.metadata.name}</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {report.status !== 'finalized' && (
            <>
              <button onClick={generateAll} disabled={generating} style={{ ...btn, background: '#8b5cf6' }}>
                {generating ? 'Generating...' : 'Generate All AI Narratives'}
              </button>
              {allGenerated && (
                <button onClick={finalize} style={{ ...btn, background: '#10b981' }}>Finalize Report</button>
              )}
            </>
          )}
          {report.status === 'finalized' && (
            <button onClick={() => exportFile(`/reports/${id}/export/html`, `esrs-report-${id}.html`)} style={{ ...btn, background: '#1e40af' }}>
              Export HTML
            </button>
          )}
          {report.status === 'finalized' && (
            <button onClick={() => exportFile(`/xbrl/${id}`, `esrs-report-${id}.xhtml`)} style={{ ...btn, background: '#dc2626' }}>
              Export iXBRL
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem' }}>
        {/* Section nav */}
        <div style={{ width: '220px', flexShrink: 0 }}>
          <h3 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Sections</h3>
          {report.metadata.sections.map((s, i) => (
            <div key={s.standardCode} onClick={() => setSelectedIdx(i)}
              style={{
                padding: '0.5rem 0.75rem', borderRadius: '6px', cursor: 'pointer', marginBottom: '4px',
                background: i === selectedIdx ? '#f0f9ff' : 'white',
                borderLeft: `3px solid ${CAT_COLORS[s.category] || '#6b7280'}`,
              }}>
              <div style={{ fontWeight: i === selectedIdx ? 700 : 400, fontSize: '0.85rem' }}>{s.standardCode}</div>
              <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>{s.standardName}</div>
              <div style={{ fontSize: '0.65rem', marginTop: '2px' }}>
                <span style={{ color: s.status === 'pending' ? '#ef4444' : '#10b981' }}>{s.status}</span>
                {s.narrativeSource === 'ai_generated' && ' (AI)'}
              </div>
            </div>
          ))}
        </div>

        {/* Section detail */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>{section.standardCode} — {section.standardName}</h3>
            {report.status !== 'finalized' && (
              <button onClick={() => generateSection(section.standardCode)} disabled={generating}
                style={{ ...btn, background: '#8b5cf6', fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}>
                Generate AI Narrative
              </button>
            )}
          </div>

          {/* Data points */}
          {section.dataPoints.length > 0 && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: '1rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '0.4rem', textAlign: 'left' }}>Metric</th>
                  <th style={{ padding: '0.4rem', textAlign: 'right' }}>Value</th>
                  <th style={{ padding: '0.4rem', textAlign: 'left' }}>Unit</th>
                </tr>
              </thead>
              <tbody>
                {section.dataPoints.map((dp) => (
                  <tr key={dp.metricCode} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '0.4rem' }}>{dp.metricName}</td>
                    <td style={{ padding: '0.4rem', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                      {dp.value !== null ? dp.value.toLocaleString() : '—'}
                    </td>
                    <td style={{ padding: '0.4rem', color: '#6b7280' }}>{dp.unit || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Narrative editor */}
          <div style={{ marginTop: '1rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>
              Disclosure Narrative
              {section.narrativeSource === 'ai_generated' && (
                <span style={{ fontWeight: 400, fontSize: '0.75rem', color: '#8b5cf6', marginLeft: '0.5rem' }}>AI Generated</span>
              )}
            </label>
            <textarea
              value={editNarrative}
              onChange={(e) => setEditNarrative(e.target.value)}
              disabled={report.status === 'finalized'}
              style={{
                width: '100%', minHeight: '200px', padding: '0.75rem', borderRadius: '6px',
                border: '1px solid #d1d5db', fontSize: '0.85rem', lineHeight: 1.6,
                marginTop: '0.5rem', background: report.status === 'finalized' ? '#f9fafb' : 'white',
              }}
            />
            {report.status !== 'finalized' && editNarrative !== section.narrative && (
              <button onClick={saveNarrative} style={{ ...btn, marginTop: '0.5rem' }}>Save Changes</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const btn: React.CSSProperties = { padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' };

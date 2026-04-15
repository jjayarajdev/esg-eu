import { useEffect, useState } from 'react';
import { api } from '../../../lib/api-client';
import { useAuth } from '../../../providers/AuthProvider';

interface Connector {
  connectorType: string;
  displayName: string;
}

interface Run {
  id: string;
  connector_type: string;
  status: string;
  records_received: number;
  records_accepted: number;
  records_rejected: number;
  started_at: string;
  completed_at: string | null;
}

export function ConnectorsPage() {
  const { tenant } = useAuth();
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);

  useEffect(() => {
    if (tenant) {
      loadConnectors();
      loadRuns();
    }
  }, [tenant]);

  async function loadConnectors() {
    const res = await api<{ data: Connector[] }>('/connectors');
    setConnectors(res.data);
  }

  async function loadRuns() {
    const res = await api<{ data: Run[] }>('/connectors/runs');
    setRuns(res.data);
  }

  if (!tenant) return <p>Select a tenant to view connectors.</p>;

  return (
    <div>
      <h2>Connectors</h2>

      <h3>Available Adapters</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {connectors.map((c) => (
          <div key={c.connectorType} style={{
            padding: '1rem',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
          }}>
            <div style={{ fontWeight: 600 }}>{c.displayName}</div>
            <div style={{ fontSize: '0.8rem', color: '#6b7280', fontFamily: 'monospace' }}>{c.connectorType}</div>
          </div>
        ))}
      </div>

      <h3>Ingestion History</h3>
      {runs.length === 0 ? (
        <p style={{ color: '#6b7280' }}>No ingestion runs yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
              <th style={thStyle}>Connector</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Accepted</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Rejected</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((r) => (
              <tr key={r.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={tdStyle}>{r.connector_type}</td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>{r.records_accepted}</td>
                <td style={{ ...tdStyle, textAlign: 'right', color: r.records_rejected > 0 ? '#ef4444' : undefined }}>
                  {r.records_rejected}
                </td>
                <td style={tdStyle}>
                  <span style={{
                    color: r.status === 'completed' ? '#10b981' : r.status === 'partial' ? '#f59e0b' : '#6b7280',
                  }}>
                    {r.status}
                  </span>
                </td>
                <td style={{ ...tdStyle, color: '#6b7280' }}>
                  {new Date(r.started_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = { padding: '0.75rem 0.5rem', fontWeight: 600 };
const tdStyle: React.CSSProperties = { padding: '0.75rem 0.5rem' };

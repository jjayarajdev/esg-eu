import { useEffect, useState } from 'react';

interface HealthStatus {
  status: string;
  service: string;
  version: string;
  timestamp: string;
}

export function DashboardPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/v1/health')
      .then((res) => res.json())
      .then(setHealth)
      .catch(() => setError('API not reachable'));
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem',
        marginTop: '1rem',
      }}>
        <StatusCard
          title="API Status"
          value={health?.status ?? error ?? 'Loading...'}
          subtitle={health ? `v${health.version}` : ''}
          color={health?.status === 'ok' ? '#10b981' : '#ef4444'}
        />
        <StatusCard
          title="ESRS Standards"
          value="12"
          subtitle="E1-E5, S1-S4, G1, ESRS 1-2"
          color="#3b82f6"
        />
        <StatusCard
          title="Metrics"
          value="167"
          subtitle="Quantitative + Qualitative"
          color="#8b5cf6"
        />
        <StatusCard
          title="Departments"
          value="6"
          subtitle="HSE&S, HR, Sustainability, Procurement, Legal, PSRA"
          color="#f59e0b"
        />
      </div>
    </div>
  );
}

function StatusCard({
  title,
  value,
  subtitle,
  color,
}: {
  title: string;
  value: string;
  subtitle: string;
  color: string;
}) {
  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '1.5rem',
      borderTop: `3px solid ${color}`,
    }}>
      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{title}</div>
      <div style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.25rem' }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>{subtitle}</div>
    </div>
  );
}

import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './providers/AuthProvider';
import { DashboardPage } from './features/dashboard/pages/DashboardPage';
import { DataCollectionPage } from './features/data-collection/pages/DataCollectionPage';
import { ApprovalsPage } from './features/approvals/pages/ApprovalsPage';
import { ConnectorsPage } from './features/connectors/pages/ConnectorsPage';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  );
}

function AppShell() {
  const { tenant, tenants, loading, selectTenant, createTenant } = useAuth();
  const location = useLocation();

  async function handleCreateTenant() {
    const name = prompt('Company name:');
    if (!name) return;
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    await createTenant(name, slug);
  }

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh' }}>
      <header style={{
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.25rem' }}>EU ESG Platform</h1>
          <nav style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                style={{
                  textDecoration: 'none',
                  color: location.pathname === to ? '#3b82f6' : '#374151',
                  fontWeight: location.pathname === to ? 600 : 400,
                  borderBottom: location.pathname === to ? '2px solid #3b82f6' : '2px solid transparent',
                  paddingBottom: '2px',
                }}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {tenants.length > 0 ? (
            <select
              value={tenant?.id || ''}
              onChange={(e) => selectTenant(e.target.value)}
              style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
            >
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          ) : (
            <button onClick={handleCreateTenant} style={primaryBtn}>
              Create First Tenant
            </button>
          )}
        </div>
      </header>

      <main style={{ padding: '1.5rem 2rem' }}>
        {!tenant && tenants.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <h2>Welcome to EU ESG Platform</h2>
            <p style={{ color: '#6b7280' }}>Create your first tenant to get started.</p>
            <button onClick={handleCreateTenant} style={primaryBtn}>Create Tenant</button>
          </div>
        ) : (
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/data" element={<DataCollectionPage />} />
            <Route path="/approvals" element={<ApprovalsPage />} />
            <Route path="/connectors" element={<ConnectorsPage />} />
            <Route path="/dma" element={<PlaceholderPage title="Double Materiality Assessment" />} />
            <Route path="/reports" element={<PlaceholderPage title="Reports" />} />
          </Routes>
        )}
      </main>
    </div>
  );
}

const navLinks = [
  { to: '/', label: 'Dashboard' },
  { to: '/data', label: 'Data Collection' },
  { to: '/approvals', label: 'Approvals' },
  { to: '/connectors', label: 'Connectors' },
  { to: '/dma', label: 'DMA' },
  { to: '/reports', label: 'Reports' },
];

const primaryBtn: React.CSSProperties = {
  padding: '0.5rem 1rem',
  background: '#3b82f6',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
};

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div>
      <h2>{title}</h2>
      <p style={{ color: '#6b7280' }}>This module will be implemented in a future phase.</p>
    </div>
  );
}

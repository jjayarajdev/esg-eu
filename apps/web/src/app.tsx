import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { DashboardPage } from './features/dashboard/pages/DashboardPage';

export function App() {
  return (
    <BrowserRouter>
      <div style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
        <header style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem', marginBottom: '2rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>EU ESG Platform</h1>
          <nav style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
            <Link to="/">Dashboard</Link>
            <Link to="/dma">DMA</Link>
            <Link to="/data">Data Collection</Link>
            <Link to="/reports">Reports</Link>
            <Link to="/connectors">Connectors</Link>
          </nav>
        </header>

        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dma" element={<PlaceholderPage title="Double Materiality Assessment" />} />
          <Route path="/data" element={<PlaceholderPage title="Data Collection" />} />
          <Route path="/reports" element={<PlaceholderPage title="Reports" />} />
          <Route path="/connectors" element={<PlaceholderPage title="Connectors" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div>
      <h2>{title}</h2>
      <p style={{ color: '#6b7280' }}>This module will be implemented in a future phase.</p>
    </div>
  );
}

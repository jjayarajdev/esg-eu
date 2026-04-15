import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './providers/AuthProvider';
import { DashboardPage } from './features/dashboard/pages/DashboardPage';
import { DataCollectionPage } from './features/data-collection/pages/DataCollectionPage';
import { DataEntryPage } from './features/data-collection/pages/DataEntryPage';
import { ApprovalsPage } from './features/approvals/pages/ApprovalsPage';
import { ConnectorsPage } from './features/connectors/pages/ConnectorsPage';
import { DmaListPage } from './features/dma/pages/DmaListPage';
import { DmaWizardPage } from './features/dma/pages/DmaWizardPage';
import { MaterialityMatrixPage } from './features/dma/pages/MaterialityMatrixPage';
import { ReportListPage } from './features/reporting/pages/ReportListPage';
import { ReportEditorPage } from './features/reporting/pages/ReportEditorPage';
import { CsvUploadPage } from './features/data-collection/pages/CsvUploadPage';
import { SetupPage } from './features/settings/pages/SetupPage';
import { WorkflowBar } from './components/WorkflowBar';
import { OnboardingWizard } from './components/OnboardingWizard';
import { AiCopilot } from './components/chat/AiCopilot';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  );
}

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { to: '/', label: 'Dashboard', icon: '/' },
    ],
  },
  {
    label: 'Compliance',
    items: [
      { to: '/dma', label: 'DMA', icon: 'M' },
      { to: '/data', label: 'Data Collection', icon: 'D' },
      { to: '/reports', label: 'Reports', icon: 'R' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/approvals', label: 'Approvals', icon: 'A' },
      { to: '/connectors', label: 'Connectors', icon: 'C' },
      { to: '/setup', label: 'Setup', icon: 'S' },
    ],
  },
];

function AppShell() {
  const { tenant, tenants, loading, selectTenant, createTenant } = useAuth();
  const location = useLocation();

  async function handleCreateTenant() {
    const name = prompt('Company name:');
    if (!name) return;
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    await createTenant(name, slug);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-slate-400 text-lg">Loading platform...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-700">
          <div className="text-lg font-bold tracking-tight">EU ESG Platform</div>
          <div className="text-xs text-slate-400 mt-0.5">ESRS Compliance Suite</div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="mb-5">
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2 mb-2">
                {section.label}
              </div>
              {section.items.map((item) => {
                const isActive = item.to === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors mb-0.5 ${
                      isActive
                        ? 'bg-blue-600 text-white font-medium'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold ${
                      isActive ? 'bg-blue-500' : 'bg-slate-700'
                    }`}>
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Tenant selector */}
        <div className="p-3 border-t border-slate-700">
          {tenants.length > 0 ? (
            <select
              value={tenant?.id || ''}
              onChange={(e) => selectTenant(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          ) : (
            <button
              onClick={handleCreateTenant}
              className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
            >
              Create First Tenant
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h1 className="text-lg font-semibold text-slate-800">
              {NAV_SECTIONS.flatMap((s) => s.items).find((i) =>
                i.to === '/' ? location.pathname === '/' : location.pathname.startsWith(i.to),
              )?.label || 'EU ESG Platform'}
            </h1>
            {tenant && (
              <p className="text-xs text-slate-400 mt-0.5">{tenant.name}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">
              A
            </div>
          </div>
        </header>

        {/* Workflow progress bar */}
        <WorkflowBar />

        {/* Page content */}
        <div className="p-8">
          {!tenant && tenants.length === 0 ? (
            <OnboardingWizard onComplete={() => window.location.reload()} />
          ) : (
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/data" element={<DataCollectionPage />} />
              <Route path="/data/new" element={<DataEntryPage />} />
              <Route path="/data/upload" element={<CsvUploadPage />} />
              <Route path="/approvals" element={<ApprovalsPage />} />
              <Route path="/connectors" element={<ConnectorsPage />} />
              <Route path="/dma" element={<DmaListPage />} />
              <Route path="/dma/:id" element={<DmaWizardPage />} />
              <Route path="/dma/:id/matrix" element={<MaterialityMatrixPage />} />
              <Route path="/reports" element={<ReportListPage />} />
              <Route path="/reports/:id" element={<ReportEditorPage />} />
              <Route path="/setup" element={<SetupPage />} />
            </Routes>
          )}
        </div>
      </main>

      {/* AI Copilot floating chat */}
      <AiCopilot />
    </div>
  );
}

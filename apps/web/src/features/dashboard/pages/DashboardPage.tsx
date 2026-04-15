import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../lib/api-client';
import { useAuth } from '../../../providers/AuthProvider';

interface HealthStatus { status: string; version: string; }

export function DashboardPage() {
  const { tenant } = useAuth();
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [stats, setStats] = useState({ dataPoints: 0, reports: 0, dma: 0, connectorRuns: 0 });

  useEffect(() => {
    fetch('/api/v1/health').then((r) => r.json()).then(setHealth).catch(() => {});
    if (tenant) loadStats();
  }, [tenant]);

  async function loadStats() {
    try {
      const [dp, rpt, dma, runs] = await Promise.all([
        api<{ pagination: { totalCount: number } }>('/data/points?pageSize=1').catch(() => ({ pagination: { totalCount: 0 } })),
        api<{ data: any[] }>('/reports').catch(() => ({ data: [] })),
        api<{ data: any[] }>('/dma').catch(() => ({ data: [] })),
        api<{ data: any[] }>('/connectors/runs').catch(() => ({ data: [] })),
      ]);
      setStats({
        dataPoints: dp.pagination.totalCount,
        reports: rpt.data.length,
        dma: dma.data.length,
        connectorRuns: runs.data.length,
      });
    } catch {}
  }

  return (
    <div>
      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard label="API Status" value={health?.status === 'ok' ? 'Operational' : 'Checking...'} sub={`v${health?.version || '...'}`} color="emerald" />
        <StatCard label="Data Points" value={stats.dataPoints.toLocaleString()} sub="Metrics collected" color="blue" />
        <StatCard label="Reports" value={String(stats.reports)} sub="ESRS reports" color="violet" />
        <StatCard label="DMA Assessments" value={String(stats.dma)} sub="Materiality assessments" color="amber" />
      </div>

      {/* Quick actions */}
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <QuickAction to="/data/new" title="Enter Data" desc="Manually enter an ESRS metric value" color="blue" />
        <QuickAction to="/dma" title="Run DMA" desc="Score topics for double materiality" color="emerald" />
        <QuickAction to="/reports" title="Generate Report" desc="Create ESRS report with AI narratives" color="violet" />
      </div>

      {/* Platform overview */}
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Platform Coverage</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-sm font-medium text-slate-500 mb-3">ESRS Standards</div>
          <div className="space-y-2">
            {[
              { code: 'E1-E5', label: 'Environmental', count: 5, color: 'bg-emerald-100 text-emerald-700' },
              { code: 'S1-S4', label: 'Social', count: 4, color: 'bg-blue-100 text-blue-700' },
              { code: 'G1', label: 'Governance', count: 1, color: 'bg-amber-100 text-amber-700' },
              { code: 'ESRS 2', label: 'General Disclosures', count: 1, color: 'bg-slate-100 text-slate-700' },
            ].map((s) => (
              <div key={s.code} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${s.color}`}>{s.code}</span>
                  <span className="text-sm text-slate-600">{s.label}</span>
                </div>
                <span className="text-sm text-slate-400">{s.count} standard{s.count > 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-sm font-medium text-slate-500 mb-3">Connected Sources</div>
          <div className="space-y-2">
            {['Enablon (HSE&S)', 'SuccessFactors (HR)', 'EcoVadis (Procurement)', 'EthicsPoint (Legal)', 'Sphera (Product Safety)', 'CSV Upload'].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-sm text-slate-600">{s}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-sm font-medium text-slate-500 mb-3">Metrics by Department</div>
          <div className="space-y-2">
            {[
              { dept: 'HSE&S', pct: 44 },
              { dept: 'HR', pct: 22 },
              { dept: 'Sustainability', pct: 15 },
              { dept: 'Procurement', pct: 13 },
              { dept: 'Legal', pct: 4 },
              { dept: 'PSRA', pct: 2 },
            ].map((d) => (
              <div key={d.dept}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">{d.dept}</span>
                  <span className="text-slate-400">{d.pct}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${d.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  const colors: Record<string, string> = {
    emerald: 'border-t-emerald-500',
    blue: 'border-t-blue-500',
    violet: 'border-t-violet-500',
    amber: 'border-t-amber-500',
  };
  return (
    <div className={`bg-white rounded-xl border border-slate-200 border-t-4 ${colors[color]} p-5`}>
      <div className="text-sm text-slate-500">{label}</div>
      <div className="text-3xl font-bold text-slate-800 mt-1">{value}</div>
      <div className="text-xs text-slate-400 mt-1">{sub}</div>
    </div>
  );
}

function QuickAction({ to, title, desc, color }: { to: string; title: string; desc: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
    emerald: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200',
    violet: 'bg-violet-50 hover:bg-violet-100 border-violet-200',
  };
  return (
    <Link to={to} className={`block rounded-xl border p-5 transition-colors ${colors[color]}`}>
      <div className="font-semibold text-slate-800">{title}</div>
      <div className="text-sm text-slate-500 mt-1">{desc}</div>
    </Link>
  );
}

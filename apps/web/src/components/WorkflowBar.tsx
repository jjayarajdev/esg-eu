import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../lib/api-client';
import { useAuth } from '../providers/AuthProvider';

interface WorkflowStep {
  id: string;
  label: string;
  path: string;
  status: 'complete' | 'current' | 'upcoming';
  detail?: string;
}

export function WorkflowBar() {
  const { tenant } = useAuth();
  const location = useLocation();
  const [steps, setSteps] = useState<WorkflowStep[]>([]);

  useEffect(() => {
    if (tenant) checkProgress();
  }, [tenant, location.pathname]);

  async function checkProgress() {
    try {
      const [periodsRes, dataRes, dmaRes, reportsRes] = await Promise.all([
        api<{ data: any[] }>('/data/periods').catch(() => ({ data: [] })),
        api<{ pagination: { totalCount: number } }>('/data/points?pageSize=1').catch(() => ({ pagination: { totalCount: 0 } })),
        api<{ data: any[] }>('/dma').catch(() => ({ data: [] })),
        api<{ data: any[] }>('/reports').catch(() => ({ data: [] })),
      ]);

      const hasPeriods = periodsRes.data.length > 0;
      const hasData = dataRes.pagination.totalCount > 0;
      const hasDma = dmaRes.data.length > 0;
      const dmaFinalized = dmaRes.data.some((d: any) => d.status === 'finalized');
      const hasReports = reportsRes.data.length > 0;
      const reportFinalized = reportsRes.data.some((r: any) => r.status === 'finalized');

      const currentPath = location.pathname;

      const newSteps: WorkflowStep[] = [
        {
          id: 'setup', label: 'Setup', path: '/setup',
          status: hasPeriods ? 'complete' : currentPath.startsWith('/setup') ? 'current' : 'upcoming',
          detail: hasPeriods ? 'Tenant + period ready' : 'Create tenant & period',
        },
        {
          id: 'data', label: 'Collect Data', path: '/data',
          status: hasData ? 'complete' : currentPath.startsWith('/data') ? 'current' : 'upcoming',
          detail: hasData ? `${dataRes.pagination.totalCount} metrics` : 'Import or enter data',
        },
        {
          id: 'dma', label: 'DMA', path: '/dma',
          status: dmaFinalized ? 'complete' : hasDma ? 'current' : 'upcoming',
          detail: dmaFinalized ? 'Materiality assessed' : hasDma ? 'Scoring in progress' : 'Score 10 topics',
        },
        {
          id: 'report', label: 'Report', path: '/reports',
          status: reportFinalized ? 'complete' : hasReports ? 'current' : 'upcoming',
          detail: reportFinalized ? 'Finalized' : hasReports ? 'In progress' : 'Create ESRS report',
        },
        {
          id: 'narratives', label: 'AI Narratives', path: '/reports',
          status: reportFinalized ? 'complete' : 'upcoming',
          detail: reportFinalized ? 'Generated' : 'Generate disclosures',
        },
        {
          id: 'export', label: 'Export iXBRL', path: '/reports',
          status: reportFinalized ? 'complete' : 'upcoming',
          detail: reportFinalized ? 'Ready to download' : 'ESEF format',
        },
      ];

      setSteps(newSteps);
    } catch {}
  }

  if (!tenant || steps.length === 0) return null;

  const completedCount = steps.filter((s) => s.status === 'complete').length;
  const progressPct = (completedCount / steps.length) * 100;

  return (
    <div className="bg-white border-b border-slate-200 px-8 py-3">
      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">CSRD Journey</span>
        <div className="flex-1 h-1 bg-slate-100 rounded-full">
          <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
        </div>
        <span className="text-[10px] text-slate-400">{completedCount}/{steps.length}</span>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-1">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center">
            <Link
              to={step.path}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors ${
                step.status === 'complete'
                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  : step.status === 'current'
                  ? 'bg-blue-50 text-blue-700 font-semibold ring-1 ring-blue-200'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${
                step.status === 'complete'
                  ? 'bg-emerald-500 text-white'
                  : step.status === 'current'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-200 text-slate-500'
              }`}>
                {step.status === 'complete' ? '\u2713' : i + 1}
              </span>
              <span className="hidden md:inline">{step.label}</span>
              {step.detail && (
                <span className={`hidden lg:inline text-[10px] ${
                  step.status === 'complete' ? 'text-emerald-500' : step.status === 'current' ? 'text-blue-400' : 'text-slate-300'
                }`}>
                  {step.detail}
                </span>
              )}
            </Link>
            {i < steps.length - 1 && (
              <svg className="w-3 h-3 text-slate-300 mx-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

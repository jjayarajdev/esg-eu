import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../lib/api-client';
import { useAuth } from '../../../providers/AuthProvider';
import { DonutChart } from '../../../components/charts/DonutChart';
import { BarChart } from '../../../components/charts/BarChart';
import { ProgressRing } from '../../../components/charts/ProgressRing';
import { Heatmap } from '../../../components/charts/Heatmap';

interface DataPoint {
  metric_code: string; standard_code: string; numeric_value: number | null;
  status: string; data_source: string | null;
}

export function DashboardPage() {
  const { tenant } = useAuth();
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [stats, setStats] = useState({ reports: 0, dma: 0 });

  useEffect(() => {
    fetch('/api/v1/health').then((r) => r.json()).then(setHealth).catch(() => {});
    if (tenant) loadData();
  }, [tenant]);

  async function loadData() {
    try {
      const [dpRes, rptRes, dmaRes] = await Promise.all([
        api<{ data: DataPoint[]; pagination: { totalCount: number } }>('/data/points?pageSize=200').catch(() => ({ data: [], pagination: { totalCount: 0 } })),
        api<{ data: any[] }>('/reports').catch(() => ({ data: [] })),
        api<{ data: any[] }>('/dma').catch(() => ({ data: [] })),
      ]);
      setDataPoints(dpRes.data);
      setStats({ reports: rptRes.data.length, dma: dmaRes.data.length });
    } catch {}
  }

  // Compute chart data from real data points
  const emissions = {
    scope1: dataPoints.find((d) => d.metric_code === 'E1_6_GHG_SCOPE1')?.numeric_value || 0,
    scope2: dataPoints.find((d) => d.metric_code === 'E1_6_GHG_SCOPE2_LOCATION')?.numeric_value || 0,
    scope3: dataPoints.find((d) => d.metric_code === 'E1_6_GHG_SCOPE3_TOTAL')?.numeric_value || 0,
  };
  const totalEmissions = Number(emissions.scope1) + Number(emissions.scope2) + Number(emissions.scope3);

  const statusCounts = dataPoints.reduce((acc, dp) => {
    acc[dp.status] = (acc[dp.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sourceCounts = dataPoints.reduce((acc, dp) => {
    const src = (dp.data_source || 'manual').replace('mock_', '');
    acc[src] = (acc[src] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // ESRS coverage heatmap
  const standards = ['ESRS_2', 'E1', 'E2', 'E3', 'E4', 'E5', 'S1', 'S2', 'S3', 'S4', 'G1'];
  const totalMetricsByStd: Record<string, number> = {
    ESRS_2: 13, E1: 17, E2: 5, E3: 6, E4: 4, E5: 10, S1: 31, S2: 5, S3: 2, S4: 4, G1: 12,
  };
  const catByStd: Record<string, any> = {
    ESRS_2: 'cross_cutting', E1: 'environmental', E2: 'environmental', E3: 'environmental',
    E4: 'environmental', E5: 'environmental', S1: 'social', S2: 'social', S3: 'social',
    S4: 'social', G1: 'governance',
  };
  const heatmapCells = standards.map((std) => {
    const collected = dataPoints.filter((d) => d.standard_code === std).length;
    const total = totalMetricsByStd[std] || 1;
    return { label: std.replace('ESRS_', ''), value: Math.min(Math.round((collected / total) * 100), 100), category: catByStd[std] };
  });

  // Taxonomy data
  const taxTurnover = Number(dataPoints.find((d) => d.metric_code === 'TAX_TURNOVER_ALIGNED_PCT')?.numeric_value || 0);
  const taxCapex = Number(dataPoints.find((d) => d.metric_code === 'TAX_CAPEX_ALIGNED_PCT')?.numeric_value || 0);
  const taxOpex = Number(dataPoints.find((d) => d.metric_code === 'TAX_OPEX_ALIGNED_PCT')?.numeric_value || 0);

  return (
    <div>
      {/* Row 1: Key stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Data Points" value={dataPoints.length.toString()} sub="Metrics collected" color="blue" />
        <StatCard label="GHG Emissions" value={totalEmissions > 0 ? `${(totalEmissions / 1000).toFixed(0)}k` : '—'} sub="tCO2e (Scope 1+2+3)" color="emerald" />
        <StatCard label="Reports" value={String(stats.reports)} sub="ESRS sustainability" color="violet" />
        <StatCard label="DMA Assessments" value={String(stats.dma)} sub="Materiality assessments" color="amber" />
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Emissions Donut */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-sm font-semibold text-slate-700 mb-4">GHG Emissions Breakdown</div>
          {totalEmissions > 0 ? (
            <DonutChart
              segments={[
                { label: 'Scope 1 (Direct)', value: Number(emissions.scope1), color: '#ef4444' },
                { label: 'Scope 2 (Energy)', value: Number(emissions.scope2), color: '#f59e0b' },
                { label: 'Scope 3 (Value chain)', value: Number(emissions.scope3), color: '#6366f1' },
              ]}
              centerValue={`${(totalEmissions / 1000).toFixed(0)}k`}
              centerLabel="tCO2e"
            />
          ) : (
            <div className="text-sm text-slate-400 py-10 text-center">Import data to see emissions</div>
          )}
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-sm font-semibold text-slate-700 mb-4">Data Point Status</div>
          {dataPoints.length > 0 ? (
            <BarChart bars={[
              { label: 'Draft', value: statusCounts.draft || 0, color: '#94a3b8' },
              { label: 'Submitted', value: statusCounts.submitted || 0, color: '#f59e0b' },
              { label: 'Approved', value: statusCounts.approved || 0, color: '#10b981' },
              { label: 'Rejected', value: statusCounts.rejected || 0, color: '#ef4444' },
              { label: 'Published', value: statusCounts.published || 0, color: '#3b82f6' },
            ]} />
          ) : (
            <div className="text-sm text-slate-400 py-10 text-center">No data points yet</div>
          )}
        </div>

        {/* EU Taxonomy */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-sm font-semibold text-slate-700 mb-4">EU Taxonomy Alignment</div>
          {taxTurnover > 0 ? (
            <div className="space-y-4">
              {[
                { label: 'Turnover', aligned: taxTurnover },
                { label: 'CapEx', aligned: taxCapex },
                { label: 'OpEx', aligned: taxOpex },
              ].map((kpi) => (
                <div key={kpi.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 font-medium">{kpi.label}</span>
                    <span className="text-emerald-600 font-bold">{kpi.aligned}% aligned</span>
                  </div>
                  <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex">
                    <div className="h-full bg-emerald-500 rounded-l-full" style={{ width: `${kpi.aligned}%` }} />
                    <div className="h-full bg-emerald-200" style={{ width: `${Math.max(0, 62 - kpi.aligned)}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>Aligned</span><span>Eligible</span><span>Not eligible</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-400 py-10 text-center">Import SAP S/4HANA data</div>
          )}
        </div>
      </div>

      {/* Row 3: ESRS Heatmap + Sources + Departments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* ESRS Coverage Heatmap */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 lg:col-span-2">
          <div className="text-sm font-semibold text-slate-700 mb-4">ESRS Data Coverage</div>
          <Heatmap cells={heatmapCells} />
        </div>

        {/* Source distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-sm font-semibold text-slate-700 mb-4">Data Sources</div>
          {Object.keys(sourceCounts).length > 0 ? (
            <DonutChart
              size={140}
              thickness={22}
              segments={Object.entries(sourceCounts).slice(0, 6).map(([src, count], i) => ({
                label: src.replace(/_/g, ' '),
                value: count,
                color: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899'][i % 7],
              }))}
              centerValue={String(dataPoints.length)}
              centerLabel="total"
            />
          ) : (
            <div className="text-sm text-slate-400 py-10 text-center">No data yet</div>
          )}
        </div>
      </div>

      {/* Row 4: Quick actions */}
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/data/new" className="block rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 p-5 transition-colors">
          <div className="font-semibold text-slate-800">Enter Data</div>
          <div className="text-sm text-slate-500 mt-1">Manually enter an ESRS metric value</div>
        </Link>
        <Link to="/dma" className="block rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 p-5 transition-colors">
          <div className="font-semibold text-slate-800">Run DMA</div>
          <div className="text-sm text-slate-500 mt-1">Score topics for double materiality</div>
        </Link>
        <Link to="/reports" className="block rounded-xl border border-violet-200 bg-violet-50 hover:bg-violet-100 p-5 transition-colors">
          <div className="font-semibold text-slate-800">Generate Report</div>
          <div className="text-sm text-slate-500 mt-1">Create ESRS report with AI narratives</div>
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  const colors: Record<string, string> = { emerald: 'border-t-emerald-500', blue: 'border-t-blue-500', violet: 'border-t-violet-500', amber: 'border-t-amber-500' };
  return (
    <div className={`bg-white rounded-xl border border-slate-200 border-t-4 ${colors[color]} p-5`}>
      <div className="text-sm text-slate-500">{label}</div>
      <div className="text-3xl font-bold text-slate-800 mt-1">{value}</div>
      <div className="text-xs text-slate-400 mt-1">{sub}</div>
    </div>
  );
}

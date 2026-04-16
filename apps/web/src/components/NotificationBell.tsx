import { useEffect, useState } from 'react';
import { api } from '../lib/api-client';
import { useAuth } from '../providers/AuthProvider';

interface Notification {
  id: string;
  type: 'deadline' | 'gap' | 'approval' | 'info';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export function NotificationBell() {
  const { tenant } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (tenant) generateNotifications();
  }, [tenant]);

  async function generateNotifications() {
    // Generate smart notifications based on actual platform state
    const notifs: Notification[] = [];
    const now = new Date();

    try {
      // Check data gaps
      const dpRes = await api<{ pagination: { totalCount: number } }>('/data/points?pageSize=1').catch(() => ({ pagination: { totalCount: 0 } }));
      if (dpRes.pagination.totalCount === 0) {
        notifs.push({ id: 'gap-1', type: 'gap', title: 'No data collected', message: 'Import data from source systems or enter manually to begin.', time: 'Now', read: false });
      } else if (dpRes.pagination.totalCount < 50) {
        notifs.push({ id: 'gap-2', type: 'gap', title: 'Low data coverage', message: `Only ${dpRes.pagination.totalCount} of 109 ESRS metrics collected. Import from more sources.`, time: 'Now', read: false });
      }

      // Check DMA status
      const dmaRes = await api<{ data: any[] }>('/dma').catch(() => ({ data: [] }));
      if (dmaRes.data.length === 0) {
        notifs.push({ id: 'dma-1', type: 'info', title: 'DMA not started', message: 'Run a Double Materiality Assessment to determine which ESRS topics are material.', time: 'Recommended', read: false });
      } else if (!dmaRes.data.some((d: any) => d.status === 'finalized')) {
        notifs.push({ id: 'dma-2', type: 'approval', title: 'DMA in progress', message: 'Finalize your DMA assessment to enable report generation.', time: 'Action needed', read: false });
      }

      // Check reports
      const rptRes = await api<{ data: any[] }>('/reports').catch(() => ({ data: [] }));
      if (rptRes.data.length === 0 && dmaRes.data.some((d: any) => d.status === 'finalized')) {
        notifs.push({ id: 'rpt-1', type: 'info', title: 'Ready to create report', message: 'DMA is finalized. Create an ESRS report and generate AI narratives.', time: 'Ready', read: false });
      }

      // Check pending approvals
      const wfRes = await api<{ data: any[] }>('/workflows?status=pending').catch(() => ({ data: [] }));
      if (wfRes.data.length > 0) {
        notifs.push({ id: 'appr-1', type: 'approval', title: `${wfRes.data.length} pending approval(s)`, message: 'Data points are waiting for your review and approval.', time: 'Action needed', read: false });
      }

      // Simulated deadline notification
      notifs.push({ id: 'deadline-1', type: 'deadline', title: 'CSRD reporting deadline', message: 'Wave 2 companies must submit FY2027 reports by April 2028. Plan your data collection timeline.', time: 'Upcoming', read: true });

      // Supply chain notification
      const scRes = await api<{ data: any[] }>('/supply-chain/campaigns').catch(() => ({ data: [] }));
      if (scRes.data.length > 0) {
        const pending = scRes.data.reduce((acc: number, c: any) => acc + (c.inviteCounts?.pending || 0), 0);
        if (pending > 0) {
          notifs.push({ id: 'sc-1', type: 'info', title: `${pending} supplier response(s) pending`, message: 'Suppliers have been invited but have not yet submitted their ESG data.', time: 'Waiting', read: false });
        }
      }
    } catch {}

    setNotifications(notifs);
  }

  const unread = notifications.filter((n) => !n.read).length;

  const TYPE_ICONS: Record<string, { bg: string; icon: string }> = {
    deadline: { bg: 'bg-red-100 text-red-600', icon: '!' },
    gap: { bg: 'bg-amber-100 text-amber-600', icon: '?' },
    approval: { bg: 'bg-blue-100 text-blue-600', icon: 'A' },
    info: { bg: 'bg-slate-100 text-slate-600', icon: 'i' },
  };

  if (!tenant) return null;

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{unread}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 max-h-[400px] overflow-y-auto">
          <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center">
            <span className="font-semibold text-slate-800 text-sm">Notifications</span>
            <span className="text-[10px] text-slate-400">{unread} unread</span>
          </div>
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">No notifications</div>
          ) : (
            notifications.map((n) => {
              const ti = TYPE_ICONS[n.type] || TYPE_ICONS.info;
              return (
                <div key={n.id} className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50 ${n.read ? 'opacity-60' : ''}`}>
                  <div className="flex gap-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${ti.bg}`}>{ti.icon}</span>
                    <div>
                      <div className="text-sm font-medium text-slate-700">{n.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{n.message}</div>
                      <div className="text-[10px] text-slate-400 mt-1">{n.time}</div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

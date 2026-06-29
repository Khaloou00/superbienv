import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useGetStaffStatsQuery } from '../../store/api/bookingsApi';
import StaffLayout from './StaffLayout';

export default function StaffTickets() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [applied, setApplied] = useState({});

  const { data: stats, refetch } = useGetStaffStatsQuery(applied, { pollingInterval: 60000 });

  const applyFilter = () => {
    const f = {};
    if (from) f.from = from;
    if (to) f.to = to;
    setApplied(f);
  };

  return (
    <StaffLayout title="Tickets">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface border border-white/5 rounded-2xl p-4 text-center">
            <p className="font-headline text-4xl font-bold text-gold leading-none">{stats?.ticketsScannesToday ?? '—'}</p>
            <p className="text-muted text-xs font-label mt-2">Scans aujourd'hui</p>
          </div>
          <div className="bg-surface border border-white/5 rounded-2xl p-4 text-center">
            <p className="font-headline text-4xl font-bold text-white leading-none">{stats?.ticketsScannesTotal ?? '—'}</p>
            <p className="text-muted text-xs font-label mt-2">Total scanné</p>
          </div>
        </div>

        <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-label font-semibold text-sm">Historique des scans</h3>
            <button onClick={() => refetch()} className="text-muted hover:text-white transition-colors p-1" title="Actualiser">
              <RefreshCw size={15} />
            </button>
          </div>

          <div className="p-4 border-b border-white/5 space-y-3">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs font-label text-muted block mb-1.5">Du</label>
                <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
                  className="w-full bg-night border border-white/10 text-white rounded-xl px-3 py-3 text-base focus:outline-none focus:border-gold transition-colors" />
              </div>
              <div className="flex-1">
                <label className="text-xs font-label text-muted block mb-1.5">Au</label>
                <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
                  className="w-full bg-night border border-white/10 text-white rounded-xl px-3 py-3 text-base focus:outline-none focus:border-gold transition-colors" />
              </div>
            </div>
            <button onClick={applyFilter}
              className="w-full py-3 bg-gold text-night rounded-xl text-sm font-label font-semibold hover:bg-gold/90 active:scale-95 transition-all">
              Appliquer le filtre
            </button>
          </div>

          {stats?.ticketsScannesParJour?.length > 0 ? (
            <div className="divide-y divide-white/5">
              {stats.ticketsScannesParJour.map((row) => (
                <div key={row.date} className="px-4 py-3.5 flex items-center justify-between">
                  <span className="text-muted text-sm font-label">{row.date}</span>
                  <span className="text-white font-label font-semibold text-sm">{row.count} billet{row.count > 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-muted text-sm font-label">Aucun scan dans cette période</div>
          )}
        </div>
      </div>
    </StaffLayout>
  );
}

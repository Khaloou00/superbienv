import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import {
  TrendingUp, Ticket, Users, Gauge, Filter, RotateCcw, Trophy, CreditCard, Clapperboard,
} from 'lucide-react';
import { useGetBookingAnalyticsQuery } from '../../store/api/bookingsApi';
import { useGetFilmsQuery } from '../../store/api/filmsApi';

const PALETTE = ['#F5C518', '#4ade80', '#60a5fa', '#f87171', '#a78bfa', '#fb923c'];
const STATUTS = [
  { value: '', label: 'Tous statuts' },
  { value: 'active', label: 'Active' },
  { value: 'utilisée', label: 'Utilisée' },
  { value: 'annulée', label: 'Annulée' },
];
const fcfa = (v) => `${(v ?? 0).toLocaleString('fr-CI')} F`;
const isoDaysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().split('T')[0]; };
const isoToday = () => new Date().toISOString().split('T')[0];

const tooltipStyle = { background: '#141414', border: '1px solid rgba(245,197,24,0.2)', borderRadius: 8, color: '#fff', fontSize: 12 };

export default function BookingAnalytics() {
  const [from, setFrom] = useState(isoDaysAgo(30));
  const [to, setTo] = useState(isoToday());
  const [filmId, setFilmId] = useState('');
  const [statut, setStatut] = useState('');

  const { data: filmsData } = useGetFilmsQuery({ scope: 'all', limit: 100 });
  const { data, isFetching } = useGetBookingAnalyticsQuery({
    ...(from && { from }), ...(to && { to }), ...(filmId && { filmId }), ...(statut && { statut }),
  });

  const kpi = data?.kpi ?? {};
  const timeseries = useMemo(
    () => (data?.timeseries ?? []).map((t) => ({ ...t, label: new Date(t.date).toLocaleDateString('fr-CI', { day: '2-digit', month: '2-digit' }) })),
    [data]
  );

  const preset = (days) => { setFrom(isoDaysAgo(days)); setTo(isoToday()); };
  const reset = () => { setFrom(isoDaysAgo(30)); setTo(isoToday()); setFilmId(''); setStatut(''); };

  const kpiCards = [
    { label: "Chiffre d'affaires", value: fcfa(kpi.ca), icon: TrendingUp, color: 'text-gold' },
    { label: 'Réservations', value: kpi.nbReservations ?? 0, icon: Ticket, color: 'text-blue-400' },
    { label: 'Billets utilisés', value: kpi.billetsUtilises ?? 0, icon: Users, color: 'text-green-400' },
    { label: 'Taux de remplissage', value: `${kpi.remplissageGlobal ?? 0}%`, icon: Gauge, color: 'text-cinema' },
  ];

  return (
    <div className="space-y-5">
      {/* ── Filtres ── */}
      <div className="bg-surface rounded-2xl border border-white/5 p-4">
        <div className="flex items-center gap-2 text-muted mb-3">
          <Filter size={15} /><span className="text-sm font-label">Filtres</span>
          {isFetching && <span className="text-[10px] text-gold animate-pulse ml-1">chargement…</span>}
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-[11px] font-label text-muted block mb-1">Du</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
              className="bg-night border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-gold" />
          </div>
          <div>
            <label className="text-[11px] font-label text-muted block mb-1">Au</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
              className="bg-night border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-gold" />
          </div>
          <div className="min-w-[140px]">
            <label className="text-[11px] font-label text-muted block mb-1">Film</label>
            <select value={filmId} onChange={(e) => setFilmId(e.target.value)}
              className="w-full bg-night border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-gold">
              <option value="">Tous les films</option>
              {filmsData?.films?.map((f) => <option key={f._id} value={f._id}>{f.titre}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-label text-muted block mb-1">Statut</label>
            <select value={statut} onChange={(e) => setStatut(e.target.value)}
              className="bg-night border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-gold">
              {STATUTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div className="flex gap-1.5 items-center">
            {[7, 30, 90].map((d) => (
              <button key={d} onClick={() => preset(d)}
                className="text-xs font-label text-muted hover:text-gold bg-night border border-white/10 hover:border-gold/40 rounded-lg px-2.5 py-2 transition-colors">
                {d}j
              </button>
            ))}
            <button onClick={reset} className="text-muted hover:text-cinema p-2" title="Réinitialiser"><RotateCcw size={15} /></button>
          </div>
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpiCards.map(({ label, value, icon: Icon, color }, i) => (
          <motion.div key={label} className="bg-surface rounded-2xl p-4 sm:p-5 border border-white/5"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <div className={`w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center mb-3 ${color}`}>
              <Icon size={16} />
            </div>
            <p className="font-headline font-bold text-xl sm:text-2xl text-white leading-none">{value}</p>
            <p className="text-muted text-xs font-label mt-1">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Évolution dans le temps ── */}
      <div className="bg-surface rounded-2xl p-4 sm:p-6 border border-white/5">
        <h3 className="font-label font-semibold mb-4 text-sm flex items-center gap-2">
          <TrendingUp size={15} className="text-gold" /> Évolution du chiffre d'affaires
        </h3>
        {timeseries.length === 0 ? (
          <p className="text-muted text-sm py-12 text-center font-label">Aucune donnée sur cette période.</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={timeseries} margin={{ left: -10 }}>
              <defs>
                <linearGradient id="caGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F5C518" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#F5C518" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="label" tick={{ fill: '#A0A0A0', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#A0A0A0', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => n === 'ca' ? [fcfa(v), 'Recettes'] : [v, 'Réservations']} />
              <Area type="monotone" dataKey="ca" stroke="#F5C518" strokeWidth={2} fill="url(#caGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ── Top films ── */}
        <div className="bg-surface rounded-2xl p-4 sm:p-6 border border-white/5">
          <h3 className="font-label font-semibold mb-4 text-sm flex items-center gap-2">
            <Trophy size={15} className="text-gold" /> Top films (CA)
          </h3>
          {(data?.topFilms?.length ?? 0) === 0 ? (
            <p className="text-muted text-sm py-8 text-center font-label">Aucune réservation.</p>
          ) : (
            <div className="space-y-2.5">
              {data.topFilms.map((f, i) => {
                const max = data.topFilms[0].ca || 1;
                return (
                  <div key={f._id} className="flex items-center gap-3">
                    <span className="text-xs font-label text-muted w-4">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-xs text-white truncate font-label">{f.titre}</span>
                        <span className="text-xs text-gold font-label flex-shrink-0 ml-2">{fcfa(f.ca)}</span>
                      </div>
                      <div className="h-1.5 bg-night rounded-full overflow-hidden">
                        <div className="h-full bg-gold rounded-full" style={{ width: `${(f.ca / max) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Répartition paiements ── */}
        <div className="bg-surface rounded-2xl p-4 sm:p-6 border border-white/5">
          <h3 className="font-label font-semibold mb-4 text-sm flex items-center gap-2">
            <CreditCard size={15} className="text-gold" /> Méthodes de paiement
          </h3>
          {(data?.parMethode?.length ?? 0) === 0 ? (
            <p className="text-muted text-sm py-8 text-center font-label">Aucune donnée.</p>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={160}>
                <PieChart>
                  <Pie data={data.parMethode} dataKey="ca" nameKey="methode" innerRadius={40} outerRadius={70} paddingAngle={2}>
                    {data.parMethode.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => fcfa(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {data.parMethode.map((m, i) => (
                  <div key={m.methode} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PALETTE[i % PALETTE.length] }} />
                    <span className="text-white font-label flex-1 truncate">{m.methode}</span>
                    <span className="text-muted">{m.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Stats par séance ── */}
      <div className="bg-surface rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center gap-2">
          <Clapperboard size={15} className="text-gold" />
          <h3 className="font-label font-semibold text-sm">Statistiques par séance</h3>
        </div>
        {(data?.parSeance?.length ?? 0) === 0 ? (
          <p className="text-muted text-sm py-10 text-center font-label">Aucune séance avec réservation sur cette période.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="text-muted font-label text-xs border-b border-white/5">
                  {['Film', 'Séance', 'Vendues', 'VIP', 'Remplissage', 'CA'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.parSeance.map((s) => (
                  <tr key={s.seanceId} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-xs truncate max-w-[160px]">{s.titre}</td>
                    <td className="px-4 py-3 text-muted text-xs whitespace-nowrap">
                      {new Date(s.date).toLocaleDateString('fr-CI', { day: '2-digit', month: '2-digit', year: '2-digit' })} · {s.heure}
                    </td>
                    <td className="px-4 py-3 font-label text-xs">{s.vendues}/{s.placesTotal}</td>
                    <td className="px-4 py-3 text-muted text-xs">{s.vip}</td>
                    <td className="px-4 py-3 w-32">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-night rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${s.remplissage >= 80 ? 'bg-green-400' : s.remplissage >= 40 ? 'bg-gold' : 'bg-cinema'}`}
                            style={{ width: `${Math.min(100, s.remplissage)}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-muted w-8 text-right">{s.remplissage}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gold font-label text-xs whitespace-nowrap">{fcfa(s.ca)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

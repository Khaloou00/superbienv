import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, AlertTriangle, Send, Inbox } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useGetNotificationsQuery, useMarkReadMutation, useMarkAllReadMutation, useCreateReportMutation,
} from '../store/api/notificationsApi';

const CATEGORIES = [
  { value: 'technique', label: 'Technique' },
  { value: 'securite', label: 'Sécurité' },
  { value: 'client', label: 'Client' },
  { value: 'autre', label: 'Autre' },
];
const PRIORITES = [
  { value: 'normale', label: 'Normale' },
  { value: 'haute', label: 'Haute' },
  { value: 'urgente', label: 'Urgente' },
];
const PRIO_CFG = {
  normale: 'bg-white/5 text-muted',
  haute: 'bg-amber-900/30 text-amber-400',
  urgente: 'bg-cinema/20 text-cinema',
};
const CAT_LABEL = { info: 'Info', technique: 'Technique', securite: 'Sécurité', client: 'Client', autre: 'Autre' };

const timeAgo = (d) => {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return "à l'instant";
  if (s < 3600) return `il y a ${Math.floor(s / 60)} min`;
  if (s < 86400) return `il y a ${Math.floor(s / 3600)} h`;
  return new Date(d).toLocaleDateString('fr-CI', { day: 'numeric', month: 'short' });
};

// canReport : affiche le formulaire de signalement (staff). Sinon, boîte de réception seule (client).
export default function NotificationsView({ canReport = false }) {
  const { data, isLoading } = useGetNotificationsQuery();
  const [markRead] = useMarkReadMutation();
  const [markAllRead] = useMarkAllReadMutation();
  const [createReport, { isLoading: isSending }] = useCreateReportMutation();

  const [form, setForm] = useState({ titre: '', message: '', categorie: 'technique', priorite: 'normale' });
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const notifications = data?.notifications ?? [];

  const handleOpen = (n) => { if (!n.read) markRead(n._id); };

  const handleReport = async (e) => {
    e.preventDefault();
    if (!form.message.trim()) { toast.error('Décris le problème'); return; }
    try {
      await createReport(form).unwrap();
      toast.success('Signalement envoyé à l’admin');
      setForm({ titre: '', message: '', categorie: 'technique', priorite: 'normale' });
    } catch (err) {
      toast.error(err.data?.message || 'Erreur lors de l’envoi');
    }
  };

  return (
    <div className="space-y-4">
      {/* Formulaire de signalement (staff) */}
      {canReport && (
        <div className="bg-surface border border-white/5 rounded-2xl p-4">
          <h3 className="font-label font-semibold text-sm flex items-center gap-2 mb-3">
            <AlertTriangle size={15} className="text-amber-400" /> Signaler un problème à l’admin
          </h3>
          <form onSubmit={handleReport} className="space-y-3">
            <input
              value={form.titre} onChange={set('titre')} placeholder="Titre (optionnel)"
              className="w-full bg-night border border-white/10 text-white text-sm rounded-xl px-3 py-2.5 placeholder:text-muted focus:outline-none focus:border-gold"
            />
            <div className="grid grid-cols-2 gap-2">
              <select value={form.categorie} onChange={set('categorie')}
                className="bg-night border border-white/10 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-gold">
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <select value={form.priorite} onChange={set('priorite')}
                className="bg-night border border-white/10 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-gold">
                {PRIORITES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <textarea
              value={form.message} onChange={set('message')} rows={3} placeholder="Décris le problème rencontré…"
              className="w-full bg-night border border-white/10 text-white text-sm rounded-xl px-3 py-2.5 placeholder:text-muted focus:outline-none focus:border-gold resize-none"
            />
            <button type="submit" disabled={isSending}
              className="w-full flex items-center justify-center gap-2 bg-gold text-night font-label font-semibold text-sm rounded-xl py-2.5 hover:bg-gold/90 disabled:opacity-50 transition-colors">
              <Send size={15} /> {isSending ? 'Envoi…' : 'Envoyer le signalement'}
            </button>
          </form>
        </div>
      )}

      {/* Boîte de réception */}
      <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-label font-semibold text-sm flex items-center gap-2">
            <Bell size={15} className="text-gold" /> Notifications
          </h3>
          {notifications.some((n) => !n.read) && (
            <button onClick={() => markAllRead()}
              className="flex items-center gap-1.5 text-xs font-label text-muted hover:text-gold transition-colors">
              <CheckCheck size={14} /> Tout marquer lu
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="p-6 space-y-2">
            {[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-night rounded-xl animate-pulse" />)}
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-14 text-center">
            <Inbox size={36} className="text-muted mx-auto mb-3" />
            <p className="text-muted text-sm font-label">Aucune notification.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {notifications.map((n, i) => (
              <motion.button
                key={n._id}
                onClick={() => handleOpen(n)}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                className={`w-full text-left px-4 py-3.5 flex gap-3 transition-colors hover:bg-white/[0.02] ${n.read ? '' : 'bg-gold/[0.04]'}`}
              >
                <div className="mt-1 flex-shrink-0">
                  <span className={`block w-2 h-2 rounded-full ${n.read ? 'bg-transparent' : 'bg-gold'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    {n.kind === 'report' && <span className="text-[10px] font-label text-amber-400 uppercase">Signalement</span>}
                    {n.titre && <span className="text-sm font-label text-white truncate">{n.titre}</span>}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-label ${PRIO_CFG[n.priorite] ?? PRIO_CFG.normale}`}>
                      {CAT_LABEL[n.categorie] ?? n.categorie}
                    </span>
                  </div>
                  <p className="text-sm text-muted line-clamp-2">{n.message}</p>
                  <p className="text-[11px] text-muted/60 mt-1">
                    {n.sender?.nom ? `${n.sender.nom} · ` : ''}{timeAgo(n.createdAt)}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

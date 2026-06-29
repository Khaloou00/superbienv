import { useMemo, useState } from 'react';
import { Send, Megaphone } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGetRecipientsQuery, useSendNotificationMutation } from '../../store/api/notificationsApi';
import NotificationsView from '../../components/NotificationsView';

const CATEGORIES = [
  { value: 'info', label: 'Info' },
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

export default function AdminMessages() {
  const { data: rec } = useGetRecipientsQuery();
  const [sendNotification, { isLoading }] = useSendNotificationMutation();

  const [target, setTarget] = useState('all_staff');
  const [form, setForm] = useState({ titre: '', message: '', categorie: 'info', priorite: 'normale' });
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  // Options de ciblage : diffusions + chaque membre individuel
  const targets = useMemo(() => {
    const staff = rec?.staff ?? [];
    const clients = rec?.clients ?? [];
    return [
      { key: 'all_staff', label: '📢 Tout le staff', audience: 'all_staff' },
      { key: 'all_clients', label: '📢 Tous les clients', audience: 'all_clients' },
      ...staff.map((s) => ({ key: `u:${s._id}`, label: `👤 ${s.nom} — staff`, audience: 'user', recipient: s._id })),
      ...clients.map((c) => ({ key: `u:${c._id}`, label: `👤 ${c.nom} — client`, audience: 'user', recipient: c._id })),
    ];
  }, [rec]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.message.trim()) { toast.error('Le message est requis'); return; }
    const t = targets.find((x) => x.key === target);
    if (!t) { toast.error('Choisis un destinataire'); return; }
    try {
      await sendNotification({
        audience: t.audience,
        recipient: t.recipient,
        titre: form.titre,
        message: form.message,
        categorie: form.categorie,
        priorite: form.priorite,
      }).unwrap();
      toast.success('Message envoyé');
      setForm({ titre: '', message: '', categorie: 'info', priorite: 'normale' });
    } catch (err) {
      toast.error(err.data?.message || "Erreur lors de l'envoi");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Composer */}
      <div className="bg-surface border border-white/5 rounded-2xl p-4 sm:p-5 h-fit">
        <h3 className="font-label font-semibold text-sm flex items-center gap-2 mb-4">
          <Megaphone size={15} className="text-gold" /> Envoyer un message
        </h3>
        <form onSubmit={handleSend} className="space-y-3">
          <div>
            <label className="text-xs font-label text-muted block mb-1">Destinataire</label>
            <select value={target} onChange={(e) => setTarget(e.target.value)}
              className="w-full bg-night border border-white/10 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-gold">
              {targets.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
            </select>
          </div>

          <input value={form.titre} onChange={set('titre')} placeholder="Titre (optionnel)"
            className="w-full bg-night border border-white/10 text-white text-sm rounded-xl px-3 py-2.5 placeholder:text-muted focus:outline-none focus:border-gold" />

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

          <textarea value={form.message} onChange={set('message')} rows={4} placeholder="Votre message…"
            className="w-full bg-night border border-white/10 text-white text-sm rounded-xl px-3 py-2.5 placeholder:text-muted focus:outline-none focus:border-gold resize-none" />

          <button type="submit" disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-gold text-night font-label font-semibold text-sm rounded-xl py-2.5 hover:bg-gold/90 disabled:opacity-50 transition-colors">
            <Send size={15} /> {isLoading ? 'Envoi…' : 'Envoyer'}
          </button>
        </form>
      </div>

      {/* Boîte de réception (signalements du staff + messages reçus) */}
      <div>
        <NotificationsView canReport={false} />
      </div>
    </div>
  );
}

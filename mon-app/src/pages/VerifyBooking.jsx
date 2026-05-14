import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const BASE = import.meta.env.VITE_API_URL ?? '';

const STATUS_CONFIG = {
  active: {
    icon: '✅',
    label: 'RÉSERVATION VALIDE',
    color: '#34d399',
    border: 'border-emerald-500/40',
    bg: 'bg-emerald-500/10',
  },
  utilisée: {
    icon: '⚠️',
    label: 'DÉJÀ UTILISÉE',
    color: '#fb923c',
    border: 'border-orange-500/40',
    bg: 'bg-orange-500/10',
  },
  annulée: {
    icon: '❌',
    label: 'RÉSERVATION ANNULÉE',
    color: '#f87171',
    border: 'border-red-500/40',
    bg: 'bg-red-500/10',
  },
};

function Row({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
      <span style={{ color: '#A0A0A0' }} className="text-xs uppercase tracking-wider">{label}</span>
      <span className="text-white font-medium text-sm text-right">{value}</span>
    </div>
  );
}

export default function VerifyBooking() {
  const { numero } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE}/api/bookings/verify/${encodeURIComponent(numero)}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ valid: false, message: 'Erreur de connexion' }))
      .finally(() => setLoading(false));
  }, [numero]);

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ background: '#0a0a0a' }} className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        <span style={{ color: '#F5C518' }} className="font-bold text-2xl tracking-widest">SUPERBIENV</span>
        <div
          className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: '#F5C518', borderTopColor: 'transparent' }}
        />
        <span style={{ color: '#A0A0A0' }} className="text-sm">Vérification en cours…</span>
      </div>
    );
  }

  // ── Not found ────────────────────────────────────────────────────────────────
  if (!data?.valid) {
    return (
      <div style={{ background: '#0a0a0a' }} className="min-h-screen flex flex-col items-center justify-center px-4">
        <motion.div
          className="w-full max-w-sm rounded-2xl border border-red-500/40 bg-red-500/10 p-8 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-5xl mb-4">❌</div>
          <p style={{ color: '#f87171' }} className="font-bold text-lg mb-2">Réservation introuvable</p>
          <p style={{ color: '#A0A0A0' }} className="text-sm">{data?.message || 'Ce QR code n\'est pas reconnu.'}</p>
          <p style={{ color: '#A0A0A0' }} className="text-xs mt-4 font-mono break-all">{numero}</p>
        </motion.div>
        <Link to="/" style={{ color: '#F5C518' }} className="mt-8 text-sm hover:underline">
          ← Accueil SUPERBIENV
        </Link>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[data.statut] ?? STATUS_CONFIG.active;

  const seanceDateStr = data.film?.seanceDate
    ? new Date(data.film.seanceDate).toLocaleDateString('fr-FR', {
        weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
      })
    : null;

  // ── Valid booking ─────────────────────────────────────────────────────────────
  return (
    <div style={{ background: '#0a0a0a' }} className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Brand */}
      <Link to="/">
        <span style={{ color: '#F5C518' }} className="font-bold text-xl tracking-widest mb-8 block text-center">
          SUPERBIENV
        </span>
      </Link>

      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Status badge */}
        <div className={`rounded-2xl border ${cfg.border} ${cfg.bg} p-6 text-center mb-4`}>
          <div className="text-5xl mb-3">{cfg.icon}</div>
          <p className="font-bold text-lg tracking-wide" style={{ color: cfg.color }}>
            {cfg.label}
          </p>
        </div>

        {/* Info card */}
        <div style={{ background: '#141414' }} className="rounded-2xl p-6 space-y-0">
          {data.film?.titre && (
            <div className="pb-3 mb-3 border-b border-white/5">
              <p style={{ color: '#A0A0A0' }} className="text-xs uppercase tracking-wider mb-1">Film</p>
              <p className="text-white font-bold text-base">{data.film.titre}</p>
            </div>
          )}

          <Row label="Client" value={data.userName} />
          <Row label="Place" value={
            data.place
              ? `${data.place}${data.isVIP ? ' — VIP ✦' : ''}`
              : null
          } />
          <Row label="Date" value={seanceDateStr} />
          <Row label="Heure" value={data.film?.seanceHeure} />
          <Row label="N° Réservation" value={data.numero} />
        </div>

        {/* VIP badge */}
        {data.isVIP && (
          <div
            className="mt-3 rounded-xl py-2 text-center text-xs font-bold tracking-widest"
            style={{ background: '#F5C518', color: '#0a0a0a' }}
          >
            ✦ PLACE VIP ✦
          </div>
        )}
      </motion.div>

      <p style={{ color: '#A0A0A0' }} className="text-xs mt-10 text-center">
        SUPERBIENV Drive-In · Abidjan, Côte d'Ivoire
      </p>
    </div>
  );
}

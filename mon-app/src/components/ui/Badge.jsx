const variants = {
  NOUVEAU: 'bg-gold text-night',
  'CE SOIR': 'bg-cinema text-white',
  COMPLET: 'bg-gray-700 text-muted',
  VIP: 'bg-gradient-to-r from-gold to-yellow-300 text-night',
};

export default function Badge({ label }) {
  if (!label) return null;
  return (
    <span className={`text-xs font-label font-semibold px-2 py-0.5 rounded uppercase tracking-wider ${variants[label] || 'bg-surface text-muted'}`}>
      {label}
    </span>
  );
}

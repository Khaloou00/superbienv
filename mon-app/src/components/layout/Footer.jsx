import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-white/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <h3 className="font-headline text-2xl font-bold text-gradient-gold mb-3">SUPERBIENV</h3>
            <p className="text-muted text-sm leading-relaxed max-w-sm">
              Vivez le cinéma autrement. Une expérience immersive et haut de gamme à ciel ouvert, au cœur d'Abidjan.
            </p>
            <p className="text-gold font-label text-sm mt-4">🇨🇮 Abidjan, Côte d'Ivoire</p>
          </div>
          <div>
            <h4 className="font-label font-semibold text-white mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm text-muted">
              {[['/', 'Accueil'], ['/programme', 'Programme'], ['/evenements', 'Événements'], ['/connexion', 'Connexion']].map(([to, label]) => (
                <li key={to}><Link to={to} className="hover:text-gold transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-label font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-muted">
              <li className="flex items-center gap-2"><MapPin size={14} className="text-gold flex-shrink-0" /> Abidjan, Plateau</li>
              <li className="flex items-center gap-2"><Phone size={14} className="text-gold flex-shrink-0" /> +225 XX XX XX XX</li>
              <li className="flex items-center gap-2"><Mail size={14} className="text-gold flex-shrink-0" /> contact@superbienv.ci</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted">
          <p>© 2024 SUPERBIENV. Tous droits réservés.</p>
          <p className="font-label">Vivez le cinéma autrement ✨</p>
        </div>
      </div>
    </footer>
  );
}

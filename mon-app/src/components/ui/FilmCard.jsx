import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Star } from 'lucide-react';
import Badge from './Badge';
import Button from './Button';

export default function FilmCard({ film }) {
  const navigate = useNavigate();

  return (
    <motion.div
      className="bg-surface rounded-xl overflow-hidden border border-white/5 card-hover group cursor-pointer"
      whileHover={{ y: -4 }}
      onClick={() => navigate(`/film/${film._id}`)}
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={film.poster || 'https://via.placeholder.com/300x450/141414/F5C518?text=SUPERBIENV'}
          alt={film.titre}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-night via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <Button
            variant="primary"
            className="w-full text-sm py-2.5"
            onClick={(e) => { e.stopPropagation(); navigate(`/reservation/${film._id}`); }}
          >
            Réserver
          </Button>
        </div>
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          {film.badge && <Badge label={film.badge} />}
          <span className="glass text-xs font-label px-2 py-0.5 rounded text-white">{film.type}</span>
        </div>
        {film.note > 0 && (
          <div className="absolute top-3 right-3 glass flex items-center gap-1 px-2 py-1 rounded-lg">
            <Star size={10} className="text-gold fill-gold" />
            <span className="text-xs font-label text-white">{film.note}</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs font-label text-gold uppercase tracking-wider mb-1">{film.genre}</p>
        <h3 className="font-label font-semibold text-white text-sm leading-snug mb-2 line-clamp-2">{film.titre}</h3>
        <div className="flex items-center gap-3 text-muted text-xs">
          <span className="flex items-center gap-1"><Clock size={11} />{film.duree}min</span>
          {film.seances?.length > 0 && (
            <span>{new Date(film.seances[0].date).toLocaleDateString('fr-CI', { day: 'numeric', month: 'short' })}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

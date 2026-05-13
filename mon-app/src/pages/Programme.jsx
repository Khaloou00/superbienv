import { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Search } from 'lucide-react';
import { useGetFilmsQuery } from '../store/api/filmsApi';
import FilmCard from '../components/ui/FilmCard';
import StarField from '../components/ui/StarField';

const GENRES = ['Tous', 'Action', 'Comédie', 'Drame', 'Horreur', 'Romance', 'Thriller', 'Animation', 'Documentaire', 'Sport', 'Concert'];
const TYPES = ['Tous', 'Film', 'Match', 'Événement', 'Concert'];

export default function Programme() {
  const [genre, setGenre] = useState('');
  const [type, setType] = useState('');
  const [date, setDate] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useGetFilmsQuery({
    ...(genre && { genre }),
    ...(type && { type }),
    ...(date && { date }),
    page,
    limit: 12,
  });

  return (
    <div className="pt-16 min-h-screen">
      {/* Header */}
      <div className="relative bg-surface py-20 px-4 overflow-hidden">
        <StarField count={60} />
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <motion.span
            className="font-label text-gold text-sm tracking-widest uppercase mb-3 block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            À l'affiche
          </motion.span>
          <motion.h1
            className="font-headline text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Programme des films
          </motion.h1>
          <p className="text-muted max-w-lg mx-auto">Films, matchs et événements spéciaux. Réservez votre place en quelques clics.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-16 z-30 bg-night/95 backdrop-blur border-b border-white/5 py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center">
          <div className="flex items-center gap-2 text-muted w-full md:w-auto justify-center md:justify-start">
            <Filter size={16} />
            <span className="text-sm font-label">Filtres</span>
          </div>

          <div className="flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none pb-2 flex-1 w-full hide-scrollbar">
            {GENRES.map((g) => (
              <button
                key={g}
                onClick={() => { setGenre(g === 'Tous' ? '' : g); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-label whitespace-nowrap transition-all ${
                  (g === 'Tous' && !genre) || genre === g
                    ? 'bg-gold text-night'
                    : 'bg-surface text-muted hover:text-white border border-white/10'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-3 items-center w-full md:w-auto">
            <select
              value={type}
              onChange={(e) => { setType(e.target.value === 'Tous' ? '' : e.target.value); setPage(1); }}
              className="bg-surface border border-white/10 text-muted text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-gold w-full sm:w-auto"
            >
              {TYPES.map((t) => <option key={t} value={t === 'Tous' ? '' : t}>{t}</option>)}
            </select>
            <input
              type="date"
              value={date}
              onChange={(e) => { setDate(e.target.value); setPage(1); }}
              className="bg-surface border border-white/10 text-muted text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-gold w-full sm:w-auto"
            />
            {(genre || type || date) && (
              <button
                onClick={() => { setGenre(''); setType(''); setDate(''); setPage(1); }}
                className="text-xs text-cinema hover:text-red-400 font-label w-full sm:w-auto mt-2 sm:mt-0"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {isLoading || isFetching ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-surface rounded-xl aspect-[2/3] animate-pulse" />
            ))}
          </div>
        ) : data?.films?.length === 0 ? (
          <div className="text-center py-24">
            <Search size={48} className="text-muted mx-auto mb-4" />
            <p className="text-muted font-label">Aucun film trouvé pour ces filtres.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted text-sm font-label">{data?.total} résultat{data?.total > 1 ? 's' : ''}</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {data?.films?.map((film, i) => (
                <motion.div
                  key={film._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <FilmCard film={film} />
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {data?.total > 12 && (
              <div className="flex justify-center gap-2 mt-12">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg bg-surface text-muted text-sm font-label disabled:opacity-30 hover:bg-gold hover:text-night transition-all"
                >
                  ← Précédent
                </button>
                <span className="px-4 py-2 text-sm text-muted font-label">Page {page}</span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={data?.films?.length < 12}
                  className="px-4 py-2 rounded-lg bg-surface text-muted text-sm font-label disabled:opacity-30 hover:bg-gold hover:text-night transition-all"
                >
                  Suivant →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

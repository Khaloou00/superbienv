import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Star, Globe, Users, ArrowLeft, Calendar, Play, ChevronRight } from 'lucide-react';
import { useGetFilmQuery } from '../store/api/filmsApi';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

export default function FilmDetail() {
  const { filmId } = useParams();
  const navigate = useNavigate();
  const isAuth = useSelector(selectIsAuthenticated);
  const { data, isLoading } = useGetFilmQuery(filmId);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const film = data?.film;
  if (!film) {
    return (
      <div className="pt-24 text-center text-muted">
        Film introuvable. <button onClick={() => navigate(-1)} className="text-gold underline ml-1">Retour</button>
      </div>
    );
  }

  const youtubeId = film.trailerUrl?.match(/(?:youtu\.be\/|v=)([^&\s]+)/)?.[1];
  const upcomingSeances = film.seances?.filter((s) => new Date(s.date) >= new Date()) ?? [];
  const nextSeance = upcomingSeances.find((s) => s.placesDisponibles > 0);
  const bookingPath = isAuth ? `/reservation/${film._id}` : '/connexion';

  return (
    <div className="pt-16 min-h-screen">
      {/* ── Hero ── */}
      <div className="relative h-[52vh] sm:h-[62vh] overflow-hidden">
        <img src={film.poster} alt={film.titre} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/50 to-transparent" />

        <button
          onClick={() => navigate(-1)}
          className="absolute top-5 left-4 sm:left-8 glass px-3 py-2 rounded-xl text-sm font-label flex items-center gap-1.5 hover:border-gold/40 transition-colors"
        >
          <ArrowLeft size={14} /> Retour
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8">
          <div className="max-w-5xl mx-auto flex items-end gap-6">
            <img
              src={film.poster}
              alt={film.titre}
              className="hidden sm:block w-28 lg:w-36 rounded-xl border-2 border-white/10 flex-shrink-0 shadow-2xl -mb-10 lg:-mb-14"
            />
            <div className="pb-1">
              {film.badge && <Badge label={film.badge} className="mb-2" />}
              <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                {film.titre}
              </h1>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 text-sm font-label text-muted">
                <span className="text-gold font-semibold">{film.genre}</span>
                <span className="hidden sm:inline">·</span>
                <span className="flex items-center gap-1"><Clock size={12} />{film.duree} min</span>
                {film.note > 0 && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1 text-gold">
                      <Star size={12} className="fill-gold" />{film.note}/10
                    </span>
                  </>
                )}
                {film.langue && <><span>·</span><span className="flex items-center gap-1"><Globe size={12} />{film.langue}</span></>}
                {film.age && <><span>·</span><span>{film.age}</span></>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-8 sm:pt-14 pb-20 space-y-10">

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <Link to={bookingPath}>
            <Button variant="primary" className="px-8 py-3 text-base">
              Réserver ma place <ChevronRight size={16} />
            </Button>
          </Link>
          {nextSeance ? (
            <p className="text-sm text-muted font-label">
              Prochaine séance :{' '}
              <span className="text-white">
                {new Date(nextSeance.date).toLocaleDateString('fr-CI', { weekday: 'long', day: 'numeric', month: 'long' })}
                {' à '}{nextSeance.heure}
              </span>
              {' — '}
              <span className="text-gold">{nextSeance.placesDisponibles} places disponibles</span>
            </p>
          ) : (
            <p className="text-sm text-muted font-label">Aucune séance à venir</p>
          )}
        </div>

        {/* Synopsis */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="font-headline text-xl sm:text-2xl font-bold mb-3">Synopsis</h2>
          <p className="text-muted leading-relaxed text-sm sm:text-base">{film.synopsis}</p>
        </motion.section>

        {/* Casting */}
        {film.casting?.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <h2 className="font-headline text-xl sm:text-2xl font-bold mb-3 flex items-center gap-2">
              <Users size={18} className="text-gold" />Casting
            </h2>
            <div className="flex flex-wrap gap-2">
              {film.casting.map((actor) => (
                <span key={actor} className="glass px-3 py-1.5 rounded-full text-sm font-label text-white">
                  {actor}
                </span>
              ))}
            </div>
          </motion.section>
        )}

        {/* Réalisateur */}
        {film.realisateur && (
          <section>
            <h2 className="font-headline text-xl font-bold mb-1">Réalisateur</h2>
            <p className="text-muted">{film.realisateur}</p>
          </section>
        )}

        {/* Trailer */}
        {youtubeId && (
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="font-headline text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
              <Play size={18} className="text-gold" />Bande-annonce
            </h2>
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title="Bande-annonce"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </motion.section>
        )}

        {/* Séances */}
        {film.seances?.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <h2 className="font-headline text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-gold" />Séances
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {film.seances.map((s) => {
                const past = new Date(s.date) < new Date();
                const full = s.placesDisponibles === 0;
                return (
                  <div
                    key={s._id}
                    className={`bg-surface rounded-xl border p-4 flex items-center justify-between transition-opacity ${
                      past || full ? 'border-white/5 opacity-40' : 'border-white/10'
                    }`}
                  >
                    <div>
                      <p className="font-label font-semibold text-white text-sm">
                        {new Date(s.date).toLocaleDateString('fr-CI', { weekday: 'short', day: 'numeric', month: 'short' })}
                        <span className="text-gold ml-2">{s.heure}</span>
                      </p>
                      <p className="text-xs text-muted mt-0.5">
                        {s.placesDisponibles}/{s.placesTotal} places · {s.placesVIPDisponibles} VIP
                      </p>
                    </div>
                    {!past && !full ? (
                      <Link to={bookingPath}>
                        <Button variant="outline" className="text-xs py-1.5 px-3">Réserver</Button>
                      </Link>
                    ) : (
                      <span className="text-xs font-label text-muted">{past ? 'Passée' : 'Complet'}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}

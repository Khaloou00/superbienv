import { useState } from 'react';
import { motion } from 'framer-motion';
import { History, CalendarPlus, X, Plus, Trash2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGetFilmsQuery, useReprogrammerFilmMutation } from '../../store/api/filmsApi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const NEW_SEANCE = { date: '', heure: '20:30', placesTotal: 80, placesVIP: 20 };
const fmtDate = (d) => new Date(d).toLocaleDateString('fr-CI', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

export default function HistoriqueFilms() {
  const { data, isLoading } = useGetFilmsQuery({ scope: 'past', limit: 50 });
  const [reprogrammer, { isLoading: isSaving }] = useReprogrammerFilmMutation();

  const [target, setTarget] = useState(null); // film en cours de reprogrammation
  const [seances, setSeances] = useState([{ ...NEW_SEANCE }]);

  const films = data?.films ?? [];

  const openModal = (film) => {
    setTarget(film);
    setSeances([{ ...NEW_SEANCE }]);
  };

  const updateSeance = (i, key, val) =>
    setSeances((s) => s.map((row, idx) => (idx === i ? { ...row, [key]: val } : row)));

  const handleSubmit = async () => {
    const valides = seances.filter((s) => s.date && s.heure);
    if (!valides.length) {
      toast.error('Ajoutez au moins une nouvelle date');
      return;
    }
    try {
      await reprogrammer({ id: target._id, seances: valides }).unwrap();
      toast.success(`« ${target.titre} » reprogrammé et de nouveau au programme !`);
      setTarget(null);
    } catch (err) {
      toast.error(err.data?.message || 'Erreur lors de la reprogrammation');
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <History size={18} className="text-gold" />
        <h2 className="font-label font-semibold">Historique des films</h2>
      </div>
      <p className="text-muted text-xs font-label mb-4">
        Films dont toutes les séances sont passées. Ils ne sont plus visibles au programme — reprogrammez-les avec de nouvelles dates (l'historique est conservé).
      </p>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-surface rounded-2xl h-28 animate-pulse" />)}
        </div>
      ) : films.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-white/5 py-16 text-center">
          <History size={40} className="text-muted mx-auto mb-3" />
          <p className="text-muted font-label text-sm">Aucun film passé pour le moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {films.map((film, i) => (
            <motion.div
              key={film._id}
              className="bg-surface rounded-2xl border border-white/5 p-3 flex gap-3"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            >
              <img src={film.poster} alt={film.titre} className="w-16 h-24 object-cover rounded-xl flex-shrink-0" />
              <div className="flex-1 min-w-0 flex flex-col">
                <p className="font-label text-sm text-white truncate">{film.titre}</p>
                <p className="text-xs text-muted mb-2">{film.genre} · {film.type}</p>

                <div className="flex-1 space-y-1 mb-2">
                  {film.seances?.slice(-3).reverse().map((s) => (
                    <div key={s._id} className="flex items-center gap-1.5 text-[11px] text-muted">
                      <Clock size={11} className="text-gold/60 flex-shrink-0" />
                      <span className="truncate">{fmtDate(s.date)} · {s.heure}</span>
                    </div>
                  ))}
                  {film.seances?.length > 3 && (
                    <p className="text-[10px] text-muted/60 pl-4">+ {film.seances.length - 3} autre(s) séance(s)</p>
                  )}
                </div>

                <button
                  onClick={() => openModal(film)}
                  className="self-start flex items-center gap-1.5 text-xs font-label text-night bg-gold hover:bg-gold/90 rounded-lg px-3 py-1.5 transition-colors"
                >
                  <CalendarPlus size={13} /> Reprogrammer
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ══ MODAL REPROGRAMMER ══ */}
      {target && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setTarget(null)}
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-night border border-white/10 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-5 border-b border-white/5 sticky top-0 bg-night z-10">
              <div className="min-w-0">
                <h3 className="font-headline font-bold text-lg truncate">Reprogrammer</h3>
                <p className="text-xs text-muted truncate">{target.titre}</p>
              </div>
              <button onClick={() => setTarget(null)} className="text-muted hover:text-white p-1"><X size={20} /></button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-muted font-label">
                Les anciennes séances restent dans l'historique. Seules ces nouvelles dates seront visibles au public.
              </p>

              <div className="space-y-3">
                {seances.map((s, i) => (
                  <div key={i} className="bg-surface rounded-xl p-3 border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-label text-gold">Séance {i + 1}</span>
                      {seances.length > 1 && (
                        <button
                          onClick={() => setSeances((arr) => arr.filter((_, idx) => idx !== i))}
                          className="text-cinema hover:text-red-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input label="Date" type="date" value={s.date} onChange={(e) => updateSeance(i, 'date', e.target.value)} />
                      <Input label="Heure" type="time" value={s.heure} onChange={(e) => updateSeance(i, 'heure', e.target.value)} />
                      <Input label="Places" type="number" min={1} value={s.placesTotal} onChange={(e) => updateSeance(i, 'placesTotal', e.target.value)} />
                      <Input label="Places VIP" type="number" min={0} value={s.placesVIP} onChange={(e) => updateSeance(i, 'placesVIP', e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setSeances((arr) => [...arr, { ...NEW_SEANCE }])}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-label text-muted hover:text-gold border border-dashed border-white/15 hover:border-gold/40 rounded-xl py-2.5 transition-colors"
              >
                <Plus size={14} /> Ajouter une séance
              </button>

              <Button variant="primary" className="w-full" onClick={handleSubmit} loading={isSaving}>
                Reprogrammer le film
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

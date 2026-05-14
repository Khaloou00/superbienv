import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  LayoutDashboard, Film, Ticket, QrCode, TrendingUp, Car,
  CalendarDays, Plus, X, ImagePlus,
} from 'lucide-react';
import { useGetStatsQuery, useGetAllBookingsQuery, useScanQRMutation } from '../../store/api/bookingsApi';
import { useGetFilmsQuery, useDeleteFilmMutation, useCreateFilmMutation, useUpdateFilmMutation } from '../../store/api/filmsApi';
import { useGetEventsQuery, useCreateEventMutation, useDeleteEventMutation, useUpdateEventMutation } from '../../store/api/eventsApi';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

// ── Constants ────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'overview',  label: 'Vue d\'ensemble', icon: LayoutDashboard },
  { id: 'films',     label: 'Films',            icon: Film },
  { id: 'events',    label: 'Événements',       icon: CalendarDays },
  { id: 'bookings',  label: 'Réservations',     icon: Ticket },
  { id: 'scanner',   label: 'Scanner QR',       icon: QrCode },
];

const FILM_GENRES = ['Action', 'Comédie', 'Drame', 'Horreur', 'Romance', 'Thriller', 'Animation', 'Documentaire', 'Sport', 'Concert', 'Événement'];
const FILM_TYPES  = ['Film', 'Match', 'Événement', 'Concert'];
const FILM_BADGES = ['', 'NOUVEAU', 'CE SOIR', 'COMPLET', 'VIP'];
const EVENT_TYPES = ['Soirée corpo', 'Anniversaire', 'Mariage', 'Match', 'Concert', 'Autre'];


const INIT_FILM = {
  titre: '', synopsis: '', genre: 'Action', type: 'Film',
  duree: '', realisateur: '', langue: 'VF', age: 'Tout public',
  note: '', badge: '', trailerUrl: '', poster: '',
};

const INIT_EVENT = {
  titre: '', type: 'Soirée corpo', description: '',
  date: '', capacite: '', prix: '0', statut: 'disponible',
};

// ── Sub-components ───────────────────────────────────────────────────────────

const StatusBadge = ({ statut }) => {
  const cfg = {
    active:   'bg-gold/20 text-gold',
    utilisée: 'bg-green-900/30 text-green-400',
    annulée:  'bg-cinema/20 text-cinema',
  };
  return (
    <span className={`text-xs px-2 py-1 rounded font-label ${cfg[statut] ?? 'bg-surface text-muted'}`}>
      {statut}
    </span>
  );
};

const SelectField = ({ label, value, onChange, children }) => (
  <div>
    {label && <label className="text-xs font-label text-muted block mb-1">{label}</label>}
    <select
      value={value}
      onChange={onChange}
      className="w-full bg-night border border-white/10 text-white rounded-xl px-3 py-2.5 font-label text-sm focus:outline-none focus:border-gold transition-colors"
    >
      {children}
    </select>
  </div>
);

const TextArea = ({ label, error, ...props }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-xs font-label text-muted">{label}</label>}
    <textarea
      rows={4}
      className={`bg-night border ${error ? 'border-cinema' : 'border-white/10'} text-white rounded-xl px-3 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:border-gold transition-colors resize-none`}
      {...props}
    />
    {error && <p className="text-xs text-cinema">{error}</p>}
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const [scanId, setScanId] = useState('');

  // Film modal
  const [filmModal, setFilmModal] = useState(false);
  const [editFilmId, setEditFilmId] = useState(null);
  const [filmForm, setFilmForm] = useState(INIT_FILM);
  const [casting, setCasting] = useState([]);
  const [castingInput, setCastingInput] = useState('');
  const [seances, setSeances] = useState([{ date: '', heure: '20:30', placesTotal: 80, placesVIP: 10 }]);
  const [posterFile, setPosterFile] = useState(null);

  // Event modal
  const [eventModal, setEventModal] = useState(false);
  const [editEventId, setEditEventId] = useState(null);
  const [eventForm, setEventForm] = useState(INIT_EVENT);
  const [imageFile, setImageFile] = useState(null);

  // Booking details
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Queries & mutations
  const { data: stats }        = useGetStatsQuery();
  const { data: bookingsData } = useGetAllBookingsQuery({ limit: 10 });
  const { data: filmsData }    = useGetFilmsQuery({ limit: 50 });
  const { data: eventsData }   = useGetEventsQuery();

  const [deleteFilm]                       = useDeleteFilmMutation();
  const [createFilm, { isLoading: isCreatingFilm }]   = useCreateFilmMutation();
  const [updateFilm, { isLoading: isUpdatingFilm }]   = useUpdateFilmMutation();
  const [deleteEvent]                      = useDeleteEventMutation();
  const [createEvent, { isLoading: isCreatingEvent }] = useCreateEventMutation();
  const [updateEvent, { isLoading: isUpdatingEvent }] = useUpdateEventMutation();
  const [scanQR, { isLoading: isScanning }]            = useScanQRMutation();

  // ── Handlers ────────────────────────────────────────────────────────────────

  const ffSet = (k) => (e) => setFilmForm((p) => ({ ...p, [k]: e.target.value }));
  const efSet = (k) => (e) => setEventForm((p) => ({ ...p, [k]: e.target.value }));

  const addCasting = () => {
    const v = castingInput.trim();
    if (v && !casting.includes(v)) setCasting((c) => [...c, v]);
    setCastingInput('');
  };

  const addSeance = () =>
    setSeances((s) => [...s, { date: '', heure: '20:30', placesTotal: 80, placesVIP: 10 }]);

  const updateSeance = (i, key, val) =>
    setSeances((s) => s.map((row, idx) => idx === i ? { ...row, [key]: val } : row));

  const handleDeleteFilm = async (id) => {
    if (!confirm('Désactiver ce film ? Ses réservations actives seront annulées.')) return;
    try {
      const res = await deleteFilm(id).unwrap();
      toast.success(`Film désactivé — ${res.bookingsCancelled} réservation(s) annulée(s)`);
    } catch {
      toast.error('Erreur lors de la désactivation');
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!confirm('Supprimer cet événement ?')) return;
    try {
      await deleteEvent(id).unwrap();
      toast.success('Événement supprimé');
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleEditFilm = (film) => {
    setEditFilmId(film._id);
    setFilmForm({
      titre: film.titre || '', synopsis: film.synopsis || '', genre: film.genre || '', type: film.type || '',
      duree: film.duree || '', realisateur: film.realisateur || '', langue: film.langue || '', age: film.age || '',
      note: film.note || '', badge: film.badge || '', trailerUrl: film.trailerUrl || '', poster: film.poster || ''
    });
    setCasting(film.casting || []);
    setSeances(film.seances?.map(s => ({
      date: s.date ? new Date(s.date).toISOString().split('T')[0] : '',
      heure: s.heure, placesTotal: s.placesTotal, placesVIP: s.placesVIP
    })) || [{ date: '', heure: '20:30', placesTotal: 80, placesVIP: 10 }]);
    setPosterFile(null);
    setFilmModal(true);
  };

  const handleSaveFilm = async () => {
    if (!filmForm.titre || !filmForm.synopsis || !filmForm.duree) {
      toast.error('Titre, synopsis et durée sont obligatoires');
      return;
    }
    const fd = new FormData();
    Object.entries(filmForm).forEach(([k, v]) => { if (v !== '') fd.append(k, v); });
    if (posterFile) fd.append('poster', posterFile);
    fd.append('casting', JSON.stringify(casting));
    fd.append('seances', JSON.stringify(seances.filter((s) => s.date && s.heure)));
    try {
      if (editFilmId) {
        await updateFilm({ id: editFilmId, fd }).unwrap();
        toast.success('Film modifié !');
      } else {
        await createFilm(fd).unwrap();
        toast.success('Film ajouté !');
      }
      setFilmModal(false);
      setFilmForm(INIT_FILM);
      setCasting([]);
      setSeances([{ date: '', heure: '20:30', placesTotal: 80, placesVIP: 10 }]);
      setPosterFile(null);
      setEditFilmId(null);
    } catch (err) {
      toast.error(err.data?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleEditEvent = (ev) => {
    setEditEventId(ev._id);
    setEventForm({
      titre: ev.titre || '', type: ev.type || 'Soirée corpo', description: ev.description || '',
      date: ev.date ? new Date(ev.date).toISOString().split('T')[0] : '',
      capacite: ev.capacite || '', prix: ev.prix || 0, statut: ev.statut || 'disponible'
    });
    setImageFile(null);
    setEventModal(true);
  };

  const handleSaveEvent = async () => {
    if (!eventForm.titre || !eventForm.description || !eventForm.type) {
      toast.error('Titre, type et description sont obligatoires');
      return;
    }
    const fd = new FormData();
    Object.entries(eventForm).forEach(([k, v]) => { if (v !== '') fd.append(k, v); });
    if (imageFile) fd.append('image', imageFile);
    try {
      if (editEventId) {
        await updateEvent({ id: editEventId, fd }).unwrap();
        toast.success('Événement modifié !');
      } else {
        await createEvent(fd).unwrap();
        toast.success('Événement ajouté !');
      }
      setEventModal(false);
      setEventForm(INIT_EVENT);
      setImageFile(null);
      setEditEventId(null);
    } catch (err) {
      toast.error(err.data?.message || 'Erreur lors de l\'enregistrement');
    }
  };
  const handleScan = async () => {
    if (!scanId.trim()) { toast.error('Entrez un ID de réservation'); return; }
    try {
      let finalId = scanId.trim();
      try {
        const parsed = JSON.parse(finalId);
        if (parsed.bookingId) finalId = parsed.bookingId;
        else if (parsed.numero) finalId = parsed.numero;
      } catch {}
      const res = await scanQR({ bookingId: finalId }).unwrap();
      if (res.success) toast.success(`✅ ${res.message} — ${res.booking?.userId?.nom || ''}`);
      else toast.error(res.message);
      setScanId('');
    } catch (err) {
      toast.error(err.data?.message || 'Réservation introuvable');
    }
  };

  const statCards = [
    { label: 'Réservations',   value: stats?.stats?.totalReservations ?? 0,                                  icon: Ticket,     color: 'text-gold' },
    { label: 'Recettes',       value: `${(stats?.stats?.recettesTotales ?? 0).toLocaleString('fr-CI')} F`,   icon: TrendingUp, color: 'text-green-400' },
    { label: 'Films actifs',   value: stats?.stats?.filmsActifs ?? 0,                                         icon: Film,       color: 'text-blue-400' },
    { label: 'Véhicules actifs', value: stats?.stats?.vehiculesActifs ?? 0,                                   icon: Car,        color: 'text-cinema' },
  ];

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="pt-16 min-h-screen">
      {/* Header */}
      <div className="bg-surface border-b border-white/5 px-4 py-5">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-headline text-2xl sm:text-3xl font-bold mb-0.5">Dashboard Admin</h1>
          <p className="text-muted text-xs sm:text-sm font-label">SUPERBIENV Drive-In</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-none pb-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-label whitespace-nowrap transition-all border flex-shrink-0 ${
                tab === id ? 'bg-gold text-night border-gold' : 'bg-surface text-muted border-white/10 hover:border-gold/30'
              }`}
            >
              <Icon size={14} />
              <span className="hidden xs:inline sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {statCards.map(({ label, value, icon: Icon, color }, i) => (
                <motion.div
                  key={label}
                  className="bg-surface rounded-2xl p-4 sm:p-5 border border-white/5"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                >
                  <div className={`w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center mb-3 ${color}`}>
                    <Icon size={16} />
                  </div>
                  <p className="font-headline font-bold text-xl sm:text-2xl text-white leading-none">{value}</p>
                  <p className="text-muted text-xs font-label mt-1">{label}</p>
                </motion.div>
              ))}
            </div>

            <div className="bg-surface rounded-2xl p-4 sm:p-6 border border-white/5">
              <h3 className="font-label font-semibold mb-4 text-sm sm:text-base">Recettes de la semaine</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats?.stats?.recettesHebdo ?? []} margin={{ left: -10 }}>
                  <XAxis dataKey="jour" tick={{ fill: '#A0A0A0', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#A0A0A0', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: '#141414', border: '1px solid rgba(245,197,24,0.2)', borderRadius: 8, color: '#fff', fontSize: 12 }}
                    formatter={(v) => [`${v.toLocaleString('fr-CI')} FCFA`, 'Recettes']}
                  />
                  <Bar dataKey="total" fill="#F5C518" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-surface rounded-2xl border border-white/5 overflow-hidden">
              <div className="p-4 border-b border-white/5">
                <h3 className="font-label font-semibold text-sm">Dernières réservations</h3>
              </div>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                  <thead>
                    <tr className="text-muted font-label text-xs border-b border-white/5">
                      {['N°', 'Client', 'Film', 'Place', 'Montant', 'Statut'].map((h) => (
                        <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bookingsData?.bookings?.map((b) => (
                      <tr key={b._id} onClick={() => setSelectedBooking(b)} className="border-b border-white/5 hover:bg-white/[0.02] cursor-pointer">
                        <td className="px-4 py-3 font-label text-xs text-muted">{b.numero?.slice(-8)}</td>
                        <td className="px-4 py-3 text-sm">{b.userId?.nom || '—'}</td>
                        <td className="px-4 py-3 text-muted text-xs truncate max-w-[140px]">{b.filmId?.titre || '—'}</td>
                        <td className="px-4 py-3 font-label text-xs">{b.place}</td>
                        <td className="px-4 py-3 text-gold font-label text-xs">{b.paiement?.montant?.toLocaleString('fr-CI')} F</td>
                        <td className="px-4 py-3"><StatusBadge statut={b.statut} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="md:hidden divide-y divide-white/5">
                {bookingsData?.bookings?.map((b) => (
                  <div key={b._id} onClick={() => setSelectedBooking(b)} className="px-4 py-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-white/[0.02]">
                    <div className="min-w-0">
                      <p className="text-sm font-label text-white truncate">{b.userId?.nom || '—'}</p>
                      <p className="text-xs text-muted truncate">{b.filmId?.titre || '—'} · Place {b.place}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-gold font-label text-xs">{b.paiement?.montant?.toLocaleString('fr-CI')} F</span>
                      <StatusBadge statut={b.statut} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── FILMS ── */}
        {tab === 'films' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-label font-semibold">Gestion des films</h2>
              <Button variant="primary" className="text-xs sm:text-sm py-2 px-3 sm:px-4" onClick={() => setFilmModal(true)}>
                <Plus size={14} /> Ajouter
              </Button>
            </div>
            <div className="hidden sm:block bg-surface rounded-2xl border border-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[640px]">
                  <thead>
                    <tr className="text-muted font-label text-xs border-b border-white/5">
                      {['Poster', 'Titre', 'Genre', 'Type', 'Séances', 'Statut', 'Actions'].map((h) => (
                        <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filmsData?.films?.map((film) => (
                      <tr key={film._id} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="px-4 py-3">
                          <img src={film.poster} alt={film.titre} className="w-9 h-12 object-cover rounded-lg" />
                        </td>
                        <td className="px-4 py-3 font-label text-sm max-w-[160px] truncate">{film.titre}</td>
                        <td className="px-4 py-3 text-muted text-xs">{film.genre}</td>
                        <td className="px-4 py-3 text-muted text-xs">{film.type}</td>
                        <td className="px-4 py-3 text-muted text-xs">{film.seances?.length || 0}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded font-label ${film.isActive ? 'bg-green-900/30 text-green-400' : 'bg-cinema/20 text-cinema'}`}>
                            {film.isActive ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="px-4 py-3 flex gap-3">
                          <button onClick={() => handleEditFilm(film)} className="text-xs text-gold hover:text-white font-label transition-colors">
                            Modifier
                          </button>
                          <button onClick={() => handleDeleteFilm(film._id)} className="text-xs text-cinema hover:text-red-400 font-label transition-colors">
                            Désactiver
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="sm:hidden space-y-3">
              {filmsData?.films?.map((film) => (
                <div key={film._id} className="bg-surface rounded-xl border border-white/5 flex items-center gap-3 p-3">
                  <img src={film.poster} alt={film.titre} className="w-12 h-16 object-cover rounded-lg flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-label text-sm text-white truncate">{film.titre}</p>
                    <p className="text-xs text-muted">{film.genre} · {film.seances?.length || 0} séance(s)</p>
                    <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded font-label ${film.isActive ? 'bg-green-900/30 text-green-400' : 'bg-cinema/20 text-cinema'}`}>
                      {film.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button onClick={() => handleEditFilm(film)} className="text-xs text-gold hover:text-white font-label text-right">
                      Modifier
                    </button>
                    <button onClick={() => handleDeleteFilm(film._id)} className="text-xs text-cinema hover:text-red-400 font-label text-right">
                      Désactiver
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── EVENTS ── */}
        {tab === 'events' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-label font-semibold">Gestion des événements</h2>
              <Button variant="primary" className="text-xs sm:text-sm py-2 px-3 sm:px-4" onClick={() => setEventModal(true)}>
                <Plus size={14} /> Ajouter
              </Button>
            </div>
            <div className="hidden sm:block bg-surface rounded-2xl border border-white/5 overflow-hidden">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="text-muted font-label text-xs border-b border-white/5">
                    {['Image', 'Titre', 'Type', 'Capacité', 'Prix', 'Statut', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {eventsData?.events?.map((ev) => (
                    <tr key={ev._id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="px-4 py-3">
                        {ev.image
                          ? <img src={ev.image} alt={ev.titre} className="w-14 h-10 object-cover rounded-lg" />
                          : <div className="w-14 h-10 bg-white/5 rounded-lg" />}
                      </td>
                      <td className="px-4 py-3 font-label text-sm max-w-[160px] truncate">{ev.titre}</td>
                      <td className="px-4 py-3 text-muted text-xs">{ev.type}</td>
                      <td className="px-4 py-3 text-muted text-xs">{ev.capacite ?? '—'}</td>
                      <td className="px-4 py-3 text-gold font-label text-xs">
                        {ev.prix > 0 ? `${ev.prix.toLocaleString('fr-CI')} F` : 'Gratuit'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded font-label ${ev.statut === 'disponible' ? 'bg-green-900/30 text-green-400' : 'bg-cinema/20 text-cinema'}`}>
                          {ev.statut}
                        </span>
                      </td>
                      <td className="px-4 py-3 flex gap-3">
                        <button onClick={() => handleEditEvent(ev)} className="text-xs text-gold hover:text-white font-label transition-colors">
                          Modifier
                        </button>
                        <button onClick={() => handleDeleteEvent(ev._id)} className="text-xs text-cinema hover:text-red-400 font-label transition-colors">
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="sm:hidden space-y-3">
              {eventsData?.events?.map((ev) => (
                <div key={ev._id} className="bg-surface rounded-xl border border-white/5 flex items-center gap-3 p-3">
                  {ev.image
                    ? <img src={ev.image} alt={ev.titre} className="w-14 h-10 object-cover rounded-lg flex-shrink-0" />
                    : <div className="w-14 h-10 bg-white/5 rounded-lg flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-label text-sm text-white truncate">{ev.titre}</p>
                    <p className="text-xs text-muted">{ev.type} · {ev.capacite ?? '—'} pers.</p>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button onClick={() => handleEditEvent(ev)} className="text-xs text-gold hover:text-white font-label text-right">
                      Modifier
                    </button>
                    <button onClick={() => handleDeleteEvent(ev._id)} className="text-xs text-cinema hover:text-red-400 font-label text-right">
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── BOOKINGS ── */}
        {tab === 'bookings' && (
          <div className="bg-surface rounded-2xl border border-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <h2 className="font-label font-semibold text-sm">Toutes les réservations</h2>
            </div>
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="text-muted font-label text-xs border-b border-white/5">
                    {['N°', 'Client', 'Film', 'Place', 'Véhicule', 'Montant', 'Paiement', 'Statut'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookingsData?.bookings?.map((b) => (
                    <tr key={b._id} onClick={() => setSelectedBooking(b)} className="border-b border-white/5 hover:bg-white/[0.02] cursor-pointer">
                      <td className="px-4 py-3 font-label text-xs text-muted">{b.numero?.slice(-8)}</td>
                      <td className="px-4 py-3 text-xs">{b.userId?.nom}</td>
                      <td className="px-4 py-3 text-muted text-xs truncate max-w-[120px]">{b.filmId?.titre}</td>
                      <td className="px-4 py-3 font-label text-xs">{b.place}</td>
                      <td className="px-4 py-3 text-muted text-xs">{b.immatriculation}</td>
                      <td className="px-4 py-3 text-gold font-label text-xs">{b.paiement?.montant?.toLocaleString('fr-CI')} F</td>
                      <td className="px-4 py-3 text-muted text-xs">{b.paiement?.methode}</td>
                      <td className="px-4 py-3"><StatusBadge statut={b.statut} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="sm:hidden divide-y divide-white/5">
              {bookingsData?.bookings?.map((b) => (
                <div key={b._id} onClick={() => setSelectedBooking(b)} className="px-4 py-3 cursor-pointer hover:bg-white/[0.02]">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="min-w-0">
                      <p className="text-sm font-label text-white truncate">{b.userId?.nom || '—'}</p>
                      <p className="text-xs text-muted truncate">{b.filmId?.titre || '—'}</p>
                    </div>
                    <StatusBadge statut={b.statut} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted flex-wrap">
                    <span>Place <span className="text-white font-label">{b.place}</span></span>
                    <span>{b.immatriculation}</span>
                    <span className="text-gold font-label">{b.paiement?.montant?.toLocaleString('fr-CI')} F</span>
                    <span>{b.paiement?.methode}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SCANNER ── */}
        {tab === 'scanner' && (
          <div className="max-w-md mx-auto sm:mx-0">
            <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-white/5">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-3">
                  <QrCode size={26} className="text-gold" />
                </div>
                <h2 className="font-headline text-xl sm:text-2xl font-bold mb-1">Scanner un QR Code</h2>
                <p className="text-muted text-sm">Entrez l'ID de réservation scanné à l'entrée.</p>
              </div>
              <div className="space-y-4">
                <Input
                  label="ID de réservation"
                  placeholder="Collez l'ID du QR Code..."
                  value={scanId}
                  onChange={(e) => setScanId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                />
                <Button variant="primary" className="w-full" onClick={handleScan} loading={isScanning}>
                  Valider l'entrée
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ══ FILM CREATE MODAL ══════════════════════════════════════════════════ */}
      {filmModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setFilmModal(false)}
        >
          <div
            className="bg-surface border border-white/10 rounded-t-2xl sm:rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10 sticky top-0 bg-surface z-10">
              <h2 className="font-headline text-xl font-bold">Nouveau film</h2>
              <button onClick={() => setFilmModal(false)} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Form body */}
            <div className="p-5 space-y-4">
              <Input label="Titre *" value={filmForm.titre} onChange={ffSet('titre')} placeholder="Ex: Black Panther" />
              <TextArea label="Synopsis *" value={filmForm.synopsis} onChange={ffSet('synopsis')} placeholder="Résumé du film..." />

              <div className="grid sm:grid-cols-2 gap-4">
                <SelectField label="Genre *" value={filmForm.genre} onChange={ffSet('genre')}>
                  {FILM_GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
                </SelectField>
                <SelectField label="Type" value={filmForm.type} onChange={ffSet('type')}>
                  {FILM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </SelectField>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Durée (min) *" type="number" min={1} value={filmForm.duree} onChange={ffSet('duree')} placeholder="90" />
                <Input label="Note /10" type="number" step="0.1" min="0" max="10" value={filmForm.note} onChange={ffSet('note')} placeholder="7.5" />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Réalisateur" value={filmForm.realisateur} onChange={ffSet('realisateur')} />
                <Input label="Langue" value={filmForm.langue} onChange={ffSet('langue')} placeholder="VF" />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Âge minimum" value={filmForm.age} onChange={ffSet('age')} placeholder="Tout public" />
                <SelectField label="Badge" value={filmForm.badge} onChange={ffSet('badge')}>
                  {FILM_BADGES.map((b) => <option key={b} value={b}>{b || 'Aucun'}</option>)}
                </SelectField>
              </div>

              {/* Poster */}
              <div className="space-y-2">
                <label className="text-xs font-label text-muted block">Poster</label>
                <Input
                  label=""
                  value={filmForm.poster}
                  onChange={ffSet('poster')}
                  placeholder="URL du poster (https://...)"
                />
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-xs text-muted font-label">ou</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer border border-dashed border-white/20 rounded-xl p-3 hover:border-gold/40 transition-colors">
                  <ImagePlus size={16} className="text-muted" />
                  <span className="text-sm text-muted font-label">
                    {posterFile ? posterFile.name : 'Choisir un fichier image…'}
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setPosterFile(e.target.files[0])} />
                </label>
              </div>

              <Input label="URL Bande-annonce (YouTube)" value={filmForm.trailerUrl} onChange={ffSet('trailerUrl')} placeholder="https://youtube.com/watch?v=..." />

              {/* Casting */}
              <div>
                <label className="text-xs font-label text-muted block mb-2">Casting</label>
                <div className="flex gap-2 mb-2">
                  <input
                    className="flex-1 bg-night border border-white/10 text-white rounded-xl px-3 py-2 text-sm placeholder:text-muted focus:outline-none focus:border-gold transition-colors"
                    placeholder="Nom de l'acteur…"
                    value={castingInput}
                    onChange={(e) => setCastingInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCasting(); } }}
                  />
                  <button
                    type="button"
                    onClick={addCasting}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl hover:border-gold/40 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {casting.map((actor, i) => (
                    <span key={i} className="glass px-3 py-1 rounded-full text-sm font-label flex items-center gap-1.5">
                      {actor}
                      <button onClick={() => setCasting((c) => c.filter((_, idx) => idx !== i))} className="text-muted hover:text-white">
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Séances */}
              <div>
                <label className="text-xs font-label text-muted block mb-2">Séances</label>
                <div className="space-y-2">
                  {seances.map((s, i) => (
                    <div key={i} className="grid grid-cols-[1fr_1fr_80px_80px_32px] gap-2 items-center">
                      <input
                        type="date"
                        value={s.date}
                        onChange={(e) => updateSeance(i, 'date', e.target.value)}
                        className="bg-night border border-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gold transition-colors"
                      />
                      <input
                        type="time"
                        value={s.heure}
                        onChange={(e) => updateSeance(i, 'heure', e.target.value)}
                        className="bg-night border border-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gold transition-colors"
                      />
                      <input
                        type="number"
                        min={1}
                        value={s.placesTotal}
                        onChange={(e) => updateSeance(i, 'placesTotal', Number(e.target.value))}
                        placeholder="Places"
                        className="bg-night border border-white/10 text-white rounded-xl px-2 py-2 text-sm text-center focus:outline-none focus:border-gold transition-colors"
                      />
                      <input
                        type="number"
                        min={0}
                        value={s.placesVIP}
                        onChange={(e) => updateSeance(i, 'placesVIP', Number(e.target.value))}
                        placeholder="VIP"
                        className="bg-night border border-white/10 text-white rounded-xl px-2 py-2 text-sm text-center focus:outline-none focus:border-gold transition-colors"
                      />
                      <button
                        onClick={() => setSeances((s) => s.filter((_, idx) => idx !== i))}
                        className="flex items-center justify-center text-muted hover:text-cinema transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <p className="text-xs text-muted">Date · Heure · Places standard · Places VIP</p>
                  <button
                    type="button"
                    onClick={addSeance}
                    className="flex items-center gap-1.5 text-sm text-gold font-label hover:text-gold/80 transition-colors"
                  >
                    <Plus size={14} /> Ajouter une séance
                  </button>
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex gap-3 p-5 border-t border-white/10">
              <Button variant="ghost" onClick={() => setFilmModal(false)} className="flex-shrink-0">Annuler</Button>
              <Button variant="primary" onClick={handleSaveFilm} loading={isCreatingFilm || isUpdatingFilm} className="flex-1">
                {editFilmId ? 'Enregistrer les modifications' : 'Créer le film'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ══ EVENT CREATE MODAL ═════════════════════════════════════════════════ */}
      {eventModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setEventModal(false)}
        >
          <div
            className="bg-surface border border-white/10 rounded-t-2xl sm:rounded-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-white/10 sticky top-0 bg-surface z-10">
              <h2 className="font-headline text-xl font-bold">Nouvel événement</h2>
              <button onClick={() => setEventModal(false)} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <Input label="Titre *" value={eventForm.titre} onChange={efSet('titre')} placeholder="Ex: Gala d'entreprise" />

              <SelectField label="Type *" value={eventForm.type} onChange={efSet('type')}>
                {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </SelectField>

              <TextArea label="Description *" value={eventForm.description} onChange={efSet('description')} placeholder="Décrivez l'événement…" rows={3} />

              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Date" type="date" value={eventForm.date} onChange={efSet('date')} />
                <Input label="Capacité (personnes)" type="number" min={1} value={eventForm.capacite} onChange={efSet('capacite')} />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Prix de base (FCFA)" type="number" min={0} value={eventForm.prix} onChange={efSet('prix')} />
                <SelectField label="Statut" value={eventForm.statut} onChange={efSet('statut')}>
                  <option value="disponible">Disponible</option>
                  <option value="complet">Complet</option>
                  <option value="annulé">Annulé</option>
                </SelectField>
              </div>

              {/* Image */}
              <div className="space-y-2">
                <label className="text-xs font-label text-muted block">Image</label>
                <label className="flex items-center gap-2 cursor-pointer border border-dashed border-white/20 rounded-xl p-3 hover:border-gold/40 transition-colors">
                  <ImagePlus size={16} className="text-muted" />
                  <span className="text-sm text-muted font-label">
                    {imageFile ? imageFile.name : 'Choisir une image…'}
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files[0])} />
                </label>
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t border-white/10">
              <Button variant="ghost" onClick={() => setEventModal(false)} className="flex-shrink-0">Annuler</Button>
              <Button variant="primary" onClick={handleSaveEvent} loading={isCreatingEvent || isUpdatingEvent} className="flex-1">
                {editEventId ? 'Enregistrer les modifications' : 'Créer l\'événement'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ══ BOOKING DETAILS MODAL ══════════════════════════════════════════════ */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedBooking(null)}>
          <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-white/10 bg-night/50">
              <h2 className="font-headline text-xl font-bold">Détails de réservation</h2>
              <button onClick={() => setSelectedBooking(null)} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-4">
                <div>
                  <p className="text-muted text-xs">Client</p>
                  <p className="font-label text-white">{selectedBooking.userId?.nom}</p>
                </div>
                <div>
                  <p className="text-muted text-xs">Email</p>
                  <p className="font-label text-white">{selectedBooking.userId?.email}</p>
                </div>
                <div>
                  <p className="text-muted text-xs">Téléphone</p>
                  <p className="font-label text-white">{selectedBooking.userId?.telephone || '—'}</p>
                </div>
                <div>
                  <p className="text-muted text-xs">Film / Événement</p>
                  <p className="font-label text-white">{selectedBooking.filmId?.titre}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-4">
                <div>
                  <p className="text-muted text-xs">Numéro de Billet</p>
                  <p className="font-label text-gold font-mono">{selectedBooking.numero}</p>
                </div>
                <div>
                  <p className="text-muted text-xs">Immatriculation</p>
                  <p className="font-label text-white">{selectedBooking.immatriculation}</p>
                </div>
                <div>
                  <p className="text-muted text-xs">Place</p>
                  <p className="font-label text-white">{selectedBooking.place} {selectedBooking.isVIP ? '(VIP)' : ''}</p>
                </div>
                <div>
                  <p className="text-muted text-xs">Nb Personnes</p>
                  <p className="font-label text-white">{selectedBooking.nombrePersonnes}</p>
                </div>
              </div>

              <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                <div>
                  <p className="text-muted text-xs">Montant payé</p>
                  <p className="font-label text-gold text-lg">{selectedBooking.paiement?.montant?.toLocaleString('fr-CI')} FCFA</p>
                  <p className="text-xs text-muted">Via {selectedBooking.paiement?.methode}</p>
                </div>
                <div className="text-right">
                  <p className="text-muted text-xs mb-1">Statut</p>
                  <StatusBadge statut={selectedBooking.statut} />
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-white/10 bg-night/50">
              <Button variant="ghost" className="w-full" onClick={() => setSelectedBooking(null)}>Fermer</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

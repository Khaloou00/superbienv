import { useState } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Ticket, Heart, Bell, User, ChevronRight, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { useGetMesReservationsQuery, useAnnulerBookingMutation } from '../../store/api/bookingsApi';
import { useGetMeQuery, useUpdateMeMutation } from '../../store/api/authApi';
import { useAddCommentMutation } from '../../store/api/filmsApi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const TABS = [
  { id: 'reservations', label: 'Réservations', icon: Ticket },
  { id: 'favoris', label: 'Favoris', icon: Heart },
  { id: 'profil', label: 'Profil', icon: User },
];

const STATUS_CONFIG = {
  active: { label: 'Active', icon: Clock, color: 'text-gold' },
  utilisée: { label: 'Utilisée', icon: CheckCircle, color: 'text-green-400' },
  annulée: { label: 'Annulée', icon: XCircle, color: 'text-cinema' },
};

export default function MonEspace() {
  const [tab, setTab] = useState('reservations');
  const [expandedId, setExpandedId] = useState(null);
  const user = useSelector(selectCurrentUser);
  const { data: meData } = useGetMeQuery();
  const { data, isLoading } = useGetMesReservationsQuery();
  const [annuler, { isLoading: isAnnulant }] = useAnnulerBookingMutation();
  const [updateMe, { isLoading: isUpdatingProfile }] = useUpdateMeMutation();
  const [addComment, { isLoading: isCommenting }] = useAddCommentMutation();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ nom: '', telephone: '', idNumber: '' });
  const [avatarFile, setAvatarFile] = useState(null);

  const [commentForm, setCommentForm] = useState({ filmId: null, texte: '', note: 5 });

  const handleAnnuler = async (id) => {
    try {
      await annuler(id).unwrap();
      toast.success('Réservation annulée');
    } catch (err) {
      toast.error(err.data?.message || 'Erreur');
    }
  };

  const handleEditProfileClick = () => {
    setProfileForm({
      nom: user?.nom || '',
      telephone: user?.telephone || '',
      idNumber: user?.idNumber || ''
    });
    setAvatarFile(null);
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    const fd = new FormData();
    fd.append('nom', profileForm.nom);
    fd.append('telephone', profileForm.telephone);
    fd.append('idNumber', profileForm.idNumber);
    if (avatarFile) fd.append('avatar', avatarFile);
    try {
      await updateMe(fd).unwrap();
      toast.success('Profil mis à jour');
      setIsEditingProfile(false);
    } catch (err) {
      toast.error(err.data?.message || 'Erreur de mise à jour');
    }
  };

  const handleSubmitComment = async (filmId) => {
    if (!commentForm.texte.trim()) { toast.error('Entrez un commentaire'); return; }
    try {
      await addComment({ id: filmId, texte: commentForm.texte, note: commentForm.note }).unwrap();
      toast.success('Avis envoyé avec succès');
      setCommentForm({ filmId: null, texte: '', note: 5 });
    } catch (err) {
      toast.error(err.data?.message || 'Erreur lors de l\'envoi de l\'avis');
    }
  };

  return (
    <div className="pt-24 pb-16 px-4 min-h-screen max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-headline text-4xl font-bold mb-1">Mon Espace</h1>
        <p className="text-muted font-label">Bonjour, {user?.nom?.split(' ')[0]} 👋</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 bg-surface rounded-xl p-1.5 w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-label transition-all ${
              tab === id ? 'bg-gold text-night' : 'text-muted hover:text-white'
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* Reservations Tab */}
      {tab === 'reservations' && (
        <div>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => <div key={i} className="bg-surface rounded-xl h-24 animate-pulse" />)}
            </div>
          ) : data?.bookings?.length === 0 ? (
            <div className="text-center py-16">
              <Ticket size={48} className="text-muted mx-auto mb-4" />
              <p className="text-muted font-label">Aucune réservation pour le moment.</p>
              <a href="/programme" className="text-gold text-sm font-label hover:underline mt-2 inline-block">Voir le programme →</a>
            </div>
          ) : (
            <div className="space-y-4">
              {data?.bookings?.map((booking) => {
                const statusCfg = STATUS_CONFIG[booking.statut] || STATUS_CONFIG.active;
                const StatusIcon = statusCfg.icon;
                const isExpanded = expandedId === booking._id;

                return (
                  <motion.div key={booking._id} className="bg-surface rounded-2xl border border-white/5 overflow-hidden">
                    <div
                      className="p-4 flex items-center gap-4 cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : booking._id)}
                    >
                      {booking.filmId?.poster && (
                        <img src={booking.filmId.poster} alt={booking.filmId.titre} className="w-12 h-16 object-cover rounded-lg" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-label font-semibold text-sm truncate">{booking.filmId?.titre || 'Film'}</h3>
                        <p className="text-muted text-xs mt-0.5">Place {booking.place}{booking.isVIP ? ' (VIP)' : ''} · {booking.immatriculation}</p>
                        <p className="text-muted text-xs">{booking.numero}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-1 text-xs font-label ${statusCfg.color}`}>
                          <StatusIcon size={12} /> {statusCfg.label}
                        </div>
                        <ChevronRight size={16} className={`text-muted transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </div>
                    </div>

                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="border-t border-white/5 p-6"
                      >
                        <div className="flex flex-col sm:flex-row gap-6 items-start">
                          <div className="bg-white p-3 rounded-xl">
                            <QRCodeSVG value={booking._id} size={120} />
                          </div>
                          <div className="flex-1 space-y-2 text-sm">
                            {[
                              ['Montant', `${booking.paiement?.montant?.toLocaleString('fr-CI')} FCFA`],
                              ['Paiement', booking.paiement?.methode],
                              ['Personnes', booking.nombrePersonnes],
                              ['Réservé le', new Date(booking.createdAt).toLocaleDateString('fr-CI')],
                            ].map(([k, v]) => (
                              <div key={k} className="flex justify-between">
                                <span className="text-muted">{k}</span>
                                <span className="text-white font-label">{v}</span>
                              </div>
                            ))}
                            {booking.statut === 'active' && (
                              <Button variant="ghost" onClick={() => handleAnnuler(booking._id)} loading={isAnnulant}>
                                Annuler la réservation
                              </Button>
                            )}
                            {(booking.statut === 'utilisée' || booking.statut === 'active') && booking.filmId && (
                              <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                                <h4 className="text-sm font-label text-white">Laisser un avis sur ce film</h4>
                                {commentForm.filmId === booking.filmId._id ? (
                                  <div className="space-y-3">
                                    <textarea
                                      className="w-full bg-night border border-white/10 rounded-xl p-3 text-sm focus:border-gold outline-none text-white resize-none"
                                      rows="3"
                                      placeholder="Partagez votre expérience..."
                                      value={commentForm.texte}
                                      onChange={(e) => setCommentForm({ ...commentForm, texte: e.target.value })}
                                    />
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted">Note:</span>
                                        <select
                                          className="bg-night border border-white/10 rounded px-2 py-1 text-sm text-white"
                                          value={commentForm.note}
                                          onChange={(e) => setCommentForm({ ...commentForm, note: Number(e.target.value) })}
                                        >
                                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <option key={n} value={n}>{n}/10</option>)}
                                        </select>
                                      </div>
                                      <div className="flex gap-2">
                                        <Button variant="ghost" className="py-1 px-3 text-xs" onClick={() => setCommentForm({ filmId: null, texte: '', note: 5 })}>Annuler</Button>
                                        <Button variant="primary" className="py-1 px-3 text-xs" onClick={() => handleSubmitComment(booking.filmId._id)} loading={isCommenting}>Envoyer</Button>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <Button variant="outline" className="text-xs py-2" onClick={() => setCommentForm({ filmId: booking.filmId._id, texte: '', note: 5 })}>
                                    Écrire un avis
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Favoris Tab */}
      {tab === 'favoris' && (
        <div>
          {meData?.user?.filmsFavoris?.length === 0 ? (
            <div className="text-center py-16">
              <Heart size={48} className="text-muted mx-auto mb-4" />
              <p className="text-muted font-label">Aucun film en favoris.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {meData?.user?.filmsFavoris?.map((film) => (
                <div key={film._id} className="bg-surface rounded-xl overflow-hidden border border-white/5">
                  <img src={film.poster} alt={film.titre} className="w-full aspect-[2/3] object-cover" />
                  <div className="p-3">
                    <p className="text-sm font-label text-white line-clamp-1">{film.titre}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Profil Tab */}
      {tab === 'profil' && (
        <div className="max-w-md">
          <div className="bg-surface rounded-2xl p-6 border border-white/5 space-y-4 relative">
            {!isEditingProfile && (
              <button onClick={handleEditProfileClick} className="absolute top-4 right-4 text-xs text-gold hover:text-white font-label transition-colors">
                Modifier
              </button>
            )}
            <div className="flex items-center gap-4 mb-6">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-gold" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gold/20 border-2 border-gold flex items-center justify-center text-gold text-2xl font-headline font-bold">
                  {user?.nom?.[0]}
                </div>
              )}
              <div>
                <h3 className="font-headline font-bold text-xl">{user?.nom}</h3>
                <p className="text-muted text-sm">{user?.email}</p>
                {user?.role === 'admin' && <span className="text-xs bg-gold/20 text-gold px-2 py-0.5 rounded mt-1 inline-block font-label">Admin</span>}
              </div>
            </div>

            {isEditingProfile ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted block mb-1">Avatar (Optionnel)</label>
                  <input type="file" accept="image/*" className="text-sm text-white" onChange={(e) => setAvatarFile(e.target.files[0])} />
                </div>
                <Input label="Nom" value={profileForm.nom} onChange={(e) => setProfileForm({ ...profileForm, nom: e.target.value })} />
                <Input label="Téléphone" value={profileForm.telephone} onChange={(e) => setProfileForm({ ...profileForm, telephone: e.target.value })} />
                <Input label="Numéro CNI / Passeport" value={profileForm.idNumber} onChange={(e) => setProfileForm({ ...profileForm, idNumber: e.target.value })} />
                <div className="flex gap-3 pt-2">
                  <Button variant="ghost" onClick={() => setIsEditingProfile(false)} className="flex-1">Annuler</Button>
                  <Button variant="primary" onClick={handleSaveProfile} loading={isUpdatingProfile} className="flex-1">Enregistrer</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {[['Email', user?.email], ['Téléphone', user?.telephone || '—'], ['CNI / Passeport', user?.idNumber || '—']].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-sm border-b border-white/5 pb-3">
                    <span className="text-muted">{label}</span>
                    <span className="text-white font-label">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

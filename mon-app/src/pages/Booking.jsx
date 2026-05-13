import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { Check, ChevronRight, Car, Users, Package, CreditCard, QrCode } from 'lucide-react';
import { useGetFilmQuery } from '../store/api/filmsApi';
import { useCreateBookingMutation } from '../store/api/bookingsApi';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import DriveInMap from '../components/booking/DriveInMap';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const STEPS = ['Place', 'Détails', 'Paiement', 'Confirmation'];

const detailsSchema = z.object({
  nombrePersonnes: z.coerce.number().min(1).max(6),
  immatriculation: z.string().min(2).max(15).toUpperCase(),
});

const PACKS = [
  { key: 'packSnack', label: 'Pack Snack', price: 3000, icon: '🍿' },
  { key: 'packBoissons', label: 'Pack Boissons', price: 2500, icon: '🥤' },
  { key: 'packRomantique', label: 'Pack Romantique', price: 5000, icon: '❤️' },
  { key: 'packVIP', label: 'Pack VIP', price: 8000, icon: '👑' },
];

const PAIEMENTS = [
  { key: 'Wave', label: 'Wave CI', icon: '🌊' },
  { key: 'OrangeMoney', label: 'Orange Money', icon: '🟠' },
  { key: 'MTNMoMo', label: 'MTN MoMo', icon: '🟡' },
  { key: 'Carte', label: 'Carte bancaire', icon: '💳' },
];

export default function Booking() {
  const { filmId } = useParams();
  const navigate = useNavigate();
  const isAuth = useSelector(selectIsAuthenticated);
  const [step, setStep] = useState(0);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [isVIP, setIsVIP] = useState(false);
  const [selectedSeance, setSelectedSeance] = useState(null);
  const [options, setOptions] = useState({});
  const [paiementMethod, setPaiementMethod] = useState('Wave');
  const [booking, setBooking] = useState(null);

  const { data: filmData, isLoading } = useGetFilmQuery(filmId);
  const [createBooking, { isLoading: isCreating }] = useCreateBookingMutation();

  const { register, handleSubmit, formState: { errors }, getValues } = useForm({
    resolver: zodResolver(detailsSchema),
    defaultValues: { nombrePersonnes: 2, immatriculation: '' },
  });

  if (!isAuth) {
    navigate('/connexion', { state: { from: `/reservation/${filmId}` } });
    return null;
  }
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" /></div>;

  const film = filmData?.film;
  if (!film) return null;

  const montantBase = isVIP ? 10000 : 5000;
  const montantOptions = PACKS.reduce((acc, p) => acc + (options[p.key] ? p.price : 0), 0);
  const total = montantBase + montantOptions;

  const handleSeatSelect = (id, vip) => {
    setSelectedSeat(id);
    setIsVIP(vip);
  };

  const onSubmitDetails = () => setStep(2);

  const handlePay = async () => {
    const { nombrePersonnes, immatriculation } = getValues();
    try {
      const res = await createBooking({
        filmId,
        seanceId: selectedSeance,
        place: selectedSeat,
        isVIP,
        immatriculation,
        nombrePersonnes,
        options,
        paiement: { methode: paiementMethod, montant: total },
      }).unwrap();
      setBooking(res.booking);
      setStep(3);
      toast.success('Réservation confirmée !');
    } catch (err) {
      toast.error(err.data?.message || 'Erreur lors du paiement');
    }
  };

  return (
    <div className="pt-24 pb-16 px-4 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-label font-bold transition-all ${
                i < step ? 'bg-gold text-night' : i === step ? 'bg-gold text-night animate-pulse-gold' : 'bg-surface text-muted border border-white/10'
              }`}>
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span className={`text-xs font-label hidden sm:block ${i === step ? 'text-gold' : 'text-muted'}`}>{s}</span>
              {i < STEPS.length - 1 && <ChevronRight size={14} className="text-white/20" />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1 — Sélection place */}
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h2 className="font-headline text-2xl sm:text-3xl font-bold mb-2 leading-tight">{film.titre}</h2>
              <p className="text-muted mb-6 font-label text-sm">Sélectionnez votre séance puis votre place</p>

              {/* Séances */}
              <div className="flex gap-3 flex-wrap mb-8">
                {film.seances?.map((s) => (
                  <button
                    key={s._id}
                    onClick={() => setSelectedSeance(s._id)}
                    className={`px-4 py-2 rounded-xl text-sm font-label border transition-all ${
                      selectedSeance === s._id ? 'bg-gold text-night border-gold' : 'bg-surface text-muted border-white/10 hover:border-gold/50'
                    }`}
                  >
                    {new Date(s.date).toLocaleDateString('fr-CI', { weekday: 'short', day: 'numeric', month: 'short' })} — {s.heure}
                    <span className="ml-2 text-xs opacity-70">({s.placesDisponibles} dispo)</span>
                  </button>
                ))}
              </div>

              {selectedSeance && (
                <>
                  <DriveInMap
                    takenSeats={[]}
                    selected={selectedSeat}
                    onSelect={handleSeatSelect}
                  />
                  <div className="mt-8 flex justify-end">
                    <Button
                      variant="primary"
                      disabled={!selectedSeat}
                      onClick={() => setStep(1)}
                    >
                      Continuer <ChevronRight size={16} />
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* STEP 2 — Détails */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h2 className="font-headline text-2xl sm:text-3xl font-bold mb-6">Détails du véhicule</h2>
              <form onSubmit={handleSubmit(onSubmitDetails)} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <Input
                      label="Nombre de personnes"
                      type="number"
                      min={1} max={6}
                      className="pl-10"
                      error={errors.nombrePersonnes?.message}
                      {...register('nombrePersonnes')}
                    />
                  </div>
                  <div className="relative">
                    <Car size={16} className="absolute left-3 top-9 text-muted" />
                    <Input
                      label="Immatriculation du véhicule"
                      placeholder="CI-000-ABC"
                      className="pl-10 uppercase"
                      error={errors.immatriculation?.message}
                      {...register('immatriculation')}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="font-label font-semibold mb-4 flex items-center gap-2"><Package size={16} className="text-gold" />Options</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {PACKS.map((p) => (
                      <button
                        type="button"
                        key={p.key}
                        onClick={() => setOptions((o) => ({ ...o, [p.key]: !o[p.key] }))}
                        className={`p-4 rounded-xl border text-left transition-all ${options[p.key] ? 'border-gold bg-gold/10' : 'border-white/10 bg-surface hover:border-gold/30'}`}
                      >
                        <span className="text-2xl mb-2 block">{p.icon}</span>
                        <p className="text-sm font-label text-white">{p.label}</p>
                        <p className="text-xs text-gold mt-1">{p.price.toLocaleString('fr-CI')} FCFA</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="ghost" type="button" onClick={() => setStep(0)}>← Retour</Button>
                  <Button variant="primary" type="submit">Continuer <ChevronRight size={16} /></Button>
                </div>
              </form>
            </motion.div>
          )}

          {/* STEP 3 — Paiement */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h2 className="font-headline text-2xl sm:text-3xl font-bold mb-6">Paiement</h2>
              {/* On mobile: recap first so Pay button is reachable without scrolling past all options */}
              <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                <div className="md:order-2 bg-surface rounded-2xl p-4 sm:p-6 border border-white/5 h-fit">
                  <h3 className="font-label font-semibold mb-4 text-gold">Récapitulatif</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-muted"><span>Film</span><span className="text-white">{film.titre}</span></div>
                    <div className="flex justify-between text-muted"><span>Place</span><span className="text-white">{selectedSeat}{isVIP ? ' (VIP)' : ''}</span></div>
                    <div className="flex justify-between text-muted"><span>Place {isVIP ? 'VIP' : 'Standard'}</span><span className="text-white">{montantBase.toLocaleString('fr-CI')} FCFA</span></div>
                    {PACKS.filter((p) => options[p.key]).map((p) => (
                      <div key={p.key} className="flex justify-between text-muted"><span>{p.label}</span><span className="text-white">+{p.price.toLocaleString('fr-CI')} FCFA</span></div>
                    ))}
                    <div className="border-t border-white/10 pt-3 flex justify-between font-semibold">
                      <span className="text-muted">Total</span>
                      <span className="text-gold text-lg">{total.toLocaleString('fr-CI')} FCFA</span>
                    </div>
                  </div>
                  <Button variant="primary" className="w-full mt-6" onClick={handlePay} loading={isCreating}>
                    Payer {total.toLocaleString('fr-CI')} FCFA
                  </Button>
                </div>

                <div className="md:order-1">
                  <h3 className="font-label font-semibold mb-4 flex items-center gap-2"><CreditCard size={16} className="text-gold" />Méthode de paiement</h3>
                  <div className="space-y-3">
                    {PAIEMENTS.map((p) => (
                      <button
                        key={p.key}
                        onClick={() => setPaiementMethod(p.key)}
                        className={`w-full flex items-center gap-4 p-3 sm:p-4 rounded-xl border transition-all ${paiementMethod === p.key ? 'border-gold bg-gold/10' : 'border-white/10 bg-surface hover:border-gold/30'}`}
                      >
                        <span className="text-xl sm:text-2xl">{p.icon}</span>
                        <span className="font-label text-sm text-white">{p.label}</span>
                        {paiementMethod === p.key && <Check size={16} className="text-gold ml-auto" />}
                      </button>
                    ))}
                  </div>
                  <div className="mt-6">
                    <Button variant="ghost" onClick={() => setStep(1)}>← Retour</Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4 — Confirmation */}
          {step === 3 && booking && (
            <motion.div key="s3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <motion.div
                className="w-20 h-20 rounded-full bg-gold/20 border-2 border-gold flex items-center justify-center mx-auto mb-6"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: 3, duration: 0.5 }}
              >
                <Check size={36} className="text-gold" />
              </motion.div>
              <h2 className="font-headline text-3xl sm:text-4xl font-bold mb-2">Réservation confirmée !</h2>
              <p className="text-muted mb-8">Un email de confirmation vous a été envoyé.</p>

              <div className="glass rounded-2xl p-4 sm:p-8 max-w-md mx-auto mb-8">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-white rounded-xl animate-pulse-gold">
                    <QRCodeSVG value={booking._id} size={160} />
                  </div>
                </div>
                <div className="space-y-3 text-sm text-left">
                  {[
                    ['Film', film.titre],
                    ['Place', `${booking.place}${booking.isVIP ? ' (VIP)' : ''}`],
                    ['Véhicule', booking.immatriculation],
                    ['Réservation', booking.numero],
                    ['Montant', `${booking.paiement.montant.toLocaleString('fr-CI')} FCFA`],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-muted">{label}</span>
                      <span className="text-white font-label">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" onClick={() => navigate('/espace')}>
                  <QrCode size={16} /> Mes réservations
                </Button>
                <Button variant="primary" onClick={() => navigate('/programme')}>
                  Voir le programme
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

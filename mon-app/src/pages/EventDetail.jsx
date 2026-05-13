import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, CalendarDays, Tag, Send, Building2, Heart, Music, Trophy, PartyPopper } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useGetEventQuery, useDemanderDevisMutation } from '../store/api/eventsApi';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const devisSchema = z.object({
  nom:             z.string().min(2, 'Nom requis'),
  email:           z.string().email('Email invalide'),
  telephone:       z.string().min(8, 'Téléphone invalide'),
  dateEvenement:   z.string().min(1, 'Date requise'),
  nombrePersonnes: z.coerce.number().int().min(1, 'Requis'),
  message:         z.string().min(10, 'Message trop court'),
});

const EVENT_ICONS = {
  'Soirée corpo': Building2,
  Anniversaire: PartyPopper,
  Mariage: Heart,
  Match: Trophy,
  Concert: Music,
  Autre: PartyPopper,
};

export default function EventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useGetEventQuery(eventId);
  const [demanderDevis, { isLoading: isSending }] = useDemanderDevisMutation();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(devisSchema),
  });

  const onSubmit = async (values) => {
    try {
      await demanderDevis({ id: eventId, ...values }).unwrap();
      toast.success('Demande envoyée ! Nous vous contacterons sous 24h.');
      reset();
    } catch (err) {
      toast.error(err.data?.message || 'Erreur lors de l\'envoi');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const event = data?.event;
  if (!event) {
    return (
      <div className="pt-24 text-center text-muted">
        Événement introuvable.{' '}
        <button onClick={() => navigate(-1)} className="text-gold underline ml-1">Retour</button>
      </div>
    );
  }

  const Icon = EVENT_ICONS[event.type] || PartyPopper;

  return (
    <div className="pt-16 min-h-screen">
      {/* ── Hero ── */}
      <div className="relative h-64 sm:h-80 overflow-hidden">
        {event.image ? (
          <img src={event.image} alt={event.titre} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gold/10 via-surface to-cinema/10 flex items-center justify-center">
            <Icon size={80} className="text-gold opacity-30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/40 to-transparent" />

        <button
          onClick={() => navigate(-1)}
          className="absolute top-5 left-4 sm:left-8 glass px-3 py-2 rounded-xl text-sm font-label flex items-center gap-1.5 hover:border-gold/40 transition-colors"
        >
          <ArrowLeft size={14} /> Retour
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={16} className="text-gold" />
              <span className="text-xs font-label text-gold uppercase tracking-wider">{event.type}</span>
            </div>
            <h1 className="font-headline text-3xl sm:text-4xl font-bold text-white">{event.titre}</h1>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-10 pb-20">
        <div className="grid lg:grid-cols-3 gap-10">

          {/* Left — info */}
          <div className="lg:col-span-2 space-y-8">
            <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="font-headline text-xl font-bold mb-3">Description</h2>
              <p className="text-muted leading-relaxed">{event.description}</p>
            </motion.section>

            {/* Meta chips */}
            <div className="flex flex-wrap gap-3">
              {event.capacite && (
                <div className="glass px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-label">
                  <Users size={14} className="text-gold" />
                  <span>Jusqu'à <strong>{event.capacite}</strong> personnes</span>
                </div>
              )}
              {event.date && (
                <div className="glass px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-label">
                  <CalendarDays size={14} className="text-gold" />
                  <span>{new Date(event.date).toLocaleDateString('fr-CI', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
              )}
              {event.prix > 0 && (
                <div className="glass px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-label">
                  <Tag size={14} className="text-gold" />
                  <span>À partir de <strong className="text-gold">{event.prix.toLocaleString('fr-CI')} FCFA</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* Right — devis form */}
          <div className="lg:col-span-1">
            <div className="bg-surface border border-white/5 rounded-2xl p-5 sm:p-6 sticky top-24">
              <h3 className="font-headline text-lg font-bold mb-4 flex items-center gap-2">
                <Send size={16} className="text-gold" />Demander un devis
              </h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <Input label="Nom complet" error={errors.nom?.message} {...register('nom')} />
                <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
                <Input label="Téléphone" error={errors.telephone?.message} {...register('telephone')} />
                <Input label="Date souhaitée" type="date" error={errors.dateEvenement?.message} {...register('dateEvenement')} />
                <Input label="Nombre de personnes" type="number" min={1} error={errors.nombrePersonnes?.message} {...register('nombrePersonnes')} />
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-label text-muted">Message</label>
                  <textarea
                    rows={3}
                    placeholder="Décrivez votre projet..."
                    className={`bg-night border ${errors.message ? 'border-cinema' : 'border-white/10'} text-white rounded-xl px-3 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:border-gold transition-colors resize-none`}
                    {...register('message')}
                  />
                  {errors.message && <p className="text-xs text-cinema">{errors.message.message}</p>}
                </div>
                <Button type="submit" variant="primary" className="w-full" loading={isSending}>
                  <Send size={14} /> Envoyer
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

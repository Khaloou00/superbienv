import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Building2, Heart, Music, Trophy, PartyPopper, Send, ArrowRight } from 'lucide-react';
import { useGetEventsQuery, useDemanderDevisMutation } from '../store/api/eventsApi';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import StarField from '../components/ui/StarField';

const devisSchema = z.object({
  nom:             z.string().min(2, 'Nom requis'),
  email:           z.string().email('Email invalide'),
  telephone:       z.string().min(8, 'Téléphone invalide'),
  dateEvenement:   z.string().min(1, 'Date requise'),
  nombrePersonnes: z.coerce.number().min(1, 'Requis'),
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

const TEMOIGNAGES = [
  { nom: 'Awa Koné', role: 'DRH, Société Ivoire', text: 'Un cadre exceptionnel pour notre soirée d\'entreprise. L\'équipe SUPERBIENV a été professionnelle et attentive à chaque détail. Nos collaborateurs en parlent encore !' },
  { nom: 'Jean-Marc Assi', role: 'Particulier', text: 'Anniversaire de mariage inoubliable sous les étoiles. Le pack romantique était parfait. Merci SUPERBIENV !' },
  { nom: 'Fatou Diallo', role: 'Event Planner', text: 'Je recommande systématiquement SUPERBIENV à mes clients. La qualité de service est au rendez-vous, toujours.' },
];

export default function Evenements() {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { data, isLoading } = useGetEventsQuery();
  const [demanderDevis, { isLoading: isSending }] = useDemanderDevisMutation();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(devisSchema),
  });

  const onSubmit = async (values) => {
    if (!selectedEvent) { toast.error('Sélectionnez un événement ci-dessus'); return; }
    try {
      await demanderDevis({ id: selectedEvent, ...values }).unwrap();
      toast.success('Demande envoyée ! Nous vous contacterons sous 24h.');
      reset();
    } catch (err) {
      toast.error(err.data?.message || 'Erreur lors de l\'envoi');
    }
  };

  return (
    <div className="pt-16 min-h-screen">
      {/* Header */}
      <div className="relative bg-surface py-20 px-4 overflow-hidden">
        <StarField count={60} />
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <motion.span
            className="font-label text-gold text-sm tracking-widest uppercase mb-3 block"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          >
            Privatisation & Événements
          </motion.span>
          <motion.h1
            className="font-headline text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          >
            Votre événement,<br /><span className="text-gradient-gold">notre scène</span>
          </motion.h1>
          <p className="text-muted max-w-xl mx-auto">
            Du séminaire d'entreprise au mariage en passant par les concerts, nous créons des moments mémorables.
          </p>
        </div>
      </div>

      {/* Event Cards */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <p className="text-muted text-sm font-label mb-6 text-center">
          Cliquez sur un événement pour voir les détails ou pour le sélectionner dans le formulaire de devis ci-dessous.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? [...Array(6)].map((_, i) => <div key={i} className="bg-surface rounded-2xl h-64 animate-pulse" />)
            : data?.events?.map((event, i) => {
                const Icon = EVENT_ICONS[event.type] || PartyPopper;
                return (
                  <motion.div
                    key={event._id}
                    className={`bg-surface rounded-2xl overflow-hidden border card-hover cursor-pointer transition-all ${
                      selectedEvent === event._id ? 'border-gold' : 'border-white/5'
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => setSelectedEvent(event._id)}
                  >
                    {event.image ? (
                      <img src={event.image} alt={event.titre} className="w-full h-48 object-cover" />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-gold/10 to-cinema/10 flex items-center justify-center">
                        <Icon size={48} className="text-gold opacity-50" />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon size={16} className="text-gold" />
                        <span className="text-xs font-label text-gold uppercase">{event.type}</span>
                      </div>
                      <h3 className="font-headline font-bold text-lg mb-1">{event.titre}</h3>
                      <p className="text-muted text-sm line-clamp-2 mb-3">{event.description}</p>
                      {event.prix > 0 && (
                        <p className="text-gold font-label text-sm">
                          À partir de {event.prix.toLocaleString('fr-CI')} FCFA
                        </p>
                      )}
                      <button
                        className="mt-3 flex items-center gap-1 text-xs font-label text-white/50 hover:text-gold transition-colors"
                        onClick={(e) => { e.stopPropagation(); navigate(`/evenement/${event._id}`); }}
                      >
                        Voir les détails <ArrowRight size={12} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
        </div>
      </section>

      {/* Devis Form */}
      <section className="bg-surface py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-headline text-4xl font-bold mb-3">Demander un devis</h2>
            <p className="text-muted">
              {selectedEvent
                ? `Événement sélectionné — complétez le formulaire ci-dessous.`
                : 'Sélectionnez un événement ci-dessus, puis complétez le formulaire.'}
            </p>
            {selectedEvent && (
              <p className="text-xs text-gold font-label mt-1">
                ✓ {data?.events?.find((e) => e._id === selectedEvent)?.titre}
              </p>
            )}
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Nom complet" error={errors.nom?.message} {...register('nom')} />
              <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Téléphone" error={errors.telephone?.message} {...register('telephone')} />
              <Input label="Date de l'événement" type="date" error={errors.dateEvenement?.message} {...register('dateEvenement')} />
            </div>
            <Input
              label="Nombre de personnes"
              type="number" min={1}
              error={errors.nombrePersonnes?.message}
              {...register('nombrePersonnes')}
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-label text-muted">Message</label>
              <textarea
                className={`bg-night border ${errors.message ? 'border-cinema' : 'border-white/10'} text-white rounded-xl px-4 py-3 font-body text-sm placeholder:text-muted focus:outline-none focus:border-gold transition-colors resize-none`}
                rows={4}
                placeholder="Décrivez votre événement..."
                {...register('message')}
              />
              {errors.message && <p className="text-xs text-cinema">{errors.message.message}</p>}
            </div>
            <Button type="submit" variant="primary" className="w-full" loading={isSending}>
              <Send size={16} /> Envoyer la demande
            </Button>
          </form>
        </div>
      </section>

      {/* Témoignages */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-headline text-4xl font-bold">Ils nous ont fait confiance</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TEMOIGNAGES.map(({ nom, role, text }, i) => (
            <motion.div
              key={nom}
              className="bg-surface rounded-2xl p-6 border border-white/5 card-hover"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <p className="text-muted text-sm leading-relaxed mb-4">"{text}"</p>
              <div>
                <p className="font-label font-semibold text-white">{nom}</p>
                <p className="text-xs text-gold">{role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

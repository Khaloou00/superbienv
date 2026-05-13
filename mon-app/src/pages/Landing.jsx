import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Film, CalendarDays, Utensils, Crown, ChevronDown, Star } from 'lucide-react';
import StarField from '../components/ui/StarField';
import Button from '../components/ui/Button';
import { useGetFilmsQuery } from '../store/api/filmsApi';
import FilmCard from '../components/ui/FilmCard';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

const stats = [
  { label: 'Places', value: '80+' },
  { label: 'Films / semaine', value: '7' },
  { label: 'Événements / mois', value: '10+' },
  { label: 'Partenaires', value: '20+' },
];

const services = [
  { icon: Film, title: 'Cinéma', desc: 'Films, matchs, concerts sous les étoiles dans votre voiture.' },
  { icon: CalendarDays, title: 'Événements', desc: 'Privatisations, soirées corpo, anniversaires et mariages.' },
  { icon: Utensils, title: 'Gastronomie', desc: 'Restauration livrée à votre véhicule. Snacks, boissons, packs.' },
  { icon: Crown, title: 'VIP', desc: 'Places premium, service dédié, expérience haut de gamme.' },
];

export default function Landing() {
  const heroRef = useRef(null);
  const { data, isLoading } = useGetFilmsQuery({ limit: 4 });

  return (
    <div className="overflow-x-hidden">
      {/* HERO */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        <StarField count={150} />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600&q=80')" }}
        />
        <div className="absolute inset-0 bg-hero-gradient" />

        <motion.div
          className="relative z-10 text-center px-4 max-w-4xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
        >
          <motion.div variants={fadeUp} className="mb-4">
            <span className="font-label text-gold text-sm tracking-[0.3em] uppercase">Abidjan, Côte d'Ivoire 🇨🇮</span>
          </motion.div>
          <motion.h1 variants={fadeUp} className="font-headline text-4xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            L'Expérience Cinéma
            <br />
            <span className="text-gradient-gold">Réinventée à Abidjan</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-muted text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Réservez votre place. Vivez le moment.
            <br />
            Films, événements et gastronomie — depuis votre voiture, sous les étoiles.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/programme">
              <Button variant="primary" className="text-base px-8 py-4 animate-pulse-gold">
                Réserver maintenant
              </Button>
            </Link>
            <Link to="/programme">
              <Button variant="outline" className="text-base px-8 py-4">
                Voir le programme
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ChevronDown size={24} />
        </motion.div>
      </section>

      {/* ABOUT */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="font-label text-gold text-sm tracking-widest uppercase mb-3 block">À propos</span>
            <h2 className="font-headline text-4xl font-bold mb-6">Plus qu'un cinéma.<br/>Une expérience de vie.</h2>
            <p className="text-muted leading-relaxed mb-6">
              SUPERBIENV Drive-In Cinéma est une nouvelle référence en matière de divertissement urbain premium à Abidjan.
              Inspiré des grands concepts internationaux et adapté aux réalités africaines, ce projet offre une expérience
              unique mêlant cinéma en plein air, innovation digitale, gastronomie et moments conviviaux.
            </p>
            <p className="text-muted leading-relaxed">
              Un véritable <span className="text-gold font-semibold">hub de vie et d'expériences</span>, accessible aux couples,
              familles, groupes d'amis et entreprises recherchant un cadre moderne, sécurisé et attractif.
            </p>
          </motion.div>
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="aspect-video rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80"
                alt="Drive-In Cinema"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 glass rounded-xl p-4 border border-gold/20">
              <div className="flex items-center gap-2">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} className="text-gold fill-gold" />)}
              </div>
              <p className="text-sm text-white mt-1 font-label">Expérience premium</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-surface py-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ label, value }, i) => (
            <motion.div
              key={label}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <p className="font-headline text-4xl font-bold text-gradient-gold">{value}</p>
              <p className="text-muted font-label text-sm mt-1">{label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="font-label text-gold text-sm tracking-widest uppercase mb-3 block">Services</span>
          <h2 className="font-headline text-4xl font-bold">Une expérience complète</h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              className="bg-surface border border-white/5 rounded-2xl p-6 card-hover group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-4 group-hover:bg-gold/20 transition-colors">
                <Icon size={22} className="text-gold" />
              </div>
              <h3 className="font-label font-semibold text-white mb-2">{title}</h3>
              <p className="text-muted text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FILMS EN VEDETTE */}
      {!isLoading && data?.films?.length > 0 && (
        <section className="py-24 px-4 bg-surface">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="font-label text-gold text-sm tracking-widest uppercase mb-3 block">Programme</span>
                <h2 className="font-headline text-4xl font-bold">À l'affiche</h2>
              </div>
              <Link to="/programme" className="text-gold font-label text-sm hover:underline">
                Voir tout →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {data.films.map((film) => (
                <FilmCard key={film._id} film={film} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA FINAL */}
      <section className="relative py-32 px-4 overflow-hidden">
        <StarField count={80} />
        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <motion.h2
            className="font-headline text-4xl sm:text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Prêt à vivre le cinéma
            <br />
            <span className="text-gradient-gold">autrement ?</span>
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link to="/programme">
              <Button variant="primary" className="text-lg px-10 py-4">
                Voir le programme
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

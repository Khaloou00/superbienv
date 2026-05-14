/**
 * SUPERBIENV — Database Seeder
 *
 * Usage:
 *   node seeder.js           → clear all data, then insert seed data
 *   node seeder.js --destroy → clear all data only (no insert)
 *
 * Admin credentials inserted: admin@superbienv.ci / 01010101
 */

import 'dotenv/config';
import connectDB from './config/db.js';
import User from './models/User.js';
import Film from './models/Film.js';
import Event from './models/Event.js';
import Booking from './models/Booking.js';
import { generateQRCode } from './utils/generateQR.js';

// ─── helpers ────────────────────────────────────────────────────────────────

/** Returns a Date offset by `days` from today (negative = past). */
const d = (days) => {
  const dt = new Date();
  dt.setDate(dt.getDate() + days);
  dt.setHours(20, 30, 0, 0);
  return dt;
};

// ─── seed data ───────────────────────────────────────────────────────────────

const USERS_DATA = [
  {
    nom: 'Admin SUPERBIENV',
    email: 'admin@superbienv.ci',
    password: '01010101',
    role: 'admin',
    telephone: '+225 07 00 00 00 01',
    isVerified: true,
  },
  {
    nom: 'Kouassi Jean-Pierre',
    email: 'jpa.kouassi@gmail.com',
    password: 'password123',
    telephone: '+225 05 12 34 56 78',
    isVerified: true,
  },
  {
    nom: 'Aminata Diallo',
    email: 'aminata.diallo@gmail.com',
    password: 'password123',
    telephone: '+225 07 98 76 54 32',
    isVerified: true,
  },
  {
    nom: 'Kofi Mensah',
    email: 'kofi.mensah@outlook.com',
    password: 'password123',
    telephone: '+225 01 11 22 33 44',
    isVerified: true,
  },
  {
    nom: 'Fatou Bamba',
    email: 'fatou.bamba@yahoo.fr',
    password: 'password123',
    telephone: '+225 05 55 66 77 88',
    isVerified: true,
  },
  {
    nom: 'Mamadou Traoré',
    email: 'mtraore@entreprise.ci',
    password: 'password123',
    telephone: '+225 07 44 33 22 11',
    isVerified: true,
  },
  {
    nom: 'Awa Koné',
    email: 'awa.kone@gmail.com',
    password: 'password123',
    telephone: '+225 05 99 88 77 66',
    isVerified: true,
  },
];

const FILMS_DATA = [
  {
    titre: 'Black Panther: Wakanda Forever',
    poster: 'https://images.unsplash.com/photo-1618945524163-32451704cbb8?w=400&h=600&fit=crop&q=80',
    synopsis: 'La reine Ramonda, Shuri, M\'Baku, Okoye et les Dora Milaje luttent pour protéger leur nation des puissances mondiales envahissantes après la mort du roi T\'Challa.',
    genre: 'Action',
    type: 'Film',
    duree: 161,
    realisateur: 'Ryan Coogler',
    casting: ['Letitia Wright', 'Angela Bassett', 'Tenoch Huerta'],
    note: 8.2,
    langue: 'VF',
    age: 'Tout public',
    badge: 'NOUVEAU',
    seances: [
      { date: d(-2), heure: '19:00', placesTotal: 80, placesDisponibles: 45, placesVIP: 10, placesVIPDisponibles: 5 },
      { date: d(1),  heure: '20:30', placesTotal: 80, placesDisponibles: 72, placesVIP: 10, placesVIPDisponibles: 9 },
      { date: d(3),  heure: '21:00', placesTotal: 80, placesDisponibles: 80, placesVIP: 10, placesVIPDisponibles: 10 },
    ],
  },
  {
    titre: 'Avatar: La Voie de l\'Eau',
    poster: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop&q=80',
    synopsis: 'Jake Sully vit avec sa nouvelle famille formée sur la planète Pandora. Quand une menace familière revient pour terminer ce qui avait été commencé, Jake doit travailler avec Neytiri.',
    genre: 'Action',
    type: 'Film',
    duree: 192,
    realisateur: 'James Cameron',
    casting: ['Sam Worthington', 'Zoe Saldana', 'Sigourney Weaver'],
    note: 7.6,
    langue: 'VF',
    age: 'Tout public',
    badge: '',
    seances: [
      { date: d(-1), heure: '20:00', placesTotal: 80, placesDisponibles: 30, placesVIP: 10, placesVIPDisponibles: 2 },
      { date: d(2),  heure: '20:00', placesTotal: 80, placesDisponibles: 68, placesVIP: 10, placesVIPDisponibles: 8 },
      { date: d(5),  heure: '19:30', placesTotal: 80, placesDisponibles: 80, placesVIP: 10, placesVIPDisponibles: 10 },
    ],
  },
  {
    titre: 'Tirailleurs',
    poster: 'https://images.unsplash.com/photo-1519669417670-68775a50919c?w=400&h=600&fit=crop&q=80',
    synopsis: 'Pour suivre son fils enrôlé de force dans l\'armée française, Bakary Diallo s\'enrôle à son tour. Père et fils se retrouvent sur le front de la Première Guerre mondiale.',
    genre: 'Drame',
    type: 'Film',
    duree: 87,
    realisateur: 'Mathieu Vadepied',
    casting: ['Omar Sy', 'Alassane Diong'],
    note: 7.8,
    langue: 'VF',
    age: '12+',
    badge: 'NOUVEAU',
    seances: [
      { date: d(0),  heure: '19:00', placesTotal: 80, placesDisponibles: 55, placesVIP: 10, placesVIPDisponibles: 7 },
      { date: d(4),  heure: '20:30', placesTotal: 80, placesDisponibles: 78, placesVIP: 10, placesVIPDisponibles: 10 },
    ],
  },
  {
    titre: 'Le Lion du Sahel',
    poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop&q=80',
    synopsis: 'À Abidjan, un jeune entrepreneur doit surmonter les obstacles d\'un système corrompu pour sauver l\'entreprise familiale et l\'honneur de sa famille.',
    genre: 'Drame',
    type: 'Film',
    duree: 110,
    realisateur: 'Ladj Ly',
    casting: ['Bakary Koné', 'Fatoumata Diabaté', 'Ibrahim Coulibaly'],
    note: 8.5,
    langue: 'VF',
    age: 'Tout public',
    badge: '',
    seances: [
      { date: d(1),  heure: '18:30', placesTotal: 80, placesDisponibles: 62, placesVIP: 10, placesVIPDisponibles: 9 },
      { date: d(6),  heure: '20:00', placesTotal: 80, placesDisponibles: 80, placesVIP: 10, placesVIPDisponibles: 10 },
    ],
  },
  {
    titre: 'Spider-Man: No Way Home',
    poster: 'https://images.unsplash.com/photo-1604975999044-188783d54fb3?w=400&h=600&fit=crop&q=80',
    synopsis: 'Pour la première fois dans l\'histoire cinématographique de Spider-Man, notre héros est démasqué, et il n\'est plus capable de séparer sa vie normale de ses grands enjeux.',
    genre: 'Action',
    type: 'Film',
    duree: 148,
    realisateur: 'Jon Watts',
    casting: ['Tom Holland', 'Zendaya', 'Benedict Cumberbatch'],
    note: 8.3,
    langue: 'VOST',
    age: 'Tout public',
    badge: '',
    seances: [
      { date: d(-3), heure: '21:00', placesTotal: 80, placesDisponibles: 12, placesVIP: 10, placesVIPDisponibles: 0 },
      { date: d(2),  heure: '20:30', placesTotal: 80, placesDisponibles: 50, placesVIP: 10, placesVIPDisponibles: 6 },
    ],
  },
  {
    titre: 'La Belle et la Cité',
    poster: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=400&h=600&fit=crop&q=80',
    synopsis: 'Une romance inattendue naît entre une architecte ambitieuse venue de Dakar et un musicien de rue d\'Abidjan, dans une ville qui ne dort jamais.',
    genre: 'Romance',
    type: 'Film',
    duree: 105,
    realisateur: 'Mati Diop',
    casting: ['Awa Sangaré', 'Seydou Gassama'],
    note: 7.9,
    langue: 'VF',
    age: 'Tout public',
    badge: 'NOUVEAU',
    seances: [
      { date: d(0),  heure: '20:00', placesTotal: 80, placesDisponibles: 48, placesVIP: 10, placesVIPDisponibles: 8 },
      { date: d(7),  heure: '19:30', placesTotal: 80, placesDisponibles: 80, placesVIP: 10, placesVIPDisponibles: 10 },
    ],
  },
  {
    titre: 'The Lion King (2019)',
    poster: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=400&h=600&fit=crop&q=80',
    synopsis: 'Le jeune Simba idolâtre son père, le roi Mufasa. Mais quand son oncle Scar l\'évince du trône et cause la mort de Mufasa, Simba doit revenir revendiquer sa place.',
    genre: 'Animation',
    type: 'Film',
    duree: 118,
    realisateur: 'Jon Favreau',
    casting: ['Donald Glover', 'Beyoncé', 'Seth Rogen'],
    note: 6.9,
    langue: 'VF',
    age: 'Tout public',
    badge: '',
    seances: [
      { date: d(1),  heure: '17:00', placesTotal: 80, placesDisponibles: 35, placesVIP: 10, placesVIPDisponibles: 4 },
      { date: d(4),  heure: '17:30', placesTotal: 80, placesDisponibles: 70, placesVIP: 10, placesVIPDisponibles: 9 },
    ],
  },
  {
    titre: 'Lupin — Saison Spéciale',
    poster: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&h=600&fit=crop&q=80',
    synopsis: 'Assane Diop, fils d\'immigré sénégalais devenu le plus grand voleur de France, utilise les méthodes d\'Arsène Lupin pour venger l\'honneur de son père.',
    genre: 'Thriller',
    type: 'Film',
    duree: 96,
    realisateur: 'Louis Leterrier',
    casting: ['Omar Sy', 'Ludivine Sagnier', 'Antoine Gouy'],
    note: 7.5,
    langue: 'VF',
    age: '12+',
    badge: 'CE SOIR',
    seances: [
      { date: d(0),  heure: '21:30', placesTotal: 80, placesDisponibles: 22, placesVIP: 10, placesVIPDisponibles: 3 },
      { date: d(3),  heure: '21:00', placesTotal: 80, placesDisponibles: 75, placesVIP: 10, placesVIPDisponibles: 10 },
    ],
  },
  {
    titre: 'AFCON 2024 — CIV vs EGY',
    poster: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&h=600&fit=crop&q=80',
    synopsis: 'Revivez en direct sur grand écran la demi-finale épique entre les Éléphants de Côte d\'Ivoire et les Pharaons d\'Égypte lors de la CAN 2024.',
    genre: 'Sport',
    type: 'Match',
    duree: 120,
    realisateur: 'CAF',
    casting: ['Sébastien Haller', 'Franck Kessié', 'Nicolas Pépé'],
    note: 9.1,
    langue: 'VF',
    age: 'Tout public',
    badge: 'NOUVEAU',
    seances: [
      { date: d(2),  heure: '21:00', placesTotal: 80, placesDisponibles: 5,  placesVIP: 10, placesVIPDisponibles: 1 },
    ],
  },
  {
    titre: 'Burna Boy Live — African Giant Tour',
    poster: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=600&fit=crop&q=80',
    synopsis: 'Retransmission exclusive du concert légendaire de Burna Boy au Stade de France. Afrobeats, énergie pure et spectacle son & lumière inoubliable.',
    genre: 'Concert',
    type: 'Concert',
    duree: 150,
    realisateur: 'Live Nation Africa',
    casting: ['Burna Boy', 'Wizkid (guest)', 'Tems (guest)'],
    note: 9.4,
    langue: 'EN',
    age: 'Tout public',
    badge: 'VIP',
    seances: [
      { date: d(5),  heure: '22:00', placesTotal: 80, placesDisponibles: 18, placesVIP: 10, placesVIPDisponibles: 2 },
    ],
  },
  {
    titre: 'Ma Belle-Mère Diabolique 3',
    poster: 'https://images.unsplash.com/photo-1572177812156-58036aae439c?w=400&h=600&fit=crop&q=80',
    synopsis: 'La famille Kouamé est de retour pour de nouvelles aventures hilarantes. Quand la belle-mère débarque sans prévenir pour les fêtes, le chaos s\'installe.',
    genre: 'Comédie',
    type: 'Film',
    duree: 95,
    realisateur: 'Henri Duparc',
    casting: ['Evelyne Kéké', 'Serge Béhi', 'Akissi Delta'],
    note: 7.2,
    langue: 'VF',
    age: 'Tout public',
    badge: '',
    seances: [
      { date: d(-1), heure: '18:00', placesTotal: 80, placesDisponibles: 40, placesVIP: 10, placesVIPDisponibles: 6 },
      { date: d(3),  heure: '18:30', placesTotal: 80, placesDisponibles: 65, placesVIP: 10, placesVIPDisponibles: 9 },
      { date: d(8),  heure: '19:00', placesTotal: 80, placesDisponibles: 80, placesVIP: 10, placesVIPDisponibles: 10 },
    ],
  },
  {
    titre: 'Nope',
    poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=600&fit=crop&q=80',
    synopsis: 'Les habitants d\'une vallée reculée de Californie font face à une découverte terrifiante et surnaturelle. Un film de Jordan Peele comme aucun autre.',
    genre: 'Horreur',
    type: 'Film',
    duree: 130,
    realisateur: 'Jordan Peele',
    casting: ['Daniel Kaluuya', 'Keke Palmer', 'Steven Yeun'],
    note: 7.0,
    langue: 'VOST',
    age: '16+',
    badge: '',
    seances: [
      { date: d(1),  heure: '22:30', placesTotal: 80, placesDisponibles: 58, placesVIP: 10, placesVIPDisponibles: 8 },
      { date: d(6),  heure: '23:00', placesTotal: 80, placesDisponibles: 80, placesVIP: 10, placesVIPDisponibles: 10 },
    ],
  },
];

const EVENTS_DATA = [
  {
    type: 'Soirée corpo',
    titre: 'Gala d\'Entreprise Prestige',
    description: 'Offrez à vos collaborateurs une soirée inoubliable sous les étoiles. Package clé en main : cocktail d\'accueil, projection sur mesure, buffet gastronomique et animations.',
    date: d(15),
    capacite: 80,
    prix: 2500000,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop&q=80',
    statut: 'disponible',
    demandesDevis: [
      {
        nom: 'Ibrahim Coulibaly',
        email: 'ibrahim@entrepriseabidjan.ci',
        telephone: '+225 07 11 22 33 44',
        message: 'Nous souhaitons organiser notre gala annuel pour 60 personnes.',
        dateEvenement: d(20),
        nombrePersonnes: 60,
        statut: 'nouveau',
      },
    ],
  },
  {
    type: 'Mariage',
    titre: 'Mariage Sous les Étoiles',
    description: 'Célébrez votre union dans un cadre magique. Notre équipe crée une expérience romantique unique : décoration sur mesure, projection de vos plus beaux moments, dîner aux chandelles.',
    date: d(30),
    capacite: 60,
    prix: 3500000,
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=400&fit=crop&q=80',
    statut: 'disponible',
    demandesDevis: [
      {
        nom: 'Adama Koné',
        email: 'adama.kone@gmail.com',
        telephone: '+225 05 66 77 88 99',
        message: 'Nous souhaitons privatiser le drive-in pour notre mariage en mai.',
        dateEvenement: d(45),
        nombrePersonnes: 50,
        statut: 'traité',
      },
    ],
  },
  {
    type: 'Anniversaire',
    titre: 'Fête d\'Anniversaire VIP',
    description: 'Surprenez vos proches avec un anniversaire hors du commun ! Projection de votre film préféré, décoration personnalisée, gâteau sur commande et ambiance fête garantie.',
    date: d(10),
    capacite: 40,
    prix: 850000,
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&h=400&fit=crop&q=80',
    statut: 'disponible',
    demandesDevis: [],
  },
  {
    type: 'Concert',
    titre: 'Nuit Afrobeats & Chill',
    description: 'Une soirée concert privé avec les meilleurs DJs d\'Abidjan. Afrobeats, Coupé-Décalé et Dancehall en live sous les étoiles. Expérience sonore premium.',
    date: d(20),
    capacite: 80,
    prix: 1200000,
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop&q=80',
    statut: 'disponible',
    demandesDevis: [
      {
        nom: 'Dj Kerozen Management',
        email: 'booking@kerozen.ci',
        telephone: '+225 07 22 33 44 55',
        message: 'Intéressé par une date en juin pour un concert privé afrobeats.',
        dateEvenement: d(60),
        nombrePersonnes: 75,
        statut: 'accepté',
      },
    ],
  },
  {
    type: 'Soirée corpo',
    titre: 'Séminaire Leadership & Vision',
    description: 'Transformez votre séminaire annuel en une expérience mémorable. Espace de projection pour présentations, salles de réunion, team-building et soirée de clôture inclus.',
    date: d(25),
    capacite: 50,
    prix: 1800000,
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=400&fit=crop&q=80',
    statut: 'disponible',
    demandesDevis: [],
  },
  {
    type: 'Match',
    titre: 'Nuit du Football — Finale Champions',
    description: 'Vivez la finale de la Champions League sur notre écran géant de 20 mètres ! Ambiance stade, buvette, retransmission HD. Venez en groupe, l\'expérience est décuplée.',
    date: d(12),
    capacite: 80,
    prix: 0,
    image: 'https://images.unsplash.com/photo-1546519638778-c1e60cde4ab3?w=800&h=400&fit=crop&q=80',
    statut: 'disponible',
    demandesDevis: [],
  },
];

// ─── seeder logic ─────────────────────────────────────────────────────────────

const clear = async () => {
  await Promise.all([
    User.deleteMany({}),
    Film.deleteMany({}),
    Event.deleteMany({}),
    Booking.deleteMany({}),
  ]);
  console.log('🗑️  Toutes les collections vidées.');
};

const seed = async () => {
  // ── Users ──────────────────────────────────────────────────────────────────
  console.log('\n👥  Insertion des utilisateurs…');
  // User.create triggers the bcrypt pre-save hook automatically
  const users = await User.create(USERS_DATA);
  const admin  = users.find((u) => u.role === 'admin');
  const regulars = users.filter((u) => u.role !== 'admin');
  console.log(`   ✔ ${users.length} utilisateurs créés (dont 1 admin)`);
  console.log(`   ℹ  Admin → ${admin.email} / 01010101`);

  // ── Films ──────────────────────────────────────────────────────────────────
  console.log('\n🎬  Insertion des films…');
  const films = await Film.create(FILMS_DATA);
  console.log(`   ✔ ${films.length} films créés`);

  // ── Events ─────────────────────────────────────────────────────────────────
  console.log('\n📅  Insertion des événements…');
  const events = await Event.create(EVENTS_DATA);
  console.log(`   ✔ ${events.length} événements créés`);

  // ── Bookings ───────────────────────────────────────────────────────────────
  console.log('\n🎟️  Insertion des réservations…');

  // Build one booking per (film, seance, user) combination until we have ~20
  const METHODES = ['Wave', 'OrangeMoney', 'MTNMoMo', 'Carte'];
  const IMMATRICULATIONS = ['CI-1234-AB', 'CI-5678-BC', 'CI-9012-CD', 'CI-3456-DE', 'CI-7890-EF', 'CI-2468-FG'];
  const PLACES = ['A1', 'A2', 'B3', 'B5', 'C2', 'C7', 'D4', 'D9', 'E1', 'E6', 'F3', 'F8', 'G2', 'G7', 'H1', 'H5', 'H9', 'A3', 'B7', 'C5'];

  const bookingDefs = [
    // Film 0 (Wakanda Forever) — 2 past bookings (utilisée), 1 active
    { film: films[0], seanceIdx: 0, user: regulars[0], statut: 'utilisée', isVIP: false, packSnack: true },
    { film: films[0], seanceIdx: 0, user: regulars[1], statut: 'utilisée', isVIP: true,  packVIP: true },
    { film: films[0], seanceIdx: 1, user: regulars[2], statut: 'active',   isVIP: false, packBoissons: true },

    // Film 1 (Avatar) — mixed
    { film: films[1], seanceIdx: 0, user: regulars[3], statut: 'utilisée', isVIP: false },
    { film: films[1], seanceIdx: 1, user: regulars[4], statut: 'active',   isVIP: true,  packVIP: true, packRomantique: true },
    { film: films[1], seanceIdx: 1, user: admin,        statut: 'active',   isVIP: false },

    // Film 2 (Tirailleurs)
    { film: films[2], seanceIdx: 0, user: regulars[0], statut: 'active',   isVIP: false, packSnack: true, packBoissons: true },
    { film: films[2], seanceIdx: 0, user: regulars[2], statut: 'annulée',  isVIP: false },

    // Film 4 (Spider-Man) — complet séance 0
    { film: films[4], seanceIdx: 0, user: regulars[1], statut: 'utilisée', isVIP: false },
    { film: films[4], seanceIdx: 0, user: regulars[3], statut: 'utilisée', isVIP: false, packSnack: true },
    { film: films[4], seanceIdx: 1, user: regulars[4], statut: 'active',   isVIP: false },

    // Film 7 (Lupin) — ce soir
    { film: films[7], seanceIdx: 0, user: regulars[0], statut: 'active',   isVIP: true,  packVIP: true },
    { film: films[7], seanceIdx: 0, user: regulars[5], statut: 'active',   isVIP: false, packBoissons: true },

    // Film 8 (Match AFCON) — quasi complet
    { film: films[8], seanceIdx: 0, user: regulars[1], statut: 'active',   isVIP: false },
    { film: films[8], seanceIdx: 0, user: regulars[2], statut: 'active',   isVIP: false },
    { film: films[8], seanceIdx: 0, user: regulars[3], statut: 'active',   isVIP: true,  packVIP: true },
    { film: films[8], seanceIdx: 0, user: admin,        statut: 'active',   isVIP: false },

    // Film 9 (Burna Boy)
    { film: films[9], seanceIdx: 0, user: regulars[4], statut: 'active',   isVIP: true,  packVIP: true, packBoissons: true },
    { film: films[9], seanceIdx: 0, user: regulars[5], statut: 'active',   isVIP: false, packSnack: true },

    // Film 10 (Belle-Mère)
    { film: films[10], seanceIdx: 0, user: regulars[0], statut: 'utilisée', isVIP: false },
  ];

  const bookingDocs = [];
  for (let i = 0; i < bookingDefs.length; i++) {
    const def = bookingDefs[i];
    const seance = def.film.seances[def.seanceIdx];
    const montantBase = def.isVIP ? 10000 : 5000;
    let montant = montantBase;
    if (def.packSnack)      montant += 3000;
    if (def.packBoissons)   montant += 2500;
    if (def.packRomantique) montant += 5000;
    if (def.packVIP)        montant += 8000;

    const bookingData = {
      userId:    def.user._id,
      filmId:    def.film._id,
      seanceId:  seance._id,
      place:     PLACES[i % PLACES.length],
      isVIP:     !!def.isVIP,
      immatriculation: IMMATRICULATIONS[i % IMMATRICULATIONS.length],
      nombrePersonnes: (i % 4) + 1,
      options: {
        packSnack:      !!def.packSnack,
        packBoissons:   !!def.packBoissons,
        packRomantique: !!def.packRomantique,
        packVIP:        !!def.packVIP,
      },
      paiement: {
        methode: METHODES[i % METHODES.length],
        statut: def.statut === 'annulée' ? 'remboursé' : 'confirmé',
        montant,
      },
      statut: def.statut,
    };

    // pre-save hook generates numero; we add QR after save
    const booking = new Booking(bookingData);
    await booking.save();

    const qrData = { bookingId: booking._id, numero: booking.numero, filmId: def.film._id, seanceId: seance._id, place: booking.place };
    booking.qrCode = await generateQRCode(qrData);
    await booking.save();

    bookingDocs.push(booking);
    process.stdout.write(`\r   ✔ ${i + 1}/${bookingDefs.length} réservations…`);
  }
  console.log(`\n   ✔ ${bookingDocs.length} réservations créées`);

  // ── Summary ────────────────────────────────────────────────────────────────
  const recettes = bookingDocs
    .filter((b) => b.paiement.statut === 'confirmé')
    .reduce((acc, b) => acc + b.paiement.montant, 0);

  console.log('\n────────────────────────────────────────────');
  console.log('✅  SUPERBIENV — Seed terminé avec succès !');
  console.log('────────────────────────────────────────────');
  console.log(`   Utilisateurs  : ${users.length}`);
  console.log(`   Films         : ${films.length}`);
  console.log(`   Événements    : ${events.length}`);
  console.log(`   Réservations  : ${bookingDocs.length}`);
  console.log(`   Recettes seed : ${recettes.toLocaleString('fr-CI')} FCFA`);
  console.log('────────────────────────────────────────────');
  console.log('🔐  Admin  →  admin@superbienv.ci  /  01010101');
  console.log('🌐  API    →  http://localhost:8000');
  console.log('🖥️   Front  →  http://localhost:5173');
  console.log('────────────────────────────────────────────\n');
};

// ─── main ─────────────────────────────────────────────────────────────────────

const DESTROY_ONLY = process.argv.includes('--destroy');

(async () => {
  try {
    await connectDB();
    await clear();
    if (!DESTROY_ONLY) await seed();
    process.exit(0);
  } catch (err) {
    console.error('\n❌  Erreur lors du seed :', err.message);
    process.exit(1);
  }
})();

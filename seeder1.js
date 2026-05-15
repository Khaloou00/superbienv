// seed.js — À placer à la racine de ton backend
// Usage : node seed.js
// Dépendances : mongoose (déjà dans ton projet)

const mongoose = require('mongoose');
require('dotenv').config();

// ─── Schéma (adapte si tu as déjà un Film model) ───────────────────────────
const seanceSchema = new mongoose.Schema({
    date: Date,
    heure: String,
    placesTotal: Number,
    placesDisponibles: Number,
    placesVIP: Number,
    placesVIPDisponibles: Number,
});

const filmSchema = new mongoose.Schema(
    {
        titre: { type: String, required: true },
        poster: String,
        synopsis: String,
        genre: String,
        duree: Number,
        realisateur: String,
        casting: [String],
        note: Number,
        langue: { type: String, enum: ['VF', 'VOSTFR', 'VO'] },
        age: String,
        type: { type: String, default: 'Film' },
        seances: [seanceSchema],
        badge: String,
        isActive: { type: Boolean, default: true },
        trailerUrl: String,
        commentaires: { type: Array, default: [] },
    },
    { timestamps: true }
);

const Film = mongoose.models.Film || mongoose.model('Film', filmSchema);

// ─── Posters stables via picsum (seed = index → même image à chaque run) ───
// Format : https://picsum.photos/seed/{mot}/400/600
const posterSeeds = [
    'dune', 'space', 'dark', 'fire', 'ocean', 'forest', 'city', 'storm', 'desert', 'mountain',
    'night', 'rain', 'galaxy', 'neon', 'shadow', 'gold', 'ice', 'fog', 'sun', 'moon',
    'war', 'love', 'time', 'dream', 'myth', 'hero', 'ghost', 'steel', 'wave', 'blood',
    'crown', 'mask', 'blade', 'wings', 'void', 'echo', 'prism', 'flux', 'apex', 'core',
    'nova', 'pulse', 'rift', 'surge', 'dawn', 'dusk', 'arc', 'veil', 'tide', 'spark',
    'fuse', 'glow', 'haze', 'mist', 'peak', 'reef', 'rust', 'sage', 'vox', 'warp',
    'xray', 'yell', 'zeal', 'atom', 'burn', 'clay', 'dive', 'edge', 'flow', 'grid',
    'hunt', 'iris', 'jade', 'keen', 'loft', 'meld', 'node', 'orb', 'pine', 'quay',
    'rune', 'silk', 'tomb', 'unit', 'vale', 'web', 'xenon', 'yarn', 'zone', 'amber',
    'bay', 'crest', 'dew', 'elm', 'fern', 'grove', 'hill', 'isle', 'jazz', 'kite',
    'lark', 'maple', 'nook', 'opal', 'pier', 'quill', 'rose', 'slate', 'thorn', 'umber',
];

// ─── Data 100 films ─────────────────────────────────────────────────────────
const filmsData = [
    { titre: "Dune: Part Two", synopsis: "Paul Atréides s'unit aux Fremen pour mener une guerre sainte contre les conspirateurs qui ont détruit sa famille.", genre: "Science-Fiction", duree: 166, realisateur: "Denis Villeneuve", casting: ["Timothée Chalamet", "Zendaya", "Austin Butler", "Rebecca Ferguson"], note: 8.5, langue: "VF", age: "12+", badge: "NOUVEAU", trailerUrl: "https://www.youtube.com/watch?v=Way9Dexny3w" },
    { titre: "Oppenheimer", synopsis: "L'histoire de J. Robert Oppenheimer, le physicien qui a mené le projet Manhattan et développé la première bombe atomique.", genre: "Drame", duree: 180, realisateur: "Christopher Nolan", casting: ["Cillian Murphy", "Emily Blunt", "Matt Damon", "Robert Downey Jr."], note: 8.9, langue: "VF", age: "12+", badge: "BEST-SELLER", trailerUrl: "https://www.youtube.com/watch?v=uYPbbksJxIg" },
    { titre: "Barbie", synopsis: "Barbie vit dans Barbieland jusqu'au jour où une crise existentielle l'envoie dans le monde réel.", genre: "Comédie", duree: 114, realisateur: "Greta Gerwig", casting: ["Margot Robbie", "Ryan Gosling", "America Ferrera", "Kate McKinnon"], note: 7.0, langue: "VF", age: "Tous", badge: null, trailerUrl: "https://www.youtube.com/watch?v=pBk4NYhWNMM" },
    { titre: "Avatar: La Voie de l'Eau", synopsis: "Jake Sully et Ney'tiri fondent une famille et explorent les régions de Pandora pour la sauvegarder.", genre: "Science-Fiction", duree: 192, realisateur: "James Cameron", casting: ["Sam Worthington", "Zoe Saldaña", "Sigourney Weaver", "Stephen Lang"], note: 7.6, langue: "VF", age: "12+", badge: "3D", trailerUrl: "https://www.youtube.com/watch?v=d9MyW72ELq0" },
    { titre: "The Batman", synopsis: "Dans sa deuxième année de combat, Batman démêle la corruption qui ronge Gotham lorsqu'un tueur masqué sème la terreur.", genre: "Action", duree: 176, realisateur: "Matt Reeves", casting: ["Robert Pattinson", "Zoë Kravitz", "Paul Dano", "Colin Farrell"], note: 7.9, langue: "VF", age: "12+", badge: null, trailerUrl: "https://www.youtube.com/watch?v=mqqft2x_Aa4" },
    { titre: "Spider-Man: No Way Home", synopsis: "Peter Parker demande à Doctor Strange de l'aider à effacer le fait que tout le monde sait qu'il est Spider-Man.", genre: "Action", duree: 148, realisateur: "Jon Watts", casting: ["Tom Holland", "Zendaya", "Benedict Cumberbatch", "Jamie Foxx"], note: 8.2, langue: "VF", age: "10+", badge: "BEST-SELLER", trailerUrl: "https://www.youtube.com/watch?v=JfVOs4VSpmA" },
    { titre: "Top Gun: Maverick", synopsis: "Après plus de trente ans de service, Pete Maverick repousse les limites malgré les injonctions à évoluer.", genre: "Action", duree: 130, realisateur: "Joseph Kosinski", casting: ["Tom Cruise", "Miles Teller", "Jennifer Connelly", "Jon Hamm"], note: 8.3, langue: "VF", age: "12+", badge: "BEST-SELLER", trailerUrl: "https://www.youtube.com/watch?v=qSqVVswa420" },
    { titre: "Everything Everywhere All at Once", synopsis: "Une femme sino-américaine est entraînée dans une aventure où elle peut accéder aux vies de ses versions alternatives.", genre: "Science-Fiction", duree: 139, realisateur: "Daniel Kwan & Daniel Scheinert", casting: ["Michelle Yeoh", "Stephanie Hsu", "Ke Huy Quan", "Jamie Lee Curtis"], note: 7.8, langue: "VOSTFR", age: "12+", badge: "OSCAR", trailerUrl: "https://www.youtube.com/watch?v=wxN1T1uxQ2g" },
    { titre: "Black Panther: Wakanda Forever", synopsis: "Ramonda et Shuri luttent pour protéger Wakanda face à une nouvelle menace sous-marine.", genre: "Action", duree: 161, realisateur: "Ryan Coogler", casting: ["Letitia Wright", "Angela Bassett", "Tenoch Huerta", "Lupita Nyong'o"], note: 6.7, langue: "VF", age: "12+", badge: null, trailerUrl: "https://www.youtube.com/watch?v=_Z3QKkl1WyM" },
    { titre: "Doctor Strange in the Multiverse of Madness", synopsis: "Doctor Strange explore le multivers avec une mystérieuse jeune femme semée d'embûches.", genre: "Fantastique", duree: 126, realisateur: "Sam Raimi", casting: ["Benedict Cumberbatch", "Elizabeth Olsen", "Chiwetel Ejiofor", "Rachel McAdams"], note: 6.9, langue: "VF", age: "12+", badge: null, trailerUrl: "https://www.youtube.com/watch?v=aWzlQ2N6qqg" },
    { titre: "The Whale", synopsis: "Un professeur reclus souffrant d'obésité morbide tente de renouer avec sa fille adolescente.", genre: "Drame", duree: 117, realisateur: "Darren Aronofsky", casting: ["Brendan Fraser", "Sadie Sink", "Hong Chau", "Ty Simpkins"], note: 7.7, langue: "VOSTFR", age: "16+", badge: "OSCAR", trailerUrl: "https://www.youtube.com/watch?v=nHFBFQDEHEQ" },
    { titre: "Tár", synopsis: "Lydia Tár, cheffe d'orchestre, voit sa carrière s'effondrer sous le poids d'accusations.", genre: "Drame", duree: 158, realisateur: "Todd Field", casting: ["Cate Blanchett", "Noémie Merlant", "Nina Hoss", "Sophie Kauer"], note: 7.4, langue: "VOSTFR", age: "12+", badge: null, trailerUrl: "https://www.youtube.com/watch?v=GF0-kBzWdBk" },
    { titre: "Killers of the Flower Moon", synopsis: "Dans les années 1920, des membres de la nation Osage sont assassinés dans l'une des premières enquêtes du FBI.", genre: "Drame", duree: 206, realisateur: "Martin Scorsese", casting: ["Leonardo DiCaprio", "Robert De Niro", "Lily Gladstone", "Jesse Plemons"], note: 7.7, langue: "VF", age: "12+", badge: "NOUVEAU", trailerUrl: "https://www.youtube.com/watch?v=EP34Yoxs3FQ" },
    { titre: "Poor Things", synopsis: "Bella Baxter ramenée à la vie par le Dr Godwin s'échappe et part en voyage à travers l'Europe.", genre: "Fantastique", duree: 141, realisateur: "Yorgos Lanthimos", casting: ["Emma Stone", "Mark Ruffalo", "Willem Dafoe", "Ramy Youssef"], note: 8.0, langue: "VOSTFR", age: "18+", badge: "PALME", trailerUrl: "https://www.youtube.com/watch?v=RlbR5N6veqw" },
    { titre: "Wonka", synopsis: "Willy Wonka, jeune magicien, rêve de monter sa propre boutique de chocolat.", genre: "Comédie Musicale", duree: 116, realisateur: "Paul King", casting: ["Timothée Chalamet", "Calah Lane", "Keegan-Michael Key", "Olivia Colman"], note: 7.2, langue: "VF", age: "Tous", badge: "FAMILLE", trailerUrl: "https://www.youtube.com/watch?v=otNh9bTjXWg" },
    { titre: "Mission: Impossible – Dead Reckoning", synopsis: "Ethan Hunt traque une arme dangereuse avant qu'elle ne tombe entre de mauvaises mains.", genre: "Action", duree: 163, realisateur: "Christopher McQuarrie", casting: ["Tom Cruise", "Hayley Atwell", "Ving Rhames", "Simon Pegg"], note: 7.7, langue: "VF", age: "12+", badge: null, trailerUrl: "https://www.youtube.com/watch?v=avz06PDqDbk" },
    { titre: "Guardians of the Galaxy Vol. 3", synopsis: "Les Gardiens se lancent dans une mission pour protéger Rocket et révéler les secrets de son passé.", genre: "Action", duree: 150, realisateur: "James Gunn", casting: ["Chris Pratt", "Zoe Saldaña", "Bradley Cooper", "Vin Diesel"], note: 7.9, langue: "VF", age: "12+", badge: null, trailerUrl: "https://www.youtube.com/watch?v=u3V5KDHRQvk" },
    { titre: "Indiana Jones et le Cadran de la Destinée", synopsis: "Indiana Jones affronte un ennemi nazi à la recherche d'une horloge permettant de voyager dans le temps.", genre: "Aventure", duree: 154, realisateur: "James Mangold", casting: ["Harrison Ford", "Phoebe Waller-Bridge", "Antonio Banderas", "Mads Mikkelsen"], note: 6.9, langue: "VF", age: "10+", badge: null, trailerUrl: "https://www.youtube.com/watch?v=eQfMbSe7F2g" },
    { titre: "Elemental", synopsis: "Dans une ville où feu, eau, terre et air coexistent, Ember rencontre Wade et change sa vision du monde.", genre: "Animation", duree: 101, realisateur: "Peter Sohn", casting: ["Leah Lewis", "Mamoudou Athie", "Ronnie del Carmen", "Shila Ommi"], note: 7.0, langue: "VF", age: "Tous", badge: "FAMILLE", trailerUrl: "https://www.youtube.com/watch?v=hXzcyx9V0xw" },
    { titre: "Ant-Man and the Wasp: Quantumania", synopsis: "Scott Lang et sa famille sont propulsés dans le Royaume Quantique et affrontent Kang.", genre: "Action", duree: 124, realisateur: "Peyton Reed", casting: ["Paul Rudd", "Evangeline Lilly", "Jonathan Majors", "Michelle Pfeiffer"], note: 6.1, langue: "VF", age: "10+", badge: null, trailerUrl: "https://www.youtube.com/watch?v=ZlKO3_ogxeU" },
    { titre: "Creed III", synopsis: "Adonis Creed fait face à Damian Anderson, son ami d'enfance sorti de prison.", genre: "Drame", duree: 116, realisateur: "Michael B. Jordan", casting: ["Michael B. Jordan", "Jonathan Majors", "Tessa Thompson", "Wood Harris"], note: 7.3, langue: "VF", age: "12+", badge: null, trailerUrl: "https://www.youtube.com/watch?v=N7ab5eP6kFQ" },
    { titre: "John Wick: Chapitre 4", synopsis: "John Wick découvre un moyen de vaincre la Table Haute mais doit d'abord affronter un nouvel ennemi.", genre: "Action", duree: 169, realisateur: "Chad Stahelski", casting: ["Keanu Reeves", "Donnie Yen", "Bill Skarsgård", "Ian McShane"], note: 7.8, langue: "VF", age: "16+", badge: "ACTION", trailerUrl: "https://www.youtube.com/watch?v=qEVUtrk8_B4" },
    { titre: "Scream VI", synopsis: "Les survivants de Woodsboro s'installent à New York mais Ghostface les suit.", genre: "Horreur", duree: 122, realisateur: "Matt Bettinelli-Olpin & Tyler Gillett", casting: ["Melissa Barrera", "Jenna Ortega", "Courteney Cox", "Hayden Panettiere"], note: 6.5, langue: "VF", age: "16+", badge: "HORREUR", trailerUrl: "https://www.youtube.com/watch?v=h74AXqw4Opc" },
    { titre: "The Super Mario Bros. Movie", synopsis: "Mario et Luigi sont aspirés dans le Royaume Champignon pour affronter le terrible Bowser.", genre: "Animation", duree: 92, realisateur: "Aaron Horvath & Michael Jelenic", casting: ["Chris Pratt", "Anya Taylor-Joy", "Charlie Day", "Jack Black"], note: 7.1, langue: "VF", age: "Tous", badge: "FAMILLE", trailerUrl: "https://www.youtube.com/watch?v=_4N2yaJBcSk" },
    { titre: "The Flash", synopsis: "Barry Allen voyage dans le temps pour empêcher la mort de sa mère, déstabilisant l'univers.", genre: "Action", duree: 144, realisateur: "Andy Muschietti", casting: ["Ezra Miller", "Michael Keaton", "Sasha Calle", "Ben Affleck"], note: 6.7, langue: "VF", age: "12+", badge: null, trailerUrl: "https://www.youtube.com/watch?v=hebWYacbdvc" },
    { titre: "Transformers: Rise of the Beasts", synopsis: "Dans les années 90, les Maximals rejoignent les Autobots pour combattre une menace mondiale.", genre: "Action", duree: 127, realisateur: "Steven Caple Jr.", casting: ["Anthony Ramos", "Dominique Fishback", "Peter Cullen", "Peter Dinklage"], note: 6.0, langue: "VF", age: "10+", badge: null, trailerUrl: "https://www.youtube.com/watch?v=iKvqS2Tz0TQ" },
    { titre: "Fast X", synopsis: "Dominic Toretto affronte Dante Reyes, fils d'un baron de la drogue décidé à se venger.", genre: "Action", duree: 141, realisateur: "Louis Leterrier", casting: ["Vin Diesel", "Michelle Rodriguez", "Jason Statham", "Jason Momoa"], note: 5.9, langue: "VF", age: "12+", badge: null, trailerUrl: "https://www.youtube.com/watch?v=32RAq6JzY-w" },
    { titre: "Asteroid City", synopsis: "Dans une ville du désert américain des années 50, une réunion est perturbée par un événement extra-terrestre.", genre: "Comédie", duree: 105, realisateur: "Wes Anderson", casting: ["Jason Schwartzman", "Scarlett Johansson", "Tom Hanks", "Jeffrey Wright"], note: 6.6, langue: "VOSTFR", age: "Tous", badge: null, trailerUrl: "https://www.youtube.com/watch?v=sG1Gme-Bxg0" },
    { titre: "M3GAN", synopsis: "M3GAN, une poupée IA créée pour être la meilleure amie d'une enfant, devient incontrôlable.", genre: "Horreur", duree: 102, realisateur: "Gerard Johnstone", casting: ["Allison Williams", "Violet McGraw", "Ronny Chieng", "Brian Jordan Alvarez"], note: 6.4, langue: "VF", age: "12+", badge: "HORREUR", trailerUrl: "https://www.youtube.com/watch?v=BRboeZ4utzI" },
    { titre: "65", synopsis: "Un astronaute s'écrase sur Terre il y a 65 millions d'années et doit survivre parmi les dinosaures.", genre: "Science-Fiction", duree: 93, realisateur: "Scott Beck & Bryan Woods", casting: ["Adam Driver", "Ariana Greenblatt", "Chloe Coleman"], note: 5.4, langue: "VF", age: "12+", badge: null, trailerUrl: "https://www.youtube.com/watch?v=7oD5IPzEqrA" },
    { titre: "Shazam! Fury of the Gods", synopsis: "Billy Batson et ses frères font face aux filles d'Atlas qui cherchent à récupérer leurs pouvoirs magiques.", genre: "Action", duree: 130, realisateur: "David F. Sandberg", casting: ["Zachary Levi", "Helen Mirren", "Lucy Liu", "Rachel Zegler"], note: 6.0, langue: "VF", age: "10+", badge: null, trailerUrl: "https://www.youtube.com/watch?v=4KCgH0gFLgU" },
    { titre: "Renfield", synopsis: "Renfield, serviteur de Dracula, en a assez de son maître toxique et cherche une vie normale.", genre: "Comédie", duree: 93, realisateur: "Chris McKay", casting: ["Nicholas Hoult", "Nicolas Cage", "Awkwafina", "Ben Schwartz"], note: 6.2, langue: "VF", age: "16+", badge: null, trailerUrl: "https://www.youtube.com/watch?v=3g5EkPDWmLU" },
    { titre: "Air", synopsis: "L'histoire de comment Nike a conclu le contrat le plus important de l'histoire du sport avec Michael Jordan.", genre: "Drame", duree: 112, realisateur: "Ben Affleck", casting: ["Matt Damon", "Ben Affleck", "Jason Bateman", "Viola Davis"], note: 7.7, langue: "VOSTFR", age: "Tous", badge: null, trailerUrl: "https://www.youtube.com/watch?v=NpSgu4vu9Fc" },
    { titre: "Dungeons & Dragons: L'Honneur des Voleurs", synopsis: "Un voleur et un groupe de héros se lancent dans une quête épique pour récupérer une relique perdue.", genre: "Aventure", duree: 134, realisateur: "Jonathan Goldstein & John Francis Daley", casting: ["Chris Pine", "Michelle Rodriguez", "Justice Smith", "Sophia Lillis"], note: 7.2, langue: "VF", age: "12+", badge: null, trailerUrl: "https://www.youtube.com/watch?v=xBKLJwCxOo0" },
    { titre: "Champions", synopsis: "Un coach de basket condamné aux travaux d'intérêt général entraîne une équipe de joueurs handicapés mentaux.", genre: "Comédie", duree: 123, realisateur: "Bobby Farrelly", casting: ["Woody Harrelson", "Kaitlin Olson", "Ernie Hudson", "Matt Cook"], note: 7.2, langue: "VOSTFR", age: "Tous", badge: null, trailerUrl: "https://www.youtube.com/watch?v=DPxdQDfrFT4" },
    { titre: "Cocaine Bear", synopsis: "Inspiré de faits réels : un ours ingère de la cocaïne et attaque tout ce qui l'entoure dans une forêt.", genre: "Comédie", duree: 95, realisateur: "Elizabeth Banks", casting: ["Keri Russell", "Alden Ehrenreich", "O'Shea Jackson Jr.", "Ray Liotta"], note: 5.9, langue: "VOSTFR", age: "16+", badge: null, trailerUrl: "https://www.youtube.com/watch?v=F6QLBgBVQyQ" },
    { titre: "Bullet Train", synopsis: "Un assassin malchanceux embarque dans le train le plus rapide du Japon et affronte plusieurs tueurs.", genre: "Action", duree: 126, realisateur: "David Leitch", casting: ["Brad Pitt", "Joey King", "Aaron Taylor-Johnson", "Brian Tyree Henry"], note: 7.3, langue: "VF", age: "16+", badge: null, trailerUrl: "https://www.youtube.com/watch?v=0IOsk2Vlc4o" },
    { titre: "The Northman", synopsis: "Un prince viking jure de venger le meurtre de son père et devient un guerrier redoutable.", genre: "Drame", duree: 136, realisateur: "Robert Eggers", casting: ["Alexander Skarsgård", "Nicole Kidman", "Anya Taylor-Joy", "Willem Dafoe"], note: 7.1, langue: "VOSTFR", age: "16+", badge: null, trailerUrl: "https://www.youtube.com/watch?v=oMSdFM12hOw" },
    { titre: "Nope", synopsis: "Des habitants d'un ranch isolé tentent de filmer un phénomène inexplicable dans le ciel californien.", genre: "Horreur", duree: 130, realisateur: "Jordan Peele", casting: ["Daniel Kaluuya", "Keke Palmer", "Steven Yeun", "Michael Wincott"], note: 6.9, langue: "VOSTFR", age: "12+", badge: null, trailerUrl: "https://www.youtube.com/watch?v=In8fuzj3gck" },
    { titre: "Morbius", synopsis: "Le Dr Morbius, atteint d'une maladie sanguine rare, se transforme accidentellement en vampire.", genre: "Action", duree: 104, realisateur: "Daniel Espinosa", casting: ["Jared Leto", "Matt Smith", "Adria Arjona", "Jared Harris"], note: 5.2, langue: "VF", age: "12+", badge: null, trailerUrl: "https://www.youtube.com/watch?v=oZ6iiRrz1X8" },
    { titre: "Licorice Pizza", synopsis: "Dans la vallée de San Fernando des années 70, une femme et un adolescent vivent une histoire singulière.", genre: "Romance", duree: 133, realisateur: "Paul Thomas Anderson", casting: ["Alana Haim", "Cooper Hoffman", "Sean Penn", "Tom Waits"], note: 7.4, langue: "VOSTFR", age: "12+", badge: null, trailerUrl: "https://www.youtube.com/watch?v=ybBQKnb5HvU" },
    { titre: "The Lost City", synopsis: "Une auteure de romans et son illustrateur se retrouvent coincés dans une vraie aventure en jungle.", genre: "Comédie", duree: 112, realisateur: "Aaron Nee & Adam Nee", casting: ["Sandra Bullock", "Channing Tatum", "Daniel Radcliffe", "Brad Pitt"], note: 6.5, langue: "VF", age: "12+", badge: null, trailerUrl: "https://www.youtube.com/watch?v=mMNzMaGK3oo" },
    { titre: "Sonic the Hedgehog 2", synopsis: "Sonic affronte le Dr Robotnik allié à Knuckles pour trouver une émeraude aux pouvoirs légendaires.", genre: "Animation", duree: 122, realisateur: "Jeff Fowler", casting: ["Ben Schwartz", "James Marsden", "Jim Carrey", "Idris Elba"], note: 6.5, langue: "VF", age: "Tous", badge: "FAMILLE", trailerUrl: "https://www.youtube.com/watch?v=YNPU8CD4ZoA" },
    { titre: "Uncharted", synopsis: "Nathan Drake, chasseur de trésors novice, fait équipe avec Sullivan pour retrouver la fortune de Magellan.", genre: "Aventure", duree: 116, realisateur: "Ruben Fleischer", casting: ["Tom Holland", "Mark Wahlberg", "Sophia Ali", "Tati Gabrielle"], note: 6.2, langue: "VF", age: "12+", badge: null, trailerUrl: "https://www.youtube.com/watch?v=VBMGM4KZQJU" },
    { titre: "The Menu", synopsis: "Un couple voyage sur une île isolée pour dîner dans un restaurant ultra-exclusif aux surprises macabres.", genre: "Thriller", duree: 107, realisateur: "Mark Mylod", casting: ["Ralph Fiennes", "Anya Taylor-Joy", "Nicholas Hoult", "Janet McTeer"], note: 7.3, langue: "VOSTFR", age: "16+", badge: null, trailerUrl: "https://www.youtube.com/watch?v=sEdENSTKtqM" },
    { titre: "Glass Onion: Une histoire à couteaux tirés", synopsis: "Benoit Blanc est invité à enquêter sur un meurtre fictif chez un milliardaire excentrique en Grèce.", genre: "Thriller", duree: 139, realisateur: "Rian Johnson", casting: ["Daniel Craig", "Edward Norton", "Janelle Monáe", "Kate Hudson"], note: 7.1, langue: "VF", age: "12+", badge: null, trailerUrl: "https://www.youtube.com/watch?v=W_sGQ-QIRGA" },
    { titre: "Triangle of Sadness", synopsis: "Des célébrités et riches se retrouvent bloqués sur une île déserte après le naufrage de leur yacht.", genre: "Comédie", duree: 147, realisateur: "Ruben Östlund", casting: ["Harris Dickinson", "Charlbi Dean", "Dolly De Leon", "Woody Harrelson"], note: 7.4, langue: "VOSTFR", age: "16+", badge: "PALME", trailerUrl: "https://www.youtube.com/watch?v=wH5GzxJpYSE" },
    { titre: "RRR", synopsis: "L'épopée de deux légendes de la lutte pour l'indépendance de l'Inde : Raju et Bheem.", genre: "Action", duree: 182, realisateur: "S. S. Rajamouli", casting: ["N. T. Rama Rao Jr.", "Ram Charan", "Ajay Devgn", "Alia Bhatt"], note: 8.0, langue: "VOSTFR", age: "12+", badge: "COUP DE COEUR", trailerUrl: "https://www.youtube.com/watch?v=f_vbAtFSEc0" },
    { titre: "Amsterdam", synopsis: "Dans les années 1930, trois amis se retrouvent au centre d'un complot qui change l'histoire américaine.", genre: "Thriller", duree: 134, realisateur: "David O. Russell", casting: ["Christian Bale", "Margot Robbie", "John David Washington", "Rami Malek"], note: 6.1, langue: "VOSTFR", age: "12+", badge: null, trailerUrl: "https://www.youtube.com/watch?v=8Kp7FQq_UKI" },
    { titre: "Don't Worry Darling", synopsis: "Une femme au foyer des années 50 soupçonne que quelque chose de sinistre se cache derrière sa communauté.", genre: "Thriller", duree: 123, realisateur: "Olivia Wilde", casting: ["Florence Pugh", "Harry Styles", "Olivia Wilde", "Chris Pine"], note: 6.4, langue: "VOSTFR", age: "16+", badge: null, trailerUrl: "https://www.youtube.com/watch?v=qhL_69aBJ1I" },
    { titre: "Eternals", synopsis: "Des êtres immortels vivant sur Terre depuis des millénaires se réunissent pour affronter les Déviants.", genre: "Action", duree: 156, realisateur: "Chloé Zhao", casting: ["Gemma Chan", "Richard Madden", "Angelina Jolie", "Salma Hayek"], note: 6.3, langue: "VF", age: "12+", badge: null, trailerUrl: "https://www.youtube.com/watch?v=x_me3xsvDgk" },
    { titre: "Belfast", synopsis: "L'enfance d'un garçon dans le Belfast des années 1960 déchiré par les violences sectaires.", genre: "Drame", duree: 98, realisateur: "Kenneth Branagh", casting: ["Caitríona Balfe", "Judi Dench", "Jamie Dornan", "Ciaran Hinds"], note: 7.3, langue: "VOSTFR", age: "Tous", badge: "OSCAR", trailerUrl: "https://www.youtube.com/watch?v=k7VaTEBGLKA" },
    { titre: "The Power of the Dog", synopsis: "Montana, 1925. Un rancher sadique terrorise sa belle-sœur et son fils jusqu'à ce que leur lien évolue.", genre: "Drame", duree: 126, realisateur: "Jane Campion", casting: ["Benedict Cumberbatch", "Kirsten Dunst", "Jesse Plemons", "Kodi Smit-McPhee"], note: 6.9, langue: "VOSTFR", age: "12+", badge: "OSCAR", trailerUrl: "https://www.youtube.com/watch?v=OinEL8yGPAM" },
    { titre: "Encanto", synopsis: "Mirabel, seule de sa famille sans pouvoir magique, doit sauver la magie qui protège sa famille en Colombie.", genre: "Animation", duree: 99, realisateur: "Byron Howard & Jared Bush", casting: ["Stephanie Beatriz", "María Cecilia Botero", "John Leguizamo", "Mauro Castillo"], note: 7.2, langue: "VF", age: "Tous", badge: "FAMILLE", trailerUrl: "https://www.youtube.com/watch?v=CaimKeDcudo" },
    { titre: "Venom: Let There Be Carnage", synopsis: "Eddie Brock et Venom font face à Carnage, une créature meurtrière liée au tueur Cletus Kasady.", genre: "Action", duree: 97, realisateur: "Andy Serkis", casting: ["Tom Hardy", "Woody Harrelson", "Michelle Williams", "Naomie Harris"], note: 5.9, langue: "VF", age: "12+", badge: null, trailerUrl: "https://www.youtube.com/watch?v=pC6vODW7JJo" },
    { titre: "Free Guy", synopsis: "Un employé de banque découvre qu'il est un PNJ dans un jeu vidéo et décide de devenir le héros de sa propre histoire.", genre: "Science-Fiction", duree: 115, realisateur: "Shawn Levy", casting: ["Ryan Reynolds", "Jodie Comer", "Joe Keery", "Taika Waititi"], note: 7.1, langue: "VF", age: "12+", badge: null, trailerUrl: "https://www.youtube.com/watch?v=X2m-08cOAbc" },
    { titre: "Black Widow", synopsis: "Natasha Romanoff fait face à une conspiration dangereuse liée à son passé au programme Veuve Noire.", genre: "Action", duree: 134, realisateur: "Cate Shortland", casting: ["Scarlett Johansson", "Florence Pugh", "David Harbour", "Rachel Weisz"], note: 6.7, langue: "VF", age: "12+", badge: null, trailerUrl: "https://www.youtube.com/watch?v=Fp9pNPdNwjI" },
    { titre: "The Suicide Squad", synopsis: "Une équipe de super-vilains est envoyée sur une île pour détruire le projet Étoile de Mer.", genre: "Action", duree: 132, realisateur: "James Gunn", casting: ["Margot Robbie", "Idris Elba", "John Cena", "Joel Kinnaman"], note: 7.2, langue: "VF", age: "16+", badge: null, trailerUrl: "https://www.youtube.com/watch?v=pFtmKBMY4oM" },
    { titre: "Jungle Cruise", synopsis: "Une scientifique et son frère embarquent en Amazonie avec un skipper à la recherche d'un arbre guérisseur.", genre: "Aventure", duree: 127, realisateur: "Jaume Collet-Serra", casting: ["Dwayne Johnson", "Emily Blunt", "Edgar Ramírez", "Jack Whitehall"], note: 6.6, langue: "VF", age: "10+", badge: "FAMILLE", trailerUrl: "https://www.youtube.com/watch?v=fJJoEWqW0Pk" },
    { titre: "Luca", synopsis: "Luca, jeune monstre marin, vit l'été de sa vie sur la Riviera italienne avec son ami Alberto.", genre: "Animation", duree: 95, realisateur: "Enrico Casarosa", casting: ["Jacob Tremblay", "Jack Dylan Grazer", "Emma Berman", "Saverio Raimondo"], note: 7.4, langue: "VF", age: "Tous", badge: "FAMILLE", trailerUrl: "https://www.youtube.com/watch?v=mYfJxlgR2jw" },
    { titre: "A Quiet Place Part II", synopsis: "La famille Abbott continue de lutter dans un monde infesté de créatures chassant au son.", genre: "Horreur", duree: 97, realisateur: "John Krasinski", casting: ["Emily Blunt", "Cillian Murphy", "Millicent Simmonds", "Noah Jupe"], note: 7.3, langue: "VF", age: "12+", badge: "HORREUR", trailerUrl: "https://www.youtube.com/watch?v=Pzd7M1KwuMo" },
    { titre: "Promising Young Woman", synopsis: "Cassie exécute un plan de vengeance minutieux contre ceux qui ont causé sa tragédie.", genre: "Thriller", duree: 113, realisateur: "Emerald Fennell", casting: ["Carey Mulligan", "Bo Burnham", "Alison Brie", "Clancy Brown"], note: 7.5, langue: "VOSTFR", age: "16+", badge: "OSCAR", trailerUrl: "https://www.youtube.com/watch?v=unMqEBSuMkA" },
    { titre: "Godzilla vs. Kong", synopsis: "Godzilla et Kong s'affrontent dans un combat épique pendant que des humains cherchent leurs origines.", genre: "Action", duree: 113, realisateur: "Adam Wingard", casting: ["Alexander Skarsgård", "Millie Bobby Brown", "Rebecca Hall", "Brian Tyree Henry"], note: 6.4, langue: "VF", age: "10+", badge: null, trailerUrl: "https://www.youtube.com/watch?v=odM92ap8_c0" },
    { titre: "Tenet", synopsis: "Un agent secret apprend à manipuler le flux du temps pour éviter une troisième guerre mondiale.", genre: "Science-Fiction", duree: 150, realisateur: "Christopher Nolan", casting: ["John David Washington", "Robert Pattinson", "Elizabeth Debicki", "Kenneth Branagh"], note: 7.3, langue: "VF", age: "12+", badge: null, trailerUrl: "https://www.youtube.com/watch?v=LdOM0x0XDMo" },
    { titre: "The Gentlemen", synopsis: "Un baron de la drogue américain à Londres cherche à vendre son empire, déclenchant arnaques et trahisons.", genre: "Action", duree: 113, realisateur: "Guy Ritchie", casting: ["Matthew McConaughey", "Charlie Hunnam", "Michelle Dockery", "Jeremy Strong"], note: 7.8, langue: "VOSTFR", age: "16+", badge: null, trailerUrl: "https://www.youtube.com/watch?v=Ify9S7hj480" },
    { titre: "1917", synopsis: "Deux soldats britanniques sont envoyés en mission désespérée pour délivrer un message vital qui sauvera 1 600 hommes.", genre: "Guerre", duree: 119, realisateur: "Sam Mendes", casting: ["George MacKay", "Dean-Charles Chapman", "Mark Strong", "Andrew Scott"], note: 8.3, langue: "VOSTFR", age: "12+", badge: "OSCAR", trailerUrl: "https://www.youtube.com/watch?v=YqNYrYUiMfg" },
    { titre: "Parasite", synopsis: "La famille Ki-taek infiltre progressivement la riche famille Park jusqu'à ce qu'un événement inattendu se produise.", genre: "Thriller", duree: 132, realisateur: "Bong Joon-ho", casting: ["Song Kang-ho", "Lee Sun-kyun", "Cho Yeo-jeong", "Choi Woo-shik"], note: 8.5, langue: "VOSTFR", age: "16+", badge: "PALME + OSCAR", trailerUrl: "https://www.youtube.com/watch?v=5xH0HfJHsaY" },
    { titre: "Joker", synopsis: "Arthur Fleck, un homme marginalisé qui aspire à être comédien, descend peu à peu dans la folie.", genre: "Drame", duree: 122, realisateur: "Todd Phillips", casting: ["Joaquin Phoenix", "Robert De Niro", "Zazie Beetz", "Frances Conroy"], note: 8.4, langue: "VF", age: "16+", badge: "BEST-SELLER", trailerUrl: "https://www.youtube.com/watch?v=zAGVQLHvwOY" },
    { titre: "Once Upon a Time in Hollywood", synopsis: "En 1969, un acteur de westerns et son cascadeur traversent une ère de bouleversements à Hollywood.", genre: "Drame", duree: 161, realisateur: "Quentin Tarantino", casting: ["Leonardo DiCaprio", "Brad Pitt", "Margot Robbie", "Al Pacino"], note: 7.6, langue: "VF", age: "16+", badge: null, trailerUrl: "https://www.youtube.com/watch?v=ELeMaP8EPAA" },
    { titre: "Avengers: Endgame", synopsis: "Les Avengers rescapés tentent de défaire les actions de Thanos grâce au voyage dans le temps.", genre: "Action", duree: 181, realisateur: "Anthony & Joe Russo", casting: ["Robert Downey Jr.", "Chris Evans", "Mark Ruffalo", "Scarlett Johansson"], note: 8.4, langue: "VF", age: "12+", badge: "LÉGENDE", trailerUrl: "https://www.youtube.com/watch?v=TcMBFSGVi1c" },
    { titre: "The Lion King", synopsis: "Simba fuit après la mort de son père et grandit avant de revenir réclamer son royaume.", genre: "Animation", duree: 118, realisateur: "Jon Favreau", casting: ["Donald Glover", "Beyoncé", "James Earl Jones", "Chiwetel Ejiofor"], note: 6.9, langue: "VF", age: "Tous", badge: "FAMILLE", trailerUrl: "https://www.youtube.com/watch?v=4NIdKoO8YoQ" },
    { titre: "Ford v Ferrari", synopsis: "Ford engage des ingénieurs pour construire une voiture révolutionnaire pour affronter Ferrari aux 24h du Mans.", genre: "Drame", duree: 152, realisateur: "James Mangold", casting: ["Matt Damon", "Christian Bale", "Jon Bernthal", "Caitriona Balfe"], note: 8.1, langue: "VF", age: "Tous", badge: "OSCAR", trailerUrl: "https://www.youtube.com/watch?v=zyYgDtY2qXU" },
    { titre: "Knives Out", synopsis: "Quand le patriarche d'une famille excentrique est retrouvé mort, le détective Blanc mène l'enquête.", genre: "Thriller", duree: 130, realisateur: "Rian Johnson", casting: ["Daniel Craig", "Ana de Armas", "Chris Evans", "Jamie Lee Curtis"], note: 7.9, langue: "VF", age: "12+", badge: "COUP DE COEUR", trailerUrl: "https://www.youtube.com/watch?v=qGk_NXOY0bk" },
    { titre: "Joker: Folie à Deux", synopsis: "Arthur Fleck incarcéré à Arkham rencontre Harley Quinn et tombe amoureux.", genre: "Drame", duree: 138, realisateur: "Todd Phillips", casting: ["Joaquin Phoenix", "Lady Gaga", "Brendan Gleeson", "Catherine Keener"], note: 5.5, langue: "VF", age: "16+", badge: null, trailerUrl: "https://www.youtube.com/watch?v=fTdDsMcNfcg" },
    { titre: "Alien: Romulus", synopsis: "Un groupe de jeunes explore une station abandonnée et se retrouve face à la créature la plus terrifiante de l'univers.", genre: "Horreur", duree: 119, realisateur: "Fede Álvarez", casting: ["Cailee Spaeny", "David Jonsson", "Archie Renaux", "Isabela Merced"], note: 7.3, langue: "VF", age: "16+", badge: "NOUVEAU", trailerUrl: "https://www.youtube.com/watch?v=Pvf9pNs-K3g" },
    { titre: "Deadpool & Wolverine", synopsis: "Deadpool rejoint le MCU et convainc un Wolverine déprimé de l'aider dans une mission cruciale.", genre: "Action", duree: 127, realisateur: "Shawn Levy", casting: ["Ryan Reynolds", "Hugh Jackman", "Emma Corrin", "Morena Baccarin"], note: 7.8, langue: "VF", age: "16+", badge: "BEST-SELLER", trailerUrl: "https://www.youtube.com/watch?v=7QKPZH0BItw" },
    { titre: "Furiosa: A Mad Max Saga", synopsis: "L'histoire des origines de Furiosa, arrachée à sa terre verdoyante et cherchant à retrouver son chemin.", genre: "Action", duree: 148, realisateur: "George Miller", casting: ["Anya Taylor-Joy", "Chris Hemsworth", "Tom Burke", "Lachy Hulme"], note: 7.8, langue: "VF", age: "16+", badge: "ACTION", trailerUrl: "https://www.youtube.com/watch?v=XJMuhwVlca4" },
    { titre: "Inside Out 2", synopsis: "Riley entre dans l'adolescence et de nouvelles émotions complexes bousculant l'équilibre de Joie.", genre: "Animation", duree: 100, realisateur: "Kelsey Mann", casting: ["Amy Poehler", "Maya Hawke", "Kensington Tallman", "Liza Lapira"], note: 7.9, langue: "VF", age: "Tous", badge: "FAMILLE", trailerUrl: "https://www.youtube.com/watch?v=LEjhY15eCx0" },
    { titre: "Kingdom of the Planet of the Apes", synopsis: "Plusieurs générations après César, un jeune singe remet en question les lois d'un roi tyrannique.", genre: "Science-Fiction", duree: 145, realisateur: "Wes Ball", casting: ["Owen Teague", "Freya Allan", "Kevin Durand", "Peter Macon"], note: 6.8, langue: "VF", age: "12+", badge: "NOUVEAU", trailerUrl: "https://www.youtube.com/watch?v=XFYKzHN7iLw" },
    { titre: "The Bikeriders", synopsis: "Chronique d'un club de motards américain dans les années 60 et 70, racontée par la femme d'un membre.", genre: "Drame", duree: 116, realisateur: "Jeff Nichols", casting: ["Austin Butler", "Tom Hardy", "Jodie Comer", "Michael Shannon"], note: 7.0, langue: "VOSTFR", age: "12+", badge: null, trailerUrl: "https://www.youtube.com/watch?v=XoINSmkgkQo" },
    { titre: "A Quiet Place: Day One", synopsis: "Découvrez les premiers jours de l'invasion de créatures mortelles à New York.", genre: "Horreur", duree: 99, realisateur: "Michael Sarnoski", casting: ["Lupita Nyong'o", "Joseph Quinn", "Alex Wolff", "Djimon Hounsou"], note: 7.1, langue: "VF", age: "12+", badge: "HORREUR", trailerUrl: "https://www.youtube.com/watch?v=cOnNGbxGt3w" },
    { titre: "Fly Me to the Moon", synopsis: "Une experte en marketing engagée par la NASA se retrouve à simuler la mission Apollo 11.", genre: "Comédie", duree: 132, realisateur: "Greg Berlanti", casting: ["Scarlett Johansson", "Channing Tatum", "Woody Harrelson", "Jim Rash"], note: 7.0, langue: "VF", age: "Tous", badge: null, trailerUrl: "https://www.youtube.com/watch?v=OV3NV3WOqTs" },
    { titre: "Twisters", synopsis: "Une chasseuse de tempêtes et un cow-boy médiatique se retrouvent au cœur de tornades dévastatrices.", genre: "Action", duree: 122, realisateur: "Lee Isaac Chung", casting: ["Daisy Edgar-Jones", "Glen Powell", "Anthony Ramos", "Maura Tierney"], note: 7.2, langue: "VF", age: "12+", badge: "NOUVEAU", trailerUrl: "https://www.youtube.com/watch?v=r3VW5OE_RKE" },
    { titre: "It Ends with Us", synopsis: "Lily Bloom commence une nouvelle vie à Boston et se retrouve dans une relation complexe.", genre: "Romance", duree: 130, realisateur: "Justin Baldoni", casting: ["Blake Lively", "Justin Baldoni", "Brandon Sklenar", "Jenny Slate"], note: 6.5, langue: "VF", age: "12+", badge: null, trailerUrl: "https://www.youtube.com/watch?v=2pNTv3Oy9Cg" },
    { titre: "Speak No Evil", synopsis: "Un couple américain découvre que l'hospitalité d'un couple néerlandais cache quelque chose de sombre.", genre: "Thriller", duree: 111, realisateur: "James Watkins", casting: ["James McAvoy", "Mackenzie Davis", "Scoot McNairy", "Aisling Franciosi"], note: 6.9, langue: "VOSTFR", age: "16+", badge: null, trailerUrl: "https://www.youtube.com/watch?v=GFGvkNSfnQU" },
    { titre: "The Wild Robot", synopsis: "Un robot naufragé s'adapte à une île sauvage et adopte un bébé oie orphelin.", genre: "Animation", duree: 102, realisateur: "Chris Sanders", casting: ["Lupita Nyong'o", "Pedro Pascal", "Kit Connor", "Bill Nighy"], note: 8.3, langue: "VF", age: "Tous", badge: "COUP DE COEUR", trailerUrl: "https://www.youtube.com/watch?v=9UrNmgJ0kuo" },
    { titre: "Conclave", synopsis: "Un cardinal supervisant l'élection d'un pape découvre un secret pouvant ébranler l'Église catholique.", genre: "Thriller", duree: 120, realisateur: "Edward Berger", casting: ["Ralph Fiennes", "Stanley Tucci", "John Lithgow", "Isabella Rossellini"], note: 7.5, langue: "VOSTFR", age: "12+", badge: "OSCAR", trailerUrl: "https://www.youtube.com/watch?v=kMb8lJYVAa8" },
    { titre: "The Substance", synopsis: "Une star hollywoodienne prend une substance mystérieuse qui crée une version plus jeune d'elle-même.", genre: "Horreur", duree: 141, realisateur: "Coralie Fargeat", casting: ["Demi Moore", "Margaret Qualley", "Dennis Quaid", "Hugo Diego Garcia"], note: 7.4, langue: "VOSTFR", age: "18+", badge: "PALME", trailerUrl: "https://www.youtube.com/watch?v=lnUpnScnGTk" },
    { titre: "Emilia Pérez", synopsis: "Un baron de la drogue demande à une avocate de l'aider à changer de sexe et fuir sa vie criminelle.", genre: "Drame", duree: 130, realisateur: "Jacques Audiard", casting: ["Zoe Saldaña", "Karla Sofía Gascón", "Selena Gomez", "Édgar Ramírez"], note: 7.2, langue: "VF", age: "16+", badge: "PALME", trailerUrl: "https://www.youtube.com/watch?v=HFEX5k0H3As" },
    { titre: "Anora", synopsis: "Anora épouse impulstivement le fils d'un oligarque russe, déclenchant une série d'événements chaotiques.", genre: "Comédie", duree: 139, realisateur: "Sean Baker", casting: ["Mikey Madison", "Yura Borisov", "Aleksei Serebryakov", "Karren Karagulian"], note: 7.9, langue: "VOSTFR", age: "18+", badge: "PALME", trailerUrl: "https://www.youtube.com/watch?v=yTMIDGWpCpU" },
    { titre: "Nosferatu", synopsis: "Remake gothique : une jeune femme est obsédée par un vampire ancien qui la hante dans ses rêves.", genre: "Horreur", duree: 132, realisateur: "Robert Eggers", casting: ["Bill Skarsgård", "Lily-Rose Depp", "Nicholas Hoult", "Aaron Taylor-Johnson"], note: 7.5, langue: "VOSTFR", age: "16+", badge: "HORREUR", trailerUrl: "https://www.youtube.com/watch?v=g2SKHU_HFR4" },
    { titre: "Gladiator II", synopsis: "Lucius devient gladiateur et jure de se venger des empereurs corrompus qui dirigent Rome.", genre: "Action", duree: 148, realisateur: "Ridley Scott", casting: ["Paul Mescal", "Pedro Pascal", "Denzel Washington", "Connie Nielsen"], note: 7.1, langue: "VF", age: "16+", badge: "ACTION", trailerUrl: "https://www.youtube.com/watch?v=I8GizAaChp0" },
    { titre: "Moana 2", synopsis: "Moana entreprend une nouvelle expédition vers les mers lointaines après un appel de ses ancêtres.", genre: "Animation", duree: 100, realisateur: "David Derrick Jr.", casting: ["Auli'i Cravalho", "Dwayne Johnson", "Alan Tudyk", "Rose Matafeo"], note: 7.0, langue: "VF", age: "Tous", badge: "FAMILLE", trailerUrl: "https://www.youtube.com/watch?v=ZE5FiZiLRxc" },
    { titre: "Wicked", synopsis: "L'amitié entre Elphaba, future sorcière de l'Ouest, et Glinda la bonne sorcière à l'Université de Shiz.", genre: "Comédie Musicale", duree: 160, realisateur: "Jon M. Chu", casting: ["Cynthia Erivo", "Ariana Grande", "Jeff Goldblum", "Jonathan Bailey"], note: 7.6, langue: "VF", age: "Tous", badge: "BEST-SELLER", trailerUrl: "https://www.youtube.com/watch?v=6COmYeLsz4c" },
    { titre: "Challengers", synopsis: "Art et Patrick se retrouvent opposés dans un tournoi de tennis, tous deux encore amoureux de Tashi.", genre: "Drame", duree: 131, realisateur: "Luca Guadagnino", casting: ["Zendaya", "Josh O'Connor", "Mike Faist", "Darnell Appling"], note: 7.6, langue: "VF", age: "16+", badge: "COUP DE COEUR", trailerUrl: "https://www.youtube.com/watch?v=Or7Iq5p6dPY" },
    { titre: "Longlegs", synopsis: "Une agente du FBI traque un tueur en série insaisissable qui semble avoir des pouvoirs occultes.", genre: "Horreur", duree: 101, realisateur: "Osgood Perkins", casting: ["Maika Monroe", "Nicolas Cage", "Alicia Witt", "Blair Underwood"], note: 6.2, langue: "VOSTFR", age: "16+", badge: "HORREUR", trailerUrl: "https://www.youtube.com/watch?v=o_B6nWRJOX4" },
    { titre: "Dune: Part One", synopsis: "Paul Atréides voyage sur Arrakis, la planète la plus dangereuse de l'univers, vers sa destinée.", genre: "Science-Fiction", duree: 155, realisateur: "Denis Villeneuve", casting: ["Timothée Chalamet", "Rebecca Ferguson", "Oscar Isaac", "Zendaya"], note: 8.0, langue: "VF", age: "12+", badge: "LÉGENDE", trailerUrl: "https://www.youtube.com/watch?v=8g18jFHCLXk" },
    { titre: "Saltburn", synopsis: "Oliver, étudiant fasciné par son camarade Jacob, passe l'été dans l'opulent manoir de la famille Catton.", genre: "Thriller", duree: 131, realisateur: "Emerald Fennell", casting: ["Barry Keoghan", "Jacob Elordi", "Rosamund Pike", "Richard E. Grant"], note: 7.1, langue: "VOSTFR", age: "18+", badge: "COUP DE COEUR", trailerUrl: "https://www.youtube.com/watch?v=_wOUMnMQmig" },
    { titre: "Aquaman and the Lost Kingdom", synopsis: "Arthur Curry forge une alliance avec son frère pour protéger l'Atlantide d'une menace ancienne.", genre: "Action", duree: 124, realisateur: "James Wan", casting: ["Jason Momoa", "Patrick Wilson", "Yahya Abdul-Mateen II", "Amber Heard"], note: 5.5, langue: "VF", age: "12+", badge: null, trailerUrl: "https://www.youtube.com/watch?v=0YMJvPFRmhA" },
    { titre: "Cabrini", synopsis: "Francesca Cabrini, immigrante italienne à New York en 1889, se bat pour les enfants les plus vulnérables d'Amérique.", genre: "Drame", duree: 143, realisateur: "Alejandro Monteverde", casting: ["Cristiana Dell'Anna", "John Lithgow", "David Morse", "Romana Maggiora Vergano"], note: 7.5, langue: "VF", age: "Tous", badge: "NOUVEAU", trailerUrl: "https://www.youtube.com/watch?v=cRY9e9aVNIc" },
];

// ─── Générer des séances réalistes ──────────────────────────────────────────
function genSeances(count = 2) {
    const seances = [];
    const now = new Date();
    for (let i = 0; i < count; i++) {
        const daysAhead = Math.floor(Math.random() * 20) + i * 3 + 1;
        const date = new Date(now);
        date.setDate(date.getDate() + daysAhead);
        date.setHours(18 + Math.floor(Math.random() * 4), 0, 0, 0);

        const heures = ['17:00', '19:30', '20:00', '20:30', '21:00', '22:00'];
        const placesTotal = [60, 80, 100, 120][Math.floor(Math.random() * 4)];
        const placesDisponibles = Math.floor(Math.random() * placesTotal);
        const placesVIP = placesTotal >= 100 ? 20 : placesTotal >= 80 ? 10 : 8;
        const placesVIPDisponibles = Math.floor(Math.random() * placesVIP);

        seances.push({
            date,
            heure: heures[Math.floor(Math.random() * heures.length)],
            placesTotal,
            placesDisponibles,
            placesVIP,
            placesVIPDisponibles,
        });
    }
    return seances;
}

// ─── Main seed ───────────────────────────────────────────────────────────────
async function seed() {
    const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/cinema';

    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ MongoDB connecté');

        await Film.deleteMany({});
        console.log('🗑️  Collection films vidée');

        const toInsert = filmsData.map((film, i) => ({
            ...film,
            // Poster stable via picsum.photos — même image à chaque run grâce au seed
            poster: `https://picsum.photos/seed/${posterSeeds[i]}/400/600`,
            type: 'Film',
            isActive: true,
            commentaires: [],
            seances: genSeances(Math.random() > 0.3 ? 2 : 3),
        }));

        const inserted = await Film.insertMany(toInsert);
        console.log(`🎬 ${inserted.length} films insérés avec succès`);

        // Afficher les 3 premiers IDs pour vérification
        inserted.slice(0, 3).forEach(f => {
            console.log(`  → ${f.titre} : /api/films/${f._id}`);
        });

    } catch (err) {
        console.error('❌ Erreur seed:', err.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Déconnecté');
    }
}

seed();
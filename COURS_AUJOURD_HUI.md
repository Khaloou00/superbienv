# Ce qu'on a construit aujourd'hui — Guide complet

> Projet : **SUPERBIENV Drive-In** — Cinema booking app (Abidjan, Côte d'Ivoire)
> Stack : React + Redux Toolkit Query (frontend) · Node.js + Express + MongoDB/Mongoose (backend)

---

## Table des matières

1. [OTP — Mot de passe oublié](#1-otp--mot-de-passe-oublié)
2. [sessionStorage — Mémoire de navigation React](#2-sessionstorage--mémoire-de-navigation-react)
3. [RTK Query — Cache, Tags et Invalidation](#3-rtk-query--cache-tags-et-invalidation)
4. [Favoris sans rechargement — Cross-API Invalidation](#4-favoris-sans-rechargement--cross-api-invalidation)
5. [Service Worker — Mode Offline (PWA)](#5-service-worker--mode-offline-pwa)
6. [IS_VERCEL — Code défensif par environnement](#6-is_vercel--code-défensif-par-environnement)
7. [Enum — Source de vérité unique](#7-enum--source-de-vérité-unique)
8. [Zod — Validation des données](#8-zod--validation-des-données)
9. [Récapitulatif des patterns](#9-récapitulatif-des-patterns)

---

## 1. OTP — Mot de passe oublié

### Terme exact : OTP (One-Time Password)

Un OTP est un code à usage unique, valable un seul instant dans le temps.
C'est ce qu'utilisent Wave, Orange Money, votre banque pour les virements.

### Pourquoi pas un lien token dans l'URL ?

| Lien token `/reset/abc123xyz` | OTP à 6 chiffres |
|-------------------------------|-----------------|
| Peut être copié et réutilisé | Expire en 10 min |
| Peu pratique sur mobile | Tape rapide, universel |
| Visible dans l'historique du navigateur | Invisible |
| Si l'email est intercepté, le lien marche | Le code seul ne suffit pas sans l'email |

### Génération du code

```js
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
```

Décomposé étape par étape :
```
Math.random()        → 0.437891  (nombre entre 0 et 1)
     * 900000        → 393801.9
Math.floor(...)      → 393801
     + 100000        → 493801    ← toujours 6 chiffres (minimum 100000)
.toString()          → "493801"  ← chaîne de caractères
```

### Stockage en base de données — `select: false`

```js
// models/User.js
otp:       { type: String, select: false },
otpExpire: { type: Date,   select: false },
```

**`select: false`** est une directive de sécurité Mongoose.
Par défaut, TOUTES les requêtes `User.findOne(...)` n'incluront JAMAIS ces champs.
Pour y accéder, il faut le demander explicitement :

```js
// Sans select:false → otp absent de la réponse
const user = await User.findOne({ email });

// Avec .select('+otp +otpExpire') → otp présent
const user = await User.findOne({ email }).select('+otp +otpExpire +password');
```

Le `+` signifie "ajoute ce champ normalement exclu".

### Le flux complet

```
┌─────────────────────────────────────────────────────────────────┐
│  ÉTAPE 1 — POST /auth/forgot-password  { email }                │
│                                                                 │
│  1. Cherche l'utilisateur par email                             │
│  2. Génère l'OTP aléatoire                                      │
│  3. Sauvegarde : user.otp = "493801"                            │
│                  user.otpExpire = maintenant + 10 minutes       │
│  4. Envoie l'email avec le code                                 │
│  5. Répond { success: true }                                    │
│     ↑ MÊME si l'email n'existe pas (protection anti-énumération)│
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  ÉTAPE 2 — POST /auth/reset-password  { email, otp, password } │
│                                                                 │
│  1. Cherche l'user avec .select('+otp +otpExpire +password')    │
│  2. Vérifie que user.otpExpire > maintenant                     │
│  3. Compare user.otp === otp  (texte brut, pas de hash)        │
│  4. Si OK → user.password = nouveau mot de passe               │
│             user.otp = undefined  (efface le code)             │
│             user.otpExpire = undefined                          │
│  5. Répond { success: true }                                    │
└─────────────────────────────────────────────────────────────────┘
```

### Terme : Protection anti-énumération

Si on répondait "Email introuvable" → un attaquant peut tester des millions d'adresses
pour savoir lesquelles sont inscrites sur le site. On répond toujours la même chose.

### Le frontend — AnimatePresence (2 étapes)

```jsx
// ForgotPassword.jsx
const [step, setStep] = useState(1);

<AnimatePresence mode="wait">
  {step === 1 ? <motion.div key="step1">…email…</motion.div>
              : <motion.div key="step2">…otp + password…</motion.div>}
</AnimatePresence>
```

**`AnimatePresence`** de Framer Motion gère les animations d'entrée/sortie entre composants.
**`mode="wait"`** attend que le composant sortant finisse son animation avant de faire entrer le suivant.
**`key`** est obligatoire — React et Framer Motion utilisent la clé pour détecter un changement de composant.

---

## 2. sessionStorage — Mémoire de navigation React

### Le problème : unmount/remount

React fonctionne par composants. Quand tu navigues vers `/film/123`, le composant `Programme`
se **démonte** (disparaît de la mémoire). Quand tu reviens, il se **remonte** (repart de zéro).

```
/programme          → Programme monté   → useState('') genre=''  page=1
  ↓ clic film
/film/123           → Programme DÉMONTÉ → tous les états perdus
  ↓ retour arrière
/programme          → Programme REMONTÉ → useState('') genre=''  page=1  ← RESET
```

### La solution : sessionStorage

`sessionStorage` est un espace de stockage clé/valeur dans le navigateur.
- Persiste tant que l'onglet est ouvert
- Effacé à la fermeture de l'onglet
- Différent de `localStorage` (lui persiste même après fermeture)

```
sessionStorage → durée de vie = onglet ouvert
localStorage   → durée de vie = jusqu'à suppression manuelle
```

### Implémentation dans Programme.jsx

```js
const SK = 'programme_state';  // SK = Storage Key (clé unique)

// Lecture sécurisée (try/catch si le JSON est corrompu)
const load = () => {
  try { return JSON.parse(sessionStorage.getItem(SK) || '{}'); }
  catch { return {}; }
};

// Initialisation depuis le cache au lieu de valeurs fixes
const saved = load();
const [genre, setGenre] = useState(saved.genre || '');
const [page,  setPage]  = useState(saved.page  || 1);
```

### Persistance automatique — useEffect avec dépendances

```js
useEffect(() => {
  const current = load();  // ← récupère l'état actuel (pour garder scrollY)
  sessionStorage.setItem(SK, JSON.stringify({ ...current, genre, type, date, page }));
}, [genre, type, date, page]);
//  ↑ ce tableau s'appelle le "tableau de dépendances"
//    le useEffect se déclenche chaque fois qu'une de ces valeurs change
```

**Spread operator `...current`** : on fusionne les anciennes données avec les nouvelles.
Sans ça, on écraserait `scrollY` à chaque changement de filtre.

### Restauration du scroll — requestAnimationFrame

```js
useEffect(() => {
  const { scrollY } = load();
  if (scrollY) requestAnimationFrame(() => window.scrollTo(0, scrollY));
}, []);  // ← tableau vide = exécuté UNE SEULE FOIS au montage
```

**`requestAnimationFrame`** = "exécute ça juste avant le prochain dessin à l'écran".
Nécessaire parce que si on scrolle immédiatement, le DOM n'est pas encore rendu → ça ne marche pas.

### Sauvegarde du scroll en temps réel

```js
const onScroll = () => {
  const cur = load();
  sessionStorage.setItem(SK, JSON.stringify({ ...cur, scrollY: window.scrollY }));
};
window.addEventListener('scroll', onScroll, { passive: true });
return () => window.removeEventListener('scroll', onScroll);
//     ↑ cleanup function — supprime l'écouteur quand le composant se démonte
//       sinon on accumule des écouteurs fantômes
```

**`{ passive: true }`** : on dit au navigateur "je ne vais pas faire `e.preventDefault()`".
Le navigateur peut alors optimiser le scroll sans attendre notre code. Meilleure performance.

---

## 3. RTK Query — Cache, Tags et Invalidation

### Terme exact : Cache Invalidation (Invalidation de cache)

RTK Query (Redux Toolkit Query) maintient un **cache en mémoire** de toutes tes requêtes.
Quand une mutation change les données, il faut "invalider" (effacer) le cache correspondant
pour forcer un nouveau fetch.

### providesTags — "Ce endpoint remplit ce cache"

```js
getFilms: builder.query({
  query: (params) => ({ url: '/films', params }),
  providesTags: ['Films'],
  //             ↑ "le résultat de cette requête est identifié par le tag 'Films'"
}),

getFilm: builder.query({
  query: (id) => `/films/${id}`,
  providesTags: (result, error, id) => [{ type: 'Films', id }],
  //             ↑ tag spécifique à cet ID : { type: 'Films', id: '64abc...' }
}),
```

### invalidatesTags — "Cette mutation vide ce cache"

```js
createFilm: builder.mutation({
  query: (formData) => ({ url: '/films', method: 'POST', body: formData }),
  invalidatesTags: ['Films'],
  //               ↑ après création → vide le cache 'Films' → getFilms se re-fetch automatiquement
}),

addComment: builder.mutation({
  invalidatesTags: (result, error, { id }) => [{ type: 'Films', id }, 'Films'],
  //               ↑ vide le cache du film spécifique ET la liste complète
}),
```

### Le cycle complet

```
Utilisateur clique "Ajouter un film"
  → createFilm() appelé
  → POST /api/films envoyé
  → Réponse 201 reçue
  → invalidatesTags: ['Films'] déclenché
  → RTK Query efface le cache 'Films'
  → Tous les composants qui utilisent useGetFilmsQuery() re-fetch automatiquement
  → La liste se met à jour SANS window.location.reload()
```

---

## 4. Favoris sans rechargement — Cross-API Invalidation

### Terme exact : Cross-Slice Cache Invalidation + onQueryStarted

C'est la partie la plus avancée du jour. Le favori est un cas spécial :

- Le bouton cœur est dans `filmsApi`
- Mais la liste des favoris est dans `authApi` (champ `user.filmsFavoris` de `getMe`)

Ces deux APIs sont **séparées** — `invalidatesTags` normal ne peut pas traverser la frontière.

### Le code

```js
// filmsApi.js
toggleFavori: builder.mutation({
  query: (id) => ({ url: `/films/${id}/favoris`, method: 'POST' }),

  async onQueryStarted(id, { dispatch, queryFulfilled }) {
    await queryFulfilled;  // ← attend que le serveur confirme
    dispatch(authApi.util.invalidateTags(['Me']));
    //        ↑ force authApi à invalider son tag 'Me'
    //          → useGetMeQuery() va se re-fetch
    //          → meData.user.filmsFavoris se met à jour
    //          → le cœur change d'état SANS rechargement
  },
}),
```

### onQueryStarted — Le cycle de vie d'une mutation

```
onQueryStarted(id, { dispatch, queryFulfilled, getState })
│
├── id             → l'argument passé à toggleFavori(film._id)
├── dispatch       → pour envoyer des actions Redux
├── queryFulfilled → Promise qui resolve quand le serveur répond OK
└── getState       → pour lire le state Redux actuel
```

### Comment le composant détecte le changement de favori

```js
// FilmCard.jsx et MonEspace.jsx
const { data: meData } = useGetMeQuery(undefined, { skip: !isAuth });
const isFav = meData?.user?.filmsFavoris?.some((f) => (f._id || f) === film._id);
//                                        ↑ .some() = "est-ce qu'au moins un élément correspond ?"
```

Le **chaînage optionnel** `?.` évite les erreurs si `meData` est `undefined` (pendant le chargement).
`(f._id || f)` gère deux cas : `filmsFavoris` peut contenir des objets peuplés `{ _id: '...' }`
ou juste des IDs bruts `'...'` selon si Mongoose a fait un `.populate()` ou non.

### Le flux complet "retirer un favori"

```
Clic sur le cœur dans MonEspace
  → toggleFavori(film._id) appelé
  → POST /api/films/64abc/favoris envoyé
  → MongoDB retire l'ID de user.filmsFavoris
  → Serveur répond 200 OK
  → queryFulfilled resolve
  → dispatch(authApi.util.invalidateTags(['Me']))
  → RTK Query efface le cache de getMe
  → useGetMeQuery() re-fetch GET /auth/me
  → meData.user.filmsFavoris ne contient plus le film
  → isFav devient false
  → React re-render → le film disparaît de la liste
  SANS rechargement de page
```

---

## 5. Service Worker — Mode Offline (PWA)

### Terme exact : PWA (Progressive Web App) + Service Worker

Une **PWA** est une application web qui se comporte comme une app native :
installable sur l'écran d'accueil, fonctionne hors ligne, a son propre splash screen.

Le **Service Worker** est le moteur : un script JavaScript qui tourne en arrière-plan,
séparé de la page, et qui peut intercepter les requêtes réseau.

### L'architecture

```
Navigateur
│
├── Onglet (ta page React)
│     └── fetch() vers /api/films
│
└── Service Worker (thread séparé, sw.js)
      └── intercepte TOUS les fetch()
          ├── Si réseau disponible → laisse passer + met en cache
          └── Si réseau KO → répond depuis le cache
```

### Les 3 événements du cycle de vie

```js
// 1. INSTALL — premier démarrage ou mise à jour
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('superbienv-v1')
      .then((cache) => cache.addAll(['/', '/index.html', '/offline.html']))
  );
  self.skipWaiting(); // Active immédiatement sans attendre la fermeture de l'onglet
});
```

```js
// 2. ACTIVATE — après installation, nettoyage des anciens caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== 'superbienv-v1')  // garde le cache actuel
          .map((k) => caches.delete(k))           // supprime les anciens
      )
    )
  );
  self.clients.claim(); // Prend le contrôle de tous les onglets ouverts
});
```

```js
// 3. FETCH — interception de chaque requête
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;     // POST/PUT/DELETE passent directement
  if (e.request.url.includes('/api/')) return; // Les appels API passent directement
  if (!e.request.url.startsWith('http')) return;

  e.respondWith(
    fetch(e.request)                 // Essaie le réseau d'abord
      .then((res) => {
        const clone = res.clone();   // Clone OBLIGATOIRE — un Response ne peut être lu qu'une fois
        caches.open('superbienv-v1').then((cache) => cache.put(e.request, clone));
        return res;                  // Retourne la vraie réponse à la page
      })
      .catch(() =>
        caches.match(e.request)      // Si réseau KO → cherche dans le cache
          .then((cached) => cached || caches.match('/offline.html'))
          //                          Si pas en cache → page offline
      )
  );
});
```

### La stratégie : Network First, Cache Fallback

```
Requête entrante
  │
  ├─ Réseau OK ?
  │    OUI → réponse fraîche + mise en cache → retourner la réponse
  │
  └─ Réseau KO ?
       ├─ Page déjà en cache ? → retourner le cache
       └─ Jamais visitée ?     → afficher offline.html
```

### Pourquoi cloner la réponse ?

```js
const clone = res.clone();
```

Un objet `Response` est un **stream** (flux de données) — il ne peut être lu qu'une seule fois.
Si on passe `res` au cache ET à la page, le premier qui le lit "épuise" le stream.
La solution : cloner, envoyer le clone au cache, garder l'original pour la page.

### Mettre à jour le cache

Pour forcer une mise à jour complète, changer juste le nom du cache :

```js
// sw.js
const CACHE_NAME = 'superbienv-v1';  →  'superbienv-v2'
```

Au prochain chargement, le SW détecte que `superbienv-v2 !== superbienv-v1`,
l'événement `activate` supprime l'ancien cache et tout est retéléchargé.

### Le manifest.json — Carte d'identité PWA

```json
{
  "display": "standalone",      ← Pas de barre d'adresse du navigateur (app native)
  "start_url": "/",             ← Page d'accueil à l'ouverture
  "theme_color": "#F5C518",     ← Couleur de la barre de statut Android
  "background_color": "#0a0a0a" ← Couleur du splash screen au démarrage
}
```

---

## 6. IS_VERCEL — Code défensif par environnement

### Terme exact : Environment Guard (garde d'environnement)

```js
// App.jsx
const IS_VERCEL = typeof window !== 'undefined'
  && (
    window.location.hostname.endsWith('.vercel.app') ||
    window.location.hostname === 'sperbienv.fun' ||
    window.location.hostname === 'www.sperbienv.fun'
  );
```

### Pourquoi c'était nécessaire

Vercel Analytics charge un script depuis `/_vercel/insights/script.js`.
Sur Vercel → ce fichier existe → tout va bien.
Sur Render (ton backend) / localhost → ce fichier n'existe pas.
Le navigateur reçoit une page HTML d'erreur à la place du JS → **SyntaxError**.

### Le court-circuit JSX

```jsx
{IS_VERCEL && <Analytics />}
```

C'est du **court-circuit logique** appliqué au JSX.
En JavaScript : `false && "n'importe quoi"` vaut toujours `false`.
React ignore `false`, `null`, `undefined` — rien n'est rendu.
Donc si `IS_VERCEL` est `false`, `<Analytics />` n'est jamais instancié, aucun script chargé.

### typeof window !== 'undefined'

Protection pour le SSR (Server-Side Rendering).
Sur un serveur Node.js, `window` n'existe pas → `window.location` planterait.
Ce check garantit qu'on est bien dans un navigateur avant d'accéder à `window`.

---

## 7. Enum — Source de vérité unique

### Terme exact : Single Source of Truth (Source de vérité unique)

Un **enum** (énumération) est une liste de valeurs autorisées.
Le problème : si la liste est définie à 3 endroits différents et qu'un seul change,
les autres rejettent les nouvelles valeurs → bug silencieux.

```
models/Film.js          → enum Mongoose → valide à l'écriture en DB
validations/filmSchemas.js → enum Zod  → valide à la réception de la requête HTTP
AdminDashboard.jsx         → liste JSX → options du select dans l'interface
```

Ces 3 listes DOIVENT être identiques. On a ajouté les 5 genres manquants dans les 3 fichiers :
`Science-Fiction`, `Fantastique`, `Aventure`, `Comédie Musicale`, `Guerre`

**L'erreur avant le fix** : le seeder avait inséré des films avec ces genres.
Quand l'admin faisait PUT (modification), Zod rejetait le genre → `400 Bad Request`.

---

## 8. Zod — Validation des données

### Terme exact : Schema Validation (Validation par schéma)

Zod est une bibliothèque de validation TypeScript/JavaScript.
On définit un "schéma" qui décrit la forme attendue d'une donnée,
puis on la valide avant de la traiter.

### Le schéma OTP (ce qu'on a écrit)

```js
export const resetPasswordSchema = z.object({
  email:    z.email({ message: 'Email invalide' }),
  otp:      z.string()
              .length(6, 'Le code OTP doit contenir 6 chiffres')
              .regex(/^\d{6}$/, 'Code OTP invalide'),
  //               ↑ regex : ^ début, \d chiffre, {6} exactement 6, $ fin
  password: z.string().min(6, 'Minimum 6 caractères'),
});
```

### Dépreciation Zod v4 : .url()

```js
// Ancienne syntaxe (Zod v3) — DÉPRÉCIÉE
z.string().url('URL invalide')

// Nouvelle syntaxe (Zod v4)
z.string().url({ message: 'URL invalide' })
```

### Comment Zod est utilisé dans Express

```js
// middleware de validation
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.flatten() });
  }
  req.body = result.data; // données nettoyées et typées
  next();
};

// dans les routes
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);
```

---

## 9. Récapitulatif des patterns

| Pattern | Terme technique | Fichier(s) |
|---------|----------------|-----------|
| Code à 6 chiffres valable 10 min | OTP (One-Time Password) | authController.js |
| Champ jamais retourné par défaut | `select: false` Mongoose | User.js |
| Mémoire de navigation React | sessionStorage persistence | Programme.jsx |
| Attendre le rendu avant d'agir | `requestAnimationFrame` | Programme.jsx |
| Ne pas bloquer le scroll | `{ passive: true }` | Programme.jsx |
| Cache qui se vide automatiquement | Cache Invalidation RTK Query | filmsApi.js |
| Invalider un cache depuis une autre API | Cross-API invalidation | filmsApi.js → authApi |
| Déclencher du code après mutation | `onQueryStarted` | filmsApi.js |
| Appli web installable hors ligne | PWA (Progressive Web App) | sw.js + manifest.json |
| Proxy réseau en arrière-plan | Service Worker | sw.js |
| Ne charger du code que sur un host | Environment Guard | App.jsx |
| Même liste à un seul endroit | Single Source of Truth | Film.js / filmSchemas / Admin |
| Valider la forme d'une donnée | Schema Validation (Zod) | authSchemas.js |
| Transformer erreur RTK en exception | `.unwrap()` | tous les composants |
| Vérifier si au moins un élément correspond | `.some()` Array method | FilmCard.jsx |
| Lire une propriété sans planter | Optional chaining `?.` | FilmCard.jsx |

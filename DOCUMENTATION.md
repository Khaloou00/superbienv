# SUPERBIENV — Complete Project Documentation

> **Drive-In Cinema & Event Management Platform**
> Abidjan, Cocody Riviera-Faya, Côte d'Ivoire 🇨🇮

---

## Table of Contents

1. [Project Context & Ivorian Realities](#1-project-context--ivorian-realities)
2. [Technologies & Tools](#2-technologies--tools)
3. [Advanced Features — PDFs, QR Codes & OTP](#3-advanced-features--pdfs-qr-codes--otp)
4. [Project Development Phases](#4-project-development-phases)
5. [Hosting & Deployment Architecture](#5-hosting--deployment-architecture)

---

## 1. Project Context & Ivorian Realities

### 1.1 The Concept

SUPERBIENV is an innovative urban entertainment concept based in Abidjan, Cocody
Riviera-Faya. The project introduces the **Drive-In Cinema** — a large-scale outdoor
screening experience where audiences watch films from the comfort of their own vehicles
— to the Ivorian and West African market.

Beyond cinema, SUPERBIENV positions itself as a **premium event hub**, hosting:

- Private and corporate evening events
- Weddings and celebrations
- Live concerts and cultural performances
- Sports screenings (live match broadcasts)

The experience is designed to be **immersive, modern, and accessible**, targeting couples,
families, friend groups, and corporate clients seeking a distinctive entertainment venue
in Abidjan.

### 1.2 Challenges & Ivorian Realities

Launching a Drive-In Cinema and event platform in Côte d'Ivoire involves navigating
a unique set of challenges that differ significantly from Western markets.

#### 🌦️ Climate Conditions
Abidjan has a tropical climate with heavy rainfall between April–July and
October–November. An outdoor cinema concept must factor in seasonal attendance
fluctuations, requiring proactive scheduling and flexible event policies. The digital
platform addresses this by enabling **real-time programme updates, postponement
notifications, and flexible booking management**.

#### 🚗 Traffic & Mobility in Abidjan
Abidjan is one of West Africa's most congested cities. The Cocody Riviera-Faya
corridor experiences significant traffic density, particularly on evenings and weekends.
The platform integrates **time-slotted reservations** and **advance digital booking**,
allowing customers to plan their journey and arrive at a pre-confirmed time, reducing
on-site congestion and queue management issues.

#### 💳 Mobile Money First
Bank card penetration in Côte d'Ivoire remains limited compared to mobile payment
adoption. **Wave CI, Orange Money, and MTN MoMo** collectively serve the vast majority
of the population. SUPERBIENV's booking system is architected with **Mobile Money
as the primary payment method**, eliminating the friction of requiring a bank card
and maximizing conversion rates across all socioeconomic segments.

#### 🔒 Venue Security
Large outdoor gatherings in urban Abidjan require careful access management. The
platform's **QR code–based entry system** enables staff to verify ticket authenticity
instantly via smartphone, eliminating counterfeit paper tickets and enabling
real-time occupancy tracking through the admin dashboard.

#### 📱 Mobile-First Consumer Behavior
A significant majority of internet users in Côte d'Ivoire access the web via
smartphone. SUPERBIENV's frontend is built **mobile-first**, with a Progressive
Web App (PWA) architecture that allows users to install the platform directly
from their browser, receive offline access to their tickets, and benefit from
a native app-like experience without requiring an App Store download.

#### 🎟️ Low Familiarity with Online Booking
Online reservation culture is still developing in the Ivorian market. The platform
addresses this with a frictionless **4-step booking flow** (seat selection → details
→ payment → confirmation), a clear confirmation email with an attached PDF ticket,
and a dedicated customer support contact embedded in the interface.

### 1.3 How SUPERBIENV Solves These Problems

| Problem | SUPERBIENV Solution |
|---|---|
| No online booking culture | Simple 4-step flow, instant email confirmation |
| Mobile Money dominance | Wave, Orange Money, MTN MoMo as primary payment |
| Counterfeit ticket risk | Cryptographic QR codes verified by staff in real time |
| Traffic & arrival congestion | Time-slotted reservations, advance digital access |
| Seasonal rainfall disruption | Real-time programme management, admin rescheduling |
| Security at entry | Staff mobile scanner app with live booking status |
| Limited smartphone storage | PWA — installable without App Store |

---

## 2. Technologies & Tools

### 2.1 Frontend

| Technology | Role |
|---|---|
| **React.js** (via Vite) | Component-based UI framework, fast HMR in development |
| **Tailwind CSS** | Utility-first CSS framework for responsive, consistent design |
| **Redux Toolkit** | Global state management (auth, booking flow, UI state) |
| **RTK Query** | Data fetching, caching, and synchronization with the API |
| **Framer Motion** | Smooth animations and page transitions |
| **React Hook Form + Zod** | Form state management with schema-based validation |
| **html5-qrcode** | In-browser camera access for QR code scanning (Staff app) |
| **Recharts** | Data visualization for admin revenue and occupancy charts |

**Design system:**
- Color palette: `#0a0a0a` (night background), `#F5C518` (cinema gold), `#FFFFFF`
- Typography: Playfair Display (headings), Inter (body), Space Grotesk (labels)
- Mobile-first layout with `max-w-md` staff interface and `max-w-7xl` admin dashboard

### 2.2 Backend

| Technology | Role |
|---|---|
| **Node.js** | JavaScript runtime for the server |
| **Express.js** (v5) | HTTP framework — routing, middleware, error handling |
| **ESM Modules** | `"type": "module"` — modern import/export syntax throughout |
| **Morgan** | HTTP request logger for development and production monitoring |
| **Helmet** | Automatic HTTP security headers (CSP, HSTS, X-Frame-Options) |
| **CORS** | Cross-origin policy, credentials-enabled for cookie-based auth |
| **express-rate-limit** | Rate limiting per IP with `trust proxy` for Render infrastructure |
| **express-mongo-sanitize** | NoSQL injection prevention |
| **HPP** | HTTP Parameter Pollution protection |
| **Multer + Cloudinary** | File upload pipeline — receive in memory, store in cloud |
| **Nodemailer → Resend** | Transactional email delivery (migrated from SMTP to Resend API) |
| **PDFKit** | Programmatic PDF ticket generation |
| **qrcode** | Dynamic QR code generation as base64 PNG |
| **dayjs** | Lightweight date manipulation and formatting |

### 2.3 Database

| Technology | Role |
|---|---|
| **MongoDB** | Document-oriented NoSQL database |
| **Mongoose** | ODM — schema definition, validation, hooks, population |
| **MongoDB Atlas** | Cloud-hosted MongoDB cluster (M0 Free Tier for initial launch) |

**Core data models:**

```
User        — authentication, role (user / staff / admin), OTP fields
Film        — title, genre, synopsis, poster, séances (screenings)
Booking     — userId, filmId, seanceId, place, vehicle, payment, QR, status
Event       — type, title, date, capacity, price, quote requests
```

### 2.4 Security & Authentication

SUPERBIENV implements a **dual-token JWT strategy**:

```
┌─────────────────────────────────────────────────────┐
│  Access Token (15 min)                              │
│  → Signed with JWT_ACCESS_SECRET                   │
│  → Stored in Redux memory (never persisted)        │
│  → Lost on page refresh → triggers silent refresh  │
├─────────────────────────────────────────────────────┤
│  Refresh Token (7 days)                             │
│  → Signed with JWT_REFRESH_SECRET                  │
│  → Stored in HTTP-only cookie                      │
│  → sameSite: 'none' + secure: true in production   │
│  → Sent automatically by browser on every request  │
└─────────────────────────────────────────────────────┘
```

On page refresh, the frontend calls `POST /api/auth/refresh` using the HTTP-only cookie.
If valid, the backend issues a new access token and the user remains authenticated
transparently.

**Password security:** All passwords are hashed with **bcryptjs** (cost factor: 12)
via a Mongoose pre-save hook before being written to the database.

**Role-based access control:**

```
user   → book films, manage own reservations
staff  → access scanner interface, mark tickets as used
admin  → full dashboard, film/event management, KPIs
```

---

## 3. Advanced Features — PDFs, QR Codes & OTP

### 3.1 QR Code Generation

When a booking is confirmed, the backend generates a QR code encoding the
**full verification URL**:

```js
const qrUrl = `${process.env.FRONTEND_URL}/verify/${booking.numero}`
const qrCodeBase64 = await QRCode.toDataURL(qrUrl)
// → "data:image/png;base64,iVBORw0KGgo..."
```

This means that scanning the QR code with any smartphone camera will
**directly open the verification page** in the browser — no dedicated app required.

The verification page (`/verify/:numero`) is **publicly accessible** (no login needed)
and displays real-time booking status:

| Status | Display |
|---|---|
| `active` | ✅ Green — Valid entry |
| `utilisée` | ⚠️ Orange — Already scanned |
| `annulée` | ❌ Red — Cancelled |

### 3.2 PDF Ticket Generation

Tickets are generated **server-side** using **PDFKit** at the moment of booking
confirmation. The ticket is a custom-designed 400×600pt document:

```
┌─────────────────────────┐  ← 6px gold top bar
│      SUPERBIENV          │  ← Gold headline
│  DRIVE-IN · ABIDJAN     │  ← Muted subtitle
├─────────────────────────┤  ← Gold divider
│      [FILM TITLE]        │  ← White, bold
│    ✦ VIP SEAT ✦          │  ← Gold badge (if applicable)
├─────────────────────────┤
│  NAME      │  SEAT       │  ← Dark card (#141414)
│  VEHICLE   │  AMOUNT     │
│  DATE      │  TIME       │
│  PAYMENT   │             │
├ - - - - - - - - - - - - ┤  ← Dashed perforation line
│         [QR CODE]        │  ← 120×120px embedded image
│  Present this code       │
│  at the entrance         │
│    BOOKING NUMBER        │
└─────────────────────────┘  ← 6px gold bottom bar
```

**Technical implementation:**

```js
// QR base64 → Buffer → embedded as image in PDF
const base64Data = qrCodeBase64.replace(/^data:image\/\w+;base64,/, '')
const imgBuf = Buffer.from(base64Data, 'base64')
doc.image(imgBuf, 140, qrTop, { width: 120, height: 120 })
```

The generated PDF `Buffer` is passed directly to **Resend** as an email attachment —
the file is never written to disk.

### 3.3 OTP System

SUPERBIENV uses a **6-digit One-Time Password** system for account verification
and password reset, delivered via email using **Resend**.

**Registration flow:**

```
User submits registration form
↓
Backend: User.create({ nom, email, password, telephone, otp, otpExpire })
↓
sendEmail({ to: user.email, subject: 'Verification Code', html: otpTemplate })
↓
User receives email → enters 6-digit code in VerifyOTP page
↓
Backend: verifies otp match + otpExpire > now
↓
user.isVerified = true → otp/otpExpire unset → JWT issued → logged in
```

**Security properties:**
- OTP fields are `select: false` in the Mongoose schema (never returned in queries
  unless explicitly selected with `.select('+otp +otpExpire')`)
- OTP expires after **10 minutes**
- Invalid or expired OTP returns `400` with a specific error message
- Failed email delivery is caught silently to prevent registration blocking,
  with a `/resend-otp` endpoint for retry

---

## 4. Project Development Phases

### Phase 1 — Conceptualization & Design

- Market research on Drive-In Cinema viability in Abidjan
- Definition of target personas: couples, families, corporate clients, event organizers
- UX wireframing: booking flow, admin dashboard, staff scanner interface
- Design system definition: dark cinematic palette, gold accents, mobile-first layouts
- Data modeling: entity-relationship diagram for User, Film, Booking, Event, Seance

### Phase 2 — Backend API Development

- Node.js + Express project initialization with ESM modules
- MongoDB Atlas cluster setup and Mongoose schema implementation
- JWT dual-token authentication system (register, login, refresh, logout)
- OTP system for email verification and password reset
- RESTful API endpoints: films, bookings, events, admin stats
- Security middleware stack: Helmet, CORS, rate limiting, NoSQL sanitization
- File upload pipeline: Multer (memory storage) → Cloudinary
- PDF ticket generation with PDFKit + QR code embedding
- Email transactional system: Resend SDK with `superbe.store` domain verification

### Phase 3 — Frontend Development

- React + Vite project setup with Tailwind CSS configuration
- Redux store architecture: authSlice, RTK Query API slices
- Authentication flows: registration, OTP verification, login, auto-refresh
- Public pages: landing, programme, event privatization
- Booking flow: interactive seat map → details → payment → QR confirmation
- Admin dashboard: KPIs, weekly revenue chart, film/event CRUD, QR scanner
- Staff scanner interface: html5-qrcode camera integration, real-time verification
- PWA implementation: manifest, service worker, offline fallback, installable icons

### Phase 4 — Integration & Testing

- Frontend-backend integration: RTK Query baseUrl configuration with `VITE_API_URL`
- Cross-domain cookie configuration for JWT refresh token (`sameSite: none`)
- CORS whitelist: localhost development + Vercel production domain
- Auth hydration on page refresh: `useAuthHydration` hook calling `/api/auth/refresh`
- End-to-end booking flow testing: reservation → PDF generation → email delivery
- Staff QR scanner testing: scan → status display → mark as used

### Phase 5 — Deployment & Production

- MongoDB Atlas: M0 free cluster, network access whitelist `0.0.0.0/0`
- Backend deployment on Render: environment variables, trust proxy, build command
- Frontend deployment on Vercel: root directory `mon-app`, `VITE_API_URL` env var
- Custom domain `sperbienv.fun` purchased on Hostinger, DNS configured on Vercel
- Resend domain verification: DNS TXT (DKIM), MX, SPF records added on Hostinger
- UptimeRobot: ping `/ping` every 10 minutes to prevent Render free tier sleep
- Vercel Analytics: traffic monitoring integrated via `@vercel/analytics/react`

---

## 5. Hosting & Deployment Architecture

```
                GitHub (Khaloou00/superbienv)
                       │
          ┌────────────┴────────────┐
          │                         │
     mon-app/                   server/
          │                         │
       Vercel                    Render
(Frontend React SPA)        (Node.js API)
https://sperbienv.fun    https://superbienv.onrender.com
          │                         │
          │    RTK Query + fetch     │
          └──────────────────────────┘
                            │
                     MongoDB Atlas
                  (M0 Free Cluster)
              cluster0.nv2bidd.mongodb.net
                            │
                      Cloudinary
                (Media storage & CDN)
                            │
                         Resend
              (Transactional email delivery)
                  sender: assistant@superbe.store
```

### 5.1 Database — MongoDB Atlas

- **Cluster:** M0 Free Tier (512MB storage)
- **Region:** AWS us-east-1
- **Access:** IP whitelist `0.0.0.0/0` (required for Render dynamic IPs)
- **User:** `cisseibrahimkhalilou_db_user` with `atlasAdmin` role
- **Connection:** `mongodb+srv://` URI stored as `MONGO_URI` environment variable on Render

### 5.2 Backend — Render

- **Service type:** Web Service (Free Plan — 512MB RAM, 0.1 CPU)
- **Build command:** `npm install --legacy-peer-deps`
- **Start command:** `node server.js`
- **Configuration:**
  - `app.set('trust proxy', 1)` — required for `express-rate-limit` behind Render's
    reverse proxy
  - All secrets stored as Render environment variables (never in source code)
- **Keep-alive:** UptimeRobot pings `GET /ping` every 10 minutes

### 5.3 Frontend — Vercel

- **Framework preset:** Vite
- **Root directory:** `mon-app`
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Environment variable:** `VITE_API_URL=https://superbienv.onrender.com`
- **Routing:** `vercel.json` rewrites — `/api/*` proxied to Render, `/*` served
  as `index.html` for React Router

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://superbienv.onrender.com/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 5.4 Custom Domain — sperbienv.fun

- **Registrar:** Hostinger
- **DNS management:** Transferred to Vercel Nameservers
- **Configuration:** Domain added in Vercel project settings → automatic SSL/TLS
  certificate provisioning via Let's Encrypt
- **Professional email:** `assistant@superbe.store` hosted on Hostinger Mail

### 5.5 Transactional Emails — Resend

- **SDK:** `resend` npm package (replaces Nodemailer — required due to Render's
  SMTP port blocking on free plan)
- **Sender domain:** `superbe.store` — verified on Resend with DNS records:
  - `TXT resend._domainkey` — DKIM signature
  - `MX send` — outbound mail routing
  - `TXT send` — SPF record (`v=spf1 include:... ~all`)
- **Emails sent:**
  - OTP verification code (registration + password reset)
  - Booking confirmation with PDF ticket attached (base64 Buffer)
  - Welcome email on successful account verification

### 5.6 Environment Variables Summary

**Render (Backend):**

```env
NODE_ENV=production
PORT=8000
MONGO_URI=mongodb+srv://...
JWT_ACCESS_SECRET=<64-byte hex>
JWT_REFRESH_SECRET=<64-byte hex>
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
RESEND_API_KEY=re_...
EMAIL_FROM=assistant@superbe.store
FRONTEND_URL=https://www.sperbienv.fun
ADMIN_EMAIL=admin@superbienv.ci
```

**Vercel (Frontend):**

```env
VITE_API_URL=https://superbienv.onrender.com
```

---

*Documentation written for SUPERBIENV — Abidjan, Côte d'Ivoire 🇨🇮*
*Stack: React · Node.js · MongoDB · Render · Vercel · Resend*

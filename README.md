<div align="center">

<p>
  <img src="https://github.com/LogicVortex123/PawPrint/blob/main/backend/PawPrint%20logo.png?raw=true" alt="PawPrint Logo" width="180">
</p>

<h1>🐾 PawPrint</h1>

<h3>Offline-First Pet Care & Health Tracking — Mobile & Web</h3>

<p>
  <strong>Care for their health. Keep their memories. Stay connected — even offline.</strong>
</p>

<p>
  <a href="#-features">✨ Features</a> •
  <a href="#️-tech-stack">🛠️ Tech Stack</a> •
  <a href="#-getting-started-web--backend">🚀 Getting Started</a> •
  <a href="#️-application-architecture">🏗️ Architecture</a> •
  <a href="#-application-workflow">🔄 Application Workflow</a> •
  <a href="#-project-structure">📁 Project Structure</a>
</p>

</div>

---

# 🐾 About PawPrint

PawPrint is a cross-platform product for pet owners to manage their pets' health and care records in one place — available as a **mobile app** (iOS & Android) and a **companion web dashboard**, sharing one account and one backend.

The application allows users to manage **pet profiles, vaccination records, weight history, medical documents, and veterinary appointments**. Its key feature is an **offline-first mobile architecture**, which allows users to access and update their pet's information even without an internet connection. The web dashboard complements this with a bigger screen for reviewing history and managing records when a connection is available.

When the mobile device reconnects to the internet, locally stored changes are automatically synchronized with the cloud backend — the same backend the web dashboard talks to directly.

> **This repository** contains the shared **backend** (`backend/`) and the **web app** (`frontend/`).

---

# ✨ Features

<table>
<tr>
<td width="50%">

### 🐶 Pet Profile Management

* Create and edit pet profiles
* Add pet name, species, breed, gender, date of birth and photo
* Support for multiple pets
* Quickly switch between pets

### 💉 Vaccination Tracking

* Add vaccination records
* Store vaccine name, administration date, next due date and veterinarian
* Automatically identify:

  * 🟢 Completed
  * 🟡 Upcoming
  * 🔴 Overdue
* Schedule vaccination reminders

### ⚖️ Weight Tracking

* Record pet weight over time
* View chronological weight history
* Display weight trends using a line chart
* Provide simple, non-diagnostic weight insights

### 🏥 Vet Appointments

* Book appointments for a specific pet
* Select veterinary clinic, date and time
* Add appointment reason and notes
* Receive appointment reminders

### 📍 Nearby Clinic Discovery

* Real vet clinics near you from OpenStreetMap, imported in the background the first time an area is searched and refreshed weekly
* Pagination on scroll — the first 6 clinics show straight away, and the next 6 load each time you scroll to the end (with 24/7 and saved filters)
* Find nearby veterinary clinics using device location (mobile) or browser location (web)
* Sort clinics based on distance
* Save favorite clinics for faster booking next time
* Provide a manual fallback when location access is unavailable

### 📄 Medical Document Vault

* Capture documents using camera or gallery (mobile) or upload from your file system (web)
* Categorize documents as:

  * Prescription
  * Medical Report
  * Insurance
  * Adoption
* Cache documents for offline access on mobile
* Automatically retry failed uploads when connectivity returns

### 🕐 Health Timeline

* View vaccinations, weight records, appointments and documents together in a chronological health timeline
* Filter timeline entries by event type

### 📶 Offline-First Support (Mobile)

The mobile app remains functional even without an internet connection.

* All important records are first stored locally and marked as pending synchronization
* Once the device is online again, the application automatically synchronizes pending changes with the backend
* Get notified when a sync completes or fails, so you're never left guessing

### 🌐 Web Dashboard

* Log in from any browser with the same account used on mobile
* A sidebar layout with 11 sections per pet: Overview, Profile & ID, Vaccinations, Medications, Weight, Appointments, Expenses, Nearby Clinics, Medical Vault, Timeline and Smart Reminders
* **Overview** — today at a glance: a **care score** (vaccines, doses, weigh-ins and open alerts), today's doses, next visit, this month's spending and what needs attention
* **Analytics** — vaccination status, weight trend, upcoming visits and spending across all your pets
* Add or edit a pet in a quick pop-up form; unsaved edits are restored if you close it by accident
* Full create, edit and delete for every record type
* Changes made on the web appear on mobile the next time it syncs, and vice versa
* Always-online by design — no offline queue on web, since a browser session assumes connectivity
* A redesigned, responsive look with real pet photography, light/dark themes and plain, friendly wording throughout

### 💊 Medication Tracker

* Add a course with dose, frequency (once/twice/three times a day, every other day, weekly, monthly or as needed), start and end dates
* A daily checklist to tick off each dose (morning / evening…), with the time it was given
* 14-day dose history, on-time percentage over 7 and 30 days, and a streak
* Doses still due, missed doses and courses about to end appear in Smart Reminders

### 💸 Expense Tracker

* Log vet bills, food, grooming, insurance, supplies, training and boarding per pet
* Monthly spending chart, category breakdown, this month vs last month and monthly average
* View one pet's spending or all pets together, and filter by category
* One tap to log the cost of a completed vet visit
* Amounts must be above zero, so totals and averages stay accurate
* Export a year of expenses as a spreadsheet (CSV, e.g. `pawprint-expenses-2026.csv`), in your chosen currency

### 🔔 Smart Reminders & Email

* One prioritised list: vaccines due or overdue, upcoming visits, doses still due today, weigh-in nudges and weight outside the healthy range
* Navbar bell, browser notifications, and an optional daily email digest at 8:00 AM
* A confirmation email with a calendar invite when a visit is booked or moved

### 🔗 Share with Your Vet

* A private, read-only link and QR code to a pet's health record — no account needed to open it
* Links expire after 24 hours, 7 days or 30 days, can be revoked any time, and show how often they were opened

### 🔐 Account & Security

* Sign up and log in with email & password, or continue instantly with **Google Sign-In** (on mobile and web)
* Forgot password? A one-time reset link is emailed (expires in 30 minutes)
* Secure sessions using JWT-based authentication; passwords protected with bcrypt hashing
* Rate-limited sign-in, security headers and strict input validation on the API
* Download all your data as one file, or delete your account and everything in it
* Optional biometric app lock on mobile (Face ID / Fingerprint)

### 🌙 Personalization

* Light and Dark theme, with automatic OS detection
* Choose which reminders you want to receive and how far ahead
* Pick your currency for expenses
* Set a healthy weight range per pet, shown on the weight chart

### 🚨 Emergency Mode

* One-tap access to a pet's allergies, medications, vaccination summary and emergency contacts
* Designed for fast, minimal-tap access during urgent situations

### 💬 PawPal Assistant

* A chat assistant on every page — tap **Ask PawPal**
* Signed in, it answers from your pet's own records: what's due, today's doses, weight trends, upcoming visits and spending, with one-tap links to the right section
* Explains how to use PawPrint and gives everyday care tips; for anything that sounds urgent it tells you to contact a vet first
* Uses Claude when `ANTHROPIC_API_KEY` is set on the backend, and built-in replies from the same records otherwise

### 🔍 Search & Export

* Search pets, vaccinations, medications, appointments, expenses and documents from anywhere
* Export a pet's health summary as a shareable PDF for a new vet or boarding facility
* Vaccine suggestions per species that pre-fill the usual next due date

</td>
</tr>
</table>

---

# 🛠️ Tech Stack

## 📱 Mobile Application

| Technology                     | Purpose                                              |
| ------------------------------- | ----------------------------------------------------- |
| **React Native**                | Cross-platform mobile application                     |
| **Expo**                        | React Native development and native device features   |
| **TypeScript**                  | Type-safe application development                     |
| **React Navigation**            | Screen navigation and routing                          |
| **Zustand**                     | Lightweight global state management                    |
| **React Native Gifted Charts**  | Weight trend line chart                                |

## 🌐 Web Application

| Technology         | Purpose                                                        |
| -------------------- | ---------------------------------------------------------------- |
| **React.js**          | Web dashboard framework                                          |
| **Vite**              | Fast dev server and production build tool                        |
| **TypeScript**        | Type-safe application development                                |
| **React Router**      | Web navigation and routing (the web equivalent of React Navigation)|
| **Zustand**           | Shared state-management patterns, reused from the mobile app      |
| **Tailwind CSS**      | Utility-first styling, with a custom PawPrint colour palette and dark mode |
| **Lucide React**      | Icon set used across the app                                     |
| **qrcode**            | QR codes for share-with-vet links                                |
| **Google Identity Services** | "Continue with Google" in the browser (loaded from Google, no extra package) |
| **Fetch API**         | Calls to the backend through one small client (`lib/api.ts`)     |
| **Vitest + React Testing Library** | Unit and component tests                            |

> The web app is intentionally **always-online** — no offline queue, no local SQLite. It calls the same REST API directly on every screen.
> Charts (weight trend, monthly spending) are hand-drawn SVG, so no chart library is needed.

## 💾 Local Storage (Mobile)

| Technology       | Purpose                                                   |
| ---------------- | --------------------------------------------------------- |
| **Expo SQLite**  | Offline storage for pets, health records and appointments |
| **AsyncStorage** | Small settings and preferences                            |

## ☁️ Backend (Shared by Mobile & Web)

| Technology     | Purpose                                                  |
| -------------- | ---------------------------------------------------------- |
| **Node.js**    | Backend runtime                                             |
| **Express.js** | REST API development                                        |
| **MongoDB + Mongoose** | Cloud database and schemas                           |
| **CORS**       | Restricts browser (web) API access to approved app origins   |
| **Helmet + express-rate-limit** | Security headers and brute-force protection |
| **Nodemailer + node-cron** | Reminder digests, appointment emails, password resets |
| **Multer**     | Pet photo and document uploads                              |
| **Jest + Supertest + mongodb-memory-server** | Unit and API integration tests against an in-memory database |

## 🔐 Authentication & Security

| Technology                            | Purpose                                                        |
| --------------------------------------- | ----------------------------------------------------------------- |
| **JWT**                                 | User authentication and API authorization                          |
| **bcrypt**                              | Secure password hashing                                            |
| **Google Sign-In (OAuth 2.0) — Mobile** | Sign in with Google via `expo-auth-session`                        |
| **Google Sign-In (OAuth 2.0) — Web**    | Sign in with Google via Google Identity Services                    |
| **Expo Local Authentication**           | Optional biometric (Face ID / Fingerprint) app lock on mobile      |

## 📱 Native Features (Mobile Only)

| Expo Technology        | Purpose                               |
| ----------------------- | -------------------------------------- |
| **Expo Image Picker**   | Pet photos and medical documents       |
| **Expo Notifications**  | Vaccination and appointment reminders  |
| **Expo Location**       | Nearby veterinary clinic discovery     |

## 🧪 Testing & Deployment

| Technology                       | Purpose                                     |
| --------------------------------- | --------------------------------------------- |
| **Jest**                          | Automated testing (mobile & web)              |
| **React Native Testing Library**  | Component and UI testing — mobile             |
| **React Testing Library**         | Component and UI testing — web                |
| **EAS Build**                     | Android and iOS production builds             |
| **Render / Vercel**               | Backend deployment                            |
| **Vercel / Netlify**              | Web dashboard static hosting                  |

---

# 🚀 Getting Started (Web + Backend)

**Prerequisites:** Node.js 18+ and a MongoDB database (a free MongoDB Atlas cluster or a local `mongod`).

```bash
# 1. Backend
cd backend
cp .env.example .env        # fill in MONGO_URI and JWT_SECRET (see comments inside)
npm install
npm run seed:clinics        # optional: sample vet clinics for "Nearby Clinics"
npm run dev                 # http://localhost:5000  (health check: /health)

# 2. Web app (new terminal)
cd frontend
cp .env.example .env        # VITE_API_URL=http://localhost:5000
npm install
npm run dev                 # http://localhost:5173 (always this port — see below)
```

Run **one** backend terminal and **one** frontend terminal. The web app always runs on
port **5173** (`strictPort` in `vite.config.ts`): if 5173 is busy it stops with an error instead
of quietly moving to 5174, because Google Sign-In only works on registered addresses. In
development the API accepts requests from any `localhost` port; in production only the
`WEB_ORIGIN` address is allowed.

**Google Sign-In (optional).** Put the same OAuth client ID in `backend/.env`
(`GOOGLE_CLIENT_ID`) and `frontend/.env` (`VITE_GOOGLE_CLIENT_ID`). In
[Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials), open
that OAuth client and add both of these under **Authorized JavaScript origins**:
`http://localhost` and `http://localhost:5173` (plus your deployed web address).

**Email (optional).** Reminders, appointment confirmations and password resets need an SMTP
login in `backend/.env`. For Gmail: turn on 2-Step Verification, create an
[App Password](https://myaccount.google.com/apppasswords) and set `EMAIL_USER` / `EMAIL_PASS`.
Without it, in development every email gets a **preview link** (printed in the backend console,
and shown after *Settings → Send test email now*) instead of being delivered.

**PawPal with Claude (optional).** Set `ANTHROPIC_API_KEY` in `backend/.env` (and optionally
`ASSISTANT_MODEL`, default `claude-opus-5-5`). The key stays on the server; without it PawPal
answers from the pet's records with built-in replies.

The full list of endpoints is in [`backend/API.md`](backend/API.md).

### 🩺 Troubleshooting

| Problem | Fix |
| --- | --- |
| `Port 5000 is already in use` | Another backend is still running — close the other terminal, or in PowerShell: `Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000 -State Listen).OwningProcess` |
| `Port 5173 is already in use` | Another copy of the web app is running — close it and use that one tab |
| Google says **Error 400: origin_mismatch** | Open the app at exactly `http://localhost:5173`, and make sure that address is in the OAuth client's Authorized JavaScript origins |
| Pages load but nothing saves | Check the backend terminal shows `MongoDB connected` and `http://localhost:5000/health` returns `ok` |

## 📁 Project Structure

```text
PawPrint/
├── backend/                     Node.js + Express API (shared by web and mobile)
│   ├── API.md                   Endpoint reference
│   ├── src/
│   │   ├── app.js               Express app: security, CORS, routes, errors
│   │   ├── server.js            Starts the server, DB, email job; graceful shutdown
│   │   ├── config/              env, database, CORS
│   │   ├── controllers/         Request handlers, one per resource
│   │   ├── middleware/          auth, security (sanitising, rate limits), uploads, errors
│   │   ├── models/              Mongoose schemas
│   │   ├── routes/              URL → controller wiring
│   │   ├── services/            Business rules (reminders, medication schedules,
│   │   │                        expense summaries, email, calendar invites…)
│   │   ├── data/                Vaccine catalogue
│   │   ├── scripts/             db:check, seed:clinics
│   │   └── utils/               ApiError, asyncHandler, validation helpers
│   └── tests/
│       ├── unit/                Pure business-rule tests
│       └── integration/         Real HTTP requests against an in-memory MongoDB
├── frontend/                    React + Vite web app
│   ├── src/
│   │   ├── pages/               One file per route (lazy-loaded)
│   │   ├── components/
│   │   │   ├── layout/          AppShell — dashboard sidebar, top bar and search
│   │   │   ├── ui/              Shared building blocks (section headers, empty states, toggles)
│   │   │   ├── dashboard/       Add/Edit pet modals, Medications, Expenses, share dialog
│   │   │   │   └── tabs/        Overview, Profile, Vaccinations, Weight, Appointments,
│   │   │   │                    Clinics, Documents, Timeline, Reminders
│   │   │   ├── home/, hero/     Landing page sections
│   │   │   ├── common/          Navbar, footer, modal, search, reminder bell, auth visuals
│   │   │   └── summary/         Printable health summary
│   │   ├── store/               Zustand store — all API calls go through it
│   │   ├── lib/                 api client, adapters, dates, money, navigation,
│   │   │                        Google sign-in, notifications, drafts
│   │   ├── data/                Roadmap content
│   │   ├── types/               Shared TypeScript types
│   │   └── test/                Test setup and component tests
│   ├── public/images/           Pet photography used across the app
│   ├── vercel.json              Vercel hosting (SPA routing, caching, headers)
│   └── public/_redirects        Netlify SPA routing
└── render.yaml                  Render blueprint for the backend
```

---

# 🏗️ Application Architecture

```text
                              🐾 PawPrint
                    ┌──────────────┴───────────────┐
                    ▼                               ▼
          ┌────────────────────┐         ┌───────────────────────┐
          │  React Native App  │         │    React.js Web App    │
          │     Expo + TS      │         │       Vite + TS        │
          └─────────┬──────────┘         └────────────┬───────────┘
                    │                                  │
          ┌─────────┴──────────┐                       │
          │                    │                       │
          ▼                    ▼                       │
   ┌─────────────┐      ┌─────────────┐                │
   │ Zustand     │      │ Expo SQLite │                │
   │ State       │      │ Local Data  │                │
   └─────────────┘      └──────┬──────┘                │
                                │                       │
                          Offline Changes                │
                                │                       │
                                ▼                       │
                          Sync Engine                    │
                                │                       │
                         Internet Available               │
                                │                       │
                                ▼                       ▼
                REST API (Axios on mobile, fetch on web — shared by both)
                                       │
                                       ▼
                         ┌─────────────────────────┐
                         │  Node.js + Express       │
                         │  Backend (CORS-enabled)  │
                         └────────────┬─────────────┘
                                      │
                                      ▼
                                 ┌──────────┐
                                 │ MongoDB  │
                                 │  Cloud   │
                                 └──────────┘
```

One backend, one database, two clients — the mobile app queues and syncs; the web app calls the API directly in real time.

---

# 📶 Offline-First Workflow (Mobile)

The core workflow of the **mobile app** is designed around offline usage. (The web dashboard has no offline mode — see the Web Dashboard Workflow below.)

```text
User creates/updates a record
              │
              ▼
        Save to SQLite
              │
              ▼
       Mark as Pending
              │
              ▼
       UI updates instantly
              │
              ▼
      Is internet available?
          /           \
        No             Yes
        │               │
        ▼               ▼
 Pending Queue      Sync Engine
                        │
                        ▼
                     Axios
                        │
                        ▼
                  Express API
                        │
                        ▼
                    MongoDB
                        │
                        ▼
                  Sync Successful
                        │
                        ▼
               Mark record Synced
                        │
                        ▼
          Notify user (sync complete)
```

This approach ensures that users can continue managing their pet's records even in areas with poor or no connectivity.

---

# 🌐 Web Dashboard Workflow

The web app assumes connectivity, so every action calls the API directly — no local queue, no pending state.

```text
Open web app in browser
              │
              ▼
      Login / Register
      (Email or Google)
              │
              ▼
    JWT stored in browser
              │
              ▼
  Dashboard loads pets, vaccinations,
  weight, appointments, documents
       directly from the API
              │
              ▼
   Any edit → API call immediately
     (succeeds or shows an error —
        no offline queue on web)
```

---

# 🔄 Main User Workflow (Mobile)

```text
App Launch
    │
    ▼
Splash Screen
    │
    ▼
Onboarding
    │
    ▼
Login / Register (Email or Google)
    │
    ▼
Home Dashboard
    │
    ├── 🐶 Manage Pets
    │
    ├── 💉 Vaccinations
    │
    ├── ⚖️ Weight Tracking
    │
    ├── 🏥 Appointments
    │
    ├── 📄 Medical Documents
    │
    ├── 🕐 Health Timeline
    │
    ├── 🚨 Emergency Mode
    │
    └── 📍 Find Clinics
```

The web dashboard skips Splash/Onboarding — it goes straight from Login to the same set of sections (Pets, Vaccinations, Weight, Appointments, Documents, Health Timeline).

---

# 🔐 Authentication Flow

```text
                Register / Login
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
 Email & Password               Google Sign-In
        │                     (expo-auth-session on
        ▼                      mobile, Google Identity
Backend Validation              Services on web)
        │                             │
        ▼                             ▼
bcrypt Password                Google ID Token
   Verification                Verified Server-Side
        │                     (google-auth-library)
        │                             │
        └──────────────┬─────────────┘
                        ▼
                 JWT Generated
                        │
                        ▼
        JWT Stored on Device (mobile)
           or in Browser (web)
                        │
                        ▼
           Authenticated API Requests
```

All synchronized user data is protected through authenticated API requests, regardless of which sign-in method or platform was used.

---

# 📱 Planned Screens (Mobile)

* Splash Screen
* Onboarding
* Login
* Registration
* Home Dashboard
* Pets
* Pet Profile
* Vaccination Records
* Add Vaccination
* Weight Tracker
* Appointments
* Book Appointment
* Nearby Clinics
* Medical Documents
* Health Timeline
* Emergency Mode
* Profile / Settings
* Notification Settings

# 🌐 Web App Pages (Built)

* Home, About, Roadmap
* Login / Register (email or Google), Forgot Password, Reset Password
* Dashboard (`/dashboard`; signed-in visitors to the home and login pages land here) with sections: Overview, Profile & ID, Vaccinations, Medications, Weight, Appointments, Expenses, Nearby Clinics, Medical Vault, Timeline, Smart Reminders
* Analytics — care score, weight trend, vaccination status, upcoming visits, spending, recent activity
* Health Summary (printable PDF) and Share with Vet
* Shared Record (`/share/:token`) — public, read-only view for vets and sitters
* Emergency Mode
* Account Settings — profile, password, theme, currency, reminders, email, data download, account deletion
* 404 page for unknown links

---

# 🎯 Project Goals

PawPrint aims to provide:

* **Offline-first reliability** on mobile
* **Cross-platform reach** — the same account and data on mobile and web
* **Fast health record logging**
* **Simple pet management**
* **Secure cloud synchronization**
* **Useful reminders**
* **Easy access to important medical information**
* **Support for multiple pets**

The goal is to make managing a pet's health information simple, reliable and accessible — on your phone even without an internet connection, and on the web whenever a bigger screen helps.

---

# 🚀 Future Enhancements

PawPrint is designed to evolve beyond its core pet-care experience. Future enhancements may include:

* 🗂️ **PWA Offline Caching (Web)**  
  Service worker caching for lightweight, read-only offline access in the browser, as a complement to mobile's full offline-first design.

* 👨‍👩‍👧 **Family / Shared Pet Access**  
  Allow multiple family members or caretakers to securely access and manage the same pet's information.

* 📊 **Advanced Health Trend Insights**  
  Provide deeper insights from vaccination history, weight trends, and other recorded health data while keeping the system non-diagnostic.

* 🌐 **Multilingual Support**  
  Make PawPrint more accessible to pet owners by supporting multiple languages.

* ♿ **Improved Accessibility**  
  Enhance accessibility through better screen-reader support, scalable text, improved contrast, and accessible interaction patterns.

* ☁️ **Cloud File Storage**  
  Move uploaded photos and documents from the server's disk to object storage (e.g. S3 or Cloudinary) so they survive redeploys on hosts with temporary disks.

* 🧪 **Expanded Automated Test Coverage**  
  Increase unit, integration, and UI test coverage across mobile and web to improve application reliability as PawPrint grows.

* 📦 **Automated Build Pipeline**  
  Introduce CI/CD automation for testing and generating production-ready mobile builds and web deployments.

Features such as a dedicated vet portal, teleconsultation and wearable integration are currently outside the MVP scope.

---

# 🧪 Testing

```bash
cd backend && npm test          # unit + API integration tests (in-memory MongoDB, no setup needed)
cd frontend && npm test         # Vitest + React Testing Library
cd frontend && npm run build    # type-check + production build
```

Current status: **64 backend tests** and **15 web tests**, all passing.

* **Backend unit tests** — reminder rules, medication schedules and adherence, expense totals,
  weight trends and targets, vaccination status, clinic distance, email templates, input sanitising.
* **Backend integration tests** — real HTTP requests through the whole API against a throwaway
  in-memory database: auth and password reset, account isolation between users, blocked
  mass-assignment and NoSQL injection, expenses (including rejecting zero amounts), clinics,
  share links, health checks.
* **Web tests** — date/money/adapter helpers and components (Medications tab, Forgot Password,
  404 page, error boundary).
* **Mobile** — React Native Testing Library, alongside the mobile app (not part of this repository).

---

# 📦 Build & Deployment

The product is intended to support:

* Android (mobile)
* iOS (mobile)
* Web (modern browsers)

Mobile production builds are generated using **EAS Build**.

**Web app → Vercel or Netlify.** Set the project root to `frontend/` and the environment
variable `VITE_API_URL` to the deployed API URL. `frontend/vercel.json` and
`frontend/public/_redirects` already route every path to the app, so links like `/settings`
or `/share/…` work on refresh.

**Backend → Render.** `render.yaml` is a ready blueprint: it builds `backend/`, checks `/health`,
generates a strong `JWT_SECRET`, and asks for `MONGO_URI`, `WEB_ORIGIN` (the web app's URL, for
CORS), `APP_URL` (used in email links) and the optional email/Google settings. In production the
server refuses to start with a weak `JWT_SECRET`.

> Uploaded photos and documents are stored on the server's disk (`backend/uploads/`). On hosts
> with temporary disks (like Render's free tier) attach a persistent disk, or move uploads to
> cloud storage.

---

## 💙 Vision

> **Care for your pets. Track their health. Stay prepared — even offline. Available wherever you are — phone or browser.**

PawPrint brings your pet's essential health information together in one simple, reliable application, on the device that's most convenient for you.

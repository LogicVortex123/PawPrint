<div align="center">

<p>
  <img src="./PawPrint%20logo.jpeg" alt="PawPrint Logo" width="140">
</p>

<h1>🐾 PawPrint — Web App</h1>

<p><strong>The React + Vite dashboard for PawPrint.</strong> For the full product overview and the backend, see the <a href="../README.md">main README</a>.</p>

</div>

---

## ✨ What's in the web app

* **Home, About, Roadmap** — public pages with real pet photography
* **Login / Sign up** — email & password or "Continue with Google"; forgot / reset password
* **Dashboard** (`/dashboard`, where signed-in users land) — a sidebar with 11 sections per pet:
  Overview (with care score) · Profile & ID · Vaccinations · Medications · Weight · Appointments ·
  Expenses · Nearby Clinics · Medical Vault · Timeline · Smart Reminders
* **Analytics** — vaccination status, weight trend, visits and spending across all pets
* **Health Summary** (print / save as PDF), **Share with Vet** links with QR codes, and the public **Shared Record** page
* **Emergency Mode** — allergies, medications, contacts and 24/7 clinics on one screen
* **Settings** — profile, password, theme, currency, reminders, email digest, data download, account deletion
* **Search records** from anywhere in the dashboard, plus a reminder bell and optional browser alerts
* **PawPal** — a chat assistant on every page that answers from the pet’s records (`src/lib/chat.ts`, `src/components/chat/`)

## 🛠️ Built with

| Technology | Purpose |
| --- | --- |
| React 18 + TypeScript | UI |
| Vite | Dev server and production build |
| React Router 6 | Routing (pages are lazy-loaded) |
| Zustand | App state — every API call goes through `src/store/useAppStore.ts` |
| Tailwind CSS | Styling, custom PawPrint palette, light/dark themes |
| Lucide React | Icons |
| qrcode | QR codes for share links |
| Google Identity Services | Google Sign-In in the browser |
| Vitest + React Testing Library | Tests |

Charts are drawn with plain SVG, so there is no chart library.

## 🚀 Run it locally

The backend must be running first (see the main README).

```bash
cp .env.example .env     # VITE_API_URL and (optional) VITE_GOOGLE_CLIENT_ID
npm install
npm run dev              # http://localhost:5173
```

The app always uses port **5173**. If that port is busy, Vite stops with an error rather than
switching to another port, because Google Sign-In only works on addresses registered for the
OAuth client (`http://localhost` and `http://localhost:5173`).

| Variable | What it is |
| --- | --- |
| `VITE_API_URL` | Backend address, e.g. `http://localhost:5000` |
| `VITE_GOOGLE_CLIENT_ID` | Same OAuth client ID as the backend's `GOOGLE_CLIENT_ID` |

## 📜 Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run the tests once |
| `npm run typecheck` | Type-check only |

## 📁 Structure

```text
src/
├── pages/                One file per route
├── components/
│   ├── layout/           AppShell — dashboard sidebar, top bar, search
│   ├── ui/               Shared building blocks
│   ├── dashboard/        Pet modals, Medications, Expenses, share dialog
│   │   └── tabs/         The other dashboard sections
│   ├── home/, hero/      Landing page
│   ├── common/           Navbar, footer, modal, search, reminder bell
│   └── summary/          Printable health summary
├── store/                Zustand store
├── lib/                  API client, adapters, dates, money, navigation, Google sign-in
├── data/                 Roadmap content
├── types/                TypeScript types
└── test/                 Test setup and component tests
public/images/            Pet photography
```

## 🌍 Deploy

**Vercel.** Import the repo and either leave the root as the repository root or set **Root Directory** to `frontend`. Production builds call `https://pawprint-2.onrender.com`. Set `VITE_API_URL` to that same address (no trailing slash) if you want it explicit; a localhost value fails the build because Vite bakes it into the bundle. `vercel.json` sends every path to the app and does not cache `index.html`.

**Netlify.** Publish `frontend/` (`public/_redirects` covers client-side routes) with the same `VITE_API_URL`.

Add the live site origin to the Google OAuth client's Authorized JavaScript origins and to the backend `WEB_ORIGIN` (`https://…`, no trailing slash). See the main README for the Render blueprint.

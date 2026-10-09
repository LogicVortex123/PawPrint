# PawPrint API reference

Base URL: `http://localhost:5000` in development (set `VITE_API_URL` in the web app).
All bodies are JSON unless noted. Errors always look like:

```json
{ "error": { "message": "Readable explanation" } }
```

**Auth:** endpoints marked 🔒 need `Authorization: Bearer <token>` (the token returned by
register / login / Google sign-in / password reset). Tokens last `JWT_EXPIRES_IN` (default 7 days).

**Dates:** fields named `date`, `startDate`, `endDate` on medications, doses and expenses are
calendar days (`YYYY-MM-DD`). Endpoints that work out "today" accept `?date=YYYY-MM-DD` — the
browser's own date — so the server's timezone never decides which day a dose belongs to.

**Limits:** sign-in endpoints allow 10 failed attempts per 15 minutes per IP, password-reset
emails 5 per hour, public share links 120 requests per 15 minutes, everything else 300 per minute.
JSON bodies are capped at 1 MB; uploads at 10 MB.

---

## Health

| Method | Path | Description |
|---|---|---|
| GET | `/health` | `200 { status: "ok", database: "connected", version, uptimeSeconds }`, or `503` when the database is down |

## Auth & account

| Method | Path | Body / query | Description |
|---|---|---|---|
| POST | `/auth/register` | `{ name, email, password }` | Create an account (password 8–72 characters). Returns `{ token, user }` |
| POST | `/auth/login` | `{ email, password }` | Returns `{ token, user }` |
| POST | `/auth/google` | `{ idToken }` | Sign in with a Google ID token (verified server-side) |
| POST | `/auth/forgot-password` | `{ email }` | Emails a one-time reset link (30 min). Same reply whether or not the account exists |
| POST | `/auth/reset-password` | `{ token, password }` | Sets the new password, returns `{ token, user }` |
| GET 🔒 | `/auth/me` | | Current user, preferences and `favoriteClinicIds` |
| PUT 🔒 | `/auth/me` | `{ name?, preferences? }` | `preferences`: `reminders.{vaccination,appointment,weight,medication}`, `reminderLeadDays` (1–60), `emailReminders`, `currency` (INR, USD, EUR, GBP, AUD, CAD, SGD, AED, JPY) |
| PUT 🔒 | `/auth/password` | `{ currentPassword?, newPassword }` | Change password (Google-only accounts can set a first one) |
| GET 🔒 | `/auth/export` | | Download everything stored for the account as JSON (no password hash or tokens) |
| DELETE 🔒 | `/auth/me` | `{ confirmEmail }` | Delete the account and every record and file |

## Pets

| Method | Path | Description |
|---|---|---|
| GET 🔒 | `/pets` | The user's pets |
| POST 🔒 | `/pets` | `{ name, species, breed?, gender?, dateOfBirth?, microchipId?, allergies?, medications?, emergencyContacts?, targetWeightMinKg?, targetWeightMaxKg?, clientLocalId? }` |
| GET 🔒 | `/pets/:id` | One pet |
| PUT 🔒 | `/pets/:id` | Same fields as create. Send `null` to clear a target weight. Ownership can never change |
| DELETE 🔒 | `/pets/:id` | Deletes the pet and all its records and files |
| POST 🔒 | `/pets/:id/photo` | `multipart/form-data` with `photo` (JPG, PNG, WebP) |

## Vaccinations

| Method | Path | Description |
|---|---|---|
| GET 🔒 | `/pets/:id/vaccinations` | With derived `status`: `Completed`, `Upcoming` (due within 30 days) or `Overdue` |
| POST 🔒 | `/pets/:id/vaccinations` | `{ vaccineName, administrationDate, nextDueDate, veterinarian?, clinic?, batchNumber?, notes? }` |
| PUT 🔒 | `/vaccinations/:id` | Edit |
| DELETE 🔒 | `/vaccinations/:id` | Delete |
| GET 🔒 | `/vaccinations/catalog?species=dog\|cat` | Common vaccines with a typical booster interval, to pre-fill forms |

## Weight

| Method | Path | Description |
|---|---|---|
| GET 🔒 | `/pets/:id/weights` | Oldest first, each with `trendPercent` vs the previous weigh-in |
| POST 🔒 | `/pets/:id/weights` | `{ weightKg, recordedAt? }` |
| PUT 🔒 | `/weights/:id` | `{ weightKg?, recordedAt? }` |
| DELETE 🔒 | `/weights/:id` | Delete |

## Appointments

| Method | Path | Description |
|---|---|---|
| GET 🔒 | `/appointments` | All appointments across the user's pets |
| POST 🔒 | `/appointments` | `{ pet, clinic: { name, address? }, date, reason?, notes? }`. Emails a confirmation with a calendar invite when email reminders are on |
| PUT 🔒 | `/appointments/:id` | Edit, reschedule (emails the new time), or set `status`: `scheduled`, `completed`, `cancelled` |
| DELETE 🔒 | `/appointments/:id` | Delete |

## Medications

| Method | Path | Description |
|---|---|---|
| GET 🔒 | `/medications?date=` | All medications, each with `doses` (last 31 days) and `schedule` (`dueToday`, `givenToday`, `remainingToday`, `missedYesterday`, `adherence7`, `adherence30`, `streak`, `history` for 14 days, `endsInDays`) |
| GET 🔒 | `/pets/:id/medications?date=` | Same, for one pet |
| POST 🔒 | `/pets/:id/medications` | `{ name, dosage?, frequency, startDate, endDate?, instructions?, prescribedBy? }`. `frequency`: `once_daily`, `twice_daily`, `three_times_daily`, `every_other_day`, `weekly`, `monthly`, `as_needed` |
| PUT 🔒 | `/medications/:id` | Edit. An empty `endDate` makes the course ongoing |
| DELETE 🔒 | `/medications/:id` | Delete with its dose history |
| POST 🔒 | `/medications/:id/doses?date=` | `{ date, slot }` — mark dose `slot` (0 = first of the day) as given. Repeating it is harmless |
| DELETE 🔒 | `/medications/:id/doses?date=&doseDate=&slot=` | Undo a dose |

## Expenses

| Method | Path | Description |
|---|---|---|
| GET 🔒 | `/expenses?pet=&year=&category=` | Newest first |
| POST 🔒 | `/pets/:id/expenses` | `{ amount, date, category?, description?, vendor?, appointment? }`. `category`: `vet`, `medication`, `food`, `grooming`, `insurance`, `supplies`, `training`, `boarding`, `other` |
| PUT 🔒 | `/expenses/:id` | Edit; `pet` moves it to another of the user's pets |
| DELETE 🔒 | `/expenses/:id` | Delete |
| GET 🔒 | `/expenses/summary?year=&pet=&date=` | `{ currency, total, count, byMonth[12], byCategory, byPet, thisMonth, lastMonth, monthlyAverage, largest }` |
| GET 🔒 | `/expenses/export.csv?year=` | Spreadsheet download |

## Documents

| Method | Path | Description |
|---|---|---|
| GET 🔒 | `/pets/:id/documents` | Newest first |
| POST 🔒 | `/pets/:id/documents` | `multipart/form-data`: `file` (PDF, JPG, PNG, WebP, ≤10 MB) and `category` (`Prescription`, `Medical Report`, `Insurance`, `Adoption`) |
| DELETE 🔒 | `/documents/:id` | Deletes the record and the file |

Uploaded files are served from `/uploads/<random-uuid>.<ext>`.

## Clinics

| Method | Path | Description |
|---|---|---|
| GET 🔒 | `/clinics/nearby?lat=&lng=` | Ranked by distance (`distanceKm`) when coordinates are given; otherwise saved clinics first, then A–Z. Each has `isFavorite` |
| GET 🔒 | `/clinics/favorites` | The user's saved clinics |
| PUT 🔒 | `/clinics/:id/favorite` | Save. Returns `{ favoriteClinicIds }` |
| DELETE 🔒 | `/clinics/:id/favorite` | Unsave |

## Reminders

| Method | Path | Description |
|---|---|---|
| GET 🔒 | `/reminders?pet=&date=` | Smart Reminders: vaccines due or overdue, upcoming and unconfirmed visits, doses still due today, missed doses, courses ending, weigh-in nudges and weight outside the target range. Each has `urgency`: `urgent`, `upcoming` or `info` |
| POST 🔒 | `/reminders/send-test` | Sends today's digest email now. In development without SMTP the reply includes a `previewUrl` |
| GET 🔒 | `/reminders/email-status` | `{ smtpConfigured }` |

A daily job at 08:00 (server time) emails the digest to everyone with email reminders turned on.

## Share links

| Method | Path | Description |
|---|---|---|
| GET 🔒 | `/pets/:id/shares` | Active (not revoked) links with `viewCount` and `lastViewedAt` |
| POST 🔒 | `/pets/:id/shares` | `{ days: 1 \| 7 \| 30, label? }` — creates a read-only link |
| DELETE 🔒 | `/shares/:id` | Revoke |
| GET | `/shares/public/:token` | **No login.** The pet's health summary: profile, allergies, current medications, vaccinations, recent weights, appointments, document list. `404` once expired or revoked |

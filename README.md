# Rancang Belanja

**Rancang Belanja** is a monthly expense planner that sorts every expense into two groups: **Wajib bayar** (must pay) and **Boleh tangguh** (can defer). It shows how much money is left after the bills that can't wait, and when you're over budget it tells you what to push to next month.

> **BM:** Rancang Belanja membantu anda merancang perbelanjaan bulanan dengan membahagikan setiap item kepada *Wajib bayar* dan *Boleh tangguh*. Aplikasi ini memaparkan baki selepas bil wajib, dan jika bajet terlebih, ia mencadangkan item yang boleh ditangguhkan ke bulan depan.

- Bahasa Melayu by default, with a one-tap switch to English
- Light, dark, or follow-your-device theme
- Built for phones first, and works on desktop too
- Can be installed on a phone's home screen (PWA)
- Runs locally in Docker with a single command
- **Separate profiles with a PIN**: each person (e.g. you and your mom) picks their name, types their PIN on a number pad, and sees only their own data. There are no usernames or passwords.
- Data is saved on your own computer (a Docker volume), so each person can open their profile from any phone or PC on the home Wi-Fi

---

## Contents

- [Why two groups?](#why-two-groups)
- [Profiles and PIN](#profiles-and-pin)
- [Features](#features)
  - [Utama (Home)](#utama-home)
  - [Perbelanjaan (Expenses)](#perbelanjaan-expenses)
  - [Laporan (Reports)](#laporan-reports)
  - [Tetapan (Settings)](#tetapan-settings)
  - [Adding and editing an expense](#adding-and-editing-an-expense)
  - [Example mode](#example-mode)
- [How the calculations work](#how-the-calculations-work)
- [Getting started](#getting-started)
- [Install on your phone](#install-on-your-phone)
- [Share outside your home (Cloudflare Tunnel)](#share-outside-your-home-cloudflare-tunnel)
- [Where your data is stored](#where-your-data-is-stored)
- [Backup and restore](#backup-and-restore)
- [Security notes](#security-notes)
- [Project structure](#project-structure)
- [Development](#development)
- [Customising](#customising)
- [Data model](#data-model)
- [API](#api)
- [Tech stack](#tech-stack)
- [Troubleshooting](#troubleshooting)
- [Roadmap ideas](#roadmap-ideas)

---

## Why two groups?

Most budgeting apps treat every ringgit the same. In real life, some payments can't wait: rent, loan instalments, utilities, insurance. Others can: a new pair of shoes, a weekend trip, dining out.

Rancang Belanja is built around that difference:

| Group | Meaning | Examples |
|---|---|---|
| 🔴 **Wajib bayar** (Must pay) | Late payment brings a penalty, interest, cut-off or real harm | Rent, car loan, PTPTN, electricity, water, internet, takaful, groceries, petrol |
| 🔵 **Boleh tangguh** (Can defer) | Can safely wait a month | Subscriptions, gym, shopping, dining out, holidays |

The main number in the app is **Baki selepas bil wajib** (balance after must-pay bills): your income minus everything you must pay. If that number is positive, your essentials are safe.

---

## Profiles and PIN

Rancang Belanja is made for a household. Each person has their own **profile**, and each profile has its own **PIN** (4 to 6 digits) and its **own separate data**. For example, you see only your bills, and your mom sees only hers.

There is no login page with a username and password. Instead:

1. **First time (setup):** the app asks you to create the profiles. Enter a name and a PIN for each person (*Orang 1*, *Orang 2*, …, up to 6), then tap **Simpan dan mula** (save and start).
2. **Every time the app opens:** the **Siapa yang guna?** (who's using?) screen shows everyone's name with a coloured initial. Tap your name.
3. **Enter your PIN** on the number pad. As soon as the last digit is typed, the app opens. You can also type the PIN on a keyboard.

| What happens | Detail |
|---|---|
| Wrong PIN | *"PIN salah. 4 cubaan lagi."* (wrong PIN, 4 tries left) |
| 5 wrong PINs in a row | That profile is blocked on that device for **5 minutes** |
| Closing the app or browser tab | The session ends, so the PIN is needed again next time |
| 15 minutes without touching the app | The app **locks itself** |
| Lock manually | Tap your coloured initial at the top (phone), **Kunci** in the sidebar (desktop), or **Kunci sekarang** in Settings |

In **Tetapan → Profil & keselamatan** (Settings → Profile & security), each person can:

- **Rename** their profile
- **Tukar PIN** (change PIN). This needs the current PIN, and it signs the profile out on every other device.
- **Tambah profil baharu** (add a new profile) for another family member, up to 6 in total
- **Kunci sekarang** (lock now)

Each profile also keeps its **own settings**: language, theme, currency, monthly income and the example month.

> **Forgot a PIN?** See [Troubleshooting](#troubleshooting). The PIN can be reset from the computer running Docker.

---

## Features

The app has four pages. On a phone they are in the **bottom menu bar**, and on a computer they are in the **left sidebar**.

### Utama (Home)

A simple overview of the selected month:

- **Summary card**
  - The balance after must-pay bills, in large type (shown in red if negative).
  - A one-line explanation in plain language, e.g. *"Bil wajib selamat. Tangguhkan RM 229.00 untuk kekal dalam bajet."*
  - A progress bar showing how much of the must-pay total is already paid.
- **Three figures**, each tappable:
  - **Pendapatan** (Income) opens Settings so you can change it.
  - **Wajib bayar** opens the must-pay list.
  - **Boleh tangguh** opens the can-defer list.
- **Status card**, colour-coded:
  - 🟢 **Bajet anda seimbang** (budget balances): everything fits, and it tells you how much is spare.
  - 🟡 **Tangguhkan beberapa perbelanjaan** (defer a few things): essentials are covered but total spending is over income. It lists the exact items to defer, with a **Pindahkan ke [bulan depan]** (move to next month) button that moves them all at once.
  - 🔴 **Pendapatan tidak cukup untuk bil wajib** (income doesn't cover must-pay bills): must-pay bills alone exceed income.
  - ⚪ **Tetapkan pendapatan anda** (set your income): shown when no income is set yet.
- **Perlu dibayar** (Still to pay): up to 5 unpaid must-pay bills, most urgent first, each with a tick circle to mark it paid.

### Perbelanjaan (Expenses)

- Two tabs, **Wajib bayar** and **Boleh tangguh**, each showing its total.
- A progress bar with the paid amount and the amount still to go.
- A **search box** that appears once a list has more than 4 items. It searches name, note and category.
- Each row shows:
  - A **tick circle** to mark it paid or unpaid.
  - Name, category, *Setiap bulan* (every month) or *Sekali sahaja* (one-off), and the note.
  - The amount.
  - A due-date label: `Lewat 3 hari` (3 days overdue), `Hari ini` (today), `2 hari lagi` (in 2 days), `15 Okt`, `Bila-bila` (anytime) or `Dibayar` (paid).
  - For can-defer items, a **Ke [bulan]** button that moves that item to next month.
- Tap a row to edit or delete it.
- The list is sorted overdue first, then due soon, then upcoming, then items with no due date, then paid items. Within each group it is sorted by due day, then by amount (largest first).

### Laporan (Reports)

- **Ringkasan bulan** (month summary): income, must pay, can defer, total spending, paid, unpaid and the final balance.
- **Trend 6 bulan** (6-month trend): stacked bars for the selected month and the five before it, split into must-pay and can-defer.
- **Mengikut kategori** (by category): each category's total, sorted largest first, with a bar split into must-pay and can-defer.

### Tetapan (Settings)

| Setting | What it does |
|---|---|
| **Bahasa** (Language) | Bahasa Melayu or English. Month names, categories and all labels are translated. |
| **Tema paparan** (Appearance) | Sistem (follow device), Cerah (light), Gelap (dark) |
| **Pendapatan** (Income) | Income for the selected month. Later months reuse the most recent amount until you change it. |
| **Mata wang** (Currency) | RM (default), S$, $, €, £, Rp, A$ |
| **Item berulang** (Recurring items) | Copies recurring items from last month that aren't in this month yet |
| **Padam perbelanjaan bulan ini** (Delete this month) | Deletes every item in the selected month, after a confirmation step |

The language and theme switches can also be reached quickly: on a phone they are at the top of the screen, and on a computer they are at the bottom of the sidebar.

### Adding and editing an expense

Tap **+ Tambah** (phone) or **Tambah perbelanjaan** (desktop). The form slides up from the bottom on phones and opens as a dialog on desktop.

| Field | Notes |
|---|---|
| **Jenis** (Type) | Wajib bayar or Boleh tangguh |
| **Nama** (Name) | Required, up to 80 characters |
| **Jumlah** (Amount) | Required, must be more than 0 |
| **Tarikh akhir** (Due day) | Optional, day of the month from 1 to 31. It is clamped to the month's last day (31 → 28/29 in February) |
| **Kategori** (Category) | 14 categories: Kediaman, Utiliti, Pinjaman & hutang, Insurans & takaful, Makanan & dapur, Pengangkutan, Pendidikan, Kesihatan, Keluarga, Langganan, Membeli-belah, Hiburan & riadah, Simpanan, Lain-lain |
| **Catatan** (Note) | Optional, e.g. an account number |
| **Berulang setiap bulan** (Repeats monthly) | Marks the item as recurring so it can be copied to the next month |

Deleting an item needs a second tap on **Ya, padam** (yes, delete). Press `Esc` or tap outside the form to close it.

### Example mode

The first time you open the app, it shows a realistic **example month**: RM 5,200 income, 9 must-pay bills and 5 can-defer items. Everything works in this mode, so you can tick, defer, edit, add and delete. Nothing is saved until you choose one of these:

- **Simpan sebagai data saya** (Keep as my data) saves the example month, with your changes, as your own list.
- **Mula senarai kosong** (Start with an empty list) discards the examples and starts fresh.

### Month navigation

Use the **‹ Month Year ›** control at the top to move between months. When you're not on the current month, a **Bulan ini** (this month) button takes you back.

When the previous month has recurring items that aren't in the current month yet, a banner offers to add them in one tap.

---

## How the calculations work

For the selected month:

```
Baki selepas bil wajib   = Pendapatan − Jumlah wajib bayar
Baki akhir               = Pendapatan − Jumlah wajib bayar − Jumlah boleh tangguh
```

**Budget status**

| Condition | Status |
|---|---|
| No income set | ⚪ Set your income |
| Final balance ≥ 0 | 🟢 Balanced |
| Balance after must-pay ≥ 0, final balance < 0 | 🟡 Defer some items |
| Balance after must-pay < 0 | 🔴 Income doesn't cover essentials |

**Balance plan (what to defer)**

When you're over budget by a gap *G*, the app picks from the **unpaid** can-defer items:

1. If a single item is at least *G*, it picks the **smallest such item**, so you defer as little as possible.
2. Otherwise it takes the **largest** item, reduces the gap, and repeats step 1 with what's left.
3. If deferring everything still isn't enough, it tells you how much you're still short.

Example: you're RM 229 over, and the deferrable items are RM 55, 120, 250, 300 and 900. The plan picks just **Kasut larian (RM 250)** instead of the RM 900 trip.

**Due-date status** (only for the current month)

| Label | Rule |
|---|---|
| Dibayar (Paid) | Item is marked paid |
| Lewat *n* hari (Overdue) | Due day has passed. Every unpaid item in a past month is also overdue |
| Hari ini (Today) | Due today |
| *n* hari lagi (In *n* days) | Due within 3 days |
| *15 Okt* | Due later, or in a future month |
| Bila-bila (Anytime) | No due day set |

**Recurring items:** when an item is copied to a new month, the copy starts as unpaid and keeps a link (`seriesId`) to the original. The app uses that link to know which recurring items are already in the month, so nothing gets copied twice.

---

## Getting started

### Option 1: Docker (recommended)

You need [Docker Desktop](https://www.docker.com/products/docker-desktop/).

```bash
git clone https://github.com/Mierul01/rancang-belanja.git
cd rancang-belanja
docker compose up -d --build
```

Open **http://localhost:8088**. The first time, you'll see **Sediakan profil** (set up profiles). Create a profile for each person, each with their own PIN.

Useful commands:

```bash
docker compose logs -f     # view logs
docker compose down        # stop and remove the container (your data is kept in the volume)
docker compose up -d       # start again
```

> ⚠️ `docker compose down -v` also deletes the **`rancang_data` volume, which holds every profile and all of their data**. Only use `-v` if you really want to start from zero.

The container uses `restart: unless-stopped`, so it starts again automatically whenever Docker starts.

### Option 2: Node.js without Docker

You need Node.js 18 or newer. No `npm install` is needed.

```bash
node server.js
```

Open **http://localhost:3000**. The data is saved in `./data/db.json`.

### Option 3: A plain static web server (single user)

If `public/` is served by a static server with no `server.js` (e.g. `npx serve public`), the app detects that there is no API. It then runs **without profiles or a PIN** and saves to the browser's local storage instead.

---

## Install on your phone

1. Make sure the phone and the computer running Docker are on the **same Wi-Fi**.
2. Find the computer's local IP address. On Windows, run `ipconfig` and look for the *IPv4 Address*, e.g. `192.168.1.20`.
3. On the phone, open `http://192.168.1.20:8088` in Chrome (Android) or Safari (iPhone).
4. Add it to your home screen:
   - **Android (Chrome):** menu ⋮, then **Add to Home screen** (or **Install app**)
   - **iPhone (Safari):** Share button, then **Add to Home Screen**

It then opens full-screen with its own icon, like a normal app. Do this on each person's phone: everyone opens the same address, taps their own name and enters their own PIN.

> If the phone can't connect, allow port 8088 through Windows Firewall.
> Some Android versions only install a full app over HTTPS. Over plain HTTP you'll still get a home-screen shortcut.

---

## Share outside your home (Cloudflare Tunnel)

To use the app away from home Wi-Fi (e.g. your mom on mobile data), a **Cloudflare Tunnel** gives it a public `https://` address. You don't need to open router ports. The data still stays on your PC, and **your PC must be on** with Docker running.

> **Do the first-time setup at home first.** Creating the first profiles is blocked through the tunnel, so strangers can't set up the app before you. Open `http://localhost:8088` on the PC and create everyone's profile there.

### Option A: Quick tunnel (free, no account, no domain)

```bash
docker compose --profile tunnel up -d
```

Find the address:

```bash
# Windows
docker compose logs tunnel | findstr trycloudflare
# macOS / Linux
docker compose logs tunnel | grep trycloudflare
```

It looks like `https://some-random-words.trycloudflare.com`. Send it to your mom. She opens it, adds it to her home screen, taps her name and enters her PIN.

⚠️ **The address changes whenever the tunnel restarts**, e.g. after the PC reboots or Docker restarts. Run the command above again and send her the new one. Cloudflare provides quick tunnels for testing, with no uptime guarantee.

To stop sharing:

```bash
docker compose --profile tunnel stop tunnel
```

### Option B: Permanent address on your own domain

A permanent address such as `https://belanja.yourdomain.com` needs a free Cloudflare account and **a domain** managed by Cloudflare (a domain costs roughly RM 40–60 a year).

1. In the Cloudflare dashboard, go to **Zero Trust → Networks → Tunnels → Create a tunnel**, choose **Cloudflared**, and name it `rancang-belanja`.
2. Copy the **token** (the long string after `--token`) into a file named `.env` next to `docker-compose.yml`:
   ```
   TUNNEL_TOKEN=eyJhIjoi...
   ```
3. Under **Public hostname**, add e.g. `belanja.yourdomain.com` → service `HTTP` → URL `web:3000`.
4. Start it:
   ```bash
   docker compose --profile tunnel-named up -d
   ```
5. Recommended: in **Zero Trust → Access → Applications**, protect that hostname with a **one-time email code** allowed only for your and your mom's emails. Strangers then can't even reach the PIN screen.

`.env` is in `.gitignore`, so the token is never pushed to GitHub.

### Safety when the app is public

- Change to **6-digit PINs** in **Tetapan → Tukar PIN**.
- All tunnel traffic arrives from the same place (the tunnel), so the wrong-PIN limit applies to each profile as a whole. After 5 wrong tries from anywhere, that profile waits 5 minutes. This stops PIN guessing, but someone who knows the address could also make your mom wait 5 minutes.
- Only share the address with family.

---

## Where your data is stored

The app picks its storage automatically, depending on how it's opened:

| How the app is run | Where data is saved | Profiles and PIN |
|---|---|---|
| **Docker / `node server.js`** (normal use) | `db.json` on the server: the `rancang_data` Docker volume, or `./data/` without Docker | ✅ Yes |
| Plain static server | The browser's local storage on that device | ❌ No |
| Inside a Claude Artifact viewer | That viewer's private per-user storage | ❌ No (the Claude account separates people) |

With Docker, your data is:

- **On your own computer**, never sent to the internet
- **Kept when the container is rebuilt or restarted**, because it lives in the `rancang_data` volume
- **Separate for every profile.** The server only returns the data that belongs to the profile whose PIN was entered.

The phone or browser keeps only small preferences: language and theme (`paycheck-planner-lang`, `paycheck-planner-theme`), plus the current session while the tab is open (`rancang-belanja-session` in session storage).

---

## Backup and restore

All profiles and data are in one file, `/data/db.json`, inside the volume.

**Back up** (copies it to the current folder):

```bash
docker cp rancang-belanja:/data/db.json ./rancang-belanja-backup.json
```

**Restore:**

```bash
docker compose stop
docker compose run --rm -v "$(pwd)/rancang-belanja-backup.json:/restore.json" web sh -c "cp /restore.json /data/db.json"
docker compose start
```

> It's a good idea to copy the backup somewhere safe from time to time, e.g. Google Drive or a USB drive.

---

## Security notes

This app is built for a **home network**, to keep family members' data separate from each other. It is not built to be exposed to the internet.

| Protection | How |
|---|---|
| PINs are never stored as-is | Hashed with **scrypt** and a random salt per profile |
| Guessing PINs | After 5 wrong tries, that profile is blocked for 5 minutes (per device) |
| Sessions | A random 256-bit token, valid for at most 12 hours, kept only while the tab or app is open |
| Walking away | Auto-locks after 15 minutes without use |
| Changing a PIN | Signs that profile out everywhere else |
| Data access | Every data request is checked on the server against the session's profile |

Things to know:

- A 4–6 digit PIN keeps family members out of each other's data. It is **not** strong protection against a determined attacker.
- On your Wi-Fi the connection is plain **HTTP**, so it isn't encrypted. Don't forward port 8088 on your router. To use the app outside the home, use the [Cloudflare Tunnel](#share-outside-your-home-cloudflare-tunnel), which adds HTTPS.
- First-time setup is refused when the request comes through the tunnel.
- Anyone with access to the computer running Docker can read `db.json` (except the PINs, which are hashed).

---

## Project structure

```
rancang-belanja/
├── src/
│   └── app.html              # The whole app: styles, translations, React components
├── public/                   # What the server serves (generated + static assets)
│   ├── index.html            # Built from src/app.html by build.js
│   ├── manifest.webmanifest  # PWA manifest (name, colours, icons)
│   ├── icon.svg              # Vector app icon
│   ├── icon-192.png          # PNG icons for Android / iOS
│   └── icon-512.png
├── server.js                 # Node server: serves public/ + the profile/PIN/data API (no dependencies)
├── reset-pin.js              # Resets a forgotten PIN (run from Docker, see Troubleshooting)
├── build.js                  # Wraps src/app.html into public/index.html with PWA meta tags
├── make-icons.js             # Draws the PNG icons (Node built-ins only, no dependencies)
├── Dockerfile                # node:22-alpine image running server.js as a non-root user
├── docker-compose.yml        # Container "rancang-belanja" on port 8088 + the rancang_data volume
└── README.md
```

---

## Development

There is **no npm install and no bundler**. React is loaded from a CDN, and the components are written with [htm](https://github.com/developit/htm) tagged templates instead of JSX, so the source runs directly in the browser. The server uses only Node's built-in modules.

Workflow:

```bash
# 1. Edit the app
#    src/app.html   (frontend)
#    server.js      (API)

# 2. Rebuild public/index.html
node build.js

# 3a. Run locally without Docker (data in ./data/)
node server.js

# 3b. Or rebuild and restart the container
docker compose up -d --build
```

Only if you change the icon design:

```bash
node make-icons.js
```

### Code map (`src/app.html`)

| Section | What's there |
|---|---|
| `<style>` | Design tokens (colours for light and dark, fonts) at the top, then layout, components and responsive rules |
| `DICT` | All UI text in `ms` and `en` |
| `MONTHS`, `MONTHS_S`, `CAT_MS` | Month names and category translations |
| Helpers | `money()`, `incomeFor()`, `dueState()`, `sortItems()`, `planDefer()`, `exampleItems()` |
| `srv` | Small API client for `server.js` (session token, JSON calls) |
| Lock screen | `Gate` (who's using?), `PinPad` (number pad), `SetupForm` (first-time profiles), `ProfileSettings` |
| Components | `Row`, `HomePage`, `ExpensesPage`, `ReportsPage`, `SettingsPage`, `Sheet` (add/edit form), `ThemeSwitch`, `LangSwitch`, `MonthNav` |
| `App` | State, storage (server, browser or Artifact store), sessions and auto-lock, demo mode, navigation, actions |

### Server settings (`server.js`)

| Setting | Default | Meaning |
|---|---|---|
| `PORT` (env) | `3000` | Port inside the container |
| `DATA_DIR` (env) | `/data` in Docker, `./data` otherwise | Where `db.json` is saved |
| `SESSION_TTL_MS` | 12 hours | Longest a session can last |
| `MAX_ATTEMPTS` / `LOCKOUT_MS` | 5 / 5 minutes | Wrong-PIN limit and block time |
| `MAX_PROFILES` | 6 | Most profiles allowed |

The 15-minute auto-lock is `AUTO_LOCK_MS` in `src/app.html`.

---

## Customising

| To change | Edit in `src/app.html` |
|---|---|
| Colours | CSS variables in `:root`, plus the two dark-mode blocks under it |
| Fonts | The Google Fonts `<link>` and `--font-display` / `--font-body` |
| Text or translations | The `DICT.ms` and `DICT.en` objects |
| Categories | The `CATEGORIES` array (the stored key) and `CAT_MS` (the Malay label) |
| Currencies | The `CURRENCIES` array |
| Example month | The `exampleItems()` function and `EXAMPLE_INCOME` |
| "Due soon" window (3 days) | `dueState()` |
| Port | `docker-compose.yml`, `"8088:3000"` (change the left number) |
| App name or colours when installed | `public/manifest.webmanifest` and the `<meta>` tags in `build.js` |

After editing, run `node build.js` and rebuild the container.

---

## Data model

Each expense:

```jsonc
{
  "id": "l1abc2def",
  "name": "Bil elektrik",
  "amount": 180,
  "priority": "must",          // "must" | "defer"
  "category": "Utilities",     // stored in English; the label is translated for display
  "dueDay": 15,                // 1–31 or null
  "month": "2026-09",          // YYYY-MM the item belongs to
  "recurring": true,
  "paid": false,
  "paidAt": null,              // timestamp when marked paid
  "note": "No. akaun 2200…",
  "seriesId": "l0xyz…",        // links recurring copies across months
  "createdAt": 1790736000000
}
```

Profile:

```jsonc
{
  "incomes": { "2026-09": 5200, "2026-10": 5400 },
  "currency": "RM",
  "lang": "ms",
  "theme": "system",
  "started": true              // true once you leave example mode
}
```

Server file `/data/db.json`:

```jsonc
{
  "profiles": [
    {
      "id": "p_3f9a1c…",
      "name": "Mak",
      "color": "#D64545",
      "pinLen": 4,             // lets the number pad submit on the last digit
      "salt": "…",             // random per profile
      "pinHash": "…",          // scrypt(PIN, salt); the PIN itself is never stored
      "createdAt": 1790736000000
    }
  ],
  "users": {
    "p_3f9a1c…": { "items": [ /* expenses */ ], "profile": { /* profile settings */ }, "updatedAt": 1790736000000 }
  },
  "sessions": { "<token>": { "pid": "p_3f9a1c…", "exp": 1790779200000 } }
}
```

---

## API

Served by `server.js`. Routes marked 🔒 need the header `Authorization: Bearer <token>` from `/api/login`.

| Method & path | Body | Purpose |
|---|---|---|
| `GET /api/profiles` | none | Profile names, colours and PIN lengths for the "who's using?" screen, plus `setupNeeded` |
| `POST /api/setup` | `{ profiles: [{ name, pin }] }` | First-time setup; only works while there are no profiles |
| `POST /api/login` | `{ profileId, pin }` | Checks the PIN and returns `{ token, profile }`. Returns `401 wrong_pin` with `attemptsLeft`, or `429 locked` with `retryAfterSec` |
| `POST /api/logout` 🔒 | none | Ends the session |
| `GET /api/me` 🔒 | none | The signed-in profile |
| `PATCH /api/me` 🔒 | `{ name }` | Rename the profile |
| `POST /api/me/pin` 🔒 | `{ current, next }` | Change the PIN and sign out other sessions |
| `POST /api/profiles` 🔒 | `{ name, pin }` | Add a profile (max 6) |
| `GET /api/data` 🔒 | none | This profile's `{ items, profile }` |
| `PUT /api/data` 🔒 | `{ items, profile }` | Save this profile's data (the app saves automatically 0.6 s after each change) |

---

## Tech stack

| Part | Technology |
|---|---|
| UI | React 18 (UMD from cdnjs) + htm |
| Styling | Hand-written CSS with custom properties; light and dark themes |
| Fonts | Bricolage Grotesque (headings), Figtree (body) from Google Fonts |
| Server | Node.js 22 (`node:22-alpine`), built-in `http` + `crypto` only, runs as a non-root user |
| Storage | One JSON file per installation in a Docker volume, written atomically (browser `localStorage` or the Artifact store as fallbacks) |
| Auth | Profile + 4–6 digit PIN, scrypt hashing, bearer session tokens, per-device lockout |
| PWA | Web app manifest + icons generated with Node |

> The page loads React, htm and the fonts from CDNs, so it needs an internet connection to open.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| **Forgot a PIN** | On the computer running Docker, run the three commands below this table. Other profiles and all data stay untouched. |
| "Terlalu banyak cubaan" (too many tries) | Wait 5 minutes, or use the PIN reset below. |
| I see someone else's name but not mine | Ask someone who can sign in to add you in **Tetapan → Tambah profil baharu**. |
| Asked for the PIN again | Normal after closing the app, after 15 minutes idle, after 12 hours, or after the PIN was changed on another device. |
| `port is already allocated` | Another app is using 8088. Change `"8088:3000"` in `docker-compose.yml`, e.g. to `"8090:3000"`. |
| Changes don't show up | Run `node build.js`, then `docker compose up -d --build`, then refresh (`Ctrl + F5`). |
| My data disappeared | Make sure you tapped **your own** name. Never run `docker compose down -v`, because it deletes the data volume. Restore from a [backup](#backup-and-restore) if needed. |
| Phone can't open the app | Same Wi-Fi? Correct IP address? Allow port 8088 in Windows Firewall. |
| Blank page | The CDN scripts couldn't load. Check your internet connection. |
| Start completely from zero | `docker compose down -v && docker compose up -d`. ⚠️ This deletes **every profile and all data**. |

**Reset a forgotten PIN** (replace `Mak` with the profile name and `1234` with the new PIN):

```bash
docker compose stop
docker compose run --rm web node reset-pin.js "Mak" 1234
docker compose start
```

---

## Roadmap ideas

- Export and import data (CSV / JSON) for backup and moving between devices
- Reminders before due dates
- Savings goals
- Offline support with a service worker
- HTTPS for installing as a full app on every phone
- A shared "household" view (e.g. joint bills), if both people agree

---

Made in Malaysia 🇲🇾

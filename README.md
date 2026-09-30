# Rancang Belanja

**Rancang Belanja** is a monthly expense planner that sorts every expense into two groups: **Wajib bayar** (must pay) and **Boleh tangguh** (can defer). It shows how much money is left after the bills that can't wait, and when you're over budget it tells you what to push to next month.

> **BM:** Rancang Belanja membantu anda merancang perbelanjaan bulanan dengan membahagikan setiap item kepada *Wajib bayar* dan *Boleh tangguh*. Aplikasi ini memaparkan baki selepas bil wajib, dan jika bajet terlebih, ia mencadangkan item yang boleh ditangguhkan ke bulan depan.

- Bahasa Melayu by default, with a one-tap switch to English
- Light, dark, or follow-your-device theme
- Built for phones first, and works on desktop too
- Can be installed on a phone's home screen (PWA)
- Runs locally in Docker with a single command
- No account, no server database: your data stays on your device

---

## Contents

- [Why two groups?](#why-two-groups)
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
- [Where your data is stored](#where-your-data-is-stored)
- [Project structure](#project-structure)
- [Development](#development)
- [Customising](#customising)
- [Data model](#data-model)
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

Open **http://localhost:8088**.

Useful commands:

```bash
docker compose logs -f     # view logs
docker compose down        # stop and remove the container
docker compose up -d       # start again
```

The container uses `restart: unless-stopped`, so it starts again automatically whenever Docker starts.

### Option 2: Any static web server

The app is plain static files in `public/`, so any static server works:

```bash
npx serve public
# or
python -m http.server 8088 --directory public
```

> Opening `public/index.html` directly as a file (`file://`) mostly works too, but installing it as a phone app needs it served over HTTP.

---

## Install on your phone

1. Make sure the phone and the computer running Docker are on the **same Wi-Fi**.
2. Find the computer's local IP address. On Windows, run `ipconfig` and look for the *IPv4 Address*, e.g. `192.168.1.20`.
3. On the phone, open `http://192.168.1.20:8088` in Chrome (Android) or Safari (iPhone).
4. Add it to your home screen:
   - **Android (Chrome):** menu ⋮, then **Add to Home screen** (or **Install app**)
   - **iPhone (Safari):** Share button, then **Add to Home Screen**

It then opens full-screen with its own icon, like a normal app.

> If the phone can't connect, allow port 8088 through Windows Firewall.
> Some Android versions only install a full app over HTTPS. Over plain HTTP you'll still get a home-screen shortcut.

---

## Where your data is stored

When run from this repository (Docker or a static server), everything is saved in the **browser's local storage** on the device you use. Nothing is sent to a server.

| Key | Contents |
|---|---|
| `paycheck-planner-v1` | Your expenses and profile (income per month, currency, settings) |
| `paycheck-planner-lang` | Language choice (`ms` / `en`) |
| `paycheck-planner-theme` | Theme choice (`system` / `light` / `dark`) |

This means:

- Each device and each browser has **its own separate data**.
- **Clearing browser data erases your expenses.**
- Private or incognito windows don't keep data after they close.

When the page runs inside a Claude Artifact viewer, it saves to that viewer's per-user private storage instead. It uses the same data format, and the page picks the right storage automatically.

---

## Project structure

```
rancang-belanja/
├── src/
│   └── app.html              # The whole app: styles, translations, React components
├── public/                   # What nginx serves (generated + static assets)
│   ├── index.html            # Built from src/app.html by build.js
│   ├── manifest.webmanifest  # PWA manifest (name, colours, icons)
│   ├── icon.svg              # Vector app icon
│   ├── icon-192.png          # PNG icons for Android / iOS
│   └── icon-512.png
├── build.js                  # Wraps src/app.html into public/index.html with PWA meta tags
├── make-icons.js             # Draws the PNG icons (Node built-ins only, no dependencies)
├── Dockerfile                # nginx:alpine image serving public/
├── nginx.conf                # Static serving, gzip, manifest MIME type, no-cache
├── docker-compose.yml        # Container "paycheck-planner" on port 8088
└── README.md
```

---

## Development

There is **no npm install and no bundler**. React is loaded from a CDN, and the components are written with [htm](https://github.com/developit/htm) tagged templates instead of JSX, so the source runs directly in the browser.

Workflow:

```bash
# 1. Edit the app
#    src/app.html

# 2. Rebuild public/index.html
node build.js

# 3. Rebuild and restart the container
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
| Components | `Row`, `HomePage`, `ExpensesPage`, `ReportsPage`, `SettingsPage`, `Sheet` (add/edit form), `ThemeSwitch`, `LangSwitch`, `MonthNav` |
| `App` | State, storage (browser or Artifact store), demo mode, navigation, actions |

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
| Port | `docker-compose.yml`, `"8088:80"` |
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

---

## Tech stack

| Part | Technology |
|---|---|
| UI | React 18 (UMD from cdnjs) + htm |
| Styling | Hand-written CSS with custom properties; light and dark themes |
| Fonts | Bricolage Grotesque (headings), Figtree (body) from Google Fonts |
| Storage | Browser `localStorage` (or the Artifact per-user store when hosted there) |
| Server | nginx:alpine in Docker |
| PWA | Web app manifest + icons generated with Node |

> The page loads React, htm and the fonts from CDNs, so it needs an internet connection to open.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `port is already allocated` | Another app is using 8088. Change `"8088:80"` in `docker-compose.yml`, e.g. to `"8090:80"`. |
| Changes don't show up | Run `node build.js`, then `docker compose up -d --build`, then refresh (`Ctrl + F5`). |
| My data disappeared | Data is per browser and per device. Check that you're using the same browser and haven't cleared site data. |
| Phone can't open the app | Same Wi-Fi? Correct IP address? Allow port 8088 in Windows Firewall. |
| Blank page | The CDN scripts couldn't load. Check your internet connection. |
| I want to reset everything | Browser DevTools → Application → Local Storage → delete the `paycheck-planner-*` keys. |

---

## Roadmap ideas

- Export and import data (CSV / JSON) for backup and moving between devices
- Reminders before due dates
- Savings goals
- Offline support with a service worker
- Sync across devices with a small backend

---

Made in Malaysia 🇲🇾

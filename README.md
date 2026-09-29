<picture>
  <source media="(prefers-color-scheme: dark)" srcset="public/brand/lockup-on-dark.png" />
  <img alt="SPENANCE — Smart Finance | Better Future" src="public/brand/lockup-on-light.png" width="520" />
</picture>

# SPENANCE

**Personal Finance & Loan Management System** — a frontend-only fintech dashboard demo.

A polished, production-looking personal finance app that tracks expenses, manages
budgets, monitors loans, calculates EMIs, scores financial health and offers a
mock "AI" financial consultant.

> **College project demo.** Everything is fictional: no backend, no real
> authentication, no payments, no banking APIs and no AI service. Data is mock
> data persisted in the browser's `localStorage`. The login screen is a
> simulated gate — any valid email with a 6+ character password opens the demo.

---

## Quick start

```bash
npm install
npm run dev      # http://localhost:5179
```

Production build:

```bash
npm run build    # outputs dist/
npm run preview  # serves the built app
```

## Brand assets

Two source artworks live in `assets/brand/`: `spenance-logo-source.jpg` (flat-white JPEG,
carries the lockup with the wordmark and the *Smart Finance | Better Future* tagline) and
`spenance-app-icon-source.png` (transparent PNG, the glossy app-icon mark used for the
browser/iOS/PWA icons and the in-app logo). `scripts/build-brand-assets.py` derives every
asset the web app needs from them (requires `numpy` + `Pillow`):

```bash
python scripts/build-brand-assets.py
```

| Output                            | Used for                                               |
| --------------------------------- | ------------------------------------------------------ |
| `public/brand/mark-on-light.png`  | Logo mark on light surfaces (sidebar, header, footer)  |
| `public/brand/mark-on-dark.png`   | Logo mark for dark mode (neutral ink turned white)     |
| `public/brand/lockup-on-light.png`, `lockup-on-dark.png` | Full lockup (mark + wordmark + tagline) |
| `public/favicon.ico`, `favicon-dark.ico` | 16/32/48 tab icon, light + dark ink             |
| `public/favicon.png`, `favicon-dark.png` | 96px tab icon (HiDPI), light + dark ink         |
| `public/apple-touch-icon.png`     | 180px iOS home-screen icon                             |
| `public/icon-192.png`, `icon-512.png` | Web-app manifest icons (`purpose: any` + `maskable`) |
| `public/icon-monochrome.png`      | 512px alpha-only mask (`purpose: monochrome`)          |
| `public/og-image.jpg`             | 1200×630 social card used by the `og:` / `twitter:` tags |

The flat-white JPEG is converted to straight RGBA with a colour-to-alpha step, so
every asset composites exactly like the original over white while staying clean on
any other background. `src/components/ui/Logo.jsx` picks the correct variant, either
from the app's class-based dark mode (`tone="auto"`) or pinned for always-dark
panels such as the login hero (`tone="on-dark"`).

### Metadata

`index.html` carries the brand metadata: `SPENANCE — Smart Finance, Better Future`
as the title, an `application-name`, the icon set above plus `public/site.webmanifest`
(name, short name, standalone display, icons) and Open Graph / Twitter card tags
pointing at `og-image.jpg`. Every route also updates `document.title` (for example
`Dashboard · SPENANCE`, `Sign in · SPENANCE`).

### Light / dark chrome

The tab icon and the browser UI colour are declared twice, once per colour scheme:

```html
<link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48" media="(prefers-color-scheme: light)" data-favicon="light-ico" />
<link rel="icon" href="/favicon-dark.ico" sizes="16x16 32x32 48x48" media="(prefers-color-scheme: dark)" data-favicon="dark-ico" />
<link rel="icon" type="image/png" sizes="96x96" href="/favicon.png" media="(prefers-color-scheme: light)" data-favicon="light-png" />
<link rel="icon" type="image/png" sizes="96x96" href="/favicon-dark.png" media="(prefers-color-scheme: dark)" data-favicon="dark-png" />
<meta name="theme-color" media="(prefers-color-scheme: light)" content="#047857" />
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0b1220" />
```

The tab icons are the emblem itself, edge to edge on transparency — no tile or
padding — so the logo is still readable at 16px. Both schemes declare their own
`.ico` so a browser can never settle on the wrong artwork, and the 96px PNGs cover
HiDPI tabs.

On top of that, `src/utils/brandIcons.js` re-syncs both from the app's own theme
whenever it is toggled, so the tab icon darkens with the app even on a light OS.
The web app manifest has no per-scheme icon member, so dark-friendly install icons
are covered by the spec's themed hook: a 512px alpha-only mask declared with
`"purpose": "monochrome"` (browsers mask a solid fill with its alpha channel).

## Tech stack

| Layer      | Choice                                        |
| ---------- | --------------------------------------------- |
| UI         | React 18 (**JavaScript only**, no TypeScript) |
| Styling    | Tailwind CSS v4                               |
| Routing    | React Router v6                               |
| Charts     | Recharts                                      |
| Icons      | Lucide React                                  |
| State      | React context + hooks                         |
| Persistence| `localStorage` (`spenance.state.v1`) + session (`spenance.session.v1`) |

## Demo flow (presentation script)

0. **Login** — the app opens on the sign-in screen. Use the demo credentials shown on the page (`rahul.sharma@example.com` / `spenance123`) or click **Fill these details for me**; any valid email with a 6+ character password also works. "Remember me" decides whether the session survives a browser restart, and **Sign out** in the profile menu returns here.
1. **Dashboard** — greeting, Total Balance ₹52,450, Income vs Expenses chart, Financial Score 82/100.
2. **Expenses** — summary cards, daily/weekly spending trend, filter by category, search, full transaction table.
3. **Add Expense** (header button or page button) — modal with live budget-impact preview; the dashboard, budget and insights update instantly.
4. **Budget** — ₹35,000 envelope, 81.8% used, per-category progress with normal/warning/near-limit states, **Edit Budget** modal.
5. **Loans** — loan cards with **View Details** (amortisation schedule, **Pay EMI** and **Remove loan**), plus **+ Add Loan** to track another loan (EMI is auto-derived from amount, rate and tenure).
6. **EMI Calculator** — amount, rate and tenure sliders recalculate EMI, total interest, total payment, principal/interest split and the balance curve live. **Save as a loan** pushes the current calculator values straight into the loan tracker.
7. **Insights** — insight cards plus six analytics charts (spending trend, income vs expenses, savings growth, categories, score, debt overview).
8. **SPENANCE AI** — insight cards and a chat interface; ask *"How can I save more?"* for a predefined recommendation.

## Features

- Collapsible sidebar (desktop), icon rail (tablet), drawer + bottom navigation (mobile)
- Top header with page title, global transaction search (navigates to filtered Expenses), notification dropdown with mark-all-read, working theme toggle, profile dropdown
- Working light/dark theme, saved across reloads
- Add / delete expenses, edit budget limits, edit profile & monthly income (salary credit stays in sync)
- Add / remove loans, record an EMI payment (interest portion, outstanding balance and next due date all update), with totals mirrored across Loans, Insights and the AI context
- Toast notifications for every action, animated progress bars, charts, modals and page transitions
- Simulated login gate with validation, show/hide password, "Remember me" and a working sign-out
- Export demo data as JSON, reset demo data to the seeded dataset
- Responsive from 375px to 1440px+ with no horizontal overflow

## Project structure

```
src/
  App.jsx                     routes + auth gate (RequireAuth)
  context/AppContext.jsx      state, persistence, derived metrics, toasts, session
  data/mockData.js            fictional user, 25 transactions, budgets, loans, AI responses
  config/nav.js               sidebar / header / mobile nav config
  utils/format.js             ₹ INR, date and percentage formatting
  utils/finance.js            EMI math, budget status, financial score
  utils/auth.js               prototype session storage + credential validation
  utils/brandIcons.js         favicon + theme-colour sync for light/dark
  components/ui/Logo.jsx      brand mark / lockup artwork (light + dark)
  hooks/useClickOutside.js
  components/
    layout/                   Layout, Sidebar, Header, MobileNav
    ui/                       Button, Badge, Card, Modal, ProgressBar, ScoreRing, Switch, Toaster, EmptyState
    charts/                   ChartCard, ChartTooltip, Sparkline, chartTheme
    AddExpenseModal, EditBudgetModal, AddLoanModal, LoanDetailsModal
    AIChat, NotificationDropdown, ProfileDropdown
    StatCard, BudgetCard, LoanCard, InsightCard, CategoryIcon
    TransactionList, TransactionRow
  pages/                      Login, Dashboard, Expenses, Budget, Loans, Insights, AIConsultant, Settings, NotFound
```

## Demo data

Fictional user **Rahul Sharma**, September / October 2026, ₹ INR.

- Income ₹45,000 · Expenses ₹28,650 · Savings ₹16,350 (36.3%)
- Budget ₹35,000 (81.8% used) · Debt-to-income 24% · Financial score 82/100
- 24 seeded expense transactions plus the September salary credit
- Loans: Education Loan (₹4,25,000 outstanding, 8.5%, EMI ₹8,500) and Personal Loan (₹72,000 outstanding, 11.5%, EMI ₹4,200)
- Loans you add are stored in `localStorage` alongside the seeded ones and can be removed at any time

All names, merchants and amounts are invented for demonstration purposes.

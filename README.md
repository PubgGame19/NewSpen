# SPENANCE

**Personal Finance & Loan Management System** — a frontend-only fintech dashboard demo.

A polished, production-looking personal finance app that tracks expenses, manages
budgets, monitors loans, calculates EMIs, scores financial health and offers a
mock "AI" financial consultant.

> **College project demo.** Everything is fictional: no backend, no
> authentication, no payments, no banking APIs and no AI service. Data is mock
> data persisted in the browser's `localStorage`.

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

## Tech stack

| Layer      | Choice                                        |
| ---------- | --------------------------------------------- |
| UI         | React 18 (**JavaScript only**, no TypeScript) |
| Styling    | Tailwind CSS v4                               |
| Routing    | React Router v6                               |
| Charts     | Recharts                                      |
| Icons      | Lucide React                                  |
| State      | React context + hooks                         |
| Persistence| `localStorage` (`spenance.state.v1`)          |

## Demo flow (presentation script)

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
- Export demo data as JSON, reset demo data to the seeded dataset
- Responsive from 375px to 1440px+ with no horizontal overflow

## Project structure

```
src/
  App.jsx                     routes
  context/AppContext.jsx      state, persistence, derived metrics, toasts
  data/mockData.js            fictional user, 25 transactions, budgets, loans, AI responses
  config/nav.js               sidebar / header / mobile nav config
  utils/format.js             ₹ INR, date and percentage formatting
  utils/finance.js            EMI math, budget status, financial score
  hooks/useClickOutside.js
  components/
    layout/                   Layout, Sidebar, Header, MobileNav
    ui/                       Button, Badge, Card, Modal, ProgressBar, ScoreRing, Switch, Toaster, EmptyState
    charts/                   ChartCard, ChartTooltip, Sparkline, chartTheme
    AddExpenseModal, EditBudgetModal, AddLoanModal, LoanDetailsModal
    AIChat, NotificationDropdown, ProfileDropdown
    StatCard, BudgetCard, LoanCard, InsightCard, CategoryIcon
    TransactionList, TransactionRow
  pages/                      Dashboard, Expenses, Budget, Loans, Insights, AIConsultant, Settings, NotFound
```

## Demo data

Fictional user **Rahul Sharma**, September / October 2026, ₹ INR.

- Income ₹45,000 · Expenses ₹28,650 · Savings ₹16,350 (36.3%)
- Budget ₹35,000 (81.8% used) · Debt-to-income 24% · Financial score 82/100
- 24 seeded expense transactions plus the September salary credit
- Loans: Education Loan (₹4,25,000 outstanding, 8.5%, EMI ₹8,500) and Personal Loan (₹72,000 outstanding, 11.5%, EMI ₹4,200)
- Loans you add are stored in `localStorage` alongside the seeded ones and can be removed at any time

All names, merchants and amounts are invented for demonstration purposes.

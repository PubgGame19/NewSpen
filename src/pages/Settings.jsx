import { useEffect, useState } from 'react'
import {
  BellRing,
  Check,
  Database,
  Download,
  Mail,
  Moon,
  Palette,
  Phone,
  RotateCcw,
  Save,
  Sun,
  UserRound,
  Wallet,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { formatINR } from '../utils/format'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Card, { CardHeader } from '../components/ui/Card'
import Switch from '../components/ui/Switch'

const CURRENCIES = [
  { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
]

export default function Settings() {
  const {
    profile,
    updateProfile,
    setMonthlyIncome,
    theme,
    setTheme,
    resetDemoData,
    pushToast,
    transactions,
    budgets,
    score,
    savingsRate,
    session,
    isFirebaseConfigured,
  } = useApp()

  // Use actual logged-in user credentials if available
  const effectiveName =
    profile.name && profile.name !== 'User'
      ? profile.name
      : session?.name && session.name !== 'User'
        ? session.name
        : ''

  const effectiveEmail = profile.email || session?.email || ''

  const [draft, setDraft] = useState({
    name: effectiveName,
    email: effectiveEmail,
    phone: profile.phone || '',
    city: profile.city || '',
    monthlyIncome: profile.monthlyIncome || '',
    currency: profile.currency || 'INR',
  })
  const [saved, setSaved] = useState(false)

  /* Re-sync when profile or session changes */
  useEffect(() => {
    setDraft({
      name:
        profile.name && profile.name !== 'User'
          ? profile.name
          : session?.name && session.name !== 'User'
            ? session.name
            : '',
      email: profile.email || session?.email || '',
      phone: profile.phone || '',
      city: profile.city || '',
      monthlyIncome: profile.monthlyIncome || '',
      currency: profile.currency || 'INR',
    })
  }, [
    profile.name,
    profile.email,
    profile.phone,
    profile.city,
    profile.monthlyIncome,
    profile.currency,
    session?.name,
    session?.email,
  ])

  const notifications = profile.notifications || {
    budgetAlerts: true,
    loanReminders: true,
    monthlyReports: false,
  }

  const initials = (draft.name || session?.name || 'U')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U'

  const nameChanged =
    draft.name !== (profile.name || '') ||
    draft.email !== (profile.email || '') ||
    draft.phone !== (profile.phone || '') ||
    draft.city !== (profile.city || '') ||
    Number(draft.monthlyIncome) !== Number(profile.monthlyIncome || 0) ||
    draft.currency !== (profile.currency || 'INR')

  const saveProfile = () => {
    const nextIncome = Math.max(0, Number(draft.monthlyIncome) || 0)
    const incomeChanged = nextIncome !== Number(profile.monthlyIncome)

    updateProfile({
      ...draft,
      monthlyIncome: nextIncome,
      initials: initials || profile.initials,
      firstName: draft.name.split(' ')[0] || profile.firstName,
    })
    // Keep the salary credit in sync so every metric follows the new income
    if (incomeChanged) setMonthlyIncome(nextIncome)

    setSaved(true)
    window.setTimeout(() => setSaved(false), 2000)
    pushToast({
      title: 'Settings saved',
      body: incomeChanged
        ? `Profile updated · monthly income set to ${formatINR(nextIncome)}.`
        : 'Profile, income and currency preferences updated.',
      tone: 'emerald',
    })
  }

  const toggleNotification = (key) =>
    updateProfile({
      notifications: { ...notifications, [key]: !notifications[key] },
    })

  const exportData = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      user: draft.name || profile.name || 'User',
      transactions,
      budgets,
      summary: { savingsRate: Number(savingsRate.toFixed(1)), score: score.total },
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'spenance-financial-data.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    pushToast({
      title: 'Export ready',
      body: 'spenance-financial-data.json downloaded with your account data.',
      tone: 'emerald',
    })
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="heading text-xl font-bold tracking-tight sm:text-2xl">
            Settings
          </h2>
          <p className="muted mt-1 text-[13px] sm:text-sm">
            Manage your personal profile, monthly income, notifications, and storage.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="emerald">
            {session?.isFirebaseUser ? 'Firebase Cloud Account' : 'Active Account'}
          </Badge>
          <Button
            icon={saved ? Check : Save}
            onClick={saveProfile}
            disabled={!nameChanged}
          >
            {saved ? 'Saved' : 'Save changes'}
          </Button>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* ----------------------------------------------------- profile */}
        <Card className="card-pad animate-rise xl:col-span-2">
          <CardHeader
            eyebrow="Profile"
            title="Personal details"
            subtitle="Used across SPENANCE — your dashboard greeting and reports update automatically."
            action={<UserRound size={18} className="text-slate-400" />}
          />

          <div className="mt-5 flex items-center gap-4">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-lg font-bold text-white shadow-sm">
              {initials}
            </span>
            <div>
              <p className="heading text-[15px] font-semibold">
                {draft.name || session?.name || 'Personal Account'}
              </p>
              <p className="muted text-[12px]">
                {session?.isFirebaseUser ? 'Firebase Cloud Account' : 'Personal Account'} · Member since{' '}
                {session?.signedInAt
                  ? new Date(session.signedInAt).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric',
                    })
                  : new Date().toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric',
                    })}
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="eyebrow mb-1.5 block" htmlFor="set-name">
                Full name
              </label>
              <input
                id="set-name"
                className="input"
                placeholder="e.g. Alex Morgan"
                value={draft.name}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, name: event.target.value }))
                }
              />
            </div>

            <div>
              <label className="eyebrow mb-1.5 block" htmlFor="set-email">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="set-email"
                  type="email"
                  className="input pr-10"
                  placeholder="e.g. alex@example.com"
                  value={draft.email}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, email: event.target.value }))
                  }
                />
              </div>
            </div>

            <div>
              <label className="eyebrow mb-1.5 block" htmlFor="set-phone">
                Phone number
              </label>
              <div className="relative">
                <Phone
                  size={15}
                  className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="set-phone"
                  className="input pr-10"
                  placeholder="e.g. +91 98765 43210"
                  value={draft.phone}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, phone: event.target.value }))
                  }
                />
              </div>
            </div>

            <div>
              <label className="eyebrow mb-1.5 block" htmlFor="set-city">
                City / Location
              </label>
              <input
                id="set-city"
                className="input"
                placeholder="e.g. Mumbai, India"
                value={draft.city}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, city: event.target.value }))
                }
              />
            </div>
          </div>
        </Card>

        {/* ------------------------------------------------- preferences */}
        <Card className="card-pad animate-rise">
          <CardHeader
            eyebrow="Money"
            title="Income & currency"
            action={<Wallet size={18} className="text-slate-400" />}
          />

          <div className="mt-5 space-y-5">
            <div>
              <label className="eyebrow mb-1.5 block" htmlFor="set-income">
                Monthly income
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                  ₹
                </span>
                <input
                  id="set-income"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="e.g. 50000"
                  className="input tabular pl-8"
                  value={draft.monthlyIncome}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      monthlyIncome: event.target.value,
                    }))
                  }
                />
              </div>
              <p className="muted mt-1.5 text-[11px]">
                Currently {formatINR(profile.monthlyIncome || 0)} · savings rate{' '}
                {savingsRate.toFixed(1)}%
              </p>
            </div>

            <div>
              <label className="eyebrow mb-1.5 block" htmlFor="set-currency">
                Currency
              </label>
              <select
                id="set-currency"
                className="input"
                value={draft.currency}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, currency: event.target.value }))
                }
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.code} — {currency.label}
                  </option>
                ))}
              </select>
              <p className="muted mt-1.5 text-[11px]">
                Amounts are formatted with Indian digit grouping (₹1,23,456).
              </p>
            </div>
          </div>
        </Card>

        {/* ------------------------------------------------ notifications */}
        <Card className="card-pad animate-rise">
          <CardHeader
            eyebrow="Notifications"
            title="Alert preferences"
            subtitle="Controls what appears in your alerts dropdown."
            action={<BellRing size={18} className="text-slate-400" />}
          />

          <ul className="mt-5 space-y-4">
            {[
              {
                key: 'budgetAlerts',
                title: 'Budget alerts',
                body: 'Warn me when a category crosses 85% of its limit.',
              },
              {
                key: 'loanReminders',
                title: 'Loan reminders',
                body: 'Remind me 3 days before each EMI auto-debit.',
              },
              {
                key: 'monthlyReports',
                title: 'Monthly reports',
                body: 'Email a summary on the 1st of every month.',
              },
            ].map((item) => (
              <li
                key={item.key}
                className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 p-3.5 dark:border-slate-800"
              >
                <div>
                  <p className="heading text-[13px] font-semibold">
                    {item.title}
                  </p>
                  <p className="muted mt-0.5 text-[11px] leading-snug">
                    {item.body}
                  </p>
                </div>
                <Switch
                  id={`notify-${item.key}`}
                  label={item.title}
                  checked={Boolean(notifications[item.key])}
                  onChange={() => toggleNotification(item.key)}
                />
              </li>
            ))}
          </ul>
        </Card>

        {/* -------------------------------------------------------- theme */}
        <Card className="card-pad animate-rise xl:col-span-2">
          <CardHeader
            eyebrow="Appearance"
            title="Theme"
            subtitle="Switches the entire interface instantly."
            action={<Palette size={18} className="text-slate-400" />}
          />

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              {
                key: 'light',
                label: 'Light',
                icon: Sun,
                body: 'Crisp white surfaces with slate text.',
                preview: 'from-white to-slate-100',
              },
              {
                key: 'dark',
                label: 'Dark',
                icon: Moon,
                body: 'Low-light navy with emerald accents.',
                preview: 'from-slate-800 to-slate-950',
              },
            ].map((option) => {
              const active = theme === option.key
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => {
                    setTheme(option.key)
                    pushToast({
                      title: `${option.label} theme enabled`,
                      body: 'Preference saved to localStorage.',
                      tone: 'sky',
                    })
                  }}
                  className={`rounded-2xl border p-4 text-left transition-all duration-200 ${
                    active
                      ? 'border-emerald-500 ring-4 ring-emerald-500/10'
                      : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2">
                      <option.icon size={16} className="text-slate-500" />
                      <span className="heading text-[13px] font-semibold">
                        {option.label}
                      </span>
                    </span>
                    {active ? (
                      <Badge tone="emerald" icon={Check}>
                        Active
                      </Badge>
                    ) : null}
                  </div>
                  <div
                    className={`mt-3 h-16 rounded-xl bg-gradient-to-br ${option.preview} border border-slate-200/70 dark:border-slate-700`}
                  />
                  <p className="muted mt-3 text-[11px]">{option.body}</p>
                </button>
              )
            })}
          </div>
        </Card>

        {/* --------------------------------------------------------- data */}
        <Card className="card-pad animate-rise xl:col-span-3">
          <CardHeader
            eyebrow={isFirebaseConfigured && session?.isFirebaseUser ? 'Cloud Sync' : 'Local Storage'}
            title="Database & Storage"
            subtitle={
              isFirebaseConfigured && session?.isFirebaseUser
                ? 'Your data is synchronized in real-time with Google Cloud Firestore.'
                : 'Running in local browser storage mode. Add Firebase credentials to enable Cloud database.'
            }
            action={<Database size={18} className="text-slate-400" />}
          />

          <dl className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-[12px]">
            <div className="rounded-xl border border-slate-200 p-3.5 dark:border-slate-800">
              <dt className="muted font-medium">Backend status</dt>
              <dd className="tabular heading font-semibold mt-1">
                <span className={`inline-flex items-center gap-1.5 ${isFirebaseConfigured ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  <span className={`h-2 w-2 rounded-full ${isFirebaseConfigured ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  {isFirebaseConfigured ? 'Cloud Firestore' : 'Local Storage'}
                </span>
              </dd>
            </div>
            <div className="rounded-xl border border-slate-200 p-3.5 dark:border-slate-800">
              <dt className="muted font-medium">Recorded Transactions</dt>
              <dd className="tabular heading font-semibold mt-1 text-base">
                {transactions.length}
              </dd>
            </div>
            <div className="rounded-xl border border-slate-200 p-3.5 dark:border-slate-800">
              <dt className="muted font-medium">Budget Envelopes</dt>
              <dd className="tabular heading font-semibold mt-1 text-base">
                {Object.keys(budgets).length} categories
              </dd>
            </div>
            <div className="rounded-xl border border-slate-200 p-3.5 dark:border-slate-800">
              <dt className="muted font-medium">Financial Health Score</dt>
              <dd className="tabular heading font-semibold mt-1 text-base">
                {score.total}/100
              </dd>
            </div>
          </dl>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button variant="outline" icon={Download} onClick={exportData}>
              Export my data (JSON)
            </Button>
            <Button
              variant="ghost"
              icon={RotateCcw}
              onClick={async () => {
                if (window.confirm('Reset all financial data, budgets, and transactions to zero?')) {
                  await resetDemoData()
                  pushToast({
                    title: 'Account reset to zero',
                    body: 'All transactions, loans, and budgets have been cleared.',
                    tone: 'emerald',
                  })
                }
              }}
              className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 cursor-pointer"
            >
              Reset all data to zero
            </Button>
          </div>

          <p className="muted mt-4 text-[11px] leading-snug">
            {isFirebaseConfigured
              ? 'Changes update instantly in Cloud Firestore and sync across all logged-in devices.'
              : 'Add your Firebase configuration to .env to turn this into a live multi-user Cloud database!'}
          </p>
        </Card>
      </div>
    </div>
  )
}

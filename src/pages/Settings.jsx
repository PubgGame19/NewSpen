import { useEffect, useState } from 'react'
import {
  BellRing,
  Check,
  Database,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  Moon,
  Palette,
  Phone,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
  Sun,
  UserRound,
  Wallet,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { formatINR } from '../utils/format'
import {
  getGeminiApiKey,
  setGeminiApiKey,
  isGeminiConfigured,
  testGeminiApiKey,
} from '../services/geminiService'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Card, { CardHeader } from '../components/ui/Card'
import Modal from '../components/ui/Modal'
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

  const [draft, setDraft] = useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    city: profile.city,
    monthlyIncome: profile.monthlyIncome,
    currency: profile.currency,
  })
  const [resetOpen, setResetOpen] = useState(false)
  const [saved, setSaved] = useState(false)

  /* Gemini AI state */
  const [geminiKeyInput, setGeminiKeyInput] = useState(() => getGeminiApiKey())
  const [showGeminiKey, setShowGeminiKey] = useState(false)
  const [geminiTesting, setGeminiTesting] = useState(false)
  const [isGeminiActive, setIsGeminiActive] = useState(() => isGeminiConfigured())

  /* Re-sync only when the saved profile fields change (not when an unrelated
     preference such as a notification toggle is updated), so unsaved edits
     are never discarded. */
  const {
    name: savedName,
    email: savedEmail,
    phone: savedPhone,
    city: savedCity,
    monthlyIncome: savedIncome,
    currency: savedCurrency,
  } = profile

  useEffect(() => {
    setDraft({
      name: savedName,
      email: savedEmail,
      phone: savedPhone,
      city: savedCity,
      monthlyIncome: savedIncome,
      currency: savedCurrency,
    })
  }, [
    savedName,
    savedEmail,
    savedPhone,
    savedCity,
    savedIncome,
    savedCurrency,
  ])

  const notifications = profile.notifications || {
    budgetAlerts: true,
    loanReminders: true,
    monthlyReports: false,
  }

  const initials = draft.name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const nameChanged =
    draft.name !== profile.name ||
    draft.email !== profile.email ||
    draft.phone !== profile.phone ||
    draft.city !== profile.city ||
    Number(draft.monthlyIncome) !== Number(profile.monthlyIncome) ||
    draft.currency !== profile.currency

  const saveProfile = () => {
    const nextIncome = Math.max(1, Number(draft.monthlyIncome) || 0)
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
        ? `Profile updated · salary credit synced to ${formatINR(nextIncome)}.`
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
      user: profile.name,
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

  const handleSaveGeminiKey = async () => {
    const trimmed = geminiKeyInput.trim()
    if (!trimmed) {
      setGeminiApiKey('')
      setIsGeminiActive(false)
      pushToast({
        title: 'Gemini Key Removed',
        body: 'SPENANCE AI will use the built-in offline financial model.',
        tone: 'amber',
      })
      return
    }

    setGeminiTesting(true)
    const result = await testGeminiApiKey(trimmed)
    setGeminiTesting(false)

    if (result.success) {
      setGeminiApiKey(trimmed)
      setIsGeminiActive(true)
      pushToast({
        title: 'Google Gemini Pro Connected! ⚡',
        body: 'Real-time AI reasoning enabled across all your financial accounts and loans.',
        tone: 'emerald',
      })
    } else {
      pushToast({
        title: 'Gemini Key Verification Failed',
        body: result.error || 'Please check that your API key is valid.',
        tone: 'rose',
      })
    }
  }

  const handleClearGeminiKey = () => {
    setGeminiApiKey('')
    setGeminiKeyInput('')
    setIsGeminiActive(false)
    pushToast({
      title: 'API Key Cleared',
      body: 'Switched to built-in offline financial rules.',
      tone: 'slate',
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
            Manage your profile, preferences and account settings.
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
            subtitle="Used across the whole app — the dashboard greeting updates too."
            action={<UserRound size={18} className="text-slate-400" />}
          />

          <div className="mt-5 flex items-center gap-4">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-lg font-bold text-white">
              {initials || profile.initials}
            </span>
            <div>
              <p className="heading text-[15px] font-semibold">{draft.name}</p>
              <p className="muted text-[12px]">
                {profile.accountType} · Member since {profile.memberSince}
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
                  value={draft.email}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, email: event.target.value }))
                  }
                />
              </div>
            </div>

            <div>
              <label className="eyebrow mb-1.5 block" htmlFor="set-phone">
                Phone
              </label>
              <div className="relative">
                <Phone
                  size={15}
                  className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="set-phone"
                  className="input pr-10"
                  value={draft.phone}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, phone: event.target.value }))
                  }
                />
              </div>
            </div>

            <div>
              <label className="eyebrow mb-1.5 block" htmlFor="set-city">
                Location
              </label>
              <input
                id="set-city"
                className="input"
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
                Currently {formatINR(profile.monthlyIncome)} · savings rate{' '}
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
        <Card className="card-pad animate-rise">
          <CardHeader
            eyebrow={isFirebaseConfigured && session?.isFirebaseUser ? 'Cloud Sync' : 'Local Storage'}
            title="Database & Storage"
            subtitle={
              isFirebaseConfigured && session?.isFirebaseUser
                ? 'Your data is synchronized in real-time with Google Cloud Firestore.'
                : 'Running in local browser storage mode. Add Firebase keys in .env to enable Cloud DB.'
            }
            action={<Database size={18} className="text-slate-400" />}
          />

          <dl className="mt-5 space-y-2 text-[12px]">
            <div className="flex items-center justify-between">
              <dt className="muted font-medium">Backend status</dt>
              <dd className="tabular heading font-semibold">
                <span className={`inline-flex items-center gap-1.5 ${isFirebaseConfigured ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  <span className={`h-2 w-2 rounded-full ${isFirebaseConfigured ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  {isFirebaseConfigured ? 'Cloud Firestore Active' : 'Local Storage'}
                </span>
              </dd>
            </div>
            {session?.isFirebaseUser ? (
              <div className="flex items-center justify-between">
                <dt className="muted font-medium">Synced account</dt>
                <dd className="tabular heading font-semibold truncate max-w-[150px]">
                  {session.email}
                </dd>
              </div>
            ) : null}
            <div className="flex items-center justify-between">
              <dt className="muted font-medium">Transactions</dt>
              <dd className="tabular heading font-semibold">
                {transactions.length}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="muted font-medium">Budget categories</dt>
              <dd className="tabular heading font-semibold">
                {Object.keys(budgets).length}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="muted font-medium">Financial score</dt>
              <dd className="tabular heading font-semibold">{score.total}/100</dd>
            </div>
          </dl>

          <div className="mt-5 flex flex-col gap-2">
            <Button variant="outline" icon={Download} onClick={exportData} className="w-full">
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
              className="w-full text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 cursor-pointer"
            >
              Reset all data to zero
            </Button>
          </div>

          <p className="muted mt-4 text-[11px] leading-snug">
            {isFirebaseConfigured
              ? 'Changes update instantly in Cloud Firestore and sync across all devices.'
              : 'Add your Firebase configuration to .env to turn this into a live multi-user Cloud database!'}
          </p>
        </Card>

        {/* ----------------------------------------------------- Gemini AI */}
        <Card className="card-pad animate-rise xl:col-span-2">
          <CardHeader
            eyebrow="Artificial Intelligence"
            title="Google Gemini AI Engine"
            subtitle="Connects Gemini 1.5 Pro to conduct live, real-time portfolio audits and financial coaching."
            action={<Sparkles size={18} className="text-emerald-500" />}
          />

          <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <div>
                <label className="eyebrow mb-1.5 block" htmlFor="gemini-key">
                  Gemini API Key
                </label>
                <div className="relative flex items-center">
                  <span className="pointer-events-none absolute left-3 text-slate-400">
                    <KeyRound size={16} />
                  </span>
                  <input
                    id="gemini-key"
                    type={showGeminiKey ? 'text' : 'password'}
                    placeholder="AIzaSy..."
                    value={geminiKeyInput}
                    onChange={(e) => setGeminiKeyInput(e.target.value)}
                    className="input pl-9 pr-10 font-mono text-[13px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGeminiKey((prev) => !prev)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title={showGeminiKey ? 'Hide key' : 'Show key'}
                  >
                    {showGeminiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="muted mt-2 text-[11px]">
                  Keys are stored locally in your browser. Get your free key from{' '}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-emerald-600 hover:underline dark:text-emerald-400 inline-flex items-center gap-0.5"
                  >
                    Google AI Studio <ExternalLink size={10} />
                  </a>
                  .
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="primary"
                  icon={Save}
                  onClick={handleSaveGeminiKey}
                  disabled={geminiTesting}
                >
                  {geminiTesting ? 'Verifying Key...' : 'Test & Save Key'}
                </Button>
                {isGeminiActive ? (
                  <Button
                    variant="ghost"
                    onClick={handleClearGeminiKey}
                    className="text-slate-500 hover:text-rose-600"
                  >
                    Remove Key
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/40 space-y-3">
              <p className="heading text-[12px] font-semibold uppercase tracking-wider text-slate-500">
                AI Engine Status
              </p>
              <div className="flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    isGeminiActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                <span className="heading text-[13px] font-bold">
                  {isGeminiActive ? 'Gemini 1.5 Pro Connected' : 'Offline Rule Engine'}
                </span>
              </div>
              <p className="muted text-[11px] leading-relaxed">
                {isGeminiActive
                  ? 'Your AI Consultant analyzes live transaction streams, debt-to-income, and savings trajectory with Google Gemini Pro.'
                  : 'Without an API key, the assistant falls back to built-in financial heuristics. Add a free Gemini key above to unlock full generative AI.'}
              </p>
              <div className="pt-1 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="muted">Primary Model</span>
                  <span className="heading font-mono font-medium">gemini-1.5-pro</span>
                </div>
                <div className="flex items-center justify-between text-[11px] mt-1">
                  <span className="muted">Fallback Model</span>
                  <span className="heading font-mono font-medium">gemini-1.5-flash</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  Banknote,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Moon,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import Button from '../components/ui/Button'
import Logo from '../components/ui/Logo'
import Toaster from '../components/ui/Toaster'
import {
  DEMO_CREDENTIALS,
  MIN_PASSWORD_LENGTH,
  buildSession,
  validateCredentials,
} from '../utils/auth'

const HIGHLIGHTS = [
  {
    icon: TrendingUp,
    title: 'Track every rupee',
    body: 'Category-wise expenses, budgets and monthly trends in one dashboard.',
  },
  {
    icon: Banknote,
    title: 'Loan & EMI clarity',
    body: 'Outstanding balances, interest rates and upcoming auto-debits at a glance.',
  },
  {
    icon: Sparkles,
    title: 'AI-style guidance',
    body: 'Savings suggestions built from the seeded September 2026 dataset.',
  },
]

const SNAPSHOT = [
  { icon: Wallet, label: 'Monthly income', value: '₹45,000' },
  { icon: PiggyBank, label: 'Savings rate', value: '36.3%' },
  { icon: Target, label: 'Health score', value: '82 / 100' },
]

export default function Login() {
  const { session, signIn, pushToast, theme, toggleTheme, justSignedOut } = useApp()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from
  const redirectTo = from ? `${from.pathname}${from.search || ''}` : '/'
  const signedOut = Boolean(justSignedOut) || Boolean(location.state?.signedOut)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    document.title = 'Sign in · SPENANCE'
  }, [])

  /* Already signed in (or just signed in) — go where they were headed. */
  if (session) return <Navigate to={redirectTo} replace />

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = validateCredentials({ email, password })
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setSubmitting(true)
    window.setTimeout(() => {
      const nextSession = buildSession(email)
      signIn(nextSession, remember)
      pushToast({
        title: `Welcome back, ${nextSession.name}`,
        body: 'Signed in to the SPENANCE demo workspace.',
        tone: 'emerald',
      })
      setSubmitting(false)
      navigate(redirectTo, { replace: true })
    }, 650)
  }

  const useDemoDetails = () => {
    setEmail(DEMO_CREDENTIALS.email)
    setPassword(DEMO_CREDENTIALS.password)
    setErrors({})
  }

  return (
    <div className="grain min-h-screen-safe relative w-full bg-slate-50 dark:bg-ink-950">
      <div className="min-h-screen-safe grid w-full items-stretch lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        {/* ------------------------- brand / hero panel ------------------------ */}
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-14 xl:py-12 2xl:px-20 [@media(max-height:760px)]:py-6">
          <div
            className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_45%),radial-gradient(circle_at_85%_75%,rgba(56,189,248,0.35),transparent_45%)]"
            aria-hidden="true"
          />

          <div className="relative mx-auto w-full max-w-[40rem]">
            <Logo
              variant="lockup"
              tone="on-dark"
              className="h-20 sm:h-24 xl:h-28"
            />

            <h1 className="mt-8 max-w-md text-3xl font-bold leading-tight xl:text-4xl">
              Know exactly where your money goes.
            </h1>
            <p className="mt-3 max-w-md text-[14px] leading-relaxed text-emerald-50/90">
              A college-project prototype of a personal finance dashboard —
              expenses, budgets, loans and savings insights for the fictional
              user Rahul Sharma.
            </p>

            <ul className="mt-7 space-y-3.5">
              {HIGHLIGHTS.map(({ icon: Icon, title, body }) => (
                <li key={title} className="flex gap-3.5">
                  <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/15 ring-1 ring-inset ring-white/20">
                    <Icon size={17} strokeWidth={2.2} />
                  </span>
                  <div>
                    <p className="text-[13.5px] font-semibold">{title}</p>
                    <p className="text-[12.5px] leading-snug text-emerald-50/80">
                      {body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mx-auto mt-8 w-full max-w-[40rem] [@media(max-height:740px)]:hidden">
            <div className="grid grid-cols-3 gap-3">
              {SNAPSHOT.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="rounded-2xl bg-white/10 p-3.5 ring-1 ring-inset ring-white/20 backdrop-blur"
                >
                  <Icon size={15} className="text-emerald-100" />
                  <p className="tabular mt-2 text-[15px] font-bold">{value}</p>
                  <p className="text-[10.5px] font-medium uppercase tracking-wider text-emerald-100/80">
                    {label}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-[11px] font-medium text-emerald-100/70">
              Demo prototype · fictional data · September 2026
            </p>
          </div>
        </section>

        {/* ------------------------------ login form --------------------------- */}
        <section className="flex min-w-0 flex-col px-5 py-6 sm:px-8 sm:py-8 lg:px-10 2xl:px-16">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 lg:invisible">
              <Logo className="h-9 w-9" />
              <span className="heading text-[15px] font-bold tracking-[0.16em]">
                SPENANCE
              </span>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              className="icon-btn"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          {/* On short browser windows the helper copy is dropped so the form still fits 100% */}
          <div className="flex flex-1 items-center justify-center py-4 [@media(max-height:760px)]:py-2">
            <div className="animate-rise w-full max-w-[26.5rem]">
              <p className="eyebrow">Welcome back</p>
              <h2 className="heading mt-2 text-2xl font-bold sm:text-[27px]">
                Sign in to your account
              </h2>
              <p className="muted mt-2 text-[13.5px] leading-relaxed">
                This is a front-end prototype — no real credentials are stored
                or sent anywhere.
              </p>

              {signedOut ? (
                <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-sky-200 bg-sky-50 px-3.5 py-3 text-[12.5px] font-medium text-sky-800 dark:border-sky-500/25 dark:bg-sky-500/10 dark:text-sky-200">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                  <span>
                    You have been signed out. Your demo data is still saved in
                    this browser.
                  </span>
                </div>
              ) : null}

              <form className="mt-4 space-y-4" onSubmit={handleSubmit} noValidate>
                {/* email */}
                <div>
                  <label
                    htmlFor="login-email"
                    className="heading mb-1.5 block text-[13px] font-semibold"
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      id="login-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      autoFocus
                      placeholder="you@example.com"
                      value={email}
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? 'login-email-error' : undefined}
                      onChange={(event) => {
                        setEmail(event.target.value)
                        if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
                      }}
                      className={`input pl-10 ${
                        errors.email
                          ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10 dark:border-rose-500/50'
                          : ''
                      }`}
                    />
                  </div>
                  {errors.email ? (
                    <p
                      id="login-email-error"
                      className="mt-1.5 flex items-center gap-1.5 text-[12px] font-medium text-rose-600 dark:text-rose-300"
                    >
                      <AlertCircle size={13} className="shrink-0" />
                      {errors.email}
                    </p>
                  ) : null}
                </div>

                {/* password */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label
                      htmlFor="login-password"
                      className="heading text-[13px] font-semibold"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        pushToast({
                          title: 'Password reset',
                          body: 'The demo has no mail service — use the demo credentials below, or any email with a 6+ character password.',
                          tone: 'sky',
                        })
                      }
                      className="text-[12px] font-semibold text-emerald-700 transition hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock
                      size={16}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      id="login-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      aria-invalid={Boolean(errors.password)}
                      aria-describedby={
                        errors.password ? 'login-password-error' : undefined
                      }
                      onChange={(event) => {
                        setPassword(event.target.value)
                        if (errors.password) {
                          setErrors((prev) => ({ ...prev, password: undefined }))
                        }
                      }}
                      className={`input pl-10 pr-11 ${
                        errors.password
                          ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10 dark:border-rose-500/50'
                          : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password ? (
                    <p
                      id="login-password-error"
                      className="mt-1.5 flex items-center gap-1.5 text-[12px] font-medium text-rose-600 dark:text-rose-300"
                    >
                      <AlertCircle size={13} className="shrink-0" />
                      {errors.password}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="flex cursor-pointer items-center gap-2.5 text-[13px] font-medium text-slate-600 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(event) => setRemember(event.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 accent-emerald-600 focus:ring-emerald-500/25 dark:border-slate-600 dark:bg-slate-900"
                    />
                    Remember me on this device
                  </label>
                  <span className="text-[11.5px] font-medium text-slate-400 dark:text-slate-500">
                    {MIN_PASSWORD_LENGTH}+ characters
                  </span>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <ArrowRight size={16} strokeWidth={2.2} />
                  )}
                  {submitting ? 'Signing in…' : 'Sign in'}
                </Button>
              </form>

              {/* demo credentials */}
              <div className="mt-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-3.5 dark:border-emerald-500/25 dark:bg-emerald-500/10">
                <div className="flex items-center gap-2">
                  <ShieldCheck
                    size={16}
                    className="text-emerald-700 dark:text-emerald-300"
                  />
                  <p className="heading text-[13px] font-semibold">
                    Demo credentials
                  </p>
                </div>
                <dl className="mt-2.5 space-y-1 text-[12.5px]">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="muted font-medium">Email</dt>
                    <dd className="tabular heading truncate font-semibold">
                      {DEMO_CREDENTIALS.email}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="muted font-medium">Password</dt>
                    <dd className="tabular heading font-semibold">
                      {DEMO_CREDENTIALS.password}
                    </dd>
                  </div>
                </dl>
                <button
                  type="button"
                  onClick={useDemoDetails}
                  className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-emerald-700 transition hover:text-emerald-900 dark:text-emerald-300 dark:hover:text-emerald-100"
                >
                  <KeyRound size={14} />
                  Fill these details for me
                </button>
              </div>

              <p className="muted mt-3 text-center text-[11.5px] leading-relaxed [@media(max-height:760px)]:hidden">
                Any email with a {MIN_PASSWORD_LENGTH}+ character password works
                — sign-in is simulated and the demo data always loads.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            <Logo className="h-5 w-5" alt="" />
            <p className="muted text-center text-[11px] font-medium">
              SPENANCE · College project prototype · No real accounts, payments
              or AI services are connected.
            </p>
          </div>
        </section>
      </div>

      <Toaster />
    </div>
  )
}

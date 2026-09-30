import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Database,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Moon,
  Shield,
  Sparkles,
  Sun,
  TrendingUp,
  User,
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
import { isFirebaseConfigured } from '../config/firebase'
import {
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  sendResetPassword,
} from '../services/firebaseService'

export default function Login() {
  const { session, signIn, pushToast, theme, toggleTheme, justSignedOut } = useApp()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from
  const redirectTo = from ? `${from.pathname}${from.search || ''}` : '/'
  const signedOut = Boolean(justSignedOut) || Boolean(location.state?.signedOut)

  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [googleSubmitting, setGoogleSubmitting] = useState(false)

  useEffect(() => {
    document.title =
      mode === 'signup' ? 'Create Account · SPENANCE' : 'Sign In · SPENANCE'
  }, [mode])

  /* Already signed in — redirect */
  if (session) return <Navigate to={redirectTo} replace />

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = validateCredentials({ email, password })
    if (mode === 'signup' && !name.trim()) {
      nextErrors.name = 'Please enter your full name.'
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setSubmitting(true)

    if (isFirebaseConfigured) {
      try {
        if (mode === 'signup') {
          await registerWithEmail(email, password, name.trim())
          pushToast({
            title: `Welcome, ${name || 'User'}!`,
            body: 'Account created and synced with Cloud Firestore.',
            tone: 'emerald',
          })
        } else {
          await loginWithEmail(email, password)
          pushToast({
            title: 'Welcome back!',
            body: 'Signed in with Firebase Authentication.',
            tone: 'emerald',
          })
        }
        navigate(redirectTo, { replace: true })
      } catch (err) {
        console.error('Firebase Auth error:', err)
        let message = 'Failed to authenticate.'
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          message = 'Invalid email or password. Please verify your credentials.'
        } else if (err.code === 'auth/wrong-password') {
          message = 'Incorrect password.'
        } else if (err.code === 'auth/email-already-in-use') {
          message = 'An account with this email already exists. Try signing in.'
        } else if (err.code === 'auth/weak-password') {
          message = 'Password must be at least 6 characters.'
        } else if (err.message) {
          message = err.message
        }
        setErrors((prev) => ({ ...prev, form: message }))
      } finally {
        setSubmitting(false)
      }
    } else {
      window.setTimeout(() => {
        const nextSession = buildSession(email)
        if (mode === 'signup' && name.trim()) {
          nextSession.name = name.trim()
          nextSession.initials = name.trim().slice(0, 2).toUpperCase()
        }
        signIn(nextSession, remember)
        pushToast({
          title: `Welcome, ${nextSession.name}`,
          body: 'Signed in locally to SPENANCE workspace.',
          tone: 'emerald',
        })
        setSubmitting(false)
        navigate(redirectTo, { replace: true })
      }, 500)
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleSubmitting(true)
    if (!isFirebaseConfigured) {
      window.setTimeout(() => {
        const googleSession = {
          email: 'alex.morgan@gmail.com',
          name: 'Alex Morgan',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          initials: 'AM',
          provider: 'google-demo',
          token: 'demo-google-token-' + Date.now(),
        }
        signIn(googleSession, remember)
        pushToast({
          title: 'Signed in with Google (Demo)',
          body: 'Add Firebase credentials in Vercel to activate live Google Cloud OAuth.',
          tone: 'emerald',
        })
        setGoogleSubmitting(false)
        navigate(redirectTo, { replace: true })
      }, 600)
      return
    }

    try {
      await loginWithGoogle()
      pushToast({
        title: 'Google Sign-In successful',
        body: 'Synced your data with Firebase Firestore.',
        tone: 'emerald',
      })
      navigate(redirectTo, { replace: true })
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        console.error('Google sign in error:', err)
        setErrors((prev) => ({ ...prev, form: err.message || 'Google sign-in failed.' }))
      }
    } finally {
      setGoogleSubmitting(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setErrors((prev) => ({ ...prev, email: 'Enter your email address first.' }))
      return
    }
    if (!isFirebaseConfigured) {
      pushToast({
        title: 'Configure Firebase',
        body: 'Please configure your Firebase credentials to enable password reset.',
        tone: 'sky',
      })
      return
    }
    try {
      await sendResetPassword(email)
      pushToast({
        title: 'Password reset link sent',
        body: `Check your inbox at ${email} for reset instructions.`,
        tone: 'emerald',
      })
    } catch (err) {
      pushToast({
        title: 'Reset failed',
        body: err.message || 'Could not send password reset email.',
        tone: 'rose',
      })
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950 font-sans text-slate-100 selection:bg-emerald-500 selection:text-white flex flex-col justify-between">
      {/* ----------------- DYNAMIC ANIMATED LIVING BACKGROUND ----------------- */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* Deep ambient dark mesh */}
        <div className="absolute inset-0 bg-radial-gradient from-slate-900 via-slate-950 to-[#030712] opacity-95" />

        {/* Floating Orb 1: Emerald glow */}
        <div className="animate-float-slow absolute -top-32 -left-32 h-[550px] w-[550px] rounded-full bg-gradient-to-tr from-emerald-600/30 to-teal-400/20 blur-[120px]" />

        {/* Floating Orb 2: Deep Cyan / Sky glow */}
        <div className="animate-float-reverse absolute -bottom-40 -right-32 h-[600px] w-[600px] rounded-full bg-gradient-to-bl from-cyan-600/25 to-blue-700/20 blur-[140px]" />

        {/* Floating Orb 3: Violet / Indigo central accent */}
        <div className="animate-pulse-glow absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[450px] rounded-full bg-indigo-600/15 blur-[130px]" />

        {/* Modern Dot Matrix Grid Overlay with Radial Fade */}
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: `radial-gradient(rgba(52, 211, 153, 0.4) 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
            maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          }}
        />

        {/* Subtle decorative floating badges in background */}
        <div className="hidden lg:block">
          <div className="animate-float-slow absolute top-28 left-20 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-md shadow-2xl">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <TrendingUp size={16} />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-400">Monthly Savings</p>
              <p className="text-xs font-bold text-white">+36.3% Rate</p>
            </div>
          </div>

          <div className="animate-float-reverse absolute bottom-32 left-28 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-md shadow-2xl">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-cyan-500/20 text-cyan-400">
              <Shield size={16} />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-400">Security Guard</p>
              <p className="text-xs font-bold text-white">Firestore Rules Live</p>
            </div>
          </div>

          <div className="animate-float-slow absolute top-36 right-24 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-md shadow-2xl">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-amber-500/20 text-amber-400">
              <Wallet size={16} />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-400">Active Balance</p>
              <p className="text-xs font-bold text-white">₹52,450</p>
            </div>
          </div>

          <div className="animate-float-reverse absolute bottom-28 right-28 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-md shadow-2xl">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-violet-500/20 text-violet-400">
              <Sparkles size={16} />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-400">AI Consultant</p>
              <p className="text-xs font-bold text-white">Insights Ready</p>
            </div>
          </div>
        </div>
      </div>

      {/* --------------------------- TOP NAV BAR --------------------------- */}
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5 sm:px-8">
        <div className="flex items-center gap-3">
          <Logo className="h-9 w-9 drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
          <span className="text-lg font-black tracking-[0.16em] text-white">
            SPENANCE
          </span>
          <span className="hidden rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10.5px] font-semibold text-emerald-400 sm:inline-block">
            v1.0 Cloud
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Badge */}
          <div
            className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-md ${
              isFirebaseConfigured
                ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                : 'border-amber-500/30 bg-amber-500/15 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isFirebaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span>{isFirebaseConfigured ? 'Firebase Cloud Active' : 'Demo Mode (Offline)'}</span>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300 backdrop-blur-md transition hover:bg-white/10 hover:text-white"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </header>

      {/* --------------------- CENTERED GLASS CARD FORM -------------------- */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-[440px] animate-rise">
          {/* Floating Glassmorphic Container with Neon Accent Edge */}
          <div className="relative rounded-3xl border border-white/15 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] ring-1 ring-emerald-500/20">
            {/* Top Glow Accent bar */}
            <div className="absolute inset-x-12 -top-px h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />

            {/* Header Content */}
            <div className="text-center">
              <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
                <Logo className="h-8 w-8" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-[26px]">
                {mode === 'signup' ? 'Create an Account' : 'Welcome to Spenance'}
              </h1>
              <p className="mt-1 text-xs text-slate-400 sm:text-[13px]">
                {mode === 'signup'
                  ? 'Join now to sync your loans, budgets, and expenses in real-time.'
                  : 'Your automated personal finance & loan tracking command center.'}
              </p>
            </div>

            {/* Tab Selector (Sign In vs Create Account) */}
            <div className="mt-6 flex rounded-xl border border-white/10 bg-white/5 p-1 backdrop-blur-md">
              <button
                type="button"
                onClick={() => {
                  setMode('signin')
                  setErrors({})
                }}
                className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  mode === 'signin'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup')
                  setErrors({})
                }}
                className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {signedOut ? (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-sky-500/20 bg-sky-500/10 px-3.5 py-2.5 text-xs font-medium text-sky-200">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-sky-400" />
                <span>You have been signed out safely.</span>
              </div>
            ) : null}

            {errors.form ? (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-500/25 bg-rose-500/10 px-3.5 py-2.5 text-xs font-medium text-rose-200">
                <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-400" />
                <span>{errors.form}</span>
              </div>
            ) : null}

            {/* Google Sign In Button */}
            <div className="mt-5 space-y-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleSubmitting || submitting}
                className="group flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-semibold text-white shadow-xs backdrop-blur-sm transition-all duration-200 hover:border-emerald-500/40 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] cursor-pointer"
              >
                {googleSubmitting ? (
                  <Loader2 size={16} className="animate-spin text-emerald-400" />
                ) : (
                  <svg className="h-4 w-4 transition group-hover:scale-110" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>Continue with Google</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-white/10" />
                <span className="bg-slate-900/90 px-3 text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">
                  or continue with email
                </span>
              </div>
            </div>

            {/* Email & Password Form */}
            <form className="mt-4 space-y-3.5" onSubmit={handleSubmit} noValidate>
              {/* Full Name (Sign Up only) */}
              {mode === 'signup' ? (
                <div className="animate-fade">
                  <label
                    htmlFor="signup-name"
                    className="mb-1 block text-xs font-semibold text-slate-300"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <User
                      size={15}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      id="signup-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value)
                        if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }))
                      }}
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-xs text-white placeholder-slate-500 transition focus:border-emerald-500 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                  {errors.name ? (
                    <p className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-rose-400">
                      <AlertCircle size={12} className="shrink-0" />
                      {errors.name}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {/* Email Address */}
              <div>
                <label
                  htmlFor="login-email"
                  className="mb-1 block text-xs font-semibold text-slate-300"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={15}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
                    }}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-xs text-white placeholder-slate-500 transition focus:border-emerald-500 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                {errors.email ? (
                  <p className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-rose-400">
                    <AlertCircle size={12} className="shrink-0" />
                    {errors.email}
                  </p>
                ) : null}
              </div>

              {/* Password */}
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label
                    htmlFor="login-password"
                    className="text-xs font-semibold text-slate-300"
                  >
                    Password
                  </label>
                  {mode === 'signin' ? (
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-[11px] font-medium text-emerald-400 transition hover:text-emerald-300 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  ) : null}
                </div>
                <div className="relative">
                  <Lock
                    size={15}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
                    }}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-10 text-xs text-white placeholder-slate-500 transition focus:border-emerald-500 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((val) => !val)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2 top-1/2 -translate-y-1/2 grid h-7 w-7 place-items-center rounded-lg text-slate-400 transition hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password ? (
                  <p className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-rose-400">
                    <AlertCircle size={12} className="shrink-0" />
                    {errors.password}
                  </p>
                ) : null}
              </div>

              {/* Remember me & min length */}
              <div className="flex items-center justify-between text-xs text-slate-400">
                <label className="flex cursor-pointer items-center gap-2 select-none">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-white/20 bg-white/10 text-emerald-500 accent-emerald-500 focus:ring-emerald-500/20"
                  />
                  <span>Remember me</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  {MIN_PASSWORD_LENGTH}+ characters
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="group relative mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-500/30 transition-all duration-200 hover:shadow-emerald-500/50 hover:brightness-110 active:scale-[0.99] disabled:opacity-60 cursor-pointer overflow-hidden"
              >
                {/* Shimmer light sweep */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition duration-1000 group-hover:translate-x-full" />

                {submitting ? (
                  <Loader2 size={16} className="animate-spin text-white" />
                ) : (
                  <ArrowRight
                    size={15}
                    className="transition group-hover:translate-x-0.5"
                  />
                )}
                <span>
                  {submitting
                    ? (mode === 'signup' ? 'Creating account…' : 'Signing in…')
                    : (mode === 'signup' ? 'Create Free Account' : 'Sign in to Spenance')}
                </span>
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* ----------------------------- FOOTER ----------------------------- */}
      <footer className="relative z-10 py-4 text-center">
        <p className="text-[11px] text-slate-400">
          SPENANCE · Cloud Firestore Powered · Real-Time Personal Finance Management
        </p>
      </footer>

      <Toaster />
    </div>
  )
}

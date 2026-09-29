import { DEMO_USER } from '../data/mockData'

/**
 * ------------------------------------------------------------------
 *  SPENANCE — prototype authentication
 *  Frontend-only session simulation. There is no backend, no token
 *  and no password store: a session object is kept in browser storage
 *  so the demo survives a refresh ("Remember me" → localStorage,
 *  otherwise sessionStorage).
 * ------------------------------------------------------------------
 */

export const SESSION_KEY = 'spenance.session.v1'

export const MIN_PASSWORD_LENGTH = 6

/** The seeded demo account shown on the login screen. */
export const DEMO_CREDENTIALS = {
  email: DEMO_USER.email,
  password: 'spenance123',
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i

function initialsOf(name) {
  const parts = String(name || '')
    .split(/[\s._-]+/)
    .filter(Boolean)
  if (!parts.length) return 'RS'
  return parts
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

export function isDemoAccount(email) {
  return String(email || '').trim().toLowerCase() === DEMO_USER.email.toLowerCase()
}

/** Read a stored session from localStorage first, then sessionStorage. */
export function readSession() {
  if (typeof window === 'undefined') return null
  for (const store of [window.localStorage, window.sessionStorage]) {
    try {
      const raw = store.getItem(SESSION_KEY)
      if (!raw) continue
      const parsed = JSON.parse(raw)
      if (parsed && parsed.email) return parsed
    } catch {
      /* corrupted entry — fall through and try the next store */
    }
  }
  return null
}

export function clearSession() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(SESSION_KEY)
  } catch {
    /* storage disabled */
  }
  try {
    window.sessionStorage.removeItem(SESSION_KEY)
  } catch {
    /* storage disabled */
  }
}

/** `remember: true` keeps the session across browser restarts. */
export function writeSession(session, remember = true) {
  if (typeof window === 'undefined') return
  clearSession()
  try {
    const store = remember ? window.localStorage : window.sessionStorage
    store.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {
    /* storage full / disabled — the in-memory session still works */
  }
}

/** Field-level validation for the login form. */
export function validateCredentials({ email, password }) {
  const cleanEmail = String(email || '').trim()
  const cleanPassword = String(password || '')
  const errors = {}

  if (!cleanEmail) errors.email = 'Enter your email address.'
  else if (!EMAIL_PATTERN.test(cleanEmail)) {
    errors.email = 'That email address does not look right.'
  }

  if (!cleanPassword) errors.password = 'Enter your password.'
  else if (cleanPassword.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
  }

  return errors
}

/** Build the session object stored for the signed-in prototype user. */
export function buildSession(email) {
  const cleanEmail = String(email || '').trim()
  const demo = isDemoAccount(cleanEmail)
  const name = demo ? DEMO_USER.name : cleanEmail.split('@')[0].replace(/[._-]+/g, ' ')

  return {
    email: cleanEmail,
    name: demo ? name : name.replace(/\b\w/g, (c) => c.toUpperCase()),
    initials: demo ? DEMO_USER.initials : initialsOf(name),
    accountType: demo ? DEMO_USER.accountType : 'Demo Account',
    isDemo: demo,
    signedInAt: new Date().toISOString(),
  }
}

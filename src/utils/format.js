/**
 * Formatting helpers for Indian currency (₹ INR) and dates.
 */

const inr = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 0,
})

const inrDecimal = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** ₹52,450 */
export function formatINR(value, { decimals = false, sign = false } = {}) {
  const amount = Number(value) || 0
  const abs = Math.abs(amount)
  const body = decimals ? inrDecimal.format(abs) : inr.format(abs)
  const prefix = sign ? (amount > 0 ? '+' : amount < 0 ? '−' : '') : ''
  return `${prefix}₹${body}`
}

/** 52450 -> "₹52.5k"  |  425000 -> "₹4.25L" (compact, used in charts) */
export function formatINRCompact(value) {
  const amount = Number(value) || 0
  const abs = Math.abs(amount)
  const sign = amount < 0 ? '−' : ''
  if (abs >= 10000000) return `${sign}₹${(abs / 10000000).toFixed(2)}Cr`
  if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(2)}L`
  if (abs >= 1000) return `${sign}₹${(abs / 1000).toFixed(abs >= 10000 ? 0 : 1)}k`
  return `${sign}₹${inr.format(abs)}`
}

/** Plain number with Indian grouping */
export function formatNumber(value) {
  return inr.format(Number(value) || 0)
}

/** 0.3633 -> "36.3%" */
export function formatPercent(value, digits = 1) {
  return `${(Number(value) || 0).toFixed(digits)}%`
}

/**
 * Same as formatPercent but truncated (81.857 -> "81.8%"), which is how
 * budget utilisation is quoted in the product spec.
 */
export function formatPercentDown(value, digits = 1) {
  const factor = 10 ** digits
  const amount = Math.floor((Number(value) || 0) * factor) / factor
  return `${amount.toFixed(digits)}%`
}

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

const MONTHS_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

/** "2026-09-26" -> "26 Sep" */
export function formatShortDate(iso) {
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS_SHORT[d.getMonth()]}`
}

/** "2026-10-05" -> "05 Oct 2026" (compact but complete) */
export function formatMediumDate(iso) {
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return `${String(d.getDate()).padStart(2, '0')} ${
    MONTHS_SHORT[d.getMonth()]
  } ${d.getFullYear()}`
}

/** "2026-10-05" -> "05 October 2026" */
export function formatLongDate(iso) {
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return `${String(d.getDate()).padStart(2, '0')} ${
    MONTHS_LONG[d.getMonth()]
  } ${d.getFullYear()}`
}

/** Days between today and an ISO date */
export function daysUntil(iso, from = new Date()) {
  const target = new Date(`${iso}T00:00:00`)
  return Math.round((target - from) / 86400000)
}

/** Current time greeting, tuned to the demo clock (evening) */
export function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  if (hour < 21) return 'Good evening'
  return 'Good evening'
}

export { MONTHS_SHORT, MONTHS_LONG }

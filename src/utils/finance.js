/**
 * Core financial math used across SPENANCE (EMI, ratios, scores).
 */

/** Standard EMI formula: P*r*(1+r)^n / ((1+r)^n - 1) */
export function calculateEMI(principal, annualRate, years) {
  const p = Number(principal) || 0
  const r = (Number(annualRate) || 0) / 12 / 100
  const n = Math.round((Number(years) || 0) * 12)

  if (p <= 0 || n <= 0) {
    return { emi: 0, totalInterest: 0, totalPayment: 0, months: n, principal: p }
  }

  const emi =
    r === 0 ? p / n : (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
  const totalPayment = emi * n

  return {
    emi: Math.round(emi),
    totalInterest: Math.round(totalPayment - p),
    totalPayment: Math.round(totalPayment),
    months: n,
    principal: p,
  }
}

export function ratioPercent(part, whole) {
  const w = Number(whole) || 0
  if (w <= 0) return 0
  return ((Number(part) || 0) / w) * 100
}

export function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, Number(value) || 0))
}

/**
 * Health of a spending category.
 * < 70 normal · 70-85 warning · >= 85 near limit
 */
export function budgetStatus(usedPercent, budgetTotal = 0) {
  if (budgetTotal <= 0) {
    return {
      key: 'unset',
      label: 'No budget set',
      tone: 'slate',
      bar: 'bg-slate-300 dark:bg-slate-700',
      chip: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    }
  }
  if (usedPercent >= 100)
    return {
      key: 'over',
      label: 'Over budget',
      tone: 'rose',
      bar: 'bg-rose-500',
      chip: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
    }
  if (usedPercent >= 85)
    return {
      key: 'limit',
      label: 'Almost at your limit',
      tone: 'rose',
      bar: 'bg-rose-500',
      chip: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
    }
  if (usedPercent >= 70)
    return {
      key: 'warning',
      label: 'Watch your spending',
      tone: 'amber',
      bar: 'bg-amber-500',
      chip: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
    }
  return {
    key: 'normal',
    label: 'On track',
    tone: 'emerald',
    bar: 'bg-emerald-500',
    chip: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  }
}

/**
 * Composite 0-100 financial score — the average of four health pillars.
 * Returns 0 if the user has not recorded any transactions or income yet.
 */
export function financialScore({
  savingsRate = 0,
  budgetUsage = 0,
  debtToIncome = 0,
  monthlyExpenses = 0,
  emergencyFund = 0,
  hasTransactions = false,
}) {
  if (!hasTransactions && monthlyExpenses === 0 && savingsRate === 0 && emergencyFund === 0) {
    return {
      total: 0,
      pillars: [
        { key: 'savings', label: 'Savings discipline', value: 0 },
        { key: 'budget', label: 'Budget control', value: 0 },
        { key: 'debt', label: 'Debt management', value: 0 },
        { key: 'emergency', label: 'Emergency buffer', value: 0 },
      ],
    }
  }

  const savings = clamp((savingsRate / 40) * 100)
  const budget = clamp(164 - budgetUsage)
  const debt = clamp(100 - debtToIncome)
  const target = Math.max(1, monthlyExpenses * 3)
  const emergency = clamp((emergencyFund / target) * 100)
  const total = Math.round((savings + budget + debt + emergency) / 4)

  return {
    total: clamp(total),
    pillars: [
      { key: 'savings', label: 'Savings discipline', value: Math.round(savings) },
      { key: 'budget', label: 'Budget control', value: Math.round(budget) },
      { key: 'debt', label: 'Debt management', value: Math.round(debt) },
      { key: 'emergency', label: 'Emergency buffer', value: Math.round(emergency) },
    ],
  }
}

export function scoreLabel(score) {
  if (!score || score <= 0) return { label: 'No data', tone: 'slate' }
  if (score >= 85) return { label: 'Excellent', tone: 'emerald' }
  if (score >= 75) return { label: 'Good', tone: 'emerald' }
  if (score >= 60) return { label: 'Fair', tone: 'amber' }
  return { label: 'Needs attention', tone: 'rose' }
}

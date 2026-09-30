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
  hasActiveLoans = false,
  hasTransactions = false,
}) {
  if (!hasTransactions && monthlyExpenses === 0 && savingsRate === 0) {
    return {
      total: 0,
      pillars: [
        { key: 'savings', label: 'Savings discipline', value: 0 },
        { key: 'budget', label: 'Budget control', value: 0 },
        { key: 'debt', label: 'Debt management', value: 0 },
      ],
    }
  }

  // 1. Savings Discipline: continuous curve across 0% to 100% savings rate
  let savingsVal = 0
  if (savingsRate > 0) {
    if (savingsRate <= 25) {
      savingsVal = (savingsRate / 25) * 65
    } else if (savingsRate <= 60) {
      savingsVal = 65 + ((savingsRate - 25) / 35) * 25
    } else {
      savingsVal = 90 + ((savingsRate - 60) / 40) * 9
    }
  }
  const savings = clamp(Math.round(savingsVal), 0, 99)

  // 2. Budget Control: dynamically scales with pacing and envelope usage
  let budgetVal = 70
  if (budgetUsage <= 0) {
    budgetVal = hasTransactions ? 80 : 50
  } else if (budgetUsage <= 65) {
    budgetVal = 75 + (budgetUsage / 65) * 20
  } else if (budgetUsage <= 100) {
    budgetVal = 95 - ((budgetUsage - 65) / 35) * 23
  } else {
    budgetVal = Math.max(10, 72 - (budgetUsage - 100) * 1.4)
  }
  const budget = clamp(Math.round(budgetVal), 10, 98)

  // 3. Debt Management: dynamically responds to EMI-to-income burden
  let debtVal = 92
  if (debtToIncome > 0) {
    if (debtToIncome <= 30) {
      debtVal = 94 - (debtToIncome / 30) * 26
    } else if (debtToIncome <= 60) {
      debtVal = 68 - ((debtToIncome - 30) / 30) * 38
    } else {
      debtVal = Math.max(10, 30 - (debtToIncome - 60) * 1.2)
    }
  } else if (hasActiveLoans) {
    debtVal = 94
  }
  const debt = clamp(Math.round(debtVal), 10, 98)

  // Composite score: weighted average of the 3 pillars
  const total = clamp(Math.round((savings + budget + debt) / 3), 0, 100)

  return {
    total,
    pillars: [
      { key: 'savings', label: 'Savings discipline', value: savings },
      { key: 'budget', label: 'Budget control', value: budget },
      { key: 'debt', label: 'Debt management', value: debt },
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

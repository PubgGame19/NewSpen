/**
 * ------------------------------------------------------------------
 *  SPENANCE — Schema & Constants
 *  Clean production template: All mock transactions, loans, and
 *  fictional user artifacts have been cleared for real user data.
 * ------------------------------------------------------------------
 */

export const DEMO_USER = {
  name: 'User',
  firstName: 'User',
  initials: 'U',
  email: '',
  phone: '',
  accountType: 'Personal Account',
  memberSince: new Date().toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  }),
  openingBalance: 0,
  monthlyIncome: 0,
  emergencyFund: 0,
  debtToIncome: 0,
  currency: 'INR',
  city: '',
  notifications: {
    budgetAlerts: true,
    loanReminders: true,
    monthlyReports: false,
  },
}

export const DEMO_MONTH = new Date().toLocaleDateString('en-US', {
  month: 'long',
  year: 'numeric',
})

/* ------------------------------------------------------------------ */
/* Categories                                                          */
/* ------------------------------------------------------------------ */

export const CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Entertainment',
  'Other',
]

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Investment',
  'Bonus',
  'Rental',
  'Refund',
  'Other Income',
]

export const PAYMENT_METHODS = ['UPI', 'Cash', 'Credit Card', 'Debit Card', 'Net Banking']

export const CATEGORY_META = {
  Food: {
    color: '#f59e0b',
    icon: 'UtensilsCrossed',
    chip: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
    dot: 'bg-amber-500',
    bar: 'bg-amber-500',
    soft: 'bg-amber-50 dark:bg-amber-500/10',
  },
  Transport: {
    color: '#0ea5e9',
    icon: 'Car',
    chip: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300',
    dot: 'bg-sky-500',
    bar: 'bg-sky-500',
    soft: 'bg-sky-50 dark:bg-sky-500/10',
  },
  Shopping: {
    color: '#6366f1',
    icon: 'ShoppingBag',
    chip: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300',
    dot: 'bg-indigo-500',
    bar: 'bg-indigo-500',
    soft: 'bg-indigo-50 dark:bg-indigo-500/10',
  },
  Bills: {
    color: '#10b981',
    icon: 'ReceiptText',
    chip: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    dot: 'bg-emerald-500',
    bar: 'bg-emerald-500',
    soft: 'bg-emerald-50 dark:bg-emerald-500/10',
  },
  Entertainment: {
    color: '#f43f5e',
    icon: 'Clapperboard',
    chip: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
    dot: 'bg-rose-500',
    bar: 'bg-rose-500',
    soft: 'bg-rose-50 dark:bg-rose-500/10',
  },
  Other: {
    color: '#94a3b8',
    icon: 'Layers',
    chip: 'bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300',
    dot: 'bg-slate-400',
    bar: 'bg-slate-400',
    soft: 'bg-slate-100 dark:bg-slate-500/15',
  },
  Income: {
    color: '#059669',
    icon: 'Wallet',
    chip: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    dot: 'bg-emerald-500',
    bar: 'bg-emerald-500',
    soft: 'bg-emerald-50 dark:bg-emerald-500/10',
  },
  Salary: {
    color: '#14b8a6',
    icon: 'Banknote',
    chip: 'bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300',
    dot: 'bg-teal-500',
    bar: 'bg-teal-500',
    soft: 'bg-teal-50 dark:bg-teal-500/10',
  },
  Investment: {
    color: '#8b5cf6',
    icon: 'TrendingUp',
    chip: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300',
    dot: 'bg-violet-500',
    bar: 'bg-violet-500',
    soft: 'bg-violet-50 dark:bg-violet-500/10',
  },
  Refund: {
    color: '#06b6d4',
    icon: 'RotateCcw',
    chip: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300',
    dot: 'bg-cyan-500',
    bar: 'bg-cyan-500',
    soft: 'bg-cyan-50 dark:bg-cyan-500/10',
  },
}

/* ------------------------------------------------------------------ */
/* Transactions — Clean empty set for real user data                   */
/* ------------------------------------------------------------------ */

export const INITIAL_TRANSACTIONS = []

/* ------------------------------------------------------------------ */
/* Budgets                                                             */
/* ------------------------------------------------------------------ */

export const DEFAULT_BUDGETS = {
  Food: 0,
  Transport: 0,
  Shopping: 0,
  Bills: 0,
  Entertainment: 0,
  Other: 0,
}

/* ------------------------------------------------------------------ */
/* 6-month history                                                    */
/* ------------------------------------------------------------------ */

export const MONTHLY_HISTORY = (() => {
  const months = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const month = d.toLocaleDateString('en-US', { month: 'long' })
    const short = d.toLocaleDateString('en-US', { month: 'short' })
    months.push({ month, short, income: 0, expenses: 0, savings: 0 })
  }
  return months
})()

export const BALANCE_TREND = (() => {
  const trend = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const month = d.toLocaleDateString('en-US', { month: 'short' })
    trend.push({ month, value: 0 })
  }
  return trend
})()

export const LAST_MONTH_CATEGORIES = {
  Food: 0,
  Transport: 0,
  Shopping: 0,
  Bills: 0,
  Entertainment: 0,
  Other: 0,
}

export const STAT_DELTAS = {
  balance: { value: 0, direction: 'neutral', label: 'vs last month' },
  income: { value: 0, direction: 'neutral', label: 'This month' },
  expenses: { value: 0, direction: 'neutral', label: 'vs last month' },
  savings: { value: 0, direction: 'neutral', label: 'vs last month' },
}

/* ------------------------------------------------------------------ */
/* Loans                                                              */
/* ------------------------------------------------------------------ */

export const LOAN_TYPES = [
  'Education',
  'Personal',
  'Home',
  'Vehicle',
  'Gold',
  'Consumer Durable',
  'Business',
  'Other',
]

export const LOANS = []

/* ------------------------------------------------------------------ */
/* Upcoming payments                                                  */
/* ------------------------------------------------------------------ */

export const UPCOMING_PAYMENTS = []

/* ------------------------------------------------------------------ */
/* Notifications                                                      */
/* ------------------------------------------------------------------ */

export const INITIAL_NOTIFICATIONS = []

/* ------------------------------------------------------------------ */
/* Insights                                                           */
/* ------------------------------------------------------------------ */

export const INSIGHTS = []

/* ------------------------------------------------------------------ */
/* SPENANCE AI — Knowledge Base                                        */
/* ------------------------------------------------------------------ */

export const AI_GREETING =
  "Hi there! I'm your AI Financial Consultant. Add your expenses and income to get real-time insights."

export const AI_INSIGHT_CARDS = []

export const AI_SUGGESTED_QUESTIONS = [
  'How can I save more?',
  'Where am I spending the most?',
  'How is my financial health?',
  'Can I afford a new purchase?',
  'How much should I save every month?',
  'Analyze my spending',
]

export const AI_KNOWLEDGE = [
  {
    id: 'save',
    keywords: ['save', 'saving', 'save more', 'cut', 'reduce', 'optimize'],
    response:
      'To build a healthy savings habit, target saving at least 20-30% of your net income every month. Start by setting category budgets for discretionary spending like Food and Shopping.',
    highlights: [
      'Target: 20-30% savings rate',
      'Optimize: Food & Entertainment',
      'Strategy: Set monthly envelope limits',
    ],
  },
  {
    id: 'biggest',
    keywords: [
      'most',
      'biggest',
      'largest',
      'where am i spending',
      'top',
      'analyze',
      'analyse',
      'breakdown',
    ],
    response:
      'Check your Expenses breakdown chart to see your largest spending envelope in real-time. Bills and Housing typically represent 30-40% of standard budgets.',
    highlights: [
      'Review: Expenses Breakdown',
      'Focus: High frequency transactions',
      'Rule: 50/30/20 budget framework',
    ],
  },
  {
    id: 'health',
    keywords: ['financial health', 'health', 'score', 'how am i doing', 'rating'],
    response:
      'Your Financial Health Score is computed continuously across 3 key pillars: Savings Discipline, Budget Control, and Debt Management.',
    highlights: [
      '3 Pillars of financial fitness',
      'Aim for a score above 75 (Good)',
      'Disciplined savings and low debt',
    ],
  },
  {
    id: 'phone',
    keywords: ['afford', 'phone', 'iphone', 'laptop', 'buy', 'purchase'],
    response:
      'Before large purchases, ensure your emergency fund covers at least 3 months of essential expenses, and keep any recurring EMI obligations below 30% of your monthly income.',
    highlights: [
      'Check emergency fund first',
      'Keep EMI below 30% of income',
      'Avoid high-interest consumer debt',
    ],
  },
  {
    id: 'howmuch',
    keywords: ['how much should', 'target', 'ideal', 'percentage', '30%', 'rule'],
    response:
      'A widely recommended benchmark is the 50/30/20 rule: 50% for Needs (rent, bills, groceries), 30% for Wants (dining out, entertainment), and at least 20% for Savings and debt repayment.',
    highlights: [
      '50% Needs (Rent, Utilities, Food)',
      '30% Wants (Leisure, Travel)',
      '20% Savings & Debt elimination',
    ],
  },
  {
    id: 'loan',
    keywords: ['loan', 'emi', 'debt', 'repay', 'prepay', 'interest'],
    response:
      'When paying down debt, prioritize loans with the highest interest rates first (Avalanche method). Even small periodic prepayments significantly reduce your total interest and tenure.',
    highlights: [
      'Target highest interest rate loans first',
      'Every extra principal payment saves interest',
      'Keep total debt-to-income below 30%',
    ],
  },
]

export const AI_FALLBACK = {
  id: 'fallback',
  response:
    "I'm here to help with budgeting, expense trends, loans, EMIs, and savings strategies. Ask me any question or record transactions to receive instant financial analysis.",
  highlights: [
    'Smart Budget Tracking',
    'Real-time EMI Calculations',
    'Actionable Savings Strategies',
  ],
}

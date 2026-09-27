/**
 * ------------------------------------------------------------------
 *  SPENANCE — demo dataset
 *  Fictional user + fictional transactions (September / October 2026).
 *  Every figure is internally consistent with the September 2026 view:
 *    income ₹45,000 · expenses ₹28,650 · savings ₹16,350 (36.3%)
 *    budget ₹35,000 (81.8% used) · debt-to-income 24% · score 82/100
 * ------------------------------------------------------------------
 */

export const DEMO_USER = {
  name: 'Rahul Sharma',
  firstName: 'Rahul',
  initials: 'RS',
  email: 'rahul.sharma@example.com',
  phone: '+91 98•••••210',
  accountType: 'Personal Account',
  memberSince: 'January 2024',
  monthlyIncome: 45000,
  emergencyFund: 68000,
  debtToIncome: 24,
  currency: 'INR',
  city: 'Bengaluru, India',
  notifications: {
    budgetAlerts: true,
    loanReminders: true,
    monthlyReports: false,
  },
}

export const DEMO_MONTH = 'September 2026'

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

export const PAYMENT_METHODS = ['UPI', 'Cash', 'Credit Card', 'Debit Card']

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
}

/* ------------------------------------------------------------------ */
/* Transactions — 24 expenses (₹28,650) + 1 salary credit (₹45,000)   */
/* ------------------------------------------------------------------ */

export const INITIAL_TRANSACTIONS = [
  // ---- Food · ₹6,200 -------------------------------------------------
  {
    id: 'txn-01',
    date: '2026-09-26',
    description: 'Swiggy',
    note: 'Dinner order',
    category: 'Food',
    method: 'UPI',
    amount: -420,
  },
  {
    id: 'txn-02',
    date: '2026-09-25',
    description: 'Reliance Smart',
    note: 'Monthly groceries',
    category: 'Food',
    method: 'Debit Card',
    amount: -2350,
  },
  {
    id: 'txn-03',
    date: '2026-09-20',
    description: 'Zomato',
    note: 'Lunch with friends',
    category: 'Food',
    method: 'UPI',
    amount: -380,
  },
  {
    id: 'txn-04',
    date: '2026-09-14',
    description: 'BigBasket',
    note: 'Groceries',
    category: 'Food',
    method: 'UPI',
    amount: -1650,
  },
  {
    id: 'txn-05',
    date: '2026-09-03',
    description: 'Zomato',
    note: 'Weekend order',
    category: 'Food',
    method: 'Credit Card',
    amount: -1400,
  },

  // ---- Transport · ₹3,400 -------------------------------------------
  {
    id: 'txn-06',
    date: '2026-09-24',
    description: 'Uber',
    note: 'Office commute',
    category: 'Transport',
    method: 'UPI',
    amount: -280,
  },
  {
    id: 'txn-07',
    date: '2026-09-21',
    description: 'Ola Cabs',
    note: 'Airport drop',
    category: 'Transport',
    method: 'UPI',
    amount: -340,
  },
  {
    id: 'txn-08',
    date: '2026-09-17',
    description: 'Indian Oil',
    note: 'Fuel top-up',
    category: 'Transport',
    method: 'Debit Card',
    amount: -1200,
  },
  {
    id: 'txn-09',
    date: '2026-09-11',
    description: 'Metro Card',
    note: 'Travel recharge',
    category: 'Transport',
    method: 'UPI',
    amount: -500,
  },
  {
    id: 'txn-10',
    date: '2026-09-02',
    description: 'Rapido',
    note: 'Bike taxi',
    category: 'Transport',
    method: 'UPI',
    amount: -1080,
  },

  // ---- Shopping · ₹4,800 --------------------------------------------
  {
    id: 'txn-11',
    date: '2026-09-22',
    description: 'Amazon',
    note: 'Wireless headphones',
    category: 'Shopping',
    method: 'Credit Card',
    amount: -2499,
  },
  {
    id: 'txn-12',
    date: '2026-09-18',
    description: 'Myntra',
    note: 'Kurta set',
    category: 'Shopping',
    method: 'Credit Card',
    amount: -1299,
  },
  {
    id: 'txn-13',
    date: '2026-09-09',
    description: 'Flipkart',
    note: 'Phone cover & cable',
    category: 'Shopping',
    method: 'UPI',
    amount: -602,
  },
  {
    id: 'txn-14',
    date: '2026-09-06',
    description: 'Decathlon',
    note: 'Running socks',
    category: 'Shopping',
    method: 'Debit Card',
    amount: -400,
  },

  // ---- Bills · ₹7,250 ------------------------------------------------
  {
    id: 'txn-15',
    date: '2026-09-23',
    description: 'Electricity Bill',
    note: 'BESCOM',
    category: 'Bills',
    method: 'UPI',
    amount: -1850,
  },
  {
    id: 'txn-16',
    date: '2026-09-19',
    description: 'Airtel Postpaid',
    note: 'Mobile bill',
    category: 'Bills',
    method: 'UPI',
    amount: -799,
  },
  {
    id: 'txn-17',
    date: '2026-09-15',
    description: 'WiFi Broadband',
    note: 'Fiber plan',
    category: 'Bills',
    method: 'Debit Card',
    amount: -999,
  },
  {
    id: 'txn-18',
    date: '2026-09-10',
    description: 'LPG Cylinder',
    note: 'Kitchen gas',
    category: 'Bills',
    method: 'Cash',
    amount: -1300,
  },
  {
    id: 'txn-19',
    date: '2026-09-01',
    description: 'House Rent Share',
    note: 'Shared flat',
    category: 'Bills',
    method: 'UPI',
    amount: -2302,
  },

  // ---- Entertainment · ₹1,500 ----------------------------------------
  {
    id: 'txn-20',
    date: '2026-09-21',
    description: 'Netflix',
    note: 'Subscription',
    category: 'Entertainment',
    method: 'Credit Card',
    amount: -649,
  },
  {
    id: 'txn-21',
    date: '2026-09-16',
    description: 'BookMyShow',
    note: 'Movie tickets',
    category: 'Entertainment',
    method: 'UPI',
    amount: -551,
  },
  {
    id: 'txn-22',
    date: '2026-09-07',
    description: 'Spotify',
    note: 'Premium plan',
    category: 'Entertainment',
    method: 'UPI',
    amount: -300,
  },

  // ---- Other · ₹5,500 -------------------------------------------------
  {
    id: 'txn-23',
    date: '2026-09-25',
    description: 'College Fees',
    note: 'Semester fee',
    category: 'Other',
    method: 'UPI',
    amount: -4500,
  },
  {
    id: 'txn-24',
    date: '2026-09-06',
    description: 'Cult.fit',
    note: 'Gym membership',
    category: 'Other',
    method: 'Debit Card',
    amount: -1000,
  },

  // ---- Income ---------------------------------------------------------
  {
    id: 'txn-25',
    date: '2026-09-01',
    description: 'Salary',
    note: 'September payroll',
    category: 'Income',
    method: 'Bank Transfer',
    amount: 45000,
  },
]

/* ------------------------------------------------------------------ */
/* Budgets                                                             */
/* ------------------------------------------------------------------ */

/** Sum = ₹35,000 monthly budget */
export const DEFAULT_BUDGETS = {
  Food: 8000,
  Transport: 5000,
  Shopping: 5000,
  Bills: 8000,
  Entertainment: 3000,
  Other: 6000,
}

/* ------------------------------------------------------------------ */
/* 6-month history (Apr – Sep 2026)                                    */
/* ------------------------------------------------------------------ */

export const MONTHLY_HISTORY = [
  { month: 'April', short: 'Apr', income: 38000, expenses: 25000 },
  { month: 'May', short: 'May', income: 40000, expenses: 27000 },
  { month: 'June', short: 'Jun', income: 42000, expenses: 29000 },
  { month: 'July', short: 'Jul', income: 44000, expenses: 26000 },
  { month: 'August', short: 'Aug', income: 43000, expenses: 30000 },
  { month: 'September', short: 'Sep', income: 45000, expenses: 28650 },
].map((m) => ({ ...m, savings: m.income - m.expenses }))

/** Closing balance by month — Aug 48,475 → Sep 52,450 is the +8.2% move */
export const BALANCE_TREND = [
  { month: 'Apr', value: 31200 },
  { month: 'May', value: 36400 },
  { month: 'Jun', value: 40900 },
  { month: 'Jul', value: 47700 },
  { month: 'Aug', value: 48475 },
  { month: 'Sep', value: 52450 },
]

/** Last month's spend per category — drives the "vs last month" deltas */
export const LAST_MONTH_CATEGORIES = {
  Food: 5250,
  Transport: 3600,
  Shopping: 4300,
  Bills: 7800,
  Entertainment: 2900,
  Other: 6150,
}

/** Month-over-month badges shown on the dashboard stat cards */
export const STAT_DELTAS = {
  balance: { value: 8.2, direction: 'up', label: 'from last month' },
  income: { value: 4.7, direction: 'up', label: 'This month' },
  expenses: { value: -4.5, direction: 'down', label: 'from last month' },
  savings: { value: 12.4, direction: 'up', label: 'from last month' },
}

/* ------------------------------------------------------------------ */
/* Loans                                                              */
/* ------------------------------------------------------------------ */

/** Options offered when adding a loan */
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

export const LOANS = [
  {
    id: 'loan-edu',
    name: 'Education Loan',
    lender: 'State Bank of India',
    type: 'Education',
    accountNumber: '•••• 4821',
    originalAmount: 500000,
    outstanding: 425000,
    interestRate: 8.5,
    emi: 8500,
    tenureMonths: 60,
    paidMonths: 9,
    startDate: '2026-01-05',
    nextPaymentDate: '2026-10-05',
    status: 'Active',
    coApplicant: 'Suresh Sharma (Father)',
    purpose: 'Post-graduation programme fee',
    moratorium: 'Ends 31 Dec 2026',
  },
  {
    id: 'loan-personal',
    name: 'Personal Loan',
    lender: 'HDFC Bank',
    type: 'Personal',
    accountNumber: '•••• 7390',
    originalAmount: 120000,
    outstanding: 72000,
    interestRate: 11.5,
    emi: 4200,
    tenureMonths: 36,
    paidMonths: 24,
    startDate: '2024-10-12',
    nextPaymentDate: '2026-10-12',
    status: 'Active',
    coApplicant: '—',
    purpose: 'Laptop upgrade & emergency buffer',
    moratorium: 'Not applicable',
  },
]

/* ------------------------------------------------------------------ */
/* Upcoming payments (October 2026)                                   */
/* ------------------------------------------------------------------ */

export const UPCOMING_PAYMENTS = [
  {
    id: 'up-1',
    title: 'Education Loan',
    meta: 'SBI · EMI',
    amount: 8500,
    dueDate: '2026-10-05',
    kind: 'loan',
    autoDebit: true,
  },
  {
    id: 'up-2',
    title: 'Electricity Bill',
    meta: 'BESCOM · Recurring',
    amount: 1850,
    dueDate: '2026-10-08',
    kind: 'bill',
    autoDebit: false,
  },
  {
    id: 'up-3',
    title: 'Netflix',
    meta: 'Subscription · Auto-pay',
    amount: 649,
    dueDate: '2026-10-10',
    kind: 'subscription',
    autoDebit: true,
  },
  {
    id: 'up-4',
    title: 'Personal Loan',
    meta: 'HDFC · EMI',
    amount: 4200,
    dueDate: '2026-10-12',
    kind: 'loan',
    autoDebit: true,
  },
]

/* ------------------------------------------------------------------ */
/* Notifications                                                      */
/* ------------------------------------------------------------------ */

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'ntf-1',
    title: 'Education loan EMI due soon',
    body: '₹8,500 is scheduled for auto-debit on 05 October 2026.',
    time: '2 hours ago',
    tone: 'amber',
    unread: true,
    to: '/loans',
  },
  {
    id: 'ntf-2',
    title: 'Shopping budget is at 96%',
    body: 'You have ₹200 left in the Shopping envelope for September.',
    time: '6 hours ago',
    tone: 'rose',
    unread: true,
    to: '/budget',
  },
  {
    id: 'ntf-3',
    title: 'Salary credited',
    body: '₹45,000 received from September payroll.',
    time: 'Yesterday',
    tone: 'emerald',
    unread: true,
    to: '/expenses',
  },
  {
    id: 'ntf-4',
    title: 'New insight available',
    body: 'Food spending is 18% higher than last month.',
    time: '2 days ago',
    tone: 'sky',
    unread: false,
    to: '/insights',
  },
]

/* ------------------------------------------------------------------ */
/* Insights                                                           */
/* ------------------------------------------------------------------ */

export const INSIGHTS = [
  {
    id: 'ins-1',
    icon: 'TrendingUp',
    tone: 'emerald',
    tag: 'Savings',
    title: 'Your savings increased by 12.4% this month.',
    body: 'You set aside ₹16,350 in September — your savings rate is now 36.3% of income.',
  },
  {
    id: 'ins-2',
    icon: 'AlertTriangle',
    tone: 'amber',
    tag: 'Food',
    title: 'Food spending is 18% higher than last month.',
    body: 'Groceries and food delivery added up to ₹6,200 vs ₹5,250 in August.',
  },
  {
    id: 'ins-3',
    icon: 'Gauge',
    tone: 'sky',
    tag: 'Budget',
    title: 'You are currently using 81.8% of your monthly budget.',
    body: '₹6,350 is still available out of your ₹35,000 September envelope.',
  },
  {
    id: 'ins-4',
    icon: 'Lightbulb',
    tone: 'violet',
    tag: 'Opportunity',
    title: 'Reducing entertainment spending by ₹500 could increase your monthly savings.',
    body: 'Trimming one streaming plan and one night out keeps you on the same lifestyle.',
  },
  {
    id: 'ins-5',
    icon: 'PiggyBank',
    tone: 'emerald',
    tag: 'Health',
    title: 'Your current savings rate is 36.3%.',
    body: 'Financial planners usually recommend a 30% floor — you are comfortably above it.',
  },
  {
    id: 'ins-6',
    icon: 'Landmark',
    tone: 'sky',
    tag: 'Debt',
    title: 'Prepaying ₹10,000 towards your personal loan saves you interest.',
    body: 'At 11.5%, an extra payment now shortens the tenor instead of paying interest.',
  },
]

/* ------------------------------------------------------------------ */
/* SPENANCE AI — predefined knowledge base (no real API)              */
/* ------------------------------------------------------------------ */

export const AI_GREETING =
  "Hi Rahul! I've analyzed your recent spending. Here are a few things you may want to know."

export const AI_INSIGHT_CARDS = [
  {
    id: 'ai-1',
    icon: 'AlertTriangle',
    tone: 'amber',
    title: 'Food expenses increased by 18%.',
    body: '₹6,200 was spent on food in September, up from ₹5,250 in August.',
  },
  {
    id: 'ai-2',
    icon: 'Lightbulb',
    tone: 'emerald',
    title: 'You could save approximately ₹1,500 this month.',
    body: 'Reducing food delivery and impulse shopping gets you there without lifestyle cuts.',
  },
  {
    id: 'ai-3',
    icon: 'Target',
    tone: 'sky',
    title: 'Your current savings rate is 36.3%.',
    body: 'That is ₹16,350 saved out of ₹45,000 earned in September.',
  },
]

export const AI_SUGGESTED_QUESTIONS = [
  'How can I save more?',
  'Where am I spending the most?',
  'How is my financial health?',
  'Can I afford a new phone?',
  'How much should I save every month?',
  'Analyze my spending',
]

/**
 * Keyword-matched canned responses. First match wins, so order matters:
 * more specific intents are listed before the generic ones.
 */
export const AI_KNOWLEDGE = [
  {
    id: 'save',
    keywords: ['save', 'saving', 'save more', 'cut', 'reduce', 'optimize'],
    response:
      'Based on your current spending, your food and shopping expenses are the easiest areas to optimize. Reducing these categories by around ₹2,000 per month could increase your savings.',
    highlights: [
      'Food: ₹6,200 (18% higher than August)',
      'Shopping: ₹4,800 — 96% of its budget',
      'Potential monthly saving: ₹2,000',
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
      'Your largest category this month is Bills at ₹7,250 (25.3% of total spend), driven by rent share, electricity and broadband. Food follows at ₹6,200 and Other at ₹5,500.',
    highlights: [
      'Bills — ₹7,250 (25.3%)',
      'Food — ₹6,200 (21.6%)',
      'Other — ₹5,500 (19.2%)',
    ],
  },
  {
    id: 'health',
    keywords: ['financial health', 'health', 'score', 'how am i doing', 'rating'],
    response:
      'Your financial health is solid. The SPENANCE score is 82/100 — rated Good — with a 36.3% savings rate and a 24% debt-to-income ratio. Building a slightly larger emergency buffer would push you into the Excellent band.',
    highlights: [
      'Score: 82 / 100 (Good)',
      'Savings rate: 36.3%',
      'Debt-to-income: 24%',
    ],
  },
  {
    id: 'phone',
    keywords: ['afford', 'phone', 'iphone', 'laptop', 'buy', 'purchase'],
    response:
      'Yes — you could comfortably afford a phone up to about ₹35,000. Your monthly surplus is ₹16,350, so paying in full would still leave you with a healthy buffer. If you finance it, keep the EMI under ₹1,500 so your total debt obligations stay below 30% of income.',
    highlights: [
      'Safe spend: up to ₹35,000',
      'Monthly surplus: ₹16,350',
      'Recommended max EMI: ₹1,500',
    ],
  },
  {
    id: 'howmuch',
    keywords: ['how much should', 'target', 'ideal', 'percentage', '30%', 'rule'],
    response:
      'A healthy target is 30–40% of income. You are already at 36.3% (₹16,350). Locking in ₹18,000 per month would get you to 40% and fully fund a ₹1 lakh emergency buffer within six months.',
    highlights: [
      'Recommended: 30–40% of income',
      'Your current rate: 36.3%',
      'Stretch goal: ₹18,000 / month',
    ],
  },
  {
    id: 'budget',
    keywords: ['budget', 'envelope', 'limit', 'left'],
    response:
      'You have used 81.8% of your ₹35,000 September budget and ₹6,350 still remains. Shopping (96%) and Other (91.7%) are your tightest envelopes, while Food and Transport still have room.',
    highlights: [
      'Budget used: ₹28,650 of ₹35,000',
      'Remaining: ₹6,350',
      'Tightest: Shopping at 96%',
    ],
  },
  {
    id: 'loan',
    keywords: ['loan', 'emi', 'debt', 'repay', 'prepay', 'interest'],
    response:
      'You have two active loans — a ₹4,25,000 education loan at 8.5% (EMI ₹8,500) and a ₹72,000 personal loan at 11.5% (EMI ₹4,200). Target the personal loan first: at the higher rate, every ₹10,000 prepaid saves you roughly ₹1,150 in interest.',
    highlights: [
      'Total monthly EMI: ₹12,700',
      'Highest rate: 11.5% personal loan',
      'Next EMI: 05 October 2026',
    ],
  },
  {
    id: 'food',
    keywords: ['food', 'swiggy', 'zomato', 'grocery', 'eating out'],
    response:
      'Food is ₹6,200 this month, 18% above August. Delivery orders (Swiggy, Zomato) alone are ₹2,200 — capping delivery to twice a month would bring food back to about ₹5,400.',
    highlights: [
      'Food total: ₹6,200',
      'Delivery apps: ₹2,200',
      'Potential saving: ₹800',
    ],
  },
  {
    id: 'invest',
    keywords: ['invest', 'sip', 'mutual fund', 'stock', 'wealth'],
    response:
      'With a ₹16,350 monthly surplus you could start a ₹5,000 SIP in an index fund right away. Keep three months of expenses (≈₹85,950) liquid first, then invest the rest on the 5th of every month for automatic discipline.',
    highlights: [
      'Suggested SIP: ₹5,000 / month',
      'Keep liquid: ₹85,950 (3 months)',
      'Best date: right after salary credit',
    ],
  },
]

export const AI_FALLBACK = {
  id: 'fallback',
  response:
    "I can help with budgeting, expense trends, loans, EMIs and savings. Here's what stands out right now: your September savings rate is 36.3%, Bills is your largest category at ₹7,250, and your budget is 81.8% used with ₹6,350 remaining.",
  highlights: [
    'Savings rate: 36.3%',
    'Largest category: Bills (₹7,250)',
    'Budget remaining: ₹6,350',
  ],
}

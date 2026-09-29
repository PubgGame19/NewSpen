import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  BALANCE_TREND,
  CATEGORIES,
  DEFAULT_BUDGETS,
  DEMO_MONTH,
  DEMO_USER,
  INITIAL_NOTIFICATIONS,
  INITIAL_TRANSACTIONS,
  LAST_MONTH_CATEGORIES,
  LOANS,
  MONTHLY_HISTORY,
  STAT_DELTAS,
} from '../data/mockData'
import { financialScore, ratioPercent, scoreLabel } from '../utils/finance'
import { formatShortDate } from '../utils/format'
import { clearSession, readSession, writeSession } from '../utils/auth'
import { syncBrowserChrome } from '../utils/brandIcons'

const STORAGE_KEY = 'spenance.state.v1'

/** Net of the seeded September dataset (₹45,000 in − ₹28,650 out) */
const SEED_NET = INITIAL_TRANSACTIONS.reduce((sum, t) => sum + t.amount, 0)
const SEED_EXPENSES = Math.abs(
  INITIAL_TRANSACTIONS.filter((t) => t.amount < 0).reduce(
    (sum, t) => sum + t.amount,
    0,
  ),
)
const BASE_BALANCE = 52450
const SAVINGS_BASE = 10000

const DEFAULT_CHAT = [
  {
    id: 'msg-0',
    role: 'ai',
    text: "Hi Rahul! I've analyzed your recent spending. Here are a few things you may want to know.",
    highlights: [],
    time: '09:14',
  },
]

const INITIAL_STATE = {
  profile: DEMO_USER,
  transactions: INITIAL_TRANSACTIONS,
  budgets: DEFAULT_BUDGETS,
  loans: LOANS,
  notifications: INITIAL_NOTIFICATIONS,
  chat: DEFAULT_CHAT,
  theme: 'light',
  sidebarCollapsed: false,
}

function loadState() {
  if (typeof window === 'undefined') return INITIAL_STATE
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return INITIAL_STATE
    const parsed = JSON.parse(raw)
    return {
      ...INITIAL_STATE,
      ...parsed,
      profile: { ...INITIAL_STATE.profile, ...(parsed.profile || {}) },
      budgets: { ...INITIAL_STATE.budgets, ...(parsed.budgets || {}) },
      loans: Array.isArray(parsed.loans) ? parsed.loans : INITIAL_STATE.loans,
    }
  } catch {
    return INITIAL_STATE
  }
}

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state, setState] = useState(loadState)
  /* Prototype session — null means the login screen is required. */
  const [session, setSession] = useState(readSession)
  /* True right after an explicit sign-out, so /login can explain itself. */
  const [justSignedOut, setJustSignedOut] = useState(false)
  const [toasts, setToasts] = useState([])
  /* "Add expense" modal is shared by the header and the pages */
  const [quickAddOpen, setQuickAddOpen] = useState(false)

  /* ----------------------------- persistence ---------------------------- */
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* storage full / disabled — demo keeps working in memory */
    }
  }, [state])

  /* -------------------------------- theme ------------------------------- */
  useEffect(() => {
    const root = document.documentElement
    const dark = state.theme === 'dark'
    root.classList.toggle('dark', dark)
    root.style.colorScheme = state.theme
    /* tab icon + browser UI colour follow the app theme, not just the OS */
    syncBrowserChrome(state.theme)
  }, [state.theme])

  /* ------------------------------- toasts ------------------------------- */
  const pushToast = useCallback((toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`
    setToasts((prev) => [...prev, { id, tone: 'emerald', ...toast }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3600)
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  /* ------------------------------- session ------------------------------ */
  const signIn = useCallback((nextSession, remember = true) => {
    writeSession(nextSession, remember)
    setSession(nextSession)
    setJustSignedOut(false)
  }, [])

  const signOut = useCallback(() => {
    clearSession()
    setSession(null)
    setJustSignedOut(true)
  }, [])

  /* ------------------------------ mutations ----------------------------- */
  const addTransaction = useCallback(
    (txn) => {
      const record = {
        id: txn.id || `txn-${Date.now()}`,
        date: txn.date,
        description: txn.description,
        note: txn.note || '',
        category: txn.category,
        method: txn.method,
        amount: txn.amount,
      }
      setState((prev) => ({
        ...prev,
        transactions: [record, ...prev.transactions],
      }))
      return record
    },
    [],
  )

  const deleteTransaction = useCallback((id) => {
    setState((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((t) => t.id !== id),
    }))
  }, [])

  const updateBudgets = useCallback((nextBudgets) => {
    setState((prev) => ({ ...prev, budgets: { ...prev.budgets, ...nextBudgets } }))
  }, [])

  /* ------------------------------- loans -------------------------------- */

  const addLoan = useCallback((loan) => {
    const record = {
      status: 'Active',
      coApplicant: '—',
      moratorium: 'Not applicable',
      purpose: 'Added from the demo loan manager',
      paidMonths: 0,
      ...loan,
      id: loan.id || `loan-${Date.now()}`,
      accountNumber:
        loan.accountNumber ||
        `•••• ${String(Math.floor(1000 + Math.random() * 9000))}`,
    }
    setState((prev) => ({ ...prev, loans: [...prev.loans, record] }))
    return record
  }, [])

  const updateLoan = useCallback((id, patch) => {
    setState((prev) => ({
      ...prev,
      loans: prev.loans.map((loan) =>
        loan.id === id ? { ...loan, ...patch } : loan,
      ),
    }))
  }, [])

  const deleteLoan = useCallback((id) => {
    setState((prev) => ({
      ...prev,
      loans: prev.loans.filter((loan) => loan.id !== id),
    }))
  }, [])

  /**
   * Simulates one instalment: the interest portion goes to the lender, the
   * rest reduces the outstanding balance and the due date moves a month on.
   */
  const payEmi = useCallback((id) => {
    let receipt = null
    setState((prev) => ({
      ...prev,
      loans: prev.loans.map((loan) => {
        if (loan.id !== id) return loan
        const interest = Math.round(
          (loan.outstanding * loan.interestRate) / 12 / 100,
        )
        const principal = Math.max(0, loan.emi - interest)
        const outstanding = Math.max(0, loan.outstanding - principal)
        const next = new Date(`${loan.nextPaymentDate}T00:00:00`)
        next.setMonth(next.getMonth() + 1)
        const nextPaymentDate = `${next.getFullYear()}-${String(
          next.getMonth() + 1,
        ).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`
        receipt = { interest, principal, outstanding, nextPaymentDate }
        return {
          ...loan,
          outstanding,
          paidMonths: Math.min(loan.tenureMonths, loan.paidMonths + 1),
          nextPaymentDate,
          status: outstanding <= 0 ? 'Closed' : loan.status,
        }
      }),
    }))
    return receipt
  }, [])

  const updateProfile = useCallback((patch) => {
    setState((prev) => ({ ...prev, profile: { ...prev.profile, ...patch } }))
  }, [])

  /**
   * Changing the salary keeps the whole app coherent: the income credit is
   * re-written so cash-flow, savings rate and score all follow the new figure.
   */
  const setMonthlyIncome = useCallback((amount) => {
    const value = Math.max(0, Math.round(Number(amount) || 0))
    setState((prev) => ({
      ...prev,
      profile: { ...prev.profile, monthlyIncome: value },
      transactions: prev.transactions.map((txn) =>
        txn.amount > 0 && /salary|payroll|income/i.test(txn.description)
          ? { ...txn, amount: value }
          : txn,
      ),
    }))
  }, [])

  const markNotificationsRead = useCallback((id) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        id ? (n.id === id ? { ...n, unread: false } : n) : { ...n, unread: false },
      ),
    }))
  }, [])

  const pushChatMessage = useCallback((message) => {
    setState((prev) => ({
      ...prev,
      chat: [
        ...prev.chat,
        {
          id: `msg-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
          ...message,
        },
      ],
    }))
  }, [])

  const clearChat = useCallback(() => {
    setState((prev) => ({ ...prev, chat: DEFAULT_CHAT }))
  }, [])

  const toggleTheme = useCallback(() => {
    setState((prev) => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }))
  }, [])

  const setTheme = useCallback((theme) => {
    setState((prev) => ({ ...prev, theme }))
  }, [])

  const toggleSidebar = useCallback(() => {
    setState((prev) => ({ ...prev, sidebarCollapsed: !prev.sidebarCollapsed }))
  }, [])

  const resetDemoData = useCallback(() => {
    setState({ ...INITIAL_STATE })
  }, [])

  const openQuickAdd = useCallback(() => setQuickAddOpen(true), [])
  const closeQuickAdd = useCallback(() => setQuickAddOpen(false), [])

  /* ------------------------------- metrics ------------------------------ */
  const metrics = useMemo(() => {
    const { transactions, budgets, profile } = state

    const expenses = transactions.filter((t) => t.amount < 0)
    const incomeTxns = transactions.filter((t) => t.amount > 0)

    const totalExpenses = Math.abs(
      expenses.reduce((sum, t) => sum + t.amount, 0),
    )
    const totalIncome = incomeTxns.reduce((sum, t) => sum + t.amount, 0)
    const netSavings = totalIncome - totalExpenses
    const savingsRate = ratioPercent(netSavings, totalIncome)

    /** Live balance = seeded balance + everything added since */
    const netNow = transactions.reduce((sum, t) => sum + t.amount, 0)
    const balance = Math.round(BASE_BALANCE + (netNow - SEED_NET))

    /* per-category totals */
    const categoryTotals = CATEGORIES.reduce((acc, category) => {
      acc[category] = Math.abs(
        expenses
          .filter((t) => t.category === category)
          .reduce((sum, t) => sum + t.amount, 0),
      )
      return acc
    }, {})

    const budgetTotal = CATEGORIES.reduce(
      (sum, category) => sum + (Number(budgets[category]) || 0),
      0,
    )
    const budgetUsagePercent = ratioPercent(totalExpenses, budgetTotal)

    const categoryRows = CATEGORIES.map((category) => {
      const spent = categoryTotals[category] || 0
      const limit = Number(budgets[category]) || 0
      const used = ratioPercent(spent, limit)
      return {
        category,
        spent,
        limit,
        remaining: Math.max(0, limit - spent),
        usedPercent: used,
        lastMonth: LAST_MONTH_CATEGORIES[category] || 0,
        deltaVsLastMonth: ratioPercent(
          spent - (LAST_MONTH_CATEGORIES[category] || 0),
          LAST_MONTH_CATEGORIES[category] || 1,
        ),
      }
    })

    const largest = [...categoryRows].sort((a, b) => b.spent - a.spent)[0]
    const avgDailySpend = Math.round(totalExpenses / 30)

    const activeLoans = state.loans.filter((loan) => loan.status !== 'Closed')
    const emiTotal = activeLoans.reduce((sum, loan) => sum + loan.emi, 0)
    const loanOutstanding = state.loans.reduce(
      (sum, loan) => sum + loan.outstanding,
      0,
    )

    const score = financialScore({
      savingsRate,
      budgetUsage: budgetUsagePercent,
      debtToIncome: profile.debtToIncome,
      monthlyExpenses: totalExpenses,
      emergencyFund: profile.emergencyFund,
    })

    /* 6-month series — September is always live */
    const monthlySeries = MONTHLY_HISTORY.map((row) =>
      row.short === 'Sep'
        ? { ...row, income: totalIncome, expenses: totalExpenses, savings: netSavings }
        : row,
    )
    let running = SAVINGS_BASE
    const savingsGrowth = monthlySeries.map((row) => {
      running += row.savings
      return { month: row.short, saved: row.savings, cumulative: running }
    })

    /* daily spend — every day of the demo month, up to the latest entry */
    const monthPrefix = '2026-09'
    const monthTxns = expenses.filter((t) => t.date.startsWith(monthPrefix))
    const lastDay = Math.max(
      26,
      ...monthTxns.map((t) => Number(t.date.slice(8, 10)) || 1),
    )
    const dailySeries = Array.from({ length: lastDay }, (_, i) => {
      const day = i + 1
      const iso = `${monthPrefix}-${String(day).padStart(2, '0')}`
      const amount = monthTxns
        .filter((t) => t.date === iso)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)
      return { label: String(day), full: formatShortDate(iso), amount }
    })

    /* weekly buckets: 1-7, 8-14, 15-21, 22-28, 29+ */
    const weeklySeries = [
      { label: 'Week 1', range: '01 – 07 Sep' },
      { label: 'Week 2', range: '08 – 14 Sep' },
      { label: 'Week 3', range: '15 – 21 Sep' },
      { label: 'Week 4', range: '22 – 28 Sep' },
      { label: 'Week 5', range: '29 – 30 Sep' },
    ].map((week, index) => {
      const start = index * 7 + 1
      const end = index === 4 ? 30 : start + 6
      const amount = monthTxns
        .filter((t) => {
          const day = Number(t.date.slice(8, 10))
          return day >= start && day <= end
        })
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)
      return { ...week, amount }
    })

    const deltas = {
      balance: {
        value: ratioPercent(balance - BALANCE_TREND[4].value, BALANCE_TREND[4].value),
        direction: balance >= BALANCE_TREND[4].value ? 'up' : 'down',
      },
      income: {
        value: ratioPercent(totalIncome - 43000, 43000),
        direction: totalIncome >= 43000 ? 'up' : 'down',
      },
      expenses: {
        value: ratioPercent(totalExpenses - 30000, 30000),
        direction: totalExpenses >= 30000 ? 'up' : 'down',
      },
      // Spec-mandated dashboard figure for the savings card
      savings: {
        value: STAT_DELTAS.savings.value,
        direction: 'up',
      },
    }

    return {
      period: DEMO_MONTH,
      transactions,
      expenses,
      incomeTxns,
      totalExpenses,
      totalIncome,
      netSavings,
      savingsRate,
      balance,
      categoryTotals,
      categoryRows,
      loanCount: activeLoans.length,
      budgetTotal,
      budgetUsagePercent,
      budgetRemaining: budgetTotal - totalExpenses,
      avgDailySpend,
      largestCategory: largest,
      emiTotal,
      loanOutstanding,
      score,
      scoreLabel: scoreLabel(score.total),
      monthlySeries,
      savingsGrowth,
      dailySeries,
      weeklySeries,
      deltas,
      spendChange: ratioPercent(totalExpenses - SEED_EXPENSES, SEED_EXPENSES),
    }
  }, [state])

  const unreadCount = state.notifications.filter((n) => n.unread).length

  const value = useMemo(
    () => ({
      ...state,
      ...metrics,
      session,
      signIn,
      signOut,
      justSignedOut,
      unreadCount,
      quickAddOpen,
      openQuickAdd,
      closeQuickAdd,
      toasts,
      pushToast,
      dismissToast,
      addTransaction,
      deleteTransaction,
      updateBudgets,
      updateProfile,
      setMonthlyIncome,
      addLoan,
      updateLoan,
      deleteLoan,
      payEmi,
      markNotificationsRead,
      pushChatMessage,
      clearChat,
      toggleTheme,
      setTheme,
      toggleSidebar,
      resetDemoData,
    }),
    [
      state,
      metrics,
      session,
      signIn,
      signOut,
      justSignedOut,
      unreadCount,
      quickAddOpen,
      openQuickAdd,
      closeQuickAdd,
      toasts,
      pushToast,
      dismissToast,
      addTransaction,
      deleteTransaction,
      updateBudgets,
      updateProfile,
      setMonthlyIncome,
      addLoan,
      updateLoan,
      deleteLoan,
      payEmi,
      markNotificationsRead,
      pushChatMessage,
      clearChat,
      toggleTheme,
      setTheme,
      toggleSidebar,
      resetDemoData,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used inside <AppProvider>')
  return context
}

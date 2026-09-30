import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
import { isFirebaseConfigured } from '../config/firebase'
import {
  onAuthChange,
  subscribeToUserData,
  addTransactionFirestore,
  batchAddTransactionsFirestore,
  deleteTransactionFirestore,
  updateTransactionFirestore,
  batchDeleteTransactionsFirestore,
  updateBudgetsFirestore,
  addLoanFirestore,
  updateLoanFirestore,
  deleteLoanFirestore,
  updateProfileFirestore,
  logoutUser,
  resetAllUserDataFirestore,
} from '../services/firebaseService'
import {
  subscribeToRecurringRules,
  addRecurringRule as addRecurringRuleService,
  updateRecurringRule as updateRecurringRuleService,
  deleteRecurringRule as deleteRecurringRuleService,
  evaluateDueRecurringRules,
} from '../services/recurringService'

const STORAGE_KEY = 'spenance.state.v3'

/** Net and base seeds are 0 for clean production */
const SEED_NET = 0
const SEED_EXPENSES = 0
const BASE_BALANCE = 0
const SAVINGS_BASE = 0

const DEFAULT_CHAT = [
  {
    id: 'msg-0',
    role: 'ai',
    text: "Hi there! I'm your AI Financial Consultant. Add your expenses and income to get real-time insights.",
    highlights: [],
    time: '09:00',
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
    const mockTxnIds = new Set(
      Array.from({ length: 30 }, (_, i) => `txn-${String(i + 1).padStart(2, '0')}`)
    )
    const cleanTxns = Array.isArray(parsed.transactions)
      ? parsed.transactions.filter(
          (t) =>
            !mockTxnIds.has(t.id) &&
            t.id !== 'tx_salary_init' &&
            !t.id?.startsWith('income-salary-'),
        )
      : []
    const cleanLoans = Array.isArray(parsed.loans)
      ? parsed.loans.filter((l) => l.id !== 'loan-edu' && l.id !== 'loan-personal')
      : []
    const cleanProfile = {
      ...INITIAL_STATE.profile,
      ...(parsed.profile || {}),
    }
    if (cleanProfile.monthlyIncome === 45000) cleanProfile.monthlyIncome = 0
    if (cleanProfile.emergencyFund === 68000) cleanProfile.emergencyFund = 0
    if (cleanProfile.debtToIncome === 24) cleanProfile.debtToIncome = 0

    return {
      ...INITIAL_STATE,
      ...parsed,
      transactions: cleanTxns,
      loans: cleanLoans,
      profile: cleanProfile,
      budgets: parsed.budgets?.Food === 8000 ? DEFAULT_BUDGETS : (parsed.budgets || DEFAULT_BUDGETS),
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
  /* Recurring rules state */
  const [recurringRules, setRecurringRules] = useState([])
  const [recurringModalOpen, setRecurringModalOpen] = useState(false)

  /* ---------------------- Firebase Auth State Listener ------------------- */
  useEffect(() => {
    if (!isFirebaseConfigured) return

    const unsubscribe = onAuthChange((firebaseUser) => {
      if (firebaseUser) {
        const name = firebaseUser.displayName || firebaseUser.email.split('@')[0]
        const initials = name
          .split(/[\s._-]+/)
          .filter(Boolean)
          .map((part) => part[0])
          .slice(0, 2)
          .join('')
          .toUpperCase() || 'U'

        const nextSession = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name,
          initials,
          accountType: 'Firebase Account',
          isDemo: false,
          isFirebaseUser: true,
          signedInAt: new Date().toISOString(),
        }
        writeSession(nextSession, true)
        setSession(nextSession)
        setJustSignedOut(false)
        setState((prev) => ({
          ...prev,
          profile: {
            ...prev.profile,
            name: name || prev.profile.name,
            firstName: name ? name.split(' ')[0] : prev.profile.firstName,
            initials: initials || prev.profile.initials,
            email: firebaseUser.email || prev.profile.email,
            accountType: 'Firebase Cloud Account',
          },
        }))
      } else {
        setSession((prev) => {
          if (prev?.isFirebaseUser) {
            clearSession()
            return null
          }
          return prev
        })
      }
    })

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe()
    }
  }, [])

  /* ------------------ Firestore Realtime Sync Listener ------------------- */
  useEffect(() => {
    if (!session?.isFirebaseUser || !session?.uid) return

    const mockTxnIds = new Set(
      Array.from({ length: 30 }, (_, i) => `txn-${String(i + 1).padStart(2, '0')}`)
    )

    const unsubscribe = subscribeToUserData(session.uid, {
      onUserData: (data) => {
        if (!data) return
        setState((prev) => {
          const profile = data.profile ? { ...prev.profile, ...data.profile } : prev.profile
          if (profile.monthlyIncome === 45000) profile.monthlyIncome = 0
          if (profile.emergencyFund === 68000) profile.emergencyFund = 0
          if (profile.debtToIncome === 24) profile.debtToIncome = 0
          const budgets = data.budgets?.Food === 8000 ? DEFAULT_BUDGETS : (data.budgets || prev.budgets)
          return {
            ...prev,
            profile,
            budgets,
          }
        })
      },
      onTransactions: (txns) => {
        if (Array.isArray(txns)) {
          const clean = txns.filter(
            (t) =>
              !mockTxnIds.has(t.id) &&
              t.id !== 'tx_salary_init' &&
              !t.id?.startsWith('income-salary-'),
          )
          setState((prev) => ({ ...prev, transactions: clean }))
        }
      },
      onLoans: (loans) => {
        if (Array.isArray(loans)) {
          const clean = loans.filter((l) => l.id !== 'loan-edu' && l.id !== 'loan-personal')
          setState((prev) => ({ ...prev, loans: clean }))
        }
      },
    })

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe()
    }
  }, [session?.uid, session?.isFirebaseUser])

  /* ------------------- Recurring Rules Subscription --------------------- */
  useEffect(() => {
    const unsub = subscribeToRecurringRules(session?.uid, (rules) => {
      setRecurringRules(rules || [])
    })
    return () => {
      if (typeof unsub === 'function') unsub()
    }
  }, [session?.uid])

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
    if (nextSession?.name) {
      setState((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          name: nextSession.name,
          firstName: nextSession.name.split(' ')[0],
          initials: nextSession.initials || prev.profile.initials,
          email: nextSession.email || prev.profile.email,
        },
      }))
    }
  }, [])

  const signOut = useCallback(async () => {
    if (session?.isFirebaseUser) {
      try {
        await logoutUser()
      } catch (err) {
        console.warn('Firebase logout warning:', err)
      }
    }
    clearSession()
    setSession(null)
    setJustSignedOut(true)
  }, [session?.isFirebaseUser])

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

      if (session?.isFirebaseUser && session?.uid) {
        addTransactionFirestore(session.uid, record).catch(console.error)
      }

      return record
    },
    [session?.isFirebaseUser, session?.uid],
  )

  const addTransactionsBatch = useCallback(
    (newTxns) => {
      if (!Array.isArray(newTxns) || newTxns.length === 0) return []
      const prepared = newTxns.map((t, idx) => ({
        id: t.id || `txn-${Date.now()}-${idx}-${Math.random().toString(16).slice(2, 6)}`,
        date: t.date || new Date().toISOString().slice(0, 10),
        description:
          t.description ||
          t.rawDescription ||
          (t.note ? t.note.replace(/^Ref:\s*/i, '') : '') ||
          'Bank Transaction',
        note: t.note || '',
        category: t.category || 'Other',
        method: t.method || 'UPI',
        amount: Number(t.amount) || 0,
      }))

      setState((prev) => ({
        ...prev,
        transactions: [...prepared, ...prev.transactions],
      }))

      if (session?.isFirebaseUser && session?.uid) {
        batchAddTransactionsFirestore(session.uid, prepared).catch(console.error)
      }

      return prepared
    },
    [session?.isFirebaseUser, session?.uid],
  )

  /* Auto-process due recurring transactions once rules are loaded */
  const hasEvaluatedRecurring = useRef(false)
  useEffect(() => {
    if (!recurringRules || recurringRules.length === 0 || hasEvaluatedRecurring.current) return
    hasEvaluatedRecurring.current = true

    const { transactionsToCreate, updatedRules } = evaluateDueRecurringRules(recurringRules)
    if (transactionsToCreate.length > 0) {
      addTransactionsBatch(transactionsToCreate)
      for (const rule of updatedRules) {
        updateRecurringRuleService(session?.uid, rule.id, {
          lastRunDate: rule.lastRunDate,
          nextRunDate: rule.nextRunDate,
        }).catch(console.error)
      }
      setRecurringRules((prev) =>
        prev.map((r) => {
          const match = updatedRules.find((u) => u.id === r.id)
          return match ? { ...r, ...match } : r
        }),
      )
      pushToast({
        title: 'Auto-Recurring Run ⚡',
        body: `Processed ${transactionsToCreate.length} automated scheduled transactions.`,
        tone: 'emerald',
      })
    }
  }, [recurringRules, addTransactionsBatch, session?.uid, pushToast])

  const deleteTransaction = useCallback(
    (id) => {
      setState((prev) => ({
        ...prev,
        transactions: prev.transactions.filter((t) => t.id !== id),
      }))

      if (session?.isFirebaseUser && session?.uid) {
        deleteTransactionFirestore(session.uid, id).catch(console.error)
      }
    },
    [session?.isFirebaseUser, session?.uid],
  )

  const updateTransaction = useCallback(
    (id, patch) => {
      setState((prev) => ({
        ...prev,
        transactions: prev.transactions.map((t) =>
          t.id === id ? { ...t, ...patch } : t
        ),
      }))

      if (session?.isFirebaseUser && session?.uid) {
        updateTransactionFirestore(session.uid, id, patch).catch(console.error)
      }
    },
    [session?.isFirebaseUser, session?.uid],
  )

  const deleteTransactionsBatch = useCallback(
    (ids) => {
      if (!Array.isArray(ids) || ids.length === 0) return
      const idSet = new Set(ids)
      setState((prev) => ({
        ...prev,
        transactions: prev.transactions.filter((t) => !idSet.has(t.id)),
      }))

      if (session?.isFirebaseUser && session?.uid) {
        batchDeleteTransactionsFirestore(session.uid, ids).catch(console.error)
      }
    },
    [session?.isFirebaseUser, session?.uid],
  )

  const deleteTransactionsByAmount = useCallback(
    (targetAmount) => {
      const target = Math.abs(targetAmount)
      const matchingIds = state.transactions
        .filter((t) => Math.abs(t.amount) === target)
        .map((t) => t.id)
      if (matchingIds.length === 0) return 0
      deleteTransactionsBatch(matchingIds)
      return matchingIds.length
    },
    [state.transactions, deleteTransactionsBatch],
  )

  const deleteTransactionsByDescription = useCallback(
    (targetDesc) => {
      const matchingIds = state.transactions
        .filter((t) => t.description === targetDesc)
        .map((t) => t.id)
      if (matchingIds.length === 0) return 0
      deleteTransactionsBatch(matchingIds)
      return matchingIds.length
    },
    [state.transactions, deleteTransactionsBatch],
  )

  const updateBudgets = useCallback(
    (nextBudgets) => {
      setState((prev) => {
        const merged = { ...prev.budgets, ...nextBudgets }
        if (session?.isFirebaseUser && session?.uid) {
          updateBudgetsFirestore(session.uid, merged).catch(console.error)
        }
        return { ...prev, budgets: merged }
      })
    },
    [session?.isFirebaseUser, session?.uid],
  )

  /* ------------------------------- loans -------------------------------- */

  const addLoan = useCallback(
    (loan) => {
      const record = {
        status: 'Active',
        coApplicant: '—',
        moratorium: 'Not applicable',
        purpose: 'Added from loan manager',
        paidMonths: 0,
        ...loan,
        id: loan.id || `loan-${Date.now()}`,
        accountNumber:
          loan.accountNumber ||
          `•••• ${String(Math.floor(1000 + Math.random() * 9000))}`,
      }
      setState((prev) => ({ ...prev, loans: [...prev.loans, record] }))

      if (session?.isFirebaseUser && session?.uid) {
        addLoanFirestore(session.uid, record).catch(console.error)
      }

      return record
    },
    [session?.isFirebaseUser, session?.uid],
  )

  const updateLoan = useCallback(
    (id, patch) => {
      setState((prev) => ({
        ...prev,
        loans: prev.loans.map((loan) =>
          loan.id === id ? { ...loan, ...patch } : loan,
        ),
      }))

      if (session?.isFirebaseUser && session?.uid) {
        updateLoanFirestore(session.uid, id, patch).catch(console.error)
      }
    },
    [session?.isFirebaseUser, session?.uid],
  )

  const deleteLoan = useCallback(
    (id) => {
      setState((prev) => ({
        ...prev,
        loans: prev.loans.filter((loan) => loan.id !== id),
      }))

      if (session?.isFirebaseUser && session?.uid) {
        deleteLoanFirestore(session.uid, id).catch(console.error)
      }
    },
    [session?.isFirebaseUser, session?.uid],
  )

  /**
   * Simulates one instalment: the interest portion goes to the lender, the
   * rest reduces the outstanding balance and the due date moves a month on.
   */
  const payEmi = useCallback(
    (id) => {
      let receipt = null
      let updatedPatch = null
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
          updatedPatch = {
            outstanding,
            paidMonths: Math.min(loan.tenureMonths, loan.paidMonths + 1),
            nextPaymentDate,
            status: outstanding <= 0 ? 'Closed' : loan.status,
          }
          return {
            ...loan,
            ...updatedPatch,
          }
        }),
      }))

      if (session?.isFirebaseUser && session?.uid && updatedPatch) {
        updateLoanFirestore(session.uid, id, updatedPatch).catch(console.error)
      }

      return receipt
    },
    [session?.isFirebaseUser, session?.uid],
  )

  const updateProfile = useCallback(
    (patch) => {
      setState((prev) => ({ ...prev, profile: { ...prev.profile, ...patch } }))
      if (session?.isFirebaseUser && session?.uid) {
        updateProfileFirestore(session.uid, patch).catch(console.error)
      }
    },
    [session?.isFirebaseUser, session?.uid],
  )

  /**
   * Updates monthly income in the user profile.
   * Total income, savings, savings rate, cash flow charts, and score automatically derive from this.
   */
  const setMonthlyIncome = useCallback(
    (amount) => {
      const value = Math.max(0, Math.round(Number(amount) || 0))
      setState((prev) => {
        const cleanedTransactions = prev.transactions.filter(
          (t) => t.id !== 'tx_salary_init' && !t.id?.startsWith('income-salary-'),
        )
        return {
          ...prev,
          profile: { ...prev.profile, monthlyIncome: value },
          transactions: cleanedTransactions,
        }
      })
      if (session?.isFirebaseUser && session?.uid) {
        updateProfileFirestore(session.uid, { monthlyIncome: value }).catch(console.error)
      }
    },
    [session?.isFirebaseUser, session?.uid],
  )

  /**
   * Sets the user's base opening balance (bank/cash/wallets).
   */
  const setOpeningBalance = useCallback(
    (amount) => {
      const value = Math.round(Number(amount) || 0)
      setState((prev) => ({
        ...prev,
        profile: { ...prev.profile, openingBalance: value },
      }))
      if (session?.isFirebaseUser && session?.uid) {
        updateProfileFirestore(session.uid, { openingBalance: value }).catch(console.error)
      }
    },
    [session?.isFirebaseUser, session?.uid],
  )

  const addRecurring = useCallback(
    async (rule) => {
      const created = await addRecurringRuleService(session?.uid, rule)
      setRecurringRules((prev) => [created, ...prev.filter((r) => r.id !== created.id)])
      pushToast({
        title: 'Schedule Created',
        body: `Recurring schedule for ${rule.title} active.`,
        tone: 'emerald',
      })
      return created
    },
    [session?.uid, pushToast],
  )

  const updateRecurring = useCallback(
    async (id, patch) => {
      await updateRecurringRuleService(session?.uid, id, patch)
      setRecurringRules((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
    },
    [session?.uid],
  )

  const deleteRecurring = useCallback(
    async (id) => {
      await deleteRecurringRuleService(session?.uid, id)
      setRecurringRules((prev) => prev.filter((r) => r.id !== id))
      pushToast({
        title: 'Schedule Removed',
        body: 'Recurring transaction schedule deleted.',
        tone: 'slate',
      })
    },
    [session?.uid, pushToast],
  )

  const processDueRecurringManually = useCallback(async () => {
    const { transactionsToCreate, updatedRules } = evaluateDueRecurringRules(recurringRules)
    if (transactionsToCreate.length > 0) {
      addTransactionsBatch(transactionsToCreate)
      for (const rule of updatedRules) {
        await updateRecurringRuleService(session?.uid, rule.id, {
          lastRunDate: rule.lastRunDate,
          nextRunDate: rule.nextRunDate,
        })
      }
      setRecurringRules((prev) =>
        prev.map((r) => {
          const match = updatedRules.find((u) => u.id === r.id)
          return match ? { ...r, ...match } : r
        }),
      )
      pushToast({
        title: 'Processed Due Schedules ⚡',
        body: `Recorded ${transactionsToCreate.length} automated transactions.`,
        tone: 'emerald',
      })
    } else {
      pushToast({
        title: 'All Schedules Up to Date',
        body: 'No pending recurring transactions are due today.',
        tone: 'sky',
      })
    }
  }, [recurringRules, addTransactionsBatch, session?.uid, pushToast])

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

  const resetAllUserData = useCallback(async () => {
    setState({
      ...INITIAL_STATE,
      transactions: [],
      loans: [],
      budgets: DEFAULT_BUDGETS,
      profile: {
        ...INITIAL_STATE.profile,
        monthlyIncome: 0,
        emergencyFund: 0,
        debtToIncome: 0,
      },
    })
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {}
    if (session?.isFirebaseUser && session?.uid) {
      await resetAllUserDataFirestore(session.uid)
    }
  }, [session?.isFirebaseUser, session?.uid])

  const resetDemoData = resetAllUserData

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
    const totalIncome = Math.max(
      Number(profile.monthlyIncome) || 0,
      incomeTxns.reduce((sum, t) => sum + t.amount, 0),
    )
    const netSavings = totalIncome - totalExpenses
    const savingsRate = ratioPercent(netSavings, totalIncome)

    /** Live balance = user opening/starting bank balance + net transaction amounts */
    const baseBalance = Number(profile.openingBalance) || 0
    const netNow = transactions.reduce((sum, t) => sum + t.amount, 0)
    const balance = Math.round(baseBalance + netNow)

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

    const dynamicDebtToIncome = totalIncome > 0
      ? ratioPercent(emiTotal, totalIncome)
      : (Number(profile.debtToIncome) || 0)

    const score = financialScore({
      savingsRate,
      budgetUsage: budgetUsagePercent,
      debtToIncome: dynamicDebtToIncome,
      monthlyExpenses: totalExpenses,
      hasActiveLoans: activeLoans.length > 0,
      hasTransactions: transactions.length > 0 || totalIncome > 0,
    })

    /* 6-month series — current month is dynamic and live */
    const currentMonthShort = new Date().toLocaleDateString('en-US', { month: 'short' })
    const monthlySeries = MONTHLY_HISTORY.map((row, idx) =>
      row.short === currentMonthShort || idx === MONTHLY_HISTORY.length - 1
        ? { ...row, income: totalIncome, expenses: totalExpenses, savings: netSavings }
        : row,
    )
    let running = SAVINGS_BASE
    const savingsGrowth = monthlySeries.map((row) => {
      running += row.savings
      return { month: row.short, saved: row.savings, cumulative: running }
    })

    /* daily spend — current month to today */
    const now = new Date()
    const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const monthTxns = expenses.filter((t) => t.date && t.date.startsWith(monthPrefix))
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const currentDay = now.getDate()
    const lastDay = Math.max(
      currentDay,
      ...monthTxns.map((t) => Number(t.date?.slice(8, 10)) || 1),
    )
    const dailySeries = Array.from({ length: lastDay }, (_, i) => {
      const day = i + 1
      const iso = `${monthPrefix}-${String(day).padStart(2, '0')}`
      const amount = monthTxns
        .filter((t) => t.date === iso)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)
      return { label: String(day), full: formatShortDate(iso), amount }
    })

    /* weekly buckets for current month */
    const monthShort = now.toLocaleDateString('en-US', { month: 'short' })
    const weeklySeries = [
      { label: 'Week 1', range: `01 – 07 ${monthShort}` },
      { label: 'Week 2', range: `08 – 14 ${monthShort}` },
      { label: 'Week 3', range: `15 – 21 ${monthShort}` },
      { label: 'Week 4', range: `22 – 28 ${monthShort}` },
      { label: 'Week 5', range: `29 – ${daysInMonth} ${monthShort}` },
    ].map((week, index) => {
      const start = index * 7 + 1
      const end = index === 4 ? daysInMonth : start + 6
      const amount = monthTxns
        .filter((t) => {
          const day = Number(t.date?.slice(8, 10))
          return day >= start && day <= end
        })
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)
      return { ...week, amount }
    })

    const prevBalance = BALANCE_TREND[4]?.value ?? 0
    const deltas = {
      balance: {
        value: prevBalance > 0 ? ratioPercent(balance - prevBalance, prevBalance) : 0,
        direction: balance >= prevBalance ? 'up' : 'down',
      },
      income: {
        value: 0,
        direction: 'neutral',
      },
      expenses: {
        value: 0,
        direction: 'neutral',
      },
      savings: {
        value: 0,
        direction: 'neutral',
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
      debtToIncome: dynamicDebtToIncome,
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
      addTransactionsBatch,
      updateTransaction,
      deleteTransaction,
      deleteTransactionsBatch,
      deleteTransactionsByAmount,
      deleteTransactionsByDescription,
      updateBudgets,
      updateProfile,
      setMonthlyIncome,
      setOpeningBalance,
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
      isFirebaseConfigured,
      recurringRules,
      recurringModalOpen,
      setRecurringModalOpen,
      openRecurringModal: () => setRecurringModalOpen(true),
      closeRecurringModal: () => setRecurringModalOpen(false),
      addRecurring,
      updateRecurring,
      deleteRecurring,
      processDueRecurringManually,
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
      addTransactionsBatch,
      updateTransaction,
      deleteTransaction,
      deleteTransactionsBatch,
      deleteTransactionsByAmount,
      deleteTransactionsByDescription,
      updateBudgets,
      updateProfile,
      setMonthlyIncome,
      setOpeningBalance,
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
      recurringRules,
      recurringModalOpen,
      addRecurring,
      updateRecurring,
      deleteRecurring,
      processDueRecurringManually,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used inside <AppProvider>')
  return context
}

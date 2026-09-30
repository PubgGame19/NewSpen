import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, Calendar, Plus, Tag, Wallet, CreditCard, ArrowDownLeft, ArrowUpRight, TrendingUp } from 'lucide-react'
import { CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from '../data/mockData'
import { useApp } from '../context/AppContext'
import { budgetStatus } from '../utils/finance'
import { formatINR, formatLongDate, formatPercentDown } from '../utils/format'
import Modal from './ui/Modal'
import Button from './ui/Button'
import CategoryIcon from './CategoryIcon'

const getTodayIso = () => new Date().toISOString().split('T')[0]

const getEmptyForm = () => ({
  type: 'expense', // 'expense' or 'income'
  description: '',
  amount: '',
  category: 'Food',
  date: getTodayIso(),
  method: 'UPI',
  note: '',
})

export default function AddExpenseModal({ open, onClose }) {
  const {
    addTransaction,
    pushToast,
    categoryRows,
    totalExpenses,
    budgetTotal,
  } = useApp()
  const [form, setForm] = useState(getEmptyForm)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (open) {
      setForm(getEmptyForm())
      setErrors({})
    }
  }, [open])

  const isExpense = form.type === 'expense'
  const activeCategories = isExpense ? CATEGORIES : INCOME_CATEGORIES
  const row = isExpense ? categoryRows.find((item) => item.category === form.category) : null
  const amount = Number(form.amount) || 0

  const preview = useMemo(() => {
    if (!isExpense || !row) return null
    const nextSpent = row.spent + amount
    const percent = row.limit ? (nextSpent / row.limit) * 100 : 0
    return {
      nextSpent,
      percent,
      status: budgetStatus(percent),
      overall: budgetTotal
        ? ((totalExpenses + amount) / budgetTotal) * 100
        : 0,
    }
  }, [isExpense, row, amount, budgetTotal, totalExpenses])

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const setTransactionType = (nextType) => {
    setForm((prev) => ({
      ...prev,
      type: nextType,
      category: nextType === 'expense' ? 'Food' : 'Salary',
    }))
  }

  const validate = () => {
    const next = {}
    if (!form.description.trim()) next.description = 'Enter a description'
    if (!amount || amount <= 0) next.amount = 'Enter an amount above ₹1'
    if (amount > 10000000) next.amount = 'Amount looks too large'
    if (!form.date) next.date = 'Pick a date'
    if (!form.method) next.method = 'Choose a payment method'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = (event) => {
    event.preventDefault()
    if (!validate()) return

    const signedAmount = isExpense ? -Math.abs(amount) : Math.abs(amount)

    addTransaction({
      date: form.date,
      description: form.description.trim(),
      note: form.note.trim(),
      category: form.category,
      method: form.method,
      amount: signedAmount,
    })

    pushToast({
      title: isExpense ? 'Expense added' : 'Income recorded! 💰',
      body: `${form.description.trim()} · ${isExpense ? '-' : '+'}${formatINR(amount)} logged under ${form.category}.`,
      tone: isExpense ? 'amber' : 'emerald',
    })

    onClose?.()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Transaction"
      description="Record a new expense or income credit to keep your ledger accurate."
      icon={Plus}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="add-expense-form">
            {isExpense ? 'Add Expense' : 'Add Income (+)'}
          </Button>
        </>
      }
    >
      <form id="add-expense-form" onSubmit={submit} className="space-y-5">
        {/* Type toggle: Expense vs Income */}
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setTransactionType('expense')}
            className={`flex items-center justify-center gap-2 rounded-lg py-2 text-[12.5px] font-semibold transition ${
              isExpense
                ? 'bg-white text-rose-600 shadow-sm dark:bg-slate-900 dark:text-rose-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <ArrowUpRight size={15} /> Expense (-)
          </button>
          <button
            type="button"
            onClick={() => setTransactionType('income')}
            className={`flex items-center justify-center gap-2 rounded-lg py-2 text-[12.5px] font-semibold transition ${
              !isExpense
                ? 'bg-white text-emerald-600 shadow-sm dark:bg-slate-900 dark:text-emerald-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <ArrowDownLeft size={15} /> Income (+)
          </button>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="eyebrow mb-1.5 block" htmlFor="exp-description">
              Description
            </label>
            <input
              id="exp-description"
              className="input"
              placeholder="e.g. Swiggy, Metro recharge, Electricity bill"
              value={form.description}
              onChange={(event) => update('description', event.target.value)}
              autoFocus
            />
            {errors.description ? (
              <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
                <AlertCircle size={12} /> {errors.description}
              </p>
            ) : null}
          </div>

          <div>
            <label className="eyebrow mb-1.5 block" htmlFor="exp-amount">
              Amount (₹)
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                ₹
              </span>
              <input
                id="exp-amount"
                type="number"
                min="1"
                step="any"
                inputMode="numeric"
                className="input tabular pl-8"
                placeholder="0"
                value={form.amount}
                onChange={(event) => update('amount', event.target.value)}
              />
            </div>
            {errors.amount ? (
              <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
                <AlertCircle size={12} /> {errors.amount}
              </p>
            ) : null}
          </div>

          <div>
            <label className="eyebrow mb-1.5 block" htmlFor="exp-date">
              Date
            </label>
            <div className="relative">
              <Calendar
                size={15}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="exp-date"
                type="date"
                className="input"
                value={form.date}
                onChange={(event) => update('date', event.target.value)}
              />
            </div>
            {errors.date ? (
              <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
                <AlertCircle size={12} /> {errors.date}
              </p>
            ) : null}
          </div>

          <div>
            <label className="eyebrow mb-1.5 block" htmlFor="exp-category">
              Category
            </label>
            <div className="relative">
              <Tag
                size={15}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <select
                id="exp-category"
                className="input appearance-none pr-10"
                value={form.category}
                onChange={(event) => update('category', event.target.value)}
              >
                {activeCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="eyebrow mb-1.5 block" htmlFor="exp-method">
              Payment Method
            </label>
            <div className="relative">
              <CreditCard
                size={15}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <select
                id="exp-method"
                className="input appearance-none pr-10"
                value={form.method}
                onChange={(event) => update('method', event.target.value)}
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="eyebrow mb-1.5 block" htmlFor="exp-note">
              Note <span className="font-normal normal-case">(optional)</span>
            </label>
            <input
              id="exp-note"
              className="input"
              placeholder={isExpense ? "What was this for?" : "Payer / Client name, project details"}
              value={form.note}
              onChange={(event) => update('note', event.target.value)}
            />
          </div>
        </div>

        {/* live budget / income preview */}
        {isExpense ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
            <div className="flex items-center gap-3">
              <CategoryIcon
                category={form.category}
                merchant={false}
                description=""
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <p className="heading text-[13px] font-semibold">
                  {form.category} budget impact
                </p>
                <p className="muted text-[11px]">
                  {formatLongDate(form.date)} · {form.method}
                </p>
              </div>
              {preview ? (
                <span className={`badge ${preview.status.chip}`}>
                  {Math.round(preview.percent)}% used
                </span>
              ) : null}
            </div>

            {preview ? (
              <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                <div className="rounded-xl bg-white p-3 dark:bg-slate-900">
                  <p className="muted text-[10px] font-semibold uppercase tracking-wide">
                    Category after
                  </p>
                  <p className="tabular heading mt-0.5 text-sm font-bold">
                    {formatINR(preview.nextSpent)}
                    <span className="muted text-[11px] font-medium">
                      {' '}
                      / {formatINR(row?.limit || 0)}
                    </span>
                  </p>
                </div>
                <div className="rounded-xl bg-white p-3 dark:bg-slate-900">
                  <p className="muted text-[10px] font-semibold uppercase tracking-wide">
                    Monthly budget after
                  </p>
                  <p className="tabular heading mt-0.5 text-sm font-bold">
                    {formatPercentDown(preview.overall)}
                  </p>
                </div>
                <div className="rounded-xl bg-white p-3 dark:bg-slate-900">
                  <p className="muted text-[10px] font-semibold uppercase tracking-wide">
                    Status
                  </p>
                  <p className="heading mt-0.5 text-sm font-bold">
                    {preview.status.label}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="heading text-[13px] font-semibold text-emerald-900 dark:text-emerald-300">
                Positive Cash Inflow (+{formatINR(amount || 0)})
              </p>
              <p className="muted text-[11px] leading-snug">
                This will be credited to your ledger on {formatLongDate(form.date)}, increasing your live Total Balance and monthly Net Savings.
              </p>
            </div>
          </div>
        )}

        <p className="flex items-start gap-2 text-[11px] leading-snug text-slate-500 dark:text-slate-400">
          <Wallet size={13} className="mt-px shrink-0" />
          Saved to your browser via localStorage — the dashboard, expenses,
          budget and insights pages all update instantly.
        </p>
      </form>
    </Modal>
  )
}

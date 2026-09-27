import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, Calendar, Plus, Tag, Wallet, CreditCard } from 'lucide-react'
import { CATEGORIES, PAYMENT_METHODS } from '../data/mockData'
import { useApp } from '../context/AppContext'
import { budgetStatus } from '../utils/finance'
import { formatINR, formatLongDate, formatPercentDown } from '../utils/format'
import Modal from './ui/Modal'
import Button from './ui/Button'
import CategoryIcon from './CategoryIcon'

const DEMO_TODAY = '2026-09-27'

const EMPTY = {
  description: '',
  amount: '',
  category: 'Food',
  date: DEMO_TODAY,
  method: 'UPI',
  note: '',
}

export default function AddExpenseModal({ open, onClose }) {
  const {
    addTransaction,
    pushToast,
    categoryRows,
    totalExpenses,
    budgetTotal,
  } = useApp()
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (open) {
      setForm(EMPTY)
      setErrors({})
    }
  }, [open])

  const row = categoryRows.find((item) => item.category === form.category)
  const amount = Number(form.amount) || 0

  const preview = useMemo(() => {
    if (!row) return null
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
  }, [row, amount, budgetTotal, totalExpenses])

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const validate = () => {
    const next = {}
    if (!form.description.trim()) next.description = 'Enter a description'
    if (!amount || amount <= 0) next.amount = 'Enter an amount above ₹1'
    if (amount > 1000000) next.amount = 'Amount looks too large'
    if (!form.date) next.date = 'Pick a date'
    if (!form.method) next.method = 'Choose a payment method'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = (event) => {
    event.preventDefault()
    if (!validate()) return

    addTransaction({
      date: form.date,
      description: form.description.trim(),
      note: form.note.trim(),
      category: form.category,
      method: form.method,
      amount: -Math.abs(amount),
    })

    pushToast({
      title: 'Expense added',
      body: `${form.description.trim()} · ${formatINR(amount, {
        sign: true,
      })} recorded under ${form.category}.`,
      tone: 'emerald',
    })

    onClose?.()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Expense"
      description="Record a new spend and keep your September budget accurate."
      icon={Plus}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="add-expense-form">
            Add Expense
          </Button>
        </>
      }
    >
      <form id="add-expense-form" onSubmit={submit} className="space-y-5">
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
                {CATEGORIES.map((category) => (
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
              placeholder="What was this for?"
              value={form.note}
              onChange={(event) => update('note', event.target.value)}
            />
          </div>
        </div>

        {/* live budget preview */}
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

        <p className="flex items-start gap-2 text-[11px] leading-snug text-slate-500 dark:text-slate-400">
          <Wallet size={13} className="mt-px shrink-0" />
          Saved to your browser via localStorage — the dashboard, expenses,
          budget and insights pages all update instantly.
        </p>
      </form>
    </Modal>
  )
}

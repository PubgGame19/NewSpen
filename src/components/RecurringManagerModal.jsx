import { useState, useMemo } from 'react'
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  Check,
  Clock,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Repeat,
  Trash2,
  X,
  Zap,
} from 'lucide-react'
import { CATEGORIES, PAYMENT_METHODS } from '../data/mockData'
import { formatINR, formatLongDate } from '../utils/format'
import Button from './ui/Button'
import Badge from './ui/Badge'

export default function RecurringManagerModal({
  isOpen,
  onClose,
  recurringRules = [],
  onAddRule,
  onUpdateRule,
  onDeleteRule,
  onProcessDue,
}) {
  const [isAdding, setIsAdding] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    type: 'expense', // 'income' or 'expense'
    amount: '',
    category: 'Housing',
    method: 'Auto-Debit',
    frequency: 'monthly',
    dayOfMonth: 1,
  })

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'expense',
      amount: '',
      category: 'Housing',
      method: 'Auto-Debit',
      frequency: 'monthly',
      dayOfMonth: 1,
    })
    setIsAdding(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.amount || Number(formData.amount) <= 0) return

    const rawAmt = Math.abs(Number(formData.amount))
    const signedAmt = formData.type === 'income' ? rawAmt : -rawAmt

    await onAddRule({
      title: formData.title.trim(),
      amount: signedAmt,
      category: formData.type === 'income' ? 'Salary' : formData.category,
      method: formData.method,
      frequency: formData.frequency,
      dayOfMonth: Number(formData.dayOfMonth) || 1,
      active: true,
    })

    resetForm()
  }

  const handleProcessDueNow = async () => {
    setProcessing(true)
    try {
      await onProcessDue()
    } finally {
      setProcessing(false)
    }
  }

  const totals = useMemo(() => {
    let inflow = 0
    let outflow = 0
    recurringRules.forEach((r) => {
      if (!r.active) return
      const amt = Number(r.amount) || 0
      if (amt > 0) inflow += amt
      else outflow += Math.abs(amt)
    })
    return { inflow, outflow, net: inflow - outflow }
  }, [recurringRules])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade">
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Repeat size={20} />
            </span>
            <div>
              <h3 className="heading text-[16px] font-bold">
                Automated Recurring Schedules
              </h3>
              <p className="muted text-[12px]">
                Auto-process monthly salary, rent, bills, and loan deductions.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Summary metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-50/40 p-3.5 dark:bg-emerald-950/20">
              <div className="flex items-center justify-between">
                <span className="muted text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Monthly Inflow
                </span>
                <ArrowDownLeft size={16} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="tabular heading text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {formatINR(totals.inflow)}
              </p>
              <p className="muted text-[10.5px] mt-0.5">Automated salary & income</p>
            </div>

            <div className="rounded-xl border border-rose-500/20 bg-rose-50/40 p-3.5 dark:bg-rose-950/20">
              <div className="flex items-center justify-between">
                <span className="muted text-[11px] font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                  Monthly Outflow
                </span>
                <ArrowUpRight size={16} className="text-rose-600 dark:text-rose-400" />
              </div>
              <p className="tabular heading text-lg font-bold text-rose-600 dark:text-rose-400 mt-1">
                {formatINR(totals.outflow)}
              </p>
              <p className="muted text-[10.5px] mt-0.5">Rent, utilities & auto-debits</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="flex items-center justify-between">
                <span className="muted text-[11px] font-semibold uppercase tracking-wider">
                  Active Schedules
                </span>
                <Zap size={16} className="text-indigo-500" />
              </div>
              <p className="tabular heading text-lg font-bold mt-1">
                {recurringRules.filter((r) => r.active).length} Rules
              </p>
              <p className="muted text-[10.5px] mt-0.5">
                Net: {totals.net >= 0 ? '+' : ''}{formatINR(totals.net)}/mo
              </p>
            </div>
          </div>

          {/* New rule form */}
          {isAdding ? (
            <form
              onSubmit={handleSave}
              className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 sm:p-5 space-y-4 animate-fade"
            >
              <div className="flex items-center justify-between">
                <h4 className="heading text-[14px] font-bold text-emerald-800 dark:text-emerald-300">
                  Create Recurring Rule
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="muted hover:text-slate-700 dark:hover:text-slate-300 text-[11px]"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="eyebrow block mb-1" htmlFor="rec-title">
                    Schedule Name
                  </label>
                  <input
                    id="rec-title"
                    type="text"
                    required
                    placeholder="e.g. Monthly Salary, House Rent, Netflix"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, title: e.target.value }))
                    }
                    className="input text-[12.5px]"
                  />
                </div>

                <div>
                  <label className="eyebrow block mb-1">Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          type: 'expense',
                          category: 'Housing',
                        }))
                      }
                      className={`rounded-xl border py-2 text-[12px] font-semibold transition ${
                        formData.type === 'expense'
                          ? 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      Expense (-)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          type: 'income',
                          category: 'Salary',
                        }))
                      }
                      className={`rounded-xl border py-2 text-[12px] font-semibold transition ${
                        formData.type === 'income'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      Income (+)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="eyebrow block mb-1" htmlFor="rec-amt">
                    Amount (₹)
                  </label>
                  <input
                    id="rec-amt"
                    type="number"
                    min="1"
                    step="any"
                    required
                    placeholder="e.g. 25000"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, amount: e.target.value }))
                    }
                    className="input text-[12.5px] tabular font-semibold"
                  />
                </div>

                {formData.type === 'expense' ? (
                  <div>
                    <label className="eyebrow block mb-1" htmlFor="rec-cat">
                      Category
                    </label>
                    <select
                      id="rec-cat"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, category: e.target.value }))
                      }
                      className="input text-[12.5px]"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.name} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="eyebrow block mb-1">Category</label>
                    <div className="input flex items-center bg-slate-100 dark:bg-slate-800 text-[12.5px] font-medium text-emerald-600 dark:text-emerald-400">
                      Salary / Inflow
                    </div>
                  </div>
                )}

                <div>
                  <label className="eyebrow block mb-1" htmlFor="rec-day">
                    Day of Month (1 - 31)
                  </label>
                  <input
                    id="rec-day"
                    type="number"
                    min="1"
                    max="31"
                    value={formData.dayOfMonth}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        dayOfMonth: Math.min(31, Math.max(1, Number(e.target.value) || 1)),
                      }))
                    }
                    className="input text-[12.5px]"
                  />
                </div>

                <div>
                  <label className="eyebrow block mb-1" htmlFor="rec-method">
                    Payment Method
                  </label>
                  <select
                    id="rec-method"
                    value={formData.method}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, method: e.target.value }))
                    }
                    className="input text-[12.5px]"
                  >
                    {['Auto-Debit', 'UPI', 'Net Banking', 'Standing Instruction'].map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
                <Button variant="primary" icon={Check} type="submit">
                  Save Schedule
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button variant="primary" icon={Plus} onClick={() => setIsAdding(true)}>
                Add Recurring Schedule
              </Button>
              <Button
                variant="outline"
                icon={RefreshCw}
                onClick={handleProcessDueNow}
                disabled={processing}
                className={processing ? 'animate-spin' : ''}
              >
                {processing ? 'Processing...' : 'Run Due Schedules Now'}
              </Button>
            </div>
          )}

          {/* List of rules */}
          <div className="space-y-2.5">
            <h4 className="heading text-[13px] font-semibold text-slate-700 dark:text-slate-300">
              Configured Schedules ({recurringRules.length})
            </h4>

            {recurringRules.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-800">
                <Repeat size={32} className="mx-auto text-slate-400" />
                <h5 className="heading mt-2 text-[14px] font-semibold">
                  No recurring schedules yet
                </h5>
                <p className="muted mt-1 text-[12px] max-w-sm mx-auto">
                  Add recurring transactions like your monthly salary credit, house rent, or subscriptions so SPENANCE auto-records them.
                </p>
                <Button
                  variant="outline"
                  icon={Plus}
                  onClick={() => setIsAdding(true)}
                  className="mt-4"
                >
                  Create Your First Schedule
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800 overflow-hidden">
                {recurringRules.map((rule) => {
                  const isIncome = Number(rule.amount) > 0
                  return (
                    <div
                      key={rule.id}
                      className={`flex flex-wrap items-center justify-between gap-3 p-3.5 transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40 ${
                        !rule.active ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateRule(rule.id, { active: !rule.active })
                          }
                          title={rule.active ? 'Pause Schedule' : 'Resume Schedule'}
                          className={`grid h-8 w-8 place-items-center rounded-lg transition ${
                            rule.active
                              ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200 dark:bg-slate-800'
                          }`}
                        >
                          {rule.active ? <Play size={14} /> : <Pause size={14} />}
                        </button>

                        <div>
                          <div className="flex items-center gap-2">
                            <p className="heading text-[13px] font-semibold">
                              {rule.title}
                            </p>
                            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                              {rule.category}
                            </span>
                            {!rule.active && (
                              <span className="rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-600">
                                Paused
                              </span>
                            )}
                          </div>
                          <p className="muted mt-0.5 text-[11px] flex items-center gap-1.5">
                            <Clock size={11} />
                            Every {rule.dayOfMonth}
                            {rule.dayOfMonth === 1
                              ? 'st'
                              : rule.dayOfMonth === 2
                                ? 'nd'
                                : rule.dayOfMonth === 3
                                  ? 'rd'
                                  : 'th'}{' '}
                            of month · Next run: {rule.nextRunDate || 'Pending'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span
                          className={`tabular heading text-[14px] font-bold ${
                            isIncome
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {isIncome ? '+' : '-'}
                          {formatINR(Math.abs(rule.amount))}
                        </span>

                        <button
                          type="button"
                          onClick={() => onDeleteRule(rule.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                          title="Delete Schedule"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <p className="muted text-[11px]">
            Schedules auto-evaluate on login & startup and record transactions directly into Firestore.
          </p>
          <Button variant="ghost" onClick={handleClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  )
}

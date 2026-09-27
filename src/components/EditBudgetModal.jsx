import { useEffect, useMemo, useState } from 'react'
import { RotateCcw, SlidersHorizontal } from 'lucide-react'
import { CATEGORIES, DEFAULT_BUDGETS } from '../data/mockData'
import { useApp } from '../context/AppContext'
import { budgetStatus, ratioPercent } from '../utils/finance'
import { formatINR } from '../utils/format'
import Modal from './ui/Modal'
import Button from './ui/Button'
import CategoryIcon from './CategoryIcon'
import ProgressBar from './ui/ProgressBar'

export default function EditBudgetModal({ open, onClose }) {
  const { budgets, updateBudgets, categoryRows, pushToast } = useApp()
  const [draft, setDraft] = useState(budgets)

  useEffect(() => {
    if (open) setDraft(budgets)
  }, [open, budgets])

  const totals = useMemo(() => {
    const total = CATEGORIES.reduce(
      (sum, category) => sum + (Number(draft[category]) || 0),
      0,
    )
    const previous = CATEGORIES.reduce(
      (sum, category) => sum + (Number(budgets[category]) || 0),
      0,
    )
    return { total, previous, diff: total - previous }
  }, [draft, budgets])

  const spentFor = (category) =>
    categoryRows.find((row) => row.category === category)?.spent || 0

  const save = () => {
    const cleaned = CATEGORIES.reduce((acc, category) => {
      acc[category] = Math.max(0, Math.round(Number(draft[category]) || 0))
      return acc
    }, {})
    updateBudgets(cleaned)
    pushToast({
      title: 'Budget updated',
      body: `Monthly envelope is now ${formatINR(totals.total)}.`,
      tone: 'sky',
    })
    onClose?.()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Monthly Budget"
      description="Adjust the limit for each category — changes apply instantly."
      icon={SlidersHorizontal}
      size="lg"
      footer={
        <>
          <Button
            variant="ghost"
            icon={RotateCcw}
            onClick={() => setDraft({ ...DEFAULT_BUDGETS })}
          >
            Restore defaults
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>Save Budget</Button>
        </>
      }
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/40">
        <div>
          <p className="eyebrow">New monthly budget</p>
          <p className="tabular heading text-xl font-bold">
            {formatINR(totals.total)}
          </p>
        </div>
        <div className="text-right">
          <p className="eyebrow">Change</p>
          <p
            className={`tabular text-sm font-bold ${
              totals.diff === 0
                ? 'text-slate-500 dark:text-slate-400'
                : totals.diff > 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {totals.diff === 0
              ? 'No change'
              : `${totals.diff > 0 ? '+' : '−'}${formatINR(Math.abs(totals.diff))}`}{' '}
            <span className="muted font-medium">
              vs {formatINR(totals.previous)}
            </span>
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {CATEGORIES.map((category) => {
          const limit = Number(draft[category]) || 0
          const spent = spentFor(category)
          const percent = ratioPercent(spent, limit)
          const status = budgetStatus(percent)

          return (
            <div
              key={category}
              className="rounded-2xl border border-slate-200 p-3.5 dark:border-slate-800"
            >
              <div className="flex flex-wrap items-center gap-3">
                <CategoryIcon
                  category={category}
                  merchant={false}
                  description=""
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="heading text-[13px] font-semibold">{category}</p>
                  <p className="muted text-[11px]">
                    Spent {formatINR(spent)} of {formatINR(limit)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    aria-label={`${category} budget limit`}
                    value={draft[category]}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        [category]: event.target.value,
                      }))
                    }
                    className="input tabular w-28 py-2 text-right"
                  />
                  <span className={`badge ${status.chip}`}>
                    {Math.round(percent)}%
                  </span>
                </div>
              </div>

              <ProgressBar
                value={percent}
                bar={status.bar}
                className="mt-3"
                delay={0}
              />
            </div>
          )
        })}
      </div>
    </Modal>
  )
}

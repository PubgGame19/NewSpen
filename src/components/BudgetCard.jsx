import { AlertTriangle, ArrowDownRight, ArrowUpRight, CheckCircle2 } from 'lucide-react'
import { CATEGORY_META } from '../data/mockData'
import { budgetStatus } from '../utils/finance'
import { formatINR } from '../utils/format'
import CategoryIcon from './CategoryIcon'
import ProgressBar from './ui/ProgressBar'

export default function BudgetCard({ row }) {
  const meta = CATEGORY_META[row.category] || CATEGORY_META.Other
  const status = budgetStatus(row.usedPercent)
  const delta = row.deltaVsLastMonth || 0
  const up = delta >= 0

  return (
    <article className="card card-hover card-pad animate-rise">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <CategoryIcon
            category={row.category}
            merchant={false}
            description=""
          />
          <div>
            <h3 className="heading text-sm font-semibold">{row.category}</h3>
            <p className="muted text-xs">
              {formatINR(row.remaining)} left of {formatINR(row.limit)}
            </p>
          </div>
        </div>
        <span className={`badge ${status.chip}`}>
          {status.key === 'normal' ? (
            <CheckCircle2 size={12} strokeWidth={2.4} />
          ) : (
            <AlertTriangle size={12} strokeWidth={2.4} />
          )}
          {Math.round(row.usedPercent)}%
        </span>
      </div>

      <div className="mt-4">
        <div className="flex items-end justify-between gap-3">
          <p className="tabular heading text-lg font-bold">
            {formatINR(row.spent)}
            <span className="muted ml-1 text-[13px] font-medium">
              / {formatINR(row.limit)}
            </span>
          </p>
          <span
            className={`tabular flex items-center gap-1 text-[11px] font-semibold ${
              up
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(delta).toFixed(1)}% vs Aug
          </span>
        </div>

        <ProgressBar
          value={row.usedPercent}
          bar={status.bar}
          className="mt-3"
          height="h-2.5"
        />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
        <p
          className={`text-[12px] font-medium ${
            status.key === 'normal'
              ? 'text-slate-500 dark:text-slate-400'
              : status.key === 'warning'
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-rose-600 dark:text-rose-400'
          }`}
        >
          {status.label}
        </p>
      </div>
    </article>
  )
}

import { Trash2 } from 'lucide-react'
import { CATEGORY_META } from '../data/mockData'
import CategoryIcon from './CategoryIcon'
import { formatINR, formatShortDate } from '../utils/format'

function Row({ txn, onDelete, showCategory = true }) {
  const isIncome = txn.amount > 0
  const meta = CATEGORY_META[txn.category] || CATEGORY_META.Other

  return (
    <li className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50/80 sm:px-5 dark:hover:bg-slate-800/40">
      <CategoryIcon category={txn.category} description={txn.description} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="heading truncate text-sm font-semibold">
            {txn.description}
          </p>
          {onDelete ? (
            <button
              type="button"
              aria-label={`Delete ${txn.description}`}
              onClick={() => onDelete(txn)}
              className="hidden rounded-md p-1 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 group-hover:block dark:hover:bg-rose-500/10"
            >
              <Trash2 size={13} />
            </button>
          ) : null}
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-xs">
          {showCategory ? (
            <>
              <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
              <span className="font-medium text-slate-500 dark:text-slate-400">
                {txn.category}
              </span>
              <span className="text-slate-300 dark:text-slate-600">·</span>
            </>
          ) : null}
          <span className="muted truncate">
            {txn.note || txn.method}
          </span>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p
          className={`tabular text-sm font-semibold ${
            isIncome
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-slate-900 dark:text-slate-100'
          }`}
        >
          {isIncome ? '+' : '−'}
          {formatINR(Math.abs(txn.amount))}
        </p>
        <p className="tabular muted mt-0.5 text-[11px] font-medium">
          {formatShortDate(txn.date)}
        </p>
      </div>
    </li>
  )
}

export default function TransactionList({
  items = [],
  onDelete,
  showCategory = true,
  className = '',
}) {
  return (
    <ul className={`divide-row ${className}`}>
      {items.map((txn) => (
        <Row
          key={txn.id}
          txn={txn}
          onDelete={onDelete}
          showCategory={showCategory}
        />
      ))}
    </ul>
  )
}

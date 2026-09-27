import { MoreVertical, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { CATEGORY_META } from '../data/mockData'
import CategoryIcon from './CategoryIcon'
import { formatINR, formatShortDate } from '../utils/format'

/** Table row for the Expenses page */
export default function TransactionRow({ txn, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const meta = CATEGORY_META[txn.category] || CATEGORY_META.Other
  const isIncome = txn.amount > 0

  return (
    <tr className="group transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
      <td className="tabular whitespace-nowrap px-4 py-3.5 text-[13px] font-medium text-slate-500 dark:text-slate-400">
        {formatShortDate(txn.date)}
      </td>

      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <CategoryIcon category={txn.category} description={txn.description} />
          <div className="min-w-0">
            <p className="heading truncate text-sm font-semibold">
              {txn.description}
            </p>
            {txn.note ? (
              <p className="muted truncate text-xs">{txn.note}</p>
            ) : null}
          </div>
        </div>
      </td>

      <td className="px-4 py-3.5">
        <span className={`badge ${meta.chip}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
          {txn.category}
        </span>
      </td>

      <td className="whitespace-nowrap px-4 py-3.5 text-[13px] font-medium text-slate-600 dark:text-slate-300">
        {txn.method}
      </td>

      <td
        className={`tabular whitespace-nowrap px-4 py-3.5 text-right text-sm font-semibold ${
          isIncome
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-slate-900 dark:text-slate-100'
        }`}
      >
        {isIncome ? '+' : '−'}
        {formatINR(Math.abs(txn.amount))}
      </td>

      <td className="px-4 py-3.5 text-right">
        <div className="relative flex justify-end">
          <button
            type="button"
            aria-label="Transaction actions"
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <MoreVertical size={16} />
          </button>

          {menuOpen ? (
            <>
              <button
                type="button"
                aria-label="Close menu"
                className="fixed inset-0 z-10 cursor-default"
                onClick={() => setMenuOpen(false)}
              />
              <div className="animate-pop absolute right-0 top-9 z-20 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lift dark:border-slate-700 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    onDelete?.(txn)
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] font-medium text-rose-600 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-500/10"
                >
                  <Trash2 size={14} />
                  Delete expense
                </button>
              </div>
            </>
          ) : null}
        </div>
      </td>
    </tr>
  )
}

import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import Sparkline from './charts/Sparkline'

const TONES = {
  emerald: {
    chip: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300',
    line: '#059669',
  },
  sky: {
    chip: 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300',
    line: '#0ea5e9',
  },
  amber: {
    chip: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300',
    line: '#f59e0b',
  },
  indigo: {
    chip: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300',
    line: '#6366f1',
  },
  slate: {
    chip: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    line: '#94a3b8',
  },
}

/**
 * Headline metric card: label · icon · value · month-over-month delta
 * and an optional sparkline for trend context.
 */
export default function StatCard({
  label,
  value,
  delta,
  deltaLabel,
  hint,
  icon: Icon,
  tone = 'emerald',
  spark,
  invertDelta = false,
  className = '',
}) {
  const theme = TONES[tone] || TONES.emerald
  const positive = (delta ?? 0) >= 0
  const good = invertDelta ? !positive : positive
  const showDelta = typeof delta === 'number' && Number.isFinite(delta)

  return (
    <article
      className={`card card-hover card-pad animate-rise ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="eyebrow">{label}</p>
        {Icon ? (
          <span
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${theme.chip}`}
          >
            <Icon size={17} strokeWidth={2.2} />
          </span>
        ) : null}
      </div>

      <p className="tabular heading mt-3 text-2xl font-bold tracking-tight sm:text-[27px]">
        {value}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {showDelta ? (
          <span
            className={`badge ${
              good
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300'
            }`}
          >
            {positive ? (
              <ArrowUpRight size={12} strokeWidth={2.6} />
            ) : (
              <ArrowDownRight size={12} strokeWidth={2.6} />
            )}
            {Math.abs(delta).toFixed(1)}%
          </span>
        ) : null}
        <span className="muted text-xs font-medium">
          {deltaLabel || hint}
        </span>
      </div>

      {spark?.length ? (
        <div className="mt-3 -mb-1">
          <Sparkline data={spark} color={theme.line} />
        </div>
      ) : null}
    </article>
  )
}

import { ArrowUpRight } from 'lucide-react'
import { getIcon } from './ui/Icon'

const TONES = {
  emerald: {
    chip: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300',
    chipText: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    accent: 'from-emerald-500/10',
  },
  amber: {
    chip: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300',
    chipText: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
    accent: 'from-amber-500/10',
  },
  sky: {
    chip: 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300',
    chipText: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300',
    accent: 'from-sky-500/10',
  },
  violet: {
    chip: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300',
    chipText: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300',
    accent: 'from-violet-500/10',
  },
  rose: {
    chip: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300',
    chipText: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
    accent: 'from-rose-500/10',
  },
}

/**
 * Insight / signal card. `icon` is a lucide name so data files stay plain.
 */
export default function InsightCard({
  icon,
  tone = 'emerald',
  tag,
  title,
  body,
  actionLabel,
  onAction,
  className = '',
}) {
  const Icon = getIcon(icon)
  const theme = TONES[tone] || TONES.emerald

  return (
    <article
      className={`card card-hover card-pad animate-rise relative overflow-hidden ${className}`}
    >
      <div
        className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${theme.accent} to-transparent blur-2xl`}
        aria-hidden="true"
      />
      <div className="relative flex items-start gap-3.5">
        <span
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${theme.chip}`}
        >
          <Icon size={19} strokeWidth={2.1} />
        </span>
        <div className="min-w-0 flex-1">
          {tag ? (
            <span
              className={`badge mb-2 ${theme.chipText}`}
            >
              {tag}
            </span>
          ) : null}
          <h3 className="heading text-sm font-semibold leading-snug">
            {title}
          </h3>
          {body ? (
            <p className="muted mt-1.5 text-[13px] leading-relaxed">{body}</p>
          ) : null}
          {actionLabel ? (
            <button
              type="button"
              onClick={onAction}
              className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-emerald-600 transition hover:gap-1.5 hover:text-emerald-700 dark:text-emerald-400"
            >
              {actionLabel}
              <ArrowUpRight size={14} strokeWidth={2.4} />
            </button>
          ) : null}
        </div>
      </div>
    </article>
  )
}

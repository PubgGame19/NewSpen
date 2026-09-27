const TONES = {
  emerald:
    'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  rose: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
  sky: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300',
  indigo:
    'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300',
  violet:
    'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300',
  slate: 'bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300',
}

export default function Badge({
  tone = 'slate',
  icon: Icon,
  className = '',
  children,
}) {
  return (
    <span className={`badge ${TONES[tone] || TONES.slate} ${className}`}>
      {Icon ? <Icon size={12} strokeWidth={2.4} /> : null}
      {children}
    </span>
  )
}

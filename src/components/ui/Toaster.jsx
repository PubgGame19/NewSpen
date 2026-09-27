import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react'
import { useApp } from '../../context/AppContext'

const TONES = {
  emerald: {
    icon: CheckCircle2,
    ring: 'border-emerald-200 dark:border-emerald-500/30',
    chip: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300',
  },
  sky: {
    icon: Info,
    ring: 'border-sky-200 dark:border-sky-500/30',
    chip: 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300',
  },
  amber: {
    icon: AlertTriangle,
    ring: 'border-amber-200 dark:border-amber-500/30',
    chip: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300',
  },
  rose: {
    icon: AlertTriangle,
    ring: 'border-rose-200 dark:border-rose-500/30',
    chip: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300',
  },
}

export default function Toaster() {
  const { toasts, dismissToast } = useApp()

  if (!toasts.length) return null

  return (
    <div className="pointer-events-none fixed bottom-24 right-4 z-[90] flex w-[min(92vw,22rem)] flex-col gap-2 sm:right-6 lg:bottom-6">
      {toasts.map((toast) => {
        const tone = TONES[toast.tone] || TONES.emerald
        const Icon = tone.icon
        return (
          <div
            key={toast.id}
            className={`animate-pop pointer-events-auto flex items-start gap-3 rounded-2xl border ${tone.ring} bg-white/95 p-3.5 shadow-lift backdrop-blur dark:bg-slate-900/95`}
          >
            <span
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${tone.chip}`}
            >
              <Icon size={17} strokeWidth={2.3} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="heading text-[13px] font-semibold">{toast.title}</p>
              {toast.body ? (
                <p className="muted mt-0.5 text-xs leading-snug">{toast.body}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              className="-mr-1 -mt-1 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
            >
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}

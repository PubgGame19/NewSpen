import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

const SIZES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-3xl',
}

export default function Modal({
  open,
  onClose,
  title,
  description,
  icon: Icon,
  children,
  footer,
  size = 'md',
}) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') onClose?.()
    }
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div
        className="animate-fade absolute inset-0 bg-slate-900/45 backdrop-blur-[3px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`animate-pop relative flex max-h-[92vh] w-full ${
          SIZES[size] || SIZES.md
        } flex-col overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-lift sm:rounded-2xl dark:border-slate-800 dark:bg-slate-900`}
      >
        <div className="flex items-start gap-4 border-b border-slate-100 px-5 py-4 sm:px-6 sm:py-5 dark:border-slate-800">
          {Icon ? (
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
              <Icon size={20} strokeWidth={2.2} />
            </span>
          ) : null}
          <div className="min-w-0 flex-1">
            <h2 className="heading truncate text-base font-semibold sm:text-lg">
              {title}
            </h2>
            {description ? (
              <p className="muted mt-0.5 text-[13px] leading-snug">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="icon-btn -mr-1 -mt-1"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {children}
        </div>

        {footer ? (
          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-6 dark:border-slate-800 dark:bg-slate-950/40">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}

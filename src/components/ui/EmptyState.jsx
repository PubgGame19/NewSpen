import { SearchX } from 'lucide-react'
import Button from './Button'

export default function EmptyState({
  icon: Icon = SearchX,
  title = 'Nothing here yet',
  body,
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
        <Icon size={24} strokeWidth={1.9} />
      </span>
      <div>
        <p className="heading text-sm font-semibold">{title}</p>
        {body ? (
          <p className="muted mx-auto mt-1 max-w-sm text-[13px] leading-snug">{body}</p>
        ) : null}
      </div>
      {actionLabel ? (
        <Button variant="soft" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}

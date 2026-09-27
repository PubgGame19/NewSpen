import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  BellRing,
  CalendarClock,
  CheckCheck,
  CreditCard,
  Settings as SettingsIcon,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import useClickOutside from '../hooks/useClickOutside'

const TONES = {
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300',
  rose: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300',
  sky: 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300',
}

const ICONS = {
  'ntf-1': CalendarClock,
  'ntf-2': CreditCard,
  'ntf-3': TrendingUp,
  'ntf-4': Sparkles,
}

export default function NotificationDropdown() {
  const { notifications, unreadCount, markNotificationsRead } = useApp()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  useClickOutside(ref, () => setOpen(false), open)

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={`icon-btn ${open ? 'border-slate-200 bg-slate-100 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white' : ''}`}
      >
        {unreadCount ? <BellRing size={18} /> : <Bell size={18} />}
        {unreadCount ? (
          <span className="absolute right-2 top-2 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="animate-pop absolute right-0 top-12 z-50 w-[min(92vw,22rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lift dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <div>
              <p className="heading text-sm font-semibold">Notifications</p>
              <p className="muted text-[11px] font-medium">
                {unreadCount ? `${unreadCount} unread alerts` : 'You are all caught up'}
              </p>
            </div>
            {unreadCount ? (
              <button
                type="button"
                onClick={() => markNotificationsRead()}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-emerald-600 transition hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
              >
                <CheckCheck size={13} />
                Mark all read
              </button>
            ) : null}
          </div>

          <ul className="max-h-[21rem] divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
            {notifications.map((item) => {
              const Icon = ICONS[item.id] || Bell
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      markNotificationsRead(item.id)
                      setOpen(false)
                      navigate(item.to || '/')
                    }}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${TONES[item.tone] || TONES.emerald}`}
                    >
                      <Icon size={16} strokeWidth={2.2} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="heading truncate text-[13px] font-semibold">
                          {item.title}
                        </p>
                        {item.unread ? (
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                        ) : null}
                      </div>
                      <p className="muted mt-0.5 text-xs leading-snug">
                        {item.body}
                      </p>
                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        {item.time}
                      </p>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>

          <button
            type="button"
            onClick={() => {
              setOpen(false)
              navigate('/settings')
            }}
            className="flex w-full items-center justify-center gap-2 border-t border-slate-100 px-4 py-3 text-[12px] font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white"
          >
            <SettingsIcon size={13} />
            Manage notification preferences
          </button>
        </div>
      ) : null}
    </div>
  )
}

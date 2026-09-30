import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  LogOut,
  Moon,
  Sun,
  UserRound,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import useClickOutside from '../hooks/useClickOutside'
import { formatINR } from '../utils/format'

export default function ProfileDropdown() {
  const { profile, session, theme, toggleTheme, signOut } = useApp()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  useClickOutside(ref, () => setOpen(false), open)

  const go = (path) => {
    setOpen(false)
    navigate(path)
  }

  const displayName = session?.name || profile.name
  const displayEmail = session?.email || profile.email
  const displayInitials = session?.initials || profile.initials || 'SP'

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={`flex items-center gap-2 rounded-xl border py-1.5 pl-1.5 pr-2.5 transition ${
          open
            ? 'border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800'
            : 'border-transparent hover:border-slate-200 hover:bg-slate-50 dark:hover:border-slate-700 dark:hover:bg-slate-800/60'
        }`}
      >
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-600 text-xs font-bold text-white shadow-xs dark:bg-emerald-500">
          {displayInitials}
        </span>
        <span className="heading hidden text-[13px] font-semibold sm:inline">
          {displayName}
        </span>
        <ChevronDown size={14} className="text-slate-400" />
      </button>

      {open ? (
        <div className="animate-pop absolute right-0 top-full z-50 mt-1.5 w-64 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 px-3 py-2.5 dark:border-slate-800">
            <p className="heading truncate text-[13px] font-semibold">
              {displayName}
            </p>
            <p className="muted truncate text-[11.5px]">{displayEmail}</p>
            <div className="mt-2 flex items-center justify-between text-[11.5px]">
              <span className="muted">Income / mo</span>
              <span className="tabular font-semibold text-emerald-600 dark:text-emerald-400">
                {formatINR(profile.monthlyIncome || 0)}
              </span>
            </div>
          </div>

          <div className="py-1">
            <button
              type="button"
              onClick={() => go('/settings')}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] font-medium text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/60 cursor-pointer rounded-lg"
            >
              <UserRound size={15} />
              Profile & settings
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] font-medium text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/60 cursor-pointer rounded-lg"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              Switch to {theme === 'dark' ? 'light' : 'dark'} theme
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                signOut()
                navigate('/login', { replace: true, state: { signedOut: true } })
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] font-medium text-rose-600 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-500/10 cursor-pointer rounded-lg"
            >
              <LogOut size={15} />
              Sign out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

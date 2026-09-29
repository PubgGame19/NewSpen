import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  LogOut,
  Moon,
  RotateCcw,
  Sun,
  UserRound,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import useClickOutside from '../hooks/useClickOutside'
import { formatINR } from '../utils/format'
import Modal from './ui/Modal'
import Button from './ui/Button'

export default function ProfileDropdown() {
  const { profile, theme, toggleTheme, resetDemoData, pushToast, signOut } = useApp()
  const [open, setOpen] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  useClickOutside(ref, () => setOpen(false), open)

  const go = (path) => {
    setOpen(false)
    navigate(path)
  }

  return (
    <>
      <div className="relative" ref={ref}>
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className={`flex items-center gap-2 rounded-xl border py-1.5 pl-1.5 pr-2.5 transition ${
            open
              ? 'border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800'
              : 'border-transparent hover:border-slate-200 hover:bg-slate-100 dark:hover:border-slate-700 dark:hover:bg-slate-800'
          }`}
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 text-[12px] font-bold text-white">
            {profile.initials}
          </span>
          <span className="hidden text-left lg:block">
            <span className="heading block text-[13px] font-semibold leading-tight">
              {profile.name}
            </span>
            <span className="muted block text-[11px] leading-tight">
              {profile.accountType}
            </span>
          </span>
          <ChevronDown
            size={15}
            className={`shrink-0 text-slate-400 transition-transform duration-200 ${
              open ? 'rotate-180' : ''
            }`}
          />
        </button>

        {open ? (
          <div className="animate-pop absolute right-0 top-13 z-50 w-[min(92vw,17rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lift dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5 dark:border-slate-800">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-sm font-bold text-white">
                {profile.initials}
              </span>
              <div className="min-w-0">
                <p className="heading truncate text-sm font-semibold">
                  {profile.name}
                </p>
                <p className="muted truncate text-[11px]">{profile.email}</p>
              </div>
            </div>

            <div className="px-4 py-3 text-[12px]">
              <div className="flex items-center justify-between">
                <span className="muted font-medium">Monthly income</span>
                <span className="tabular heading font-semibold">
                  {formatINR(profile.monthlyIncome)}
                </span>
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="muted font-medium">Currency</span>
                <span className="heading font-semibold">₹ INR</span>
              </div>
            </div>

            <div className="border-t border-slate-100 py-1 dark:border-slate-800">
              <button
                type="button"
                onClick={() => go('/settings')}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] font-medium text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/60"
              >
                <UserRound size={15} />
                Profile & settings
              </button>
              <button
                type="button"
                onClick={toggleTheme}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] font-medium text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/60"
              >
                {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                Switch to {theme === 'dark' ? 'light' : 'dark'} theme
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  setConfirmReset(true)
                }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] font-medium text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/60"
              >
                <RotateCcw size={15} />
                Reset demo data
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  signOut()
                  navigate('/login', { replace: true, state: { signedOut: true } })
                }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] font-medium text-rose-600 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-500/10"
              >
                <LogOut size={15} />
                Sign out
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Reset demo data?"
        description="Expenses, budgets and preferences return to the seeded September 2026 dataset."
        icon={RotateCcw}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmReset(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                resetDemoData()
                setConfirmReset(false)
                pushToast({
                  title: 'Demo data restored',
                  body: 'September 2026 dataset loaded again.',
                  tone: 'sky',
                })
              }}
            >
              Reset data
            </Button>
          </>
        }
      >
        <p className="muted text-[13px] leading-relaxed">
          Any expenses or budget changes you made during this session will be
          discarded. This is useful between demo runs.
        </p>
      </Modal>
    </>
  )
}

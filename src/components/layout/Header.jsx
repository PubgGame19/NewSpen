import { useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Menu, Moon, Plus, Search, Sun, X } from 'lucide-react'
import { findNavItem } from '../../config/nav'
import { useApp } from '../../context/AppContext'
import { CATEGORY_META } from '../../data/mockData'
import { formatINR, formatShortDate } from '../../utils/format'
import useClickOutside from '../../hooks/useClickOutside'
import NotificationDropdown from '../NotificationDropdown'
import ProfileDropdown from '../ProfileDropdown'
import Button from '../ui/Button'

export default function Header({ onOpenMobileNav }) {
  const { transactions, theme, toggleTheme, openQuickAdd } = useApp()
  const location = useLocation()
  const navigate = useNavigate()
  const page = findNavItem(location.pathname)

  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [mobileSearch, setMobileSearch] = useState(false)
  const searchRef = useRef(null)

  useClickOutside(searchRef, () => setFocused(false), focused)

  const results = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (term.length < 1) return []
    return transactions
      .filter((txn) =>
        [txn.description, txn.category, txn.method, txn.note]
          .join(' ')
          .toLowerCase()
          .includes(term),
      )
      .slice(0, 6)
  }, [query, transactions])

  const submitSearch = (event) => {
    event.preventDefault()
    const term = query.trim()
    if (!term) return
    setFocused(false)
    setMobileSearch(false)
    navigate(`/expenses?q=${encodeURIComponent(term)}`)
  }

  const openResult = (txn) => {
    setQuery(txn.description)
    setFocused(false)
    setMobileSearch(false)
    navigate(`/expenses?q=${encodeURIComponent(txn.description)}`)
  }

  const searchField = (
    <form onSubmit={submitSearch} className="relative w-full">
      <Search
        size={16}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
      />
      <input
        type="search"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
          setFocused(true)
        }}
        onFocus={() => setFocused(true)}
        placeholder="Search transactions, categories, payment modes…"
        aria-label="Search transactions"
        className="input h-10 py-0 pl-10 pr-9 text-[13px]"
      />
      {query ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setQuery('')
            setFocused(false)
          }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
        >
          <X size={14} />
        </button>
      ) : null}

      {focused && query.trim() ? (
        <div className="animate-pop absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lift dark:border-slate-700 dark:bg-slate-900">
          {results.length ? (
            <ul className="divide-row max-h-80 overflow-y-auto">
              {results.map((txn) => {
                const meta = CATEGORY_META[txn.category] || CATEGORY_META.Other
                return (
                  <li key={txn.id}>
                    <button
                      type="button"
                      onClick={() => openResult(txn)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    >
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${meta.dot}`}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="heading block truncate text-[13px] font-semibold">
                          {txn.description}
                        </span>
                        <span className="muted block text-[11px]">
                          {txn.category} · {txn.method} ·{' '}
                          {formatShortDate(txn.date)}
                        </span>
                      </span>
                      <span
                        className={`tabular shrink-0 text-[13px] font-semibold ${
                          txn.amount > 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {txn.amount > 0 ? '+' : '−'}
                        {formatINR(Math.abs(txn.amount))}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="muted px-4 py-6 text-center text-[13px]">
              No transactions match “{query.trim()}”.
            </p>
          )}
          <button
            type="button"
            onClick={submitSearch}
            className="flex w-full items-center justify-center gap-2 border-t border-slate-100 px-4 py-2.5 text-[12px] font-semibold text-emerald-600 transition hover:bg-emerald-50 dark:border-slate-800 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
          >
            <Search size={13} />
            See all results in Expenses
          </button>
        </div>
      ) : null}
    </form>
  )

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onOpenMobileNav}
          aria-label="Open navigation"
          className="icon-btn md:hidden"
        >
          <Menu size={19} />
        </button>

        <div className="min-w-0">
          <h1 className="heading truncate text-[15px] font-bold sm:text-base">
            {page.title}
          </h1>
          <p className="muted hidden truncate text-[11px] font-medium sm:block">
            {page.subtitle}
          </p>
        </div>

        <div className="ml-auto hidden w-full max-w-md lg:block" ref={searchRef}>
          {searchField}
        </div>

        <div className="ml-auto flex items-center gap-1.5 lg:ml-3">
          <button
            type="button"
            aria-label="Search"
            onClick={() => setMobileSearch((value) => !value)}
            className="icon-btn lg:hidden"
          >
            <Search size={18} />
          </button>

          <Button
            size="sm"
            icon={Plus}
            className="hidden sm:inline-flex"
            onClick={openQuickAdd}
          >
            Add Expense
          </Button>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle colour theme"
            className="icon-btn"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <NotificationDropdown />
          <ProfileDropdown />
        </div>
      </div>

      {mobileSearch ? (
        <div className="animate-fade border-t border-slate-100 px-4 py-3 lg:hidden dark:border-slate-800">
          {searchField}
        </div>
      ) : null}
    </header>
  )
}

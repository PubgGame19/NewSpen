import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { NAV_ITEMS } from '../../config/nav'
import Header from './Header'
import MobileNav from './MobileNav'
import Sidebar from './Sidebar'
import AddExpenseModal from '../AddExpenseModal'
import RecurringManagerModal from '../RecurringManagerModal'
import Logo from '../ui/Logo'
import Toaster from '../ui/Toaster'

export default function Layout() {
  const {
    quickAddOpen,
    closeQuickAdd,
    recurringModalOpen,
    closeRecurringModal,
    recurringRules,
    addRecurring,
    updateRecurring,
    deleteRecurring,
    processDueRecurringManually,
  } = useApp()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  /* Route-aware brand title, e.g. "Dashboard · SPENANCE" — unknown paths
     (the 404 route) must not borrow the dashboard label. */
  useEffect(() => {
    const page = NAV_ITEMS.find((item) => item.to === location.pathname)
    document.title = `${page ? page.title : 'Page not found'} · SPENANCE`
  }, [location.pathname])

  return (
    <div className="min-h-screen-safe flex bg-slate-50 dark:bg-ink-950">
      <Sidebar
        mobileOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header onOpenMobileNav={() => setMobileNavOpen(true)} />

        <main className="flex-1 px-4 pb-24 pt-5 sm:px-6 sm:pt-6 lg:px-8 lg:pb-12">
          <div
            key={location.pathname}
            className="animate-rise mx-auto w-full max-w-[1400px] 2xl:max-w-[1560px]"
          >
            <Outlet />
          </div>
        </main>

        <footer className="hidden items-center justify-between border-t border-slate-200 px-8 py-4 text-[11px] font-medium text-slate-400 lg:flex dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <Logo className="h-5 w-5 opacity-80" alt="" />
            <span>
              © {new Date().getFullYear()} SPENANCE · Personal Finance &amp; Loan Management System · All rights reserved.
            </span>
          </div>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Cloud Synced
          </span>
        </footer>
      </div>

      <MobileNav />
      <AddExpenseModal open={quickAddOpen} onClose={closeQuickAdd} />
      <RecurringManagerModal
        isOpen={recurringModalOpen}
        onClose={closeRecurringModal}
        recurringRules={recurringRules}
        onAddRule={addRecurring}
        onUpdateRule={updateRecurring}
        onDeleteRule={deleteRecurring}
        onProcessDue={processDueRecurringManually}
      />
      <Toaster />
    </div>
  )
}

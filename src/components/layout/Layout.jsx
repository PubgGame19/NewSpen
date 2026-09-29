import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { NAV_ITEMS } from '../../config/nav'
import Header from './Header'
import MobileNav from './MobileNav'
import Sidebar from './Sidebar'
import AddExpenseModal from '../AddExpenseModal'
import Logo from '../ui/Logo'
import Toaster from '../ui/Toaster'

export default function Layout() {
  const { quickAddOpen, closeQuickAdd } = useApp()
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

        <footer className="hidden items-center gap-2.5 border-t border-slate-200 px-8 py-4 text-[11px] font-medium text-slate-400 lg:flex dark:border-slate-800">
          <Logo className="h-6 w-6 opacity-80" alt="" />
          <span>
            SPENANCE · Personal Finance &amp; Loan Management System · Demo
            prototype with fictional data (September 2026). No real accounts,
            payments or AI services are connected.
          </span>
        </footer>
      </div>

      <MobileNav />
      <AddExpenseModal open={quickAddOpen} onClose={closeQuickAdd} />
      <Toaster />
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import Header from './Header'
import MobileNav from './MobileNav'
import Sidebar from './Sidebar'
import AddExpenseModal from '../AddExpenseModal'
import Toaster from '../ui/Toaster'

export default function Layout() {
  const { quickAddOpen, closeQuickAdd } = useApp()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-ink-950">
      <Sidebar
        mobileOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header onOpenMobileNav={() => setMobileNavOpen(true)} />

        <main className="flex-1 px-4 pb-24 pt-5 sm:px-6 sm:pt-6 lg:px-8 lg:pb-12">
          <div
            key={location.pathname}
            className="animate-rise mx-auto w-full max-w-[1400px]"
          >
            <Outlet />
          </div>
        </main>

        <footer className="hidden border-t border-slate-200 px-8 py-5 text-[11px] font-medium text-slate-400 lg:block dark:border-slate-800">
          SPENANCE · Personal Finance &amp; Loan Management System · Demo
          prototype with fictional data (September 2026). No real accounts,
          payments or AI services are connected.
        </footer>
      </div>

      <MobileNav />
      <AddExpenseModal open={quickAddOpen} onClose={closeQuickAdd} />
      <Toaster />
    </div>
  )
}

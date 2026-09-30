import { NavLink } from 'react-router-dom'
import { ChevronLeft, ChevronsUpDown, PanelLeftClose, Sparkles, X } from 'lucide-react'
import { NAV_ITEMS } from '../../config/nav'
import { useApp } from '../../context/AppContext'
import { formatINR } from '../../utils/format'
import Logo from '../ui/Logo'

function NavItem({ item, collapsed, onNavigate }) {
  const Icon = item.icon

  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium transition-all duration-200 ${
          collapsed ? 'justify-center px-2.5' : 'px-3'
        } ${
          isActive
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-white'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive ? (
            <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-emerald-500" />
          ) : null}
          <Icon
            size={18}
            strokeWidth={isActive ? 2.4 : 2}
            className="shrink-0"
          />
          {!collapsed ? (
            <span className="truncate">{item.label}</span>
          ) : (
            <span className="pointer-events-none absolute left-[calc(100%+10px)] z-50 hidden whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white shadow-lift group-hover:block dark:bg-slate-700">
              {item.label}
            </span>
          )}
        </>
      )}
    </NavLink>
  )
}

function SidebarBody({ collapsed, onNavigate, onClose, mobile }) {
  const { profile, score, toggleSidebar, session } = useApp()

  return (
    <div className="flex h-full flex-col">
      {/* brand */}
      <div
        className={`flex items-center gap-3 border-b border-slate-100 px-4 py-5 dark:border-slate-800 ${
          collapsed ? 'justify-center px-3' : ''
        }`}
      >
        <Logo className="h-10 w-10" />
        {!collapsed ? (
          <div className="min-w-0 flex-1">
            <p className="heading text-[15px] font-extrabold tracking-tight">
              SPENANCE
            </p>
            <p className="muted text-[11px] font-medium">Personal Finance</p>
          </div>
        ) : null}
        {mobile ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="icon-btn ml-auto"
          >
            <X size={18} />
          </button>
        ) : null}
      </div>

      {/* nav */}
      <nav className="no-scrollbar flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {!collapsed ? (
          <p className="eyebrow px-3 pb-2 pt-1">Overview</p>
        ) : null}
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.to}
            item={item}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      {/* score teaser */}
      {!collapsed ? (
        <div className="mx-3 mb-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3.5 dark:border-emerald-500/20 dark:bg-emerald-500/5">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-emerald-600 dark:text-emerald-400" />
            <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              Financial score
            </p>
          </div>
          <p className="tabular heading mt-1.5 text-xl font-bold">
            {score.total}
            <span className="muted text-sm font-semibold">/100</span>
          </p>
          <p className="muted mt-0.5 text-[11px] font-medium">
            {score.pillars[0].value}% savings discipline
          </p>
        </div>
      ) : null}

      {/* user */}
      <div className="border-t border-slate-100 p-3 dark:border-slate-800">
        <div
          className={`flex items-center gap-3 rounded-xl p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800/70 ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-[12px] font-bold text-white">
            {profile.name && profile.name !== 'User'
              ? profile.initials
              : session?.initials || profile.initials || 'U'}
          </span>
          {!collapsed ? (
            <>
              <div className="min-w-0 flex-1">
                <p className="heading truncate text-[13px] font-semibold">
                  {profile.name && profile.name !== 'User'
                    ? profile.name
                    : session?.name || 'Personal Account'}
                </p>
                <p className="muted truncate text-[11px]">
                  {session?.isFirebaseUser ? 'Firebase Cloud Account' : profile.accountType}
                </p>
              </div>
              <span className="tabular muted text-[11px] font-semibold">
                {formatINR(profile.monthlyIncome)}
              </span>
            </>
          ) : null}
        </div>

        {!mobile ? (
          <button
            type="button"
            onClick={toggleSidebar}
            className={`mt-2 flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[12px] font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white ${
              collapsed ? 'justify-center px-2' : ''
            }`}
          >
            {collapsed ? (
              <ChevronsUpDown size={16} />
            ) : (
              <>
                <PanelLeftClose size={16} />
                Collapse sidebar
                <ChevronLeft size={14} className="ml-auto" />
              </>
            )}
          </button>
        ) : null}
      </div>
    </div>
  )
}

export default function Sidebar({ mobileOpen, onClose }) {
  const { sidebarCollapsed } = useApp()

  return (
    <>
      {/* desktop */}
      <aside
        className={`hidden shrink-0 border-r border-slate-200 bg-white transition-[width] duration-300 ease-out lg:block dark:border-slate-800 dark:bg-slate-900 ${
          sidebarCollapsed ? 'w-[84px]' : 'w-[264px]'
        }`}
      >
        <div className="h-screen-safe sticky top-0">
          <SidebarBody collapsed={sidebarCollapsed} />
        </div>
      </aside>

      {/* phones & tablets navigate from the bottom bar, so no icon rail here */}

      {/* mobile drawer */}
      <div
        className={`fixed inset-0 z-[80] md:hidden ${
          mobileOpen ? '' : 'pointer-events-none'
        }`}
        aria-hidden={!mobileOpen}
      >
        <div
          className={`absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] transition-opacity duration-300 ${
            mobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={onClose}
        />
        <div
          className={`absolute inset-y-0 left-0 w-[272px] border-r border-slate-200 bg-white shadow-lift transition-transform duration-300 ease-out dark:border-slate-800 dark:bg-slate-900 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <SidebarBody mobile onNavigate={onClose} onClose={onClose} />
        </div>
      </div>
    </>
  )
}

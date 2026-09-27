import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from '../../config/nav'

/**
 * Bottom navigation bar — the primary navigation on phones and tablets
 * (hidden from `lg` upwards, where the fixed sidebar takes over).
 * Shows every section with an active pill indicator.
 */
export default function MobileNav() {
  return (
    <nav
      aria-label="Bottom navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden dark:border-slate-800 dark:bg-slate-950/95"
    >
      <ul className="mx-auto grid max-w-3xl grid-cols-7">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <li key={item.to} className="min-w-0">
              <NavLink
                to={item.to}
                end={item.to === '/'}
                title={item.label}
                aria-label={item.label}
                className={({ isActive }) =>
                  `group relative flex flex-col items-center gap-1 px-0.5 pb-2.5 pt-2 text-[9px] font-semibold leading-none transition-colors duration-200 sm:text-[10px] ${
                    isActive
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`absolute inset-x-1.5 top-0 h-[3px] rounded-b-full transition-all duration-300 ${
                        isActive ? 'bg-emerald-500 opacity-100' : 'opacity-0'
                      }`}
                    />
                    <span
                      className={`grid h-7 w-full max-w-[3.25rem] place-items-center rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-emerald-50 dark:bg-emerald-500/10'
                          : 'group-hover:bg-slate-100 dark:group-hover:bg-slate-800/70'
                      }`}
                    >
                      <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                    </span>
                    <span className="w-full truncate text-center">
                      {item.short}
                    </span>
                  </>
                )}
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

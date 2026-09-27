import {
  LayoutDashboard,
  CreditCard,
  Target,
  Landmark,
  BarChart3,
  Bot,
  Settings as SettingsIcon,
} from 'lucide-react'

/**
 * Single source of truth for the sidebar, the top header titles and the
 * bottom navigation bar. `short` is the compact label used in the bottom bar.
 */
export const NAV_ITEMS = [
  {
    to: '/',
    label: 'Dashboard',
    short: 'Home',
    icon: LayoutDashboard,
    emoji: '🏠',
    title: 'Dashboard',
    subtitle: 'Financial overview',
  },
  {
    to: '/expenses',
    label: 'Expenses',
    short: 'Expenses',
    icon: CreditCard,
    emoji: '💳',
    title: 'Expenses',
    subtitle: 'Track and understand where your money goes.',
  },
  {
    to: '/budget',
    label: 'Budget',
    short: 'Budget',
    icon: Target,
    emoji: '🎯',
    title: 'Monthly Budget',
    subtitle: 'Stay on track with your spending goals.',
  },
  {
    to: '/loans',
    label: 'Loans',
    short: 'Loans',
    icon: Landmark,
    emoji: '🏦',
    title: 'Loans & EMIs',
    subtitle: 'Manage your loans and upcoming repayments.',
  },
  {
    to: '/insights',
    label: 'Insights',
    short: 'Insights',
    icon: BarChart3,
    emoji: '📊',
    title: 'Financial Insights',
    subtitle: 'Understand your financial habits and make smarter decisions.',
  },
  {
    to: '/ai-consultant',
    label: 'AI Consultant',
    short: 'AI Chat',
    icon: Bot,
    emoji: '🤖',
    title: 'SPENANCE AI',
    subtitle: 'Your personal financial assistant',
  },
  {
    to: '/settings',
    label: 'Settings',
    short: 'Settings',
    icon: SettingsIcon,
    emoji: '⚙️',
    title: 'Settings',
    subtitle: 'Manage your profile and preferences.',
  },
]

/** Every section is reachable from the bottom navigation bar */
export const BOTTOM_NAV = NAV_ITEMS.map((item) => item.to)

export function findNavItem(pathname) {
  return NAV_ITEMS.find((item) => item.to === pathname) || NAV_ITEMS[0]
}

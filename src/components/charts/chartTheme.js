import { useApp } from '../../context/AppContext'

export const CHART_COLORS = {
  income: '#059669',
  incomeSoft: '#34d399',
  expenses: '#0f172a',
  expensesSoft: '#94a3b8',
  savings: '#10b981',
  grid: '#eef2f6',
  axis: '#e2e8f0',
}

export function useChartTheme() {
  const { theme } = useApp()
  const dark = theme === 'dark'
  return {
    dark,
    grid: dark ? '#1e293b' : '#eef2f6',
    axis: dark ? '#334155' : '#e2e8f0',
    tick: dark ? '#94a3b8' : '#64748b',
    tooltipBg: dark ? '#0f172a' : '#ffffff',
    tooltipBorder: dark ? '#1e293b' : '#e2e8f0',
    income: CHART_COLORS.income,
    expenses: dark ? '#e2e8f0' : '#0f172a',
    savings: CHART_COLORS.savings,
    palette: [
      '#f59e0b',
      '#0ea5e9',
      '#6366f1',
      '#10b981',
      '#f43f5e',
      '#94a3b8',
    ],
  }
}

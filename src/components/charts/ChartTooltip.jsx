import { formatINR } from '../../utils/format'
import { useChartTheme } from './chartTheme'

/**
 * Shared Recharts tooltip. `labelled` can map raw keys to friendly labels,
 * `percent` renders 0-100 values instead of currency.
 */
export default function ChartTooltip({
  active,
  payload,
  label,
  labels = {},
  mode = 'currency',
  suffix = '',
}) {
  const theme = useChartTheme()
  if (!active || !payload?.length) return null

  return (
    <div
      className="rounded-xl border px-3 py-2 shadow-lift"
      style={{
        background: theme.tooltipBg,
        borderColor: theme.tooltipBorder,
      }}
    >
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {labels[label] || label}
      </p>
      <div className="space-y-1">
        {payload.map((entry) => (
          <div
            key={entry.dataKey || entry.name}
            className="flex items-center gap-2 text-[13px]"
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: entry.color || entry.payload?.fill }}
            />
            <span className="text-slate-500 dark:text-slate-400">
              {entry.name}
            </span>
            <span className="tabular ml-auto font-semibold text-slate-900 dark:text-white">
              {mode === 'percent'
                ? `${Math.round(entry.value)}%`
                : `${formatINR(entry.value)}${suffix}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'

/**
 * Animated progress bar. Grows from 0 → value on mount / change so
 * budget and health meters feel alive without being distracting.
 */
export default function ProgressBar({
  value = 0,
  bar = 'bg-emerald-500',
  track = 'bg-slate-100 dark:bg-slate-800',
  height = 'h-2',
  className = '',
  delay = 60,
}) {
  const target = Math.max(0, Math.min(100, Number(value) || 0))
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const timer = window.setTimeout(() => setWidth(target), delay)
    return () => window.clearTimeout(timer)
  }, [target, delay])

  return (
    <div
      className={`w-full overflow-hidden rounded-full ${track} ${height} ${className}`}
      role="progressbar"
      aria-valuenow={Math.round(target)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`h-full rounded-full ${bar} transition-[width] duration-700 ease-out`}
        style={{ width: `${width}%` }}
      />
    </div>
  )
}

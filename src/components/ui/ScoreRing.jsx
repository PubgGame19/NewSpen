import { useEffect, useState } from 'react'

/**
 * Circular progress ring (SVG). Animates the stroke on mount and is
 * responsive via the `size` prop.
 */
export default function ScoreRing({
  value = 0,
  size = 132,
  stroke = 11,
  label,
  caption,
  color = '#059669',
  trackClass = 'text-slate-100 dark:text-slate-800',
}) {
  const [progress, setProgress] = useState(0)
  const target = Math.max(0, Math.min(100, Number(value) || 0))
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  useEffect(() => {
    const timer = window.setTimeout(() => setProgress(target), 120)
    return () => window.clearTimeout(timer)
  }, [target])

  return (
    <div
      className="relative grid shrink-0 place-items-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className={trackClass}
          stroke="currentColor"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          stroke={color}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(.16,1,.3,1)' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">
        <p className="tabular heading text-2xl font-bold leading-none sm:text-[28px]">
          {label ?? Math.round(target)}
        </p>
        {caption ? (
          <p className="muted mt-1 text-[11px] font-semibold uppercase tracking-wider">
            {caption}
          </p>
        ) : null}
      </div>
    </div>
  )
}

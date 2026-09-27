/**
 * Tiny dependency-free sparkline (inline SVG) used inside stat cards.
 * Falls back gracefully when there is a single data point.
 */
export default function Sparkline({
  data = [],
  color = '#059669',
  className = '',
  height = 44,
  width = 160,
  filled = true,
}) {
  if (data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  const stepX = width / (data.length - 1)
  const pad = 4
  const usable = height - pad * 2

  const points = data.map((value, index) => {
    const x = index * stepX
    const y = pad + usable - ((value - min) / span) * usable
    return [x, y]
  })

  const line = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const area = `${line} ${width},${height} 0,${height}`
  const id = `spark-${color.replace('#', '')}-${data.length}`

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={`h-11 w-full ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.24" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {filled ? <polygon points={area} fill={`url(#${id})`} /> : null}
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

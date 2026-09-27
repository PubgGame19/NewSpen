export default function Card({
  className = '',
  hover = false,
  children,
  ...props
}) {
  return (
    <div
      className={`card ${hover ? 'card-hover' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  title,
  subtitle,
  eyebrow,
  action,
  className = '',
}) {
  return (
    <div
      className={`flex flex-wrap items-start justify-between gap-3 ${className}`}
    >
      <div className="min-w-0">
        {eyebrow ? <p className="eyebrow mb-1">{eyebrow}</p> : null}
        <h3 className="heading text-[15px] font-semibold sm:text-base">{title}</h3>
        {subtitle ? (
          <p className="muted mt-1 text-[13px] leading-snug">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

import { CardHeader } from '../ui/Card'

export default function ChartCard({
  title,
  subtitle,
  eyebrow,
  action,
  legend,
  footer,
  height = 280,
  className = '',
  children,
}) {
  return (
    <section className={`card card-pad ${className}`}>
      <CardHeader
        title={title}
        subtitle={subtitle}
        eyebrow={eyebrow}
        action={action}
      />

      {legend ? (
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          {legend.map((item) => (
            <span
              key={item.label}
              className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300"
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: item.color }}
              />
              {item.label}
              {item.value ? (
                <span className="tabular font-semibold text-slate-900 dark:text-white">
                  {item.value}
                </span>
              ) : null}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-4 w-full" style={{ height }}>
        {children}
      </div>

      {footer ? (
        <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
          {footer}
        </div>
      ) : null}
    </section>
  )
}

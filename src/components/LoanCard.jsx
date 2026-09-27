import { ArrowRight, CalendarClock, Landmark, Percent, Wallet } from 'lucide-react'
import { formatINR, formatLongDate } from '../utils/format'
import { ratioPercent } from '../utils/finance'
import Button from './ui/Button'
import ProgressBar from './ui/ProgressBar'

export default function LoanCard({ loan, onView }) {
  const repaid = 100 - ratioPercent(loan.outstanding, loan.originalAmount)
  const tenorUsed = ratioPercent(loan.paidMonths, loan.tenureMonths)

  const stats = [
    { label: 'Interest rate', value: `${loan.interestRate}% p.a.`, icon: Percent },
    { label: 'Monthly EMI', value: formatINR(loan.emi), icon: Wallet },
    {
      label: 'Tenure left',
      value: `${loan.tenureMonths - loan.paidMonths} of ${loan.tenureMonths} months`,
      icon: CalendarClock,
    },
  ]

  return (
    <article className="card card-hover card-pad animate-rise">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
            <Landmark size={20} strokeWidth={2.1} />
          </span>
          <div>
            <h3 className="heading text-[15px] font-semibold">{loan.name}</h3>
            <p className="muted text-xs">
              {loan.lender} · {loan.accountNumber}
            </p>
          </div>
        </div>
        <span className="badge bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
          {loan.status}
        </span>
      </div>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Outstanding</p>
          <p className="tabular heading mt-1 text-2xl font-bold">
            {formatINR(loan.outstanding)}
          </p>
        </div>
        <div className="text-right">
          <p className="eyebrow">Original amount</p>
          <p className="tabular muted mt-1 text-sm font-semibold">
            {formatINR(loan.originalAmount)}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-[11px] font-semibold">
          <span className="muted">Principal repaid {Math.round(repaid)}%</span>
          <span className="muted">Tenor used {Math.round(tenorUsed)}%</span>
        </div>
        <ProgressBar value={repaid} height="h-2.5" />
      </div>

      <dl className="mt-5 grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-3 dark:border-slate-800">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <stat.icon size={15} strokeWidth={2.1} />
            </span>
            <div className="min-w-0">
              <dt className="muted text-[11px] font-medium uppercase tracking-wide">
                {stat.label}
              </dt>
              <dd className="heading tabular truncate text-[13px] font-semibold">
                {stat.value}
              </dd>
            </div>
          </div>
        ))}
      </dl>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-950/40">
        <div>
          <p className="muted text-[11px] font-semibold uppercase tracking-wide">
            Next payment
          </p>
          <p className="heading text-[13px] font-semibold">
            {formatLongDate(loan.nextPaymentDate)}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          iconRight={ArrowRight}
          onClick={() => onView?.(loan)}
        >
          View Details
        </Button>
      </div>
    </article>
  )
}

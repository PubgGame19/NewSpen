import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import {
  ArrowRight,
  Calculator,
  CalendarClock,
  Landmark,
  Plus,
  Receipt,
  Wallet,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { calculateEMI, ratioPercent } from '../utils/finance'
import {
  formatINR,
  formatINRCompact,
  formatMediumDate,
  formatNumber,
} from '../utils/format'
import LoanCard from '../components/LoanCard'
import LoanDetailsModal from '../components/LoanDetailsModal'
import AddLoanModal from '../components/AddLoanModal'
import EmptyState from '../components/ui/EmptyState'
import ChartTooltip from '../components/charts/ChartTooltip'
import { useChartTheme } from '../components/charts/chartTheme'
import Button from '../components/ui/Button'
import Card, { CardHeader } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import ScoreRing from '../components/ui/ScoreRing'

const PRESETS = [
  { label: 'Education loan', amount: 500000, rate: 8.5, years: 5 },
  { label: 'Personal loan', amount: 120000, rate: 11.5, years: 3 },
  { label: 'Two-wheeler', amount: 90000, rate: 9.9, years: 2 },
  { label: 'Home loan', amount: 2500000, rate: 8.25, years: 20 },
]

function buildBalanceCurve(amount, rate, years, emi) {
  if (!amount || !rate || !years || !emi) return []
  const monthlyRate = rate / 12 / 100
  let balance = amount
  const points = []
  const totalMonths = Math.round(years * 12)
  for (let month = 0; month <= totalMonths; month += 1) {
    if (month % 12 === 0 || month === totalMonths) {
      points.push({
        label: `Y${(month / 12).toFixed(0)}`,
        month,
        balance: Math.max(0, Math.round(balance)),
      })
    }
    const interest = balance * monthlyRate
    balance = Math.max(0, balance - (emi - interest))
  }
  return points
}

export default function Loans() {
  const { pushToast, emiTotal, loanOutstanding, loans, loanCount } = useApp()
  const theme = useChartTheme()
  const [selectedId, setSelectedId] = useState(null)
  const [addOpen, setAddOpen] = useState(false)
  const [prefill, setPrefill] = useState(null)

  const [amount, setAmount] = useState(0)
  const [rate, setRate] = useState(0)
  const [years, setYears] = useState(0)

  /* always read the live record so pay/remove actions refresh the dialog */
  const selected = loans.find((loan) => loan.id === selectedId) || null

  const result = useMemo(
    () => calculateEMI(amount, rate, years),
    [amount, rate, years],
  )

  const balanceCurve = useMemo(
    () => buildBalanceCurve(Number(amount) || 0, Number(rate) || 0, Number(years) || 0, result.emi),
    [amount, rate, years, result.emi],
  )

  const split = [
    { name: 'Principal', value: Number(amount) || 0, color: '#059669' },
    {
      name: 'Interest',
      value: result.totalInterest,
      color: theme.dark ? '#f59e0b' : '#fbbf24',
    },
  ]
  const interestShare = ratioPercent(result.totalInterest, result.totalPayment)

  const upcomingLoan = [...loans].sort((a, b) =>
    a.nextPaymentDate < b.nextPaymentDate ? -1 : 1,
  )[0]

  const summary = [
    {
      label: 'Total Outstanding',
      value: formatINR(loanOutstanding),
      hint: `${loanCount} active ${loanCount === 1 ? 'loan' : 'loans'}`,
      icon: Landmark,
      tone: 'emerald',
    },
    {
      label: 'Monthly EMI',
      value: formatINR(emiTotal),
      hint: 'Auto-debited each month',
      icon: Wallet,
      tone: 'sky',
    },
    {
      label: 'Next Instalment',
      value: upcomingLoan ? formatMediumDate(upcomingLoan.nextPaymentDate) : '—',
      hint: upcomingLoan
        ? `${upcomingLoan.name} · ${formatINR(upcomingLoan.emi)}`
        : 'No loans tracked yet',
      icon: CalendarClock,
      tone: 'amber',
    },
  ]

  return (
    <div className="space-y-6">
      {/* --------------------------------------------------------- header */}
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="heading text-xl font-bold tracking-tight sm:text-2xl">
            Loans &amp; EMIs
          </h2>
          <p className="muted mt-1 text-[13px] sm:text-sm">
            Manage your loans and upcoming repayments.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {loans.length > 0 ? (
            <Badge tone="emerald">On-time payer</Badge>
          ) : (
            <Badge tone="slate">No active loans</Badge>
          )}
          <Button
            variant="ghost"
            icon={Receipt}
            onClick={() => {
              if (loans.length === 0) {
                pushToast({
                  title: 'No loans tracked',
                  body: 'Add your first loan to generate repayment reports.',
                  tone: 'sky',
                })
                return
              }
              pushToast({
                title: 'Repayment report generated',
                body: `A summary of your ${loans.length} active loans has been exported.`,
                tone: 'emerald',
              })
            }}
          >
            Repayment report
          </Button>
          <Button
            icon={Plus}
            onClick={() => {
              setPrefill(null)
              setAddOpen(true)
            }}
          >
            Add Loan
          </Button>
        </div>
      </section>

      {/* -------------------------------------------------------- summary */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {summary.map((item) => (
          <article key={item.label} className="card card-hover card-pad animate-rise">
            <div className="flex items-start justify-between gap-3">
              <p className="eyebrow">{item.label}</p>
              <span
                className={`grid h-9 w-9 place-items-center rounded-xl ${
                  item.tone === 'emerald'
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300'
                    : item.tone === 'sky'
                      ? 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300'
                      : item.tone === 'amber'
                        ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300'
                        : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300'
                }`}
              >
                <item.icon size={17} strokeWidth={2.2} />
              </span>
            </div>
            <p className="tabular heading mt-3 text-2xl font-bold">{item.value}</p>
            <p className="muted mt-2 text-xs font-medium">{item.hint}</p>
          </article>
        ))}
      </section>

      {/* ---------------------------------------------------- loan cards */}
      <section>
        <CardHeader
          title={`Your Loans (${loans.length})`}
          subtitle="Tap a card to see the repayment schedule, pay an EMI or remove it."
          className="mb-4"
          action={
            <Button
              variant="ghost"
              size="sm"
              icon={Plus}
              onClick={() => {
                setPrefill(null)
                setAddOpen(true)
              }}
            >
              Add Loan
            </Button>
          }
        />

        {loans.length ? (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {loans.map((loan) => (
              <LoanCard
                key={loan.id}
                loan={loan}
                onView={(item) => setSelectedId(item.id)}
              />
            ))}
          </div>
        ) : (
          <Card className="animate-rise">
            <EmptyState
              icon={Landmark}
              title="No loans tracked yet"
              body="Add your education, personal or vehicle loan to track EMIs, outstanding balance and the repayment schedule."
              actionLabel="Add your first loan"
              onAction={() => {
                setPrefill(null)
                setAddOpen(true)
              }}
            />
          </Card>
        )}
      </section>

      {/* ------------------------------------------------ EMI calculator */}
      <Card className="card-pad animate-rise">
        <CardHeader
          eyebrow="Calculator"
          title="EMI Calculator"
          subtitle="Move the sliders or type a value — results update instantly."
          action={
            <Badge tone="emerald" icon={Calculator}>
              {formatNumber(result.months)} months
            </Badge>
          }
        />

        <div className="mt-5 flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setAmount(preset.amount)
                setRate(preset.rate)
                setYears(preset.years)
              }}
              className={`chip ${
                Number(amount) === preset.amount && Number(rate) === preset.rate
                  ? 'bg-emerald-600 text-white'
                  : 'chip-idle'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* inputs */}
          <div className="space-y-6 lg:col-span-3">
            {[
              {
                key: 'amount',
                label: 'Loan Amount',
                value: amount,
                min: 10000,
                max: 5000000,
                step: 10000,
                inputStep: 'any',
                prefix: '₹',
                set: setAmount,
                format: (value) => formatINR(value),
              },
              {
                key: 'rate',
                label: 'Interest Rate (p.a.)',
                value: rate,
                min: 5,
                max: 24,
                step: 0.1,
                inputStep: 'any',
                suffix: '%',
                set: setRate,
                format: (value) => `${Number(value).toFixed(1)}%`,
              },
              {
                key: 'years',
                label: 'Loan Tenure',
                value: years,
                min: 1,
                max: 20,
                step: 1,
                inputStep: 'any',
                suffix: 'years',
                set: setYears,
                format: (value) => `${value} ${Number(value) === 1 ? 'year' : 'years'}`,
              },
            ].map((field) => (
              <div key={field.key}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label
                    htmlFor={`emi-${field.key}`}
                    className="eyebrow"
                  >
                    {field.label}
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="tabular heading text-[15px] font-bold">
                      {field.format(field.value)}
                    </span>
                    <div className="relative">
                      {field.prefix ? (
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-slate-400">
                          {field.prefix}
                        </span>
                      ) : null}
                      <input
                        id={`emi-${field.key}`}
                        type="number"
                        min={field.min}
                        max={field.max}
                        step={field.inputStep || field.step}
                        value={field.value}
                        onChange={(event) => field.set(event.target.value)}
                        className={`input tabular w-32 py-2 text-right ${
                          field.prefix ? 'pl-7' : ''
                        } ${field.suffix ? 'pr-9' : ''}`}
                      />
                      {field.suffix ? (
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-400">
                          {field.suffix === 'years' ? 'yr' : field.suffix}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <input
                  type="range"
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={field.value}
                  onChange={(event) => field.set(event.target.value)}
                  aria-label={field.label}
                  className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-100 accent-emerald-600 dark:bg-slate-800"
                />
                <div className="muted mt-1.5 flex justify-between text-[10px] font-medium">
                  <span>{field.format(field.min)}</span>
                  <span>{field.format(field.max)}</span>
                </div>
              </div>
            ))}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                {
                  label: 'Monthly EMI',
                  value: formatINR(result.emi),
                  tone: 'text-emerald-600 dark:text-emerald-400',
                },
                {
                  label: 'Total Interest',
                  value: formatINR(result.totalInterest),
                  tone: 'text-amber-600 dark:text-amber-400',
                },
                {
                  label: 'Total Payment',
                  value: formatINR(result.totalPayment),
                  tone: 'text-slate-900 dark:text-white',
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/40"
                >
                  <p className="muted text-[10px] font-semibold uppercase tracking-wide">
                    {item.label}
                  </p>
                  <p className={`tabular mt-1.5 text-lg font-bold ${item.tone}`}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <p className="muted flex items-start gap-2 rounded-xl bg-slate-50 p-3.5 text-[11px] leading-snug dark:bg-slate-950/40">
              <Calculator size={14} className="mt-px shrink-0" />
              EMI uses the standard reducing-balance formula
              P×r×(1+r)ⁿ ÷ ((1+r)ⁿ−1). With this loan you would pay{' '}
              <strong className="heading">{formatINR(result.totalInterest)}</strong>{' '}
              in interest — shortening the tenure to{' '}
              {Math.max(1, Math.round(Number(years) - 1))} years cuts it
              substantially.
            </p>
          </div>

          {/* visuals */}
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <p className="heading text-[13px] font-semibold">
                  Payment split
                </p>
                <span className="badge bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                  {interestShare.toFixed(1)}% interest
                </span>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <div className="relative h-[150px] flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={split}
                        dataKey="value"
                        innerRadius={44}
                        outerRadius={66}
                        paddingAngle={3}
                        stroke="none"
                        animationDuration={700}
                      >
                        {split.map((slice) => (
                          <Cell key={slice.name} fill={slice.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
                    <p className="tabular heading text-sm font-bold">
                      {formatINRCompact(result.totalPayment)}
                    </p>
                    <p className="muted text-[9px] font-semibold uppercase tracking-wide">
                      total
                    </p>
                  </div>
                </div>

                <ul className="w-32 space-y-3">
                  {split.map((slice) => (
                    <li key={slice.name}>
                      <span className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ background: slice.color }}
                        />
                        {slice.name}
                      </span>
                      <p className="tabular heading mt-0.5 text-[13px] font-bold">
                        {formatINR(slice.value)}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
              <p className="heading text-[13px] font-semibold">
                Outstanding balance over time
              </p>
              <div className="mt-3 h-[170px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={balanceCurve}
                    margin={{ top: 4, right: 6, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={theme.grid} />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 10, fill: theme.tick }}
                      dy={6}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 10, fill: theme.tick }}
                      tickFormatter={(value) => formatINRCompact(value)}
                      width={56}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="balance"
                      name="Balance"
                      stroke="#0ea5e9"
                      strokeWidth={2.2}
                      fill="url(#balanceFill)"
                      animationDuration={800}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/5">
              <ScoreRing
                value={100 - interestShare}
                size={92}
                stroke={9}
                label={`${Math.round(100 - interestShare)}%`}
                caption="principal"
              />
              <div>
                <p className="heading text-[13px] font-semibold">
                  Keep tenure shorter
                </p>
                <p className="muted mt-1 text-[11px] leading-snug">
                  A 5-year loan at {Number(rate).toFixed(1)}% costs{' '}
                  {interestShare.toFixed(0)}% of your total payment as interest.
                  Every extra EMI paid early reduces this share.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    iconRight={ArrowRight}
                    onClick={() =>
                      pushToast({
                        title: 'Prepayment planned',
                        body: 'An extra EMI every quarter can cut your tenure by up to 8 months.',
                        tone: 'emerald',
                      })
                    }
                  >
                    Plan a prepayment
                  </Button>
                  <Button
                    variant="soft"
                    size="sm"
                    icon={Plus}
                    onClick={() => {
                      setPrefill({
                        name: '',
                        lender: '',
                        type: 'Personal',
                        originalAmount: String(Number(amount) || 0),
                        outstanding: String(Number(amount) || 0),
                        interestRate: String(Number(rate) || 0),
                        emi: String(result.emi),
                        tenureMonths: String(result.months),
                        paidMonths: '0',
                        nextPaymentDate: '2026-10-05',
                      })
                      setAddOpen(true)
                    }}
                  >
                    Save as a loan
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <LoanDetailsModal
        loan={selected}
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
      />

      <AddLoanModal
        open={addOpen}
        initial={prefill}
        onClose={() => {
          setAddOpen(false)
          setPrefill(null)
        }}
      />
    </div>
  )
}

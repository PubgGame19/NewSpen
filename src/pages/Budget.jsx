import { useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  PiggyBank,
  SlidersHorizontal,
  Target,
  TrendingDown,
  Wallet,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { budgetStatus, ratioPercent } from '../utils/finance'
import {
  formatINR,
  formatINRCompact,
  formatPercent,
  formatPercentDown,
} from '../utils/format'
import BudgetCard from '../components/BudgetCard'
import EditBudgetModal from '../components/EditBudgetModal'
import ChartCard from '../components/charts/ChartCard'
import ChartTooltip from '../components/charts/ChartTooltip'
import { useChartTheme } from '../components/charts/chartTheme'
import Button from '../components/ui/Button'
import Card, { CardHeader } from '../components/ui/Card'
import ProgressBar from '../components/ui/ProgressBar'
import Badge from '../components/ui/Badge'

const LEGEND = [
  { label: 'On track', dot: 'bg-emerald-500', hint: 'under 70%' },
  { label: 'Watch', dot: 'bg-amber-500', hint: '70 – 85%' },
  { label: 'Near limit', dot: 'bg-rose-500', hint: 'above 85%' },
]

export default function Budget() {
  const {
    categoryRows,
    budgetTotal,
    totalExpenses,
    budgetRemaining,
    budgetUsagePercent,
    avgDailySpend,
    netSavings,
    savingsRate,
    period,
  } = useApp()
  const theme = useChartTheme()
  const [editOpen, setEditOpen] = useState(false)

  const overall = budgetStatus(budgetUsagePercent)
  const daysInMonth = 30
  const daysLeft = Math.max(1, daysInMonth - 27)
  const safePerDay = Math.max(0, Math.round(budgetRemaining / daysLeft))

  const chartData = categoryRows.map((row) => ({
    category: row.category,
    Spent: row.spent,
    Budget: row.limit,
  }))

  const tiles = [
    {
      label: 'Monthly Budget',
      value: formatINR(budgetTotal),
      hint: 'Six category envelopes',
      icon: Target,
      tone: 'emerald',
    },
    {
      label: 'Used',
      value: formatINR(totalExpenses),
      hint: `${formatPercentDown(budgetUsagePercent)} of budget`,
      icon: Wallet,
      tone: 'amber',
    },
    {
      label: 'Remaining',
      value: formatINR(budgetRemaining),
      hint: `${formatINR(safePerDay)} safe to spend per day`,
      icon: PiggyBank,
      tone: 'sky',
    },
    {
      label: 'Budget Usage',
      value: formatPercentDown(budgetUsagePercent),
      hint: overall.label,
      icon: TrendingDown,
      tone: 'indigo',
    },
  ]

  return (
    <div className="space-y-6">
      {/* --------------------------------------------------------- header */}
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="heading text-xl font-bold tracking-tight sm:text-2xl">
            Monthly Budget
          </h2>
          <p className="muted mt-1 text-[13px] sm:text-sm">
            Stay on track with your spending goals.
          </p>
        </div>
        <Button
          icon={SlidersHorizontal}
          onClick={() => setEditOpen(true)}
        >
          Edit Budget
        </Button>
      </section>

      {/* -------------------------------------------------------- overview */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((tile) => (
          <article key={tile.label} className="card card-hover card-pad animate-rise">
            <div className="flex items-start justify-between gap-3">
              <p className="eyebrow">{tile.label}</p>
              <span
                className={`grid h-9 w-9 place-items-center rounded-xl ${
                  tile.tone === 'emerald'
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300'
                    : tile.tone === 'amber'
                      ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300'
                      : tile.tone === 'sky'
                        ? 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300'
                        : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300'
                }`}
              >
                <tile.icon size={17} strokeWidth={2.2} />
              </span>
            </div>
            <p className="tabular heading mt-3 text-2xl font-bold">{tile.value}</p>
            <p className="muted mt-2 text-xs font-medium">{tile.hint}</p>
          </article>
        ))}
      </section>

      {/* --------------------------------------------------- overall gauge */}
      <Card className="card-pad animate-rise">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">{period} envelope</p>
            <h3 className="heading mt-1 text-lg font-bold">
              {formatINR(totalExpenses)} spent of {formatINR(budgetTotal)}
            </h3>
            <p className="muted mt-1 text-[13px]">
              {formatINR(budgetRemaining)} remains · {formatINR(safePerDay)} per
              day for the last {daysLeft} days
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              tone={overall.key === 'normal' ? 'emerald' : overall.key === 'warning' ? 'amber' : 'rose'}
              icon={overall.key === 'normal' ? CheckCircle2 : AlertTriangle}
            >
              {overall.label}
            </Badge>
            <Badge tone="sky" icon={Info}>
              Savings rate {formatPercent(savingsRate)}
            </Badge>
          </div>
        </div>

        <ProgressBar
          value={budgetUsagePercent}
          bar={overall.bar}
          height="h-3.5"
          className="mt-4"
        />

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
          {LEGEND.map((item) => (
            <span
              key={item.label}
              className="flex items-center gap-2 text-[11px] font-medium text-slate-500 dark:text-slate-400"
            >
              <span className={`h-2 w-2 rounded-full ${item.dot}`} />
              {item.label}
              <span className="text-slate-400 dark:text-slate-500">
                ({item.hint})
              </span>
            </span>
          ))}
        </div>
      </Card>

      {/* ------------------------------------------------------- comparison */}
      <ChartCard
        title="Budget vs Actual"
        subtitle="How each envelope is tracking this month"
        eyebrow="Comparison"
        height={280}
        legend={[
          { label: 'Spent', color: '#059669' },
          { label: 'Budget', color: theme.dark ? '#475569' : '#cbd5e1' },
        ]}
        footer={
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="muted text-[10px] font-semibold uppercase tracking-wide">
                Tightest envelope
              </p>
              <p className="heading mt-1 text-[13px] font-bold">
                {
                  [...categoryRows].sort((a, b) => b.usedPercent - a.usedPercent)[0]
                    .category
                }{' '}
                ·{' '}
                {formatPercent(
                  [...categoryRows].sort(
                    (a, b) => b.usedPercent - a.usedPercent,
                  )[0].usedPercent,
                )}
              </p>
            </div>
            <div>
              <p className="muted text-[10px] font-semibold uppercase tracking-wide">
                Most headroom
              </p>
              <p className="heading mt-1 text-[13px] font-bold">
                {
                  [...categoryRows].sort((a, b) => a.usedPercent - b.usedPercent)[0]
                    .category
                }{' '}
                ·{' '}
                {formatINR(
                  [...categoryRows].sort(
                    (a, b) => a.usedPercent - b.usedPercent,
                  )[0].remaining,
                )}{' '}
                left
              </p>
            </div>
            <div>
              <p className="muted text-[10px] font-semibold uppercase tracking-wide">
                Avg daily spend
              </p>
              <p className="tabular heading mt-1 text-[13px] font-bold">
                {formatINR(avgDailySpend)}
              </p>
            </div>
            <div>
              <p className="muted text-[10px] font-semibold uppercase tracking-wide">
                Monthly savings
              </p>
              <p className="tabular mt-1 text-[13px] font-bold text-emerald-600 dark:text-emerald-400">
                {formatINR(netSavings)}
              </p>
            </div>
          </div>
        }
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            barGap={4}
          >
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={theme.grid} />
            <XAxis
              dataKey="category"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: theme.tick }}
              dy={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: theme.tick }}
              tickFormatter={(value) => formatINRCompact(value)}
              width={62}
            />
            <Tooltip
              cursor={{ fill: theme.dark ? '#1e293b66' : '#f1f5f966' }}
              content={<ChartTooltip />}
            />
            <Legend
              verticalAlign="top"
              align="right"
              height={28}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12 }}
            />
            <Bar
              dataKey="Spent"
              fill="#059669"
              radius={[6, 6, 0, 0]}
              maxBarSize={26}
              animationDuration={900}
            />
            <Bar
              dataKey="Budget"
              fill={theme.dark ? '#475569' : '#cbd5e1'}
              radius={[6, 6, 0, 0]}
              maxBarSize={26}
              animationDuration={900}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ---------------------------------------------------- budget cards */}
      <section>
        <CardHeader
          title="Category Budgets"
          subtitle="Limits update instantly when you edit your budget."
          className="mb-4"
          action={
            <Button
              variant="ghost"
              size="sm"
              icon={SlidersHorizontal}
              onClick={() => setEditOpen(true)}
            >
              Edit limits
            </Button>
          }
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categoryRows.map((row) => (
            <BudgetCard key={row.category} row={row} />
          ))}
        </div>
      </section>

      {/* ----------------------------------------------------------- tips */}
      <Card className="card-pad animate-rise">
        <CardHeader
          title="Smart adjustments"
          subtitle="Small changes that keep this month inside the envelope."
        />
        <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            {
              title: 'Shopping is 96% used',
              body: `Only ${formatINR(
                categoryRows.find((r) => r.category === 'Shopping')?.remaining || 0,
              )} left — pause online orders until October.`,
            },
            {
              title: 'Food is 77.5% used',
              body: `Reducing delivery orders by ₹500 brings Food back to a comfortable pace.`,
            },
            {
              title: 'Bills are fixed',
              body: 'Rent, electricity and broadband rarely change — keep ₹8,000 ring-fenced.',
            },
            {
              title: 'Move surplus to savings',
              body: `Projected surplus is ${formatINR(
                netSavings,
              )}. Transfer it on the 1st so it is not spent.`,
            },
          ].map((tip) => (
            <li
              key={tip.title}
              className="flex gap-3 rounded-xl border border-slate-200 p-3.5 dark:border-slate-800"
            >
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                <TrendingDown size={15} strokeWidth={2.2} />
              </span>
              <div>
                <p className="heading text-[13px] font-semibold">{tip.title}</p>
                <p className="muted mt-0.5 text-[12px] leading-snug">{tip.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <EditBudgetModal open={editOpen} onClose={() => setEditOpen(false)} />
    </div>
  )
}

import { useNavigate } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ArrowRight,
  BellRing,
  CalendarClock,
  CreditCard,
  Landmark,
  PiggyBank,
  Plus,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { CATEGORY_META, UPCOMING_PAYMENTS } from '../data/mockData'
import {
  daysUntil,
  formatINR,
  formatINRCompact,
  formatLongDate,
  formatPercent,
  formatPercentDown,
  greeting,
} from '../utils/format'
import { ratioPercent } from '../utils/finance'
import StatCard from '../components/StatCard'
import ChartCard from '../components/charts/ChartCard'
import ChartTooltip from '../components/charts/ChartTooltip'
import { useChartTheme } from '../components/charts/chartTheme'
import ScoreRing from '../components/ui/ScoreRing'
import ProgressBar from '../components/ui/ProgressBar'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card, { CardHeader } from '../components/ui/Card'
import TransactionList from '../components/TransactionList'
import CategoryIcon from '../components/CategoryIcon'

const HEALTH_ROWS = [
  {
    key: 'savings',
    label: 'Savings Rate',
    hint: 'of monthly income saved',
    bar: 'bg-emerald-500',
    pick: (m) => m.savingsRate,
    display: (m) => formatPercent(m.savingsRate),
    scale: 100,
  },
  {
    key: 'budget',
    label: 'Monthly Budget Usage',
    hint: 'of the ₹35,000 envelope',
    bar: 'bg-sky-500',
    pick: (m) => m.budgetUsagePercent,
    display: (m) => formatPercentDown(m.budgetUsagePercent),
    scale: 100,
  },
  {
    key: 'debt',
    label: 'Debt-to-Income',
    hint: 'EMIs vs monthly income',
    bar: 'bg-amber-500',
    pick: (m) => m.profile.debtToIncome,
    display: (m) => `${m.profile.debtToIncome}%`,
    scale: 50,
  },
]

export default function Dashboard() {
  const metrics = useApp()
  const {
    profile,
    transactions,
    totalIncome,
    monthlySeries,
    categoryTotals,
    totalExpenses,
    balance,
    netSavings,
    budgetUsagePercent,
    budgetRemaining,
    score,
    scoreLabel,
    deltas,
    emiTotal,
    openQuickAdd,
    period,
  } = metrics
  const theme = useChartTheme()
  const navigate = useNavigate()

  /* Salary credit first, then the newest spends */
  const recent = [
    ...transactions.filter((t) => t.amount > 0),
    ...transactions
      .filter((t) => t.amount < 0)
      .sort((a, b) => (a.date < b.date ? 1 : -1)),
  ].slice(0, 6)

  const breakdown = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category,
      amount,
      percent: ratioPercent(amount, totalExpenses),
      color: CATEGORY_META[category]?.color || '#94a3b8',
    }))
    .sort((a, b) => b.amount - a.amount)

  const scoreColor =
    score.total >= 75 ? '#059669' : score.total >= 60 ? '#d97706' : '#e11d48'

  const spendTrend = monthlySeries.map((row) => row.expenses)
  const balanceTrend = [
    ...monthlySeries.map((row) => row.income - row.expenses),
  ]

  return (
    <div className="space-y-6">
      {/* ---------------------------------------------------------- hero */}
      <section className="animate-rise flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="heading text-xl font-bold tracking-tight sm:text-2xl">
            {greeting()}, {profile.firstName} 👋
          </h2>
          <p className="muted mt-1 text-[13px] sm:text-sm">
            Here's your financial overview for {period}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="emerald" icon={Sparkles}>
            Financial score {score.total}/100
          </Badge>
          <Button variant="ghost" size="sm" icon={BellRing}>
            {emiTotal ? formatINR(emiTotal) : '₹0'} EMIs this month
          </Button>
          <Button size="sm" icon={Plus} onClick={openQuickAdd}>
            Add Expense
          </Button>
        </div>
      </section>

      {/* --------------------------------------------------------- stats */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Balance"
          value={formatINR(balance)}
          delta={deltas.balance.value}
          deltaLabel="from last month"
          icon={Wallet}
          tone="emerald"
          spark={[31200, 36400, 40900, 47700, 48475, balance]}
        />
        <StatCard
          label="Monthly Income"
          value={formatINR(profile.monthlyIncome)}
          delta={deltas.income.value}
          deltaLabel="This month"
          icon={TrendingUp}
          tone="sky"
          spark={[...monthlySeries.slice(0, 5).map((row) => row.income), totalIncome]}
        />
        <StatCard
          label="Monthly Expenses"
          value={formatINR(totalExpenses)}
          delta={deltas.expenses.value}
          deltaLabel="from last month"
          icon={CreditCard}
          tone="amber"
          invertDelta
          spark={spendTrend}
        />
        <StatCard
          label="Savings"
          value={formatINR(netSavings)}
          delta={deltas.savings.value}
          deltaLabel="from last month"
          icon={PiggyBank}
          tone="indigo"
          spark={balanceTrend}
        />
      </section>

      {/* ------------------------------------------- score + health row */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="card-pad animate-rise flex flex-col items-center justify-between gap-5 text-center xl:items-start xl:text-left">
          <CardHeader
            eyebrow="Financial Score"
            title="Health of your money"
            className="w-full"
          />
          <div className="flex w-full flex-col items-center gap-5 sm:flex-row sm:justify-around xl:flex-col xl:items-start">
            <ScoreRing
              value={score.total}
              label={`${score.total}`}
              caption="/ 100"
              color={scoreColor}
            />
            <div className="w-full space-y-3">
              {score.pillars.map((pillar) => (
                <div key={pillar.key}>
                  <div className="mb-1.5 flex items-center justify-between text-[12px]">
                    <span className="muted font-medium">{pillar.label}</span>
                    <span className="tabular heading font-semibold">
                      {pillar.value}
                    </span>
                  </div>
                  <ProgressBar
                    value={pillar.value}
                    bar={
                      pillar.value >= 80
                        ? 'bg-emerald-500'
                        : pillar.value >= 60
                          ? 'bg-sky-500'
                          : 'bg-amber-500'
                    }
                    height="h-1.5"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="flex w-full flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
            <Badge tone={scoreLabel.tone}>{scoreLabel.label}</Badge>
            <span className="muted text-[11px] font-medium">
              Updated {period.split(' ')[0]} 2026
            </span>
          </div>
        </Card>

        <Card className="card-pad animate-rise xl:col-span-2">
          <CardHeader
            title="Financial Health"
            subtitle="Three ratios that decide how comfortable your month looks."
            action={
              <Button
                variant="ghost"
                size="sm"
                iconRight={ArrowRight}
                onClick={() => navigate('/insights')}
              >
                Insights
              </Button>
            }
          />

          <div className="mt-6 space-y-6">
            {HEALTH_ROWS.map((row) => {
              const raw = row.pick(metrics)
              const scaled = (raw / row.scale) * 100
              return (
                <div key={row.key}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div>
                      <p className="heading text-[13px] font-semibold">
                        {row.label}
                      </p>
                      <p className="muted text-[11px]">{row.hint}</p>
                    </div>
                    <p className="tabular heading text-lg font-bold">
                      {row.display(metrics)}
                    </p>
                  </div>
                  <ProgressBar value={scaled} bar={row.bar} className="mt-2.5" />
                </div>
              )
            })}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-4 dark:border-slate-800">
            {[
              { label: 'Avg daily spend', value: formatINR(metrics.avgDailySpend) },
              { label: 'Budget left', value: formatINR(budgetRemaining) },
              { label: 'Total EMI', value: formatINR(emiTotal) },
              {
                label: 'Budget used',
                value: formatPercentDown(budgetUsagePercent),
              },
            ].map((item) => (
              <div key={item.label}>
                <p className="muted text-[10px] font-semibold uppercase tracking-wide">
                  {item.label}
                </p>
                <p className="tabular heading mt-1 text-[15px] font-bold">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* -------------------------------------------------------- charts */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ChartCard
          className="xl:col-span-2"
          title="Income vs Expenses"
          subtitle="Last six months, in ₹"
          eyebrow="Cash flow"
          height={300}
          legend={[
            { label: 'Income', color: '#059669' },
            { label: 'Expenses', color: theme.dark ? '#94a3b8' : '#0f172a' },
          ]}
          footer={
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <p className="muted text-[10px] font-semibold uppercase tracking-wide">
                  6-month income
                </p>
                <p className="tabular heading mt-1 text-sm font-bold">
                  {formatINR(monthlySeries.reduce((s, r) => s + r.income, 0))}
                </p>
              </div>
              <div>
                <p className="muted text-[10px] font-semibold uppercase tracking-wide">
                  6-month spend
                </p>
                <p className="tabular heading mt-1 text-sm font-bold">
                  {formatINR(monthlySeries.reduce((s, r) => s + r.expenses, 0))}
                </p>
              </div>
              <div>
                <p className="muted text-[10px] font-semibold uppercase tracking-wide">
                  Average surplus
                </p>
                <p className="tabular mt-1 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {formatINR(
                    Math.round(
                      monthlySeries.reduce((s, r) => s + r.savings, 0) /
                        monthlySeries.length,
                    ),
                  )}
                </p>
              </div>
            </div>
          }
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlySeries}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              barGap={6}
            >
              <CartesianGrid
                strokeDasharray="4 4"
                vertical={false}
                stroke={theme.grid}
              />
              <XAxis
                dataKey="short"
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
              <Bar
                dataKey="income"
                name="Income"
                fill="#059669"
                radius={[6, 6, 0, 0]}
                maxBarSize={26}
                animationDuration={900}
              />
              <Bar
                dataKey="expenses"
                name="Expenses"
                fill={theme.dark ? '#64748b' : '#0f172a'}
                radius={[6, 6, 0, 0]}
                maxBarSize={26}
                animationDuration={900}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <Card className="card-pad animate-rise">
          <CardHeader
            title="Expense Breakdown"
            subtitle={`${formatINR(totalExpenses)} across ${breakdown.length} categories`}
          />

          <div className="relative mt-2 h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={breakdown}
                  dataKey="amount"
                  nameKey="category"
                  innerRadius={62}
                  outerRadius={92}
                  paddingAngle={3}
                  stroke="none"
                  animationDuration={900}
                >
                  {breakdown.map((slice) => (
                    <Cell key={slice.category} fill={slice.color} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
              <p className="muted text-[10px] font-semibold uppercase tracking-wide">
                September
              </p>
              <p className="tabular heading text-lg font-bold">
                {formatINR(totalExpenses)}
              </p>
            </div>
          </div>

          <ul className="mt-3 space-y-2.5">
            {breakdown.map((slice) => (
              <li key={slice.category} className="flex items-center gap-3">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: slice.color }}
                />
                <span className="heading flex-1 text-[13px] font-medium">
                  {slice.category}
                </span>
                <span className="tabular muted text-[12px] font-medium">
                  {formatINR(slice.amount)}
                </span>
                <span className="tabular heading w-12 text-right text-[12px] font-semibold">
                  {slice.percent.toFixed(1)}%
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* ------------------------------------------- transactions + bills */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="animate-rise xl:col-span-2">
          <div className="px-5 pt-5 sm:px-6">
            <CardHeader
              title="Recent Transactions"
              subtitle={`${transactions.length} entries this period · latest first`}
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  iconRight={ArrowRight}
                  onClick={() => navigate('/expenses')}
                >
                  View all
                </Button>
              }
            />
          </div>
          <TransactionList items={recent} className="mt-3 border-t border-slate-100 dark:border-slate-800" />
        </Card>

        <Card className="card-pad animate-rise">
          <CardHeader
            title="Upcoming Payments"
            subtitle="Next 15 days · October 2026"
            action={<CalendarClock size={18} className="text-slate-400" />}
          />

          <ul className="mt-4 space-y-3">
            {UPCOMING_PAYMENTS.map((payment) => {
              const days = daysUntil(payment.dueDate)
              const soon = days <= 7
              return (
                <li
                  key={payment.id}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 px-3.5 py-3 transition hover:border-slate-300 hover:bg-slate-50/70 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-800/40"
                >
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                      payment.kind === 'loan'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300'
                        : payment.kind === 'bill'
                          ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300'
                          : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300'
                    }`}
                  >
                    {payment.kind === 'loan' ? (
                      <Landmark size={18} strokeWidth={2.1} />
                    ) : (
                      <CreditCard size={18} strokeWidth={2.1} />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="heading truncate text-[13px] font-semibold">
                      {payment.title}
                    </p>
                    <p className="muted text-[11px]">
                      Due {formatLongDate(payment.dueDate)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="tabular heading text-[13px] font-bold">
                      {formatINR(payment.amount)}
                    </p>
                    <p
                      className={`text-[10px] font-semibold ${
                        soon
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-slate-400'
                      }`}
                    >
                      in {days} days
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>

          <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-950/40">
            <span className="muted text-[11px] font-semibold uppercase tracking-wide">
              Total due
            </span>
            <span className="tabular heading text-sm font-bold">
              {formatINR(
                UPCOMING_PAYMENTS.reduce((sum, p) => sum + p.amount, 0),
              )}
            </span>
          </div>
        </Card>
      </section>

      {/* ------------------------------------------------------ ai teaser */}
      <section className="animate-rise card relative overflow-hidden">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-emerald-500/15 to-transparent blur-3xl"
          aria-hidden="true"
        />
        <div className="relative flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white">
              <Sparkles size={20} strokeWidth={2.2} />
            </span>
            <div>
              <p className="eyebrow">SPENANCE AI</p>
              <h3 className="heading mt-1 text-[15px] font-semibold">
                You could save about ₹2,000 more this month.
              </h3>
              <p className="muted mt-1 max-w-xl text-[13px] leading-snug">
                Food delivery is up 18% and Shopping has 96% of its budget used.
                Ask your assistant how to rebalance without changing your
                lifestyle.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              size="md"
              icon={TrendingDown}
              onClick={() => navigate('/budget')}
            >
              Review budget
            </Button>
            <Button
              size="md"
              iconRight={ArrowRight}
              onClick={() => navigate('/ai-consultant')}
            >
              Ask SPENANCE AI
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

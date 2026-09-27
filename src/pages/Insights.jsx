import { useNavigate } from 'react-router-dom'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ArrowRight,
  Gauge,
  Landmark,
  PiggyBank,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { CATEGORY_META, INSIGHTS } from '../data/mockData'
import { ratioPercent } from '../utils/finance'
import {
  formatINR,
  formatINRCompact,
  formatMediumDate,
  formatPercent,
  formatPercentDown,
} from '../utils/format'
import InsightCard from '../components/InsightCard'
import ChartCard from '../components/charts/ChartCard'
import ChartTooltip from '../components/charts/ChartTooltip'
import { useChartTheme } from '../components/charts/chartTheme'
import ScoreRing from '../components/ui/ScoreRing'
import ProgressBar from '../components/ui/ProgressBar'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card, { CardHeader } from '../components/ui/Card'
import StatCard from '../components/StatCard'

export default function Insights() {
  const {
    monthlySeries,
    savingsGrowth,
    categoryRows,
    totalExpenses,
    totalIncome,
    netSavings,
    savingsRate,
    score,
    scoreLabel,
    emiTotal,
    loanOutstanding,
    loans,
    budgetUsagePercent,
    profile,
  } = useApp()
  const navigate = useNavigate()
  const theme = useChartTheme()

  const categoryChart = categoryRows
    .map((row) => ({
      category: row.category,
      Spent: row.spent,
      lastMonth: row.lastMonth,
      delta: row.deltaVsLastMonth,
      limit: row.limit,
      usedPercent: row.usedPercent,
      color: CATEGORY_META[row.category]?.color || '#94a3b8',
    }))
    .sort((a, b) => b.Spent - a.Spent)

  const bestMonth = [...savingsGrowth].sort((a, b) => b.saved - a.saved)[0]
  const worstMonth = [...savingsGrowth].sort((a, b) => a.saved - b.saved)[0]

  return (
    <div className="space-y-6">
      {/* --------------------------------------------------------- header */}
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="heading text-xl font-bold tracking-tight sm:text-2xl">
            Financial Insights
          </h2>
          <p className="muted mt-1 text-[13px] sm:text-sm">
            Understand your financial habits and make smarter decisions.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="emerald" icon={Sparkles}>
            {INSIGHTS.length} insights this month
          </Badge>
          <Button
            variant="ghost"
            icon={Sparkles}
            onClick={() => navigate('/ai-consultant')}
          >
            Ask SPENANCE AI
          </Button>
        </div>
      </section>

      {/* ------------------------------------------------------ kpi strip */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Savings Rate"
          value={formatPercent(savingsRate)}
          delta={6.1}
          deltaLabel="vs August (30.2%)"
          icon={PiggyBank}
          tone="emerald"
          spark={savingsGrowth.map((row) => row.saved)}
        />
        <StatCard
          label="Average Monthly Spend"
          value={formatINR(
            Math.round(
              monthlySeries.reduce((sum, row) => sum + row.expenses, 0) /
                monthlySeries.length,
            ),
          )}
          deltaLabel="6-month average"
          icon={TrendingDown}
          tone="amber"
          spark={monthlySeries.map((row) => row.expenses)}
        />
        <StatCard
          label="Financial Score"
          value={`${score.total} / 100`}
          deltaLabel={scoreLabel.label}
          icon={Gauge}
          tone="indigo"
          spark={[68, 71, 74, 76, 79, score.total]}
        />
        <StatCard
          label="Total Debt"
          value={formatINR(loanOutstanding)}
          deltaLabel={`${formatINR(emiTotal)} EMI per month`}
          icon={Landmark}
          tone="sky"
        />
      </section>

      {/* --------------------------------------------------- insight cards */}
      <section>
        <CardHeader
          title="What your data is saying"
          subtitle="Generated from this month's transactions and budgets."
          className="mb-4"
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {INSIGHTS.map((insight) => (
            <InsightCard
              key={insight.id}
              icon={insight.icon}
              tone={insight.tone}
              tag={insight.tag}
              title={insight.title}
              body={insight.body}
            />
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------- charts row 1 */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ChartCard
          className="xl:col-span-2"
          eyebrow="Trend"
          title="Monthly Spending Trend"
          subtitle="Expenses (bars) against income (line) for the last six months"
          height={300}
          legend={[
            { label: 'Expenses', color: '#059669' },
            { label: 'Income', color: theme.dark ? '#e2e8f0' : '#0f172a' },
          ]}
          action={
            <Badge tone="emerald" icon={TrendingUp}>
              {formatPercent(ratioPercent(totalIncome - 38000, 38000))} income growth
            </Badge>
          }
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={monthlySeries}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={theme.grid} />
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
                dataKey="expenses"
                name="Expenses"
                fill="#059669"
                radius={[6, 6, 0, 0]}
                maxBarSize={30}
                animationDuration={900}
              />
              <Line
                type="monotone"
                dataKey="income"
                name="Income"
                stroke={theme.dark ? '#e2e8f0' : '#0f172a'}
                strokeWidth={2.4}
                dot={{ r: 3.5, strokeWidth: 0, fill: theme.dark ? '#e2e8f0' : '#0f172a' }}
                animationDuration={1100}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        <Card className="card-pad animate-rise">
          <CardHeader
            eyebrow="Score"
            title="Financial Score"
            subtitle="Average of four money-health pillars"
          />
          <div className="mt-5 flex flex-col items-center gap-5">
            <ScoreRing
              value={score.total}
              size={148}
              label={`${score.total}`}
              caption="/ 100"
              color={score.total >= 75 ? '#059669' : '#d97706'}
            />
            <Badge tone={scoreLabel.tone}>{scoreLabel.label}</Badge>
          </div>
          <div className="mt-6 space-y-4">
            {score.pillars.map((pillar) => (
              <div key={pillar.key}>
                <div className="mb-1.5 flex items-center justify-between text-[12px]">
                  <span className="muted font-medium">{pillar.label}</span>
                  <span className="tabular heading font-semibold">
                    {pillar.value}/100
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
        </Card>
      </section>

      {/* ---------------------------------------------------- charts row 2 */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ChartCard
          className="xl:col-span-2"
          eyebrow="Cash flow"
          title="Income vs Expenses"
          subtitle="Surplus each month, in ₹"
          height={280}
          footer={
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: 'Best month', value: `${bestMonth.month} · ${formatINR(bestMonth.saved)}` },
                { label: 'Weakest month', value: `${worstMonth.month} · ${formatINR(worstMonth.saved)}` },
                { label: 'Total income', value: formatINR(totalIncome) },
                { label: 'Total savings', value: formatINR(netSavings) },
              ].map((item) => (
                <div key={item.label}>
                  <p className="muted text-[10px] font-semibold uppercase tracking-wide">
                    {item.label}
                  </p>
                  <p className="tabular heading mt-1 text-[13px] font-bold">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          }
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlySeries.map((row) => ({
                short: row.short,
                Surplus: row.savings,
                Expenses: -row.expenses,
              }))}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              stackOffset="sign"
            >
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={theme.grid} />
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
                width={66}
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
                dataKey="Surplus"
                name="Saved"
                stackId="flow"
                fill="#059669"
                radius={[6, 6, 0, 0]}
                maxBarSize={34}
                animationDuration={900}
              />
              <Bar
                dataKey="Expenses"
                name="Spent"
                stackId="flow"
                fill={theme.dark ? '#475569' : '#e2e8f0'}
                radius={[0, 0, 6, 6]}
                maxBarSize={34}
                animationDuration={900}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          eyebrow="Categories"
          title="Expense Categories"
          subtitle={`${formatINR(totalExpenses)} total · vs August`}
          height={280}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={categoryChart}
              layout="vertical"
              margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="4 4" horizontal={false} stroke={theme.grid} />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: theme.tick }}
                tickFormatter={(value) => formatINRCompact(value)}
              />
              <YAxis
                type="category"
                dataKey="category"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: theme.tick }}
                width={84}
              />
              <Tooltip
                cursor={{ fill: theme.dark ? '#1e293b66' : '#f1f5f966' }}
                content={<ChartTooltip />}
              />
              <Bar
                dataKey="Spent"
                radius={[0, 6, 6, 0]}
                maxBarSize={20}
                animationDuration={900}
              >
                {categoryChart.map((row) => (
                  <Cell key={row.category} fill={row.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      {/* ---------------------------------------------------- charts row 3 */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ChartCard
          className="xl:col-span-2"
          eyebrow="Savings"
          title="Savings Growth"
          subtitle="Monthly savings against cumulative savings"
          height={280}
          legend={[
            { label: 'Saved this month', color: '#10b981' },
            { label: 'Cumulative', color: theme.dark ? '#38bdf8' : '#0ea5e9' },
          ]}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={savingsGrowth}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="cumulativeFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={theme.grid} />
              <XAxis
                dataKey="month"
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
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="cumulative"
                name="Cumulative"
                stroke="#0ea5e9"
                strokeWidth={2.4}
                fill="url(#cumulativeFill)"
                animationDuration={900}
              />
              <Line
                type="monotone"
                dataKey="saved"
                name="Saved"
                stroke="#10b981"
                strokeWidth={2.4}
                dot={{ r: 3, strokeWidth: 0, fill: '#10b981' }}
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <Card className="card-pad animate-rise">
          <CardHeader
            eyebrow="Debt"
            title="Debt Overview"
            subtitle={`${formatINR(loanOutstanding)} outstanding across ${loans.length} ${
              loans.length === 1 ? 'loan' : 'loans'
            }`}
            action={<Badge tone="sky">{profile.debtToIncome}% DTI</Badge>}
          />

          <div className="mt-5 space-y-5">
            {loans.map((loan) => {
              const repaid = 100 - ratioPercent(loan.outstanding, loan.originalAmount)
              return (
                <div key={loan.id}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="heading text-[13px] font-semibold">{loan.name}</p>
                    <p className="tabular heading text-[13px] font-bold">
                      {formatINR(loan.outstanding)}
                    </p>
                  </div>
                  <ProgressBar
                    value={repaid}
                    bar={loan.interestRate > 10 ? 'bg-amber-500' : 'bg-emerald-500'}
                    height="h-2"
                    className="mt-2"
                  />
                  <div className="muted mt-1.5 flex justify-between text-[11px] font-medium">
                    <span>{Math.round(repaid)}% repaid</span>
                    <span>EMI {formatINR(loan.emi)}</span>
                  </div>
                </div>
              )
            })}
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
            {[
              { label: 'Monthly EMI', value: formatINR(emiTotal) },
              { label: 'Budget used', value: formatPercentDown(budgetUsagePercent) },
              { label: 'Next due', value: formatMediumDate('2026-10-05') },
              { label: 'Savings rate', value: formatPercent(savingsRate) },
            ].map((item) => (
              <div key={item.label}>
                <dt className="muted text-[10px] font-semibold uppercase tracking-wide">
                  {item.label}
                </dt>
                <dd className="tabular heading mt-1 text-[13px] font-bold">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>

          <Button
            variant="soft"
            size="sm"
            iconRight={ArrowRight}
            className="mt-5 w-full"
            onClick={() => navigate('/loans')}
          >
            Open loans &amp; EMI calculator
          </Button>
        </Card>
      </section>

      {/* --------------------------------------------------- category table */}
      <Card className="animate-rise overflow-hidden">
        <div className="px-5 pt-5 sm:px-6">
          <CardHeader
            title="Category performance"
            subtitle="This month against August, with budget utilisation"
            action={<Wallet size={18} className="text-slate-400" />}
          />
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[46rem] text-left">
            <thead className="border-y border-slate-100 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-950/30">
              <tr className="muted text-[11px] font-semibold uppercase tracking-wide">
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">September</th>
                <th className="px-5 py-3">August</th>
                <th className="px-5 py-3">Change</th>
                <th className="px-5 py-3">Budget used</th>
                <th className="px-5 py-3 text-right">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {categoryChart.map((row) => {
                const up = row.delta >= 0
                const share = ratioPercent(row.Spent, totalExpenses)
                return (
                  <tr
                    key={row.category}
                    className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-2.5">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ background: row.color }}
                        />
                        <span className="heading text-[13px] font-semibold">
                          {row.category}
                        </span>
                      </span>
                    </td>
                    <td className="tabular px-5 py-3.5 text-[13px] font-semibold text-slate-900 dark:text-slate-100">
                      {formatINR(row.Spent)}
                    </td>
                    <td className="tabular px-5 py-3.5 text-[13px] text-slate-500 dark:text-slate-400">
                      {formatINR(row.lastMonth)}
                    </td>
                    <td
                      className={`tabular px-5 py-3.5 text-[13px] font-semibold ${
                        up
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {up ? '+' : ''}
                      {row.delta.toFixed(1)}%
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className={`h-full rounded-full transition-[width] duration-700 ${
                              row.usedPercent >= 85
                                ? 'bg-rose-500'
                                : row.usedPercent >= 70
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, row.usedPercent)}%` }}
                          />
                        </div>
                        <span className="muted tabular text-[12px] font-medium">
                          {formatPercent(row.usedPercent)} of {formatINR(row.limit)}
                        </span>
                      </div>
                    </td>
                    <td className="tabular px-5 py-3.5 text-right text-[13px] font-semibold text-slate-900 dark:text-white">
                      {share.toFixed(1)}%
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

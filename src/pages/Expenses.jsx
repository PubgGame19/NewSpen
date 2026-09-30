import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  AlertTriangle,
  BarChart3,
  CalendarRange,
  CreditCard,
  FileSpreadsheet,
  Filter,
  Plus,
  Receipt,
  Repeat,
  Search,
  Tag,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { CATEGORIES, PAYMENT_METHODS } from '../data/mockData'
import {
  formatINR,
  formatINRCompact,
  formatLongDate,
  formatPercent,
} from '../utils/format'
import StatCard from '../components/StatCard'
import ChartCard from '../components/charts/ChartCard'
import ChartTooltip from '../components/charts/ChartTooltip'
import { useChartTheme } from '../components/charts/chartTheme'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import TransactionRow from '../components/TransactionRow'
import TransactionList from '../components/TransactionList'
import CategoryIcon from '../components/CategoryIcon'
import ImportStatementModal from '../components/ImportStatementModal'

export default function Expenses() {
  const {
    expenses,
    totalExpenses,
    avgDailySpend,
    largestCategory,
    categoryTotals,
    dailySeries,
    weeklySeries,
    addTransactionsBatch,
    updateTransaction,
    deleteTransaction,
    deleteTransactionsByAmount,
    deleteTransactionsByDescription,
    pushToast,
    period,
    openQuickAdd,
    openRecurringModal,
  } = useApp()

  const theme = useChartTheme()
  const [searchParams, setSearchParams] = useSearchParams()
  const [category, setCategory] = useState('All')
  const [method, setMethod] = useState('All')
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [mode, setMode] = useState('daily')
  const [importOpen, setImportOpen] = useState(false)

  const handleImportSuccess = async (importedTxns) => {
    await addTransactionsBatch(importedTxns)
    pushToast({
      title: 'Statement Imported! 🚀',
      body: `Successfully imported ${importedTxns.length} transactions directly into your ledger.`,
      tone: 'emerald',
    })
  }

  /* Keep the header search in sync with this page */
  useEffect(() => {
    setQuery(searchParams.get('q') || '')
  }, [searchParams])

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    return expenses
      .filter((txn) => (category === 'All' ? true : txn.category === category))
      .filter((txn) => (method === 'All' ? true : txn.method === method))
      .filter((txn) =>
        term
          ? [txn.description, txn.category, txn.method, txn.note]
              .join(' ')
              .toLowerCase()
              .includes(term)
          : true,
      )
      .sort((a, b) => (a.date < b.date ? 1 : -1))
  }, [expenses, category, method, query])

  const filteredTotal = filtered.reduce((sum, txn) => sum + Math.abs(txn.amount), 0)
  const activeFilters = (category !== 'All' ? 1 : 0) + (method !== 'All' ? 1 : 0)

  const countFor = (name) =>
    name === 'All'
      ? expenses.length
      : expenses.filter((txn) => txn.category === name).length

  const chartData = mode === 'daily' ? dailySeries : weeklySeries

  const handleDelete = (txn) => {
    deleteTransaction(txn.id)
    pushToast({
      title: 'Expense removed',
      body: `${txn.description} · ${formatINR(Math.abs(txn.amount))} deleted.`,
      tone: 'rose',
    })
  }

  const faulty3048Count = useMemo(
    () => expenses.filter((t) => Math.abs(t.amount) === 3048).length,
    [expenses],
  )

  const placeholderTitleCount = useMemo(
    () => expenses.filter((t) => t.description === 'Imported Transaction').length,
    [expenses],
  )

  const handleCleanup3048 = () => {
    const count = deleteTransactionsByAmount(3048)
    pushToast({
      title: 'Cleaned Up Transactions 🧹',
      body: `Successfully removed ${count} transactions that had the ₹3,048 account number amount.`,
      tone: 'emerald',
    })
  }

  const handleCleanupPlaceholders = () => {
    const count = deleteTransactionsByDescription('Imported Transaction')
    pushToast({
      title: 'Placeholders Cleared 🧹',
      body: `Removed ${count} placeholder transactions. Re-import statement to load proper merchant names!`,
      tone: 'emerald',
    })
  }

  const clearAll = () => {
    setCategory('All')
    setMethod('All')
    setQuery('')
    setSearchParams({})
  }

  return (
    <div className="space-y-6">
      {/* --------------------------------------------------------- header */}
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="heading text-xl font-bold tracking-tight sm:text-2xl">
            Expenses
          </h2>
          <p className="muted mt-1 text-[13px] sm:text-sm">
            Track and understand where your money goes.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            icon={Repeat}
            onClick={openRecurringModal}
          >
            Recurring Bills
          </Button>
          <Button
            variant="outline"
            icon={FileSpreadsheet}
            onClick={() => setImportOpen(true)}
          >
            Import Statement
          </Button>
          <Button icon={Plus} onClick={openQuickAdd}>
            Add Expense
          </Button>
        </div>
      </section>

      {/* -------------------------------------------------------- summary */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Expenses"
          value={formatINR(totalExpenses)}
          deltaLabel={`${period} · ${expenses.length} transactions`}
          icon={CreditCard}
          tone="amber"
          spark={dailySeries.map((d) => d.amount).filter(Boolean)}
        />
        <StatCard
          label="Average Daily Spending"
          value={formatINR(avgDailySpend)}
          deltaLabel="30-day rolling average"
          icon={CalendarRange}
          tone="sky"
        />
        <StatCard
          label="Largest Category"
          value={largestCategory?.category || '—'}
          deltaLabel={`${formatINR(largestCategory?.spent || 0)} · ${formatPercent(
            largestCategory?.usedPercent || 0,
          )} of its budget`}
          icon={Tag}
          tone="indigo"
        />
        <StatCard
          label="Transactions"
          value={String(expenses.length)}
          deltaLabel="Recorded this period"
          icon={Receipt}
          tone="emerald"
        />
      </section>

      {/* ---------------------------------------------------- trend chart */}
      <ChartCard
        title="Spending Trend"
        subtitle={
          mode === 'daily'
            ? `Daily spend across ${period}`
            : `Weekly totals across ${period}`
        }
        eyebrow="Pattern"
        height={260}
        action={
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-900">
            {['daily', 'weekly'].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setMode(option)}
                className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold capitalize transition ${
                  mode === option
                    ? 'bg-white text-emerald-700 shadow-sm dark:bg-slate-800 dark:text-emerald-300'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        }
        footer={
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              {
                label: 'Peak day',
                value:
                  [...dailySeries].sort((a, b) => b.amount - a.amount)[0]?.full ||
                  '—',
              },
              {
                label: 'Highest spend',
                value: formatINR(
                  Math.max(...dailySeries.map((d) => d.amount), 0),
                ),
              },
              {
                label: 'Spending days',
                value: `${dailySeries.filter((d) => d.amount > 0).length} of ${
                  dailySeries.length
                }`,
              },
              {
                label: 'Biggest week',
                value: formatINR(
                  Math.max(...weeklySeries.map((w) => w.amount), 0),
                ),
              },
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
          {mode === 'daily' ? (
            <AreaChart
              data={chartData}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#059669" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="4 4"
                vertical={false}
                stroke={theme.grid}
              />
              <XAxis
                dataKey="label"
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
                content={<ChartTooltip mode="currency" />}
                cursor={{ stroke: theme.axis }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                name="Spent"
                stroke="#059669"
                strokeWidth={2.4}
                fill="url(#spendFill)"
                animationDuration={900}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2 }}
              />
            </AreaChart>
          ) : (
            <BarChart
              data={chartData}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="4 4"
                vertical={false}
                stroke={theme.grid}
              />
              <XAxis
                dataKey="label"
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
                dataKey="amount"
                name="Spent"
                fill="#059669"
                radius={[8, 8, 0, 0]}
                maxBarSize={54}
                animationDuration={900}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </ChartCard>

      {/* ------------------------------------------------ 3048 cleanup banner */}
      {faulty3048Count > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-300 bg-amber-50/90 p-4 text-amber-900 shadow-sm dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200 animate-rise">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400">
              <AlertTriangle size={20} />
            </span>
            <div>
              <p className="text-[13.5px] font-bold">
                Found {faulty3048Count} transactions with amount ₹3,048 from previous bank account column mapping.
              </p>
              <p className="text-[12px] opacity-80 mt-0.5">
                The previous import mapped your bank account ending (e.g. "SBI - 3048") instead of the real Amount column. Clean them up in 1 click and re-import with the fixed parser.
              </p>
            </div>
          </div>
          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            onClick={handleCleanup3048}
          >
            Remove {faulty3048Count} Faulty (₹3,048) Records
          </Button>
        </div>
      )}

      {/* ------------------------------------------------ Imported Transaction placeholder banner */}
      {placeholderTitleCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-sky-300 bg-sky-50/90 p-4 text-sky-900 shadow-sm dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-200 animate-rise">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-500/20 text-sky-700 dark:text-sky-400">
              <FileSpreadsheet size={20} />
            </span>
            <div>
              <p className="text-[13.5px] font-bold">
                Found {placeholderTitleCount} transactions showing "Imported Transaction" as title.
              </p>
              <p className="text-[12px] opacity-80 mt-0.5">
                The description parser is now fixed. Click below to clear these placeholder items and re-import with your real merchant names (Swiggy, Uber, etc.).
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={Trash2}
            onClick={handleCleanupPlaceholders}
            className="border-sky-400 text-sky-800 hover:bg-sky-100 dark:border-sky-700 dark:text-sky-200 dark:hover:bg-sky-900/40"
          >
            Clear {placeholderTitleCount} Placeholder Records
          </Button>
        </div>
      )}

      {/* ------------------------------------------------ filters/search */}
      <Card className="card-pad animate-rise">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="muted mr-1 hidden items-center gap-1.5 text-[12px] font-semibold sm:flex">
              <Filter size={14} /> Filter
            </span>
            <button
              type="button"
              onClick={() => setCategory('All')}
              className={`chip ${
                category === 'All' ? 'bg-emerald-600 text-white' : 'chip-idle'
              }`}
            >
              All
              <span className="opacity-70">{countFor('All')}</span>
            </button>
            {CATEGORIES.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setCategory(name)}
                className={`chip ${
                  category === name ? 'bg-emerald-600 text-white' : 'chip-idle'
                }`}
              >
                {name}
                <span className="opacity-70">{countFor(name)}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setSearchParams(event.target.value ? { q: event.target.value } : {})
                }}
                placeholder="Search by name, note or payment mode…"
                aria-label="Search expenses"
                className="input pl-10"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('')
                    setSearchParams({})
                  }}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                >
                  <X size={14} />
                </button>
              ) : null}
            </div>

            <div className="flex items-center gap-3">
              <select
                value={method}
                onChange={(event) => setMethod(event.target.value)}
                aria-label="Filter by payment method"
                className="input w-full py-2.5 sm:w-44"
              >
                <option value="All">All payment modes</option>
                {PAYMENT_METHODS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              {activeFilters || query ? (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={X}
                  onClick={clearAll}
                  className="shrink-0"
                >
                  Clear
                </Button>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3.5 dark:border-slate-800">
            <p className="muted text-[12px] font-medium">
              Showing{' '}
              <strong className="heading tabular">{filtered.length}</strong> of{' '}
              {expenses.length} transactions
              {category !== 'All' ? ` · ${category}` : ''}
              {method !== 'All' ? ` · ${method}` : ''}
              {query ? ` · “${query}”` : ''}
            </p>
            <p className="tabular heading text-[13px] font-bold">
              {formatINR(filteredTotal)}
            </p>
          </div>
        </div>
      </Card>

      {/* --------------------------------------------------------- table */}
      <Card className="animate-rise overflow-hidden">
        {filtered.length ? (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[52rem] text-left">
                <thead className="border-b border-slate-100 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-950/30">
                  <tr className="muted text-[11px] font-semibold uppercase tracking-wide">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Payment Method</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filtered.map((txn) => (
                    <TransactionRow
                      key={txn.id}
                      txn={txn}
                      onDelete={handleDelete}
                      onUpdateCategory={(id, newCat) => {
                        updateTransaction(id, { category: newCat })
                        pushToast({
                          title: 'Category Updated',
                          body: `Changed category to ${newCat}.`,
                          tone: 'emerald',
                        })
                      }}
                      onToggleType={(id) => {
                        const nextAmount = -txn.amount
                        updateTransaction(id, { amount: nextAmount })
                        pushToast({
                          title: nextAmount > 0 ? 'Converted to Income 💰' : 'Converted to Expense 📉',
                          body: `${txn.description} is now ${nextAmount > 0 ? 'Income (+)' : 'Expense (−)'}.`,
                          tone: nextAmount > 0 ? 'emerald' : 'amber',
                        })
                      }}
                    />
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-950/30">
                    <td className="muted px-4 py-3 text-[12px] font-semibold" colSpan={4}>
                      {filtered.length} transactions
                    </td>
                    <td className="tabular heading px-4 py-3 text-right text-sm font-bold">
                      −{formatINR(filteredTotal)}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="md:hidden">
              <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                <p className="heading text-[13px] font-semibold">
                  {filtered.length} transactions · {formatINR(filteredTotal)}
                </p>
              </div>
              <TransactionList items={filtered} onDelete={handleDelete} />
            </div>
          </>
        ) : (
          <EmptyState
            icon={BarChart3}
            title="No transactions match your filters"
            body="Try a different category, payment mode or search term to see your spending here."
            actionLabel="Clear filters"
            onAction={clearAll}
          />
        )}
      </Card>

      {/* ------------------------------------------------ category totals */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {CATEGORIES.map((name) => {
          const total = categoryTotals[name] || 0
          const share = totalExpenses ? (total / totalExpenses) * 100 : 0
          return (
            <article
              key={name}
              className="card card-hover card-pad animate-rise flex items-center gap-4"
            >
              <CategoryIcon category={name} merchant={false} description="" size="lg" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="heading text-[13px] font-semibold">{name}</p>
                  <p className="tabular heading text-[13px] font-bold">
                    {formatINR(total)}
                  </p>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-[width] duration-700"
                    style={{ width: `${Math.min(100, share)}%` }}
                  />
                </div>
                <p className="muted mt-2 text-[11px] font-medium">
                  {share.toFixed(1)}% of total spend ·{' '}
                  {countFor(name)} transactions
                </p>
              </div>
            </article>
          )
        })}
      </section>

      <p className="muted flex items-center gap-2 text-[11px]">
        <TrendingUp size={13} />
        Data is synced securely with your account. Latest entry:{" "}
        {filtered[0] ? formatLongDate(filtered[0].date) : '—'}
      </p>

      <ImportStatementModal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        onImportSuccess={handleImportSuccess}
      />
    </div>
  )
}

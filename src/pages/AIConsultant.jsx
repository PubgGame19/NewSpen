import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  CreditCard,
  Gauge,
  Info,
  Landmark,
  PiggyBank,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { AI_GREETING, AI_INSIGHT_CARDS, UPCOMING_PAYMENTS } from '../data/mockData'
import {
  formatINR,
  formatLongDate,
  formatPercent,
  formatPercentDown,
} from '../utils/format'
import AIChat from '../components/AIChat'
import InsightCard from '../components/InsightCard'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card, { CardHeader } from '../components/ui/Card'
import ProgressBar from '../components/ui/ProgressBar'

export default function AIConsultant() {
  const {
    profile,
    savingsRate,
    budgetUsagePercent,
    budgetRemaining,
    largestCategory,
    netSavings,
    score,
    scoreLabel,
    emiTotal,
    period,
  } = useApp()
  const navigate = useNavigate()

  const quickStats = [
    {
      label: 'Savings rate',
      value: formatPercent(savingsRate),
      icon: PiggyBank,
      tone: 'emerald',
      progress: savingsRate,
      scale: 50,
    },
    {
      label: 'Budget used',
      value: formatPercentDown(budgetUsagePercent),
      icon: Gauge,
      tone: 'sky',
      progress: budgetUsagePercent,
      scale: 100,
    },
    {
      label: 'Financial score',
      value: `${score.total}/100`,
      icon: Sparkles,
      tone: 'indigo',
      progress: score.total,
      scale: 100,
    },
    {
      label: 'Debt-to-income',
      value: `${profile.debtToIncome}%`,
      icon: Landmark,
      tone: 'amber',
      progress: profile.debtToIncome,
      scale: 50,
    },
  ]

  return (
    <div className="space-y-6">
      {/* --------------------------------------------------------- header */}
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-sm">
            <Bot size={22} strokeWidth={2.1} />
          </span>
          <div>
            <h2 className="heading text-xl font-bold tracking-tight sm:text-2xl">
              SPENANCE AI
            </h2>
            <p className="muted mt-0.5 text-[13px] sm:text-sm">
              Your personal financial assistant
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="emerald" icon={ShieldCheck}>
            Demo mode · no external AI
          </Badge>
          <Button
            variant="ghost"
            icon={CreditCard}
            onClick={() => navigate('/expenses')}
          >
            Review expenses
          </Button>
        </div>
      </section>

      {/* ------------------------------------------------------- greeting */}
      <Card className="relative overflow-hidden">
        <div
          className="grain pointer-events-none absolute inset-0"
          aria-hidden="true"
        />
        <div className="relative p-5 sm:p-6">
          <p className="eyebrow">Analysis complete · {period}</p>
          <h3 className="heading mt-2 max-w-3xl text-base font-semibold leading-snug sm:text-lg">
            {AI_GREETING}
          </h3>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] font-medium">
            <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <BadgeCheck size={14} />
              {formatINR(netSavings)} saved this month
            </span>
            <span className="muted flex items-center gap-2">
              <Info size={14} />
              Largest category: {largestCategory?.category} (
              {formatINR(largestCategory?.spent || 0)})
            </span>
            <span className="muted flex items-center gap-2">
              <Landmark size={14} />
              EMIs: {formatINR(emiTotal)} · Next{' '}
              {formatLongDate(UPCOMING_PAYMENTS[0].dueDate)}
            </span>
          </div>
        </div>
      </Card>

      {/* -------------------------------------------------- insight cards */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {AI_INSIGHT_CARDS.map((card) => (
          <InsightCard
            key={card.id}
            icon={card.icon}
            tone={card.tone}
            tag="Detected"
            title={card.title}
            body={card.body}
          />
        ))}
      </section>

      {/* --------------------------------------------------- chat + panel */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <AIChat />
        </div>

        <div className="space-y-4">
          <Card className="card-pad animate-rise">
            <CardHeader
              title="Your context"
              subtitle="Everything the assistant reasons over."
            />
            <ul className="mt-4 space-y-4">
              {quickStats.map((stat) => (
                <li key={stat.label}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="muted flex items-center gap-2 text-[12px] font-medium">
                      <stat.icon size={14} />
                      {stat.label}
                    </span>
                    <span className="tabular heading text-[13px] font-bold">
                      {stat.value}
                    </span>
                  </div>
                  <ProgressBar
                    value={(stat.progress / stat.scale) * 100}
                    bar={
                      stat.tone === 'emerald'
                        ? 'bg-emerald-500'
                        : stat.tone === 'sky'
                          ? 'bg-sky-500'
                          : stat.tone === 'indigo'
                            ? 'bg-indigo-500'
                            : 'bg-amber-500'
                    }
                    height="h-1.5"
                    className="mt-2"
                  />
                </li>
              ))}
            </ul>
          </Card>

          <Card className="card-pad animate-rise">
            <CardHeader
              title="What I can help with"
              subtitle="Pick a topic or type your own question."
            />
            <ul className="mt-4 space-y-2.5">
              {[
                { label: 'Where can I cut spending?', to: '/expenses' },
                { label: 'Is my budget still on track?', to: '/budget' },
                { label: 'How do I pay off loans faster?', to: '/loans' },
                { label: 'Show my long-term trends', to: '/insights' },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() => navigate(item.to)}
                    className="group flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 px-3.5 py-3 text-left transition hover:border-emerald-200 hover:bg-emerald-50/60 dark:border-slate-800 dark:hover:border-emerald-500/30 dark:hover:bg-emerald-500/5"
                  >
                    <span className="heading text-[13px] font-medium">
                      {item.label}
                    </span>
                    <ArrowRight
                      size={15}
                      className="shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-emerald-600"
                    />
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-4 rounded-xl bg-slate-50 p-3.5 dark:bg-slate-950/40">
              <p className="muted text-[11px] leading-snug">
                <strong className="heading">Demo note:</strong> SPENANCE AI uses a
                predefined knowledge base and your local demo data. No external
                AI service, API key or internet call is involved.
              </p>
            </div>
          </Card>

          <Card className="card-pad animate-rise">
            <p className="eyebrow">Month at a glance</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {[
                { label: 'Budget left', value: formatINR(budgetRemaining) },
                { label: 'Savings', value: formatINR(netSavings) },
                { label: 'Score', value: `${score.total}/100` },
                { label: 'Rating', value: scoreLabel.label },
              ].map((item) => (
                <div key={item.label}>
                  <p className="muted text-[10px] font-semibold uppercase tracking-wide">
                    {item.label}
                  </p>
                  <p className="tabular heading mt-1 text-[14px] font-bold">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </div>
  )
}

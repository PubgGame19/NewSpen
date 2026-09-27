import { useEffect, useMemo, useState } from 'react'
import { BadgeCheck, Download, Landmark, Trash2, Wallet } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { ratioPercent } from '../utils/finance'
import { formatINR, formatLongDate, formatShortDate } from '../utils/format'
import Modal from './ui/Modal'
import Button from './ui/Button'
import ProgressBar from './ui/ProgressBar'

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

/** Next 5 instalments derived from the outstanding balance + rate */
function buildSchedule(loan, count = 5) {
  const monthlyRate = loan.interestRate / 12 / 100
  let balance = loan.outstanding
  const rows = []
  const start = new Date(`${loan.nextPaymentDate}T00:00:00`)

  for (let i = 0; i < count; i += 1) {
    const interest = Math.round(balance * monthlyRate)
    const principal = Math.max(0, loan.emi - interest)
    const closing = Math.max(0, balance - principal)
    const date = new Date(start)
    date.setMonth(date.getMonth() + i)
    rows.push({
      key: `${loan.id}-${i}`,
      label: `${MONTHS[date.getMonth()]} ${date.getFullYear()}`,
      iso: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
      opening: balance,
      interest,
      principal,
      closing,
    })
    balance = closing
  }
  return rows
}

export default function LoanDetailsModal({ loan, open, onClose }) {
  const { pushToast, payEmi, deleteLoan } = useApp()
  const [confirmRemove, setConfirmRemove] = useState(false)

  useEffect(() => {
    if (open) setConfirmRemove(false)
  }, [open, loan?.id])

  const schedule = useMemo(
    () => (loan ? buildSchedule(loan) : []),
    [loan],
  )

  if (!loan) return null

  const repaidPercent = 100 - ratioPercent(loan.outstanding, loan.originalAmount)
  const nextInterest = schedule[0]?.interest || 0

  const stats = [
    { label: 'Outstanding', value: formatINR(loan.outstanding) },
    { label: 'Original amount', value: formatINR(loan.originalAmount) },
    { label: 'Interest rate', value: `${loan.interestRate}% p.a.` },
    { label: 'Monthly EMI', value: formatINR(loan.emi) },
    { label: 'Next payment', value: formatLongDate(loan.nextPaymentDate) },
    {
      label: 'Tenure',
      value: `${loan.tenureMonths} months (${loan.tenureMonths - loan.paidMonths} left)`,
    },
    { label: 'Co-applicant', value: loan.coApplicant },
    { label: 'Moratorium', value: loan.moratorium },
  ]

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={loan.name}
      description={`${loan.lender} · Account ${loan.accountNumber} · ${loan.purpose}`}
      icon={Landmark}
      size="lg"
      footer={
        <>
          {confirmRemove ? (
            <>
              <span className="mr-auto hidden text-[12px] font-medium text-rose-600 sm:block dark:text-rose-400">
                Remove {loan.name} from tracking?
              </span>
              <Button variant="ghost" onClick={() => setConfirmRemove(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                icon={Trash2}
                onClick={() => {
                  deleteLoan(loan.id)
                  pushToast({
                    title: 'Loan removed',
                    body: `${loan.name} is no longer tracked. Outstanding EMI totals updated.`,
                    tone: 'rose',
                  })
                  onClose?.()
                }}
              >
                Yes, remove
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                icon={Trash2}
                className="mr-auto"
                onClick={() => setConfirmRemove(true)}
              >
                Remove loan
              </Button>
              <Button
                variant="ghost"
                icon={Download}
                onClick={() =>
                  pushToast({
                    title: 'Statement ready',
                    body: `${loan.name} repayment schedule exported as a demo PDF.`,
                    tone: 'sky',
                  })
                }
              >
                Statement
              </Button>
              <Button
                icon={Wallet}
                onClick={() => {
                  const receipt = payEmi(loan.id)
                  pushToast({
                    title: 'EMI payment recorded',
                    body: receipt
                      ? `${formatINR(loan.emi)} paid · ${formatINR(receipt.principal)} principal + ${formatINR(receipt.interest)} interest. Balance now ${formatINR(receipt.outstanding)}.`
                      : `${formatINR(loan.emi)} recorded for ${loan.name}.`,
                    tone: 'emerald',
                  })
                }}
              >
                Pay EMI {formatINR(loan.emi)}
              </Button>
            </>
          )}
        </>
      }
    >
      <div className="space-y-5">
        <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">Principal repaid</p>
              <p className="tabular heading mt-1 text-xl font-bold">
                {Math.round(repaidPercent)}%
                <span className="muted ml-2 text-[13px] font-medium">
                  {formatINR(loan.originalAmount - loan.outstanding)} of{' '}
                  {formatINR(loan.originalAmount)}
                </span>
              </p>
            </div>
            <span className="badge bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
              <BadgeCheck size={12} /> {loan.status}
            </span>
          </div>
          <ProgressBar value={repaidPercent} height="h-2.5" className="mt-3" />
          <p className="muted mt-2 text-[11px] font-medium">
            {loan.paidMonths} of {loan.tenureMonths} instalments paid · started{' '}
            {formatLongDate(loan.startDate)}
          </p>
        </div>

        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-3 dark:border-slate-800 dark:bg-slate-950/30"
            >
              <dt className="muted text-[10px] font-semibold uppercase tracking-wide">
                {stat.label}
              </dt>
              <dd className="heading tabular mt-1 text-[13px] font-semibold">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="heading text-[13px] font-semibold">
              Upcoming instalments
            </p>
            <p className="muted text-[11px] font-medium">
              Interest first, principal after
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full min-w-[34rem] text-left text-[12px]">
              <thead className="bg-slate-50 dark:bg-slate-950/40">
                <tr className="muted text-[10px] font-semibold uppercase tracking-wide">
                  <th className="px-3.5 py-2.5">Instalment</th>
                  <th className="px-3.5 py-2.5">Opening</th>
                  <th className="px-3.5 py-2.5">Interest</th>
                  <th className="px-3.5 py-2.5">Principal</th>
                  <th className="px-3.5 py-2.5 text-right">Closing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {schedule.map((row, index) => (
                  <tr key={row.key}>
                    <td className="tabular px-3.5 py-2.5 font-semibold text-slate-700 dark:text-slate-200">
                      {row.label}
                      <span className="muted ml-1.5 font-normal">
                        {formatShortDate(row.iso)}
                      </span>
                      {index === 0 ? (
                        <span className="badge ml-2 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                          Next
                        </span>
                      ) : null}
                    </td>
                    <td className="tabular px-3.5 py-2.5 text-slate-600 dark:text-slate-300">
                      {formatINR(row.opening)}
                    </td>
                    <td className="tabular px-3.5 py-2.5 text-amber-600 dark:text-amber-400">
                      {formatINR(row.interest)}
                    </td>
                    <td className="tabular px-3.5 py-2.5 text-emerald-600 dark:text-emerald-400">
                      {formatINR(row.principal)}
                    </td>
                    <td className="tabular px-3.5 py-2.5 text-right font-semibold text-slate-900 dark:text-white">
                      {formatINR(row.closing)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="muted mt-3 text-[11px] leading-snug">
            Of your next {formatINR(loan.emi)} instalment, roughly{' '}
            <strong className="heading">{formatINR(nextInterest)}</strong> goes
            towards interest. Prepaying ₹10,000 now saves about ₹{' '}
            {Math.round((10000 * loan.interestRate) / 100 / 12 * 12).toLocaleString(
              'en-IN',
            )}{' '}
            in yearly interest.
          </p>
        </div>
      </div>
    </Modal>
  )
}

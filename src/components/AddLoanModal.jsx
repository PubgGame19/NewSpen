import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  BadgeIndianRupee,
  Building2,
  Calculator,
  Calendar,
  Landmark,
  Percent,
  Plus,
  Wallet,
} from 'lucide-react'
import { LOAN_TYPES } from '../data/mockData'
import { useApp } from '../context/AppContext'
import { calculateEMI, ratioPercent } from '../utils/finance'
import { formatINR, formatLongDate } from '../utils/format'
import Modal from './ui/Modal'
import Button from './ui/Button'
import ProgressBar from './ui/ProgressBar'

const DEMO_TODAY = '2026-09-27'
const DEMO_NEXT_DUE = '2026-10-05'

const EMPTY = {
  name: '',
  lender: '',
  type: 'Personal',
  originalAmount: '',
  outstanding: '',
  interestRate: '10.5',
  emi: '',
  tenureMonths: '24',
  paidMonths: '0',
  startDate: DEMO_TODAY,
  nextPaymentDate: DEMO_NEXT_DUE,
  purpose: '',
  coApplicant: '',
}

/**
 * Add a loan to the tracker. EMI can be typed in manually or derived from
 * amount + rate + tenure with the same formula the calculator uses.
 */
export default function AddLoanModal({ open, onClose, initial = null }) {
  const { addLoan, pushToast } = useApp()
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [autoEmi, setAutoEmi] = useState(true)

  useEffect(() => {
    if (!open) return
    setForm({ ...EMPTY, ...(initial || {}) })
    setErrors({})
    setAutoEmi(!initial?.emi)
  }, [open, initial])

  const computed = useMemo(
    () =>
      calculateEMI(
        Number(form.originalAmount) || 0,
        Number(form.interestRate) || 0,
        (Number(form.tenureMonths) || 0) / 12,
      ),
    [form.originalAmount, form.interestRate, form.tenureMonths],
  )

  /* keep the EMI field in sync while auto mode is on */
  useEffect(() => {
    if (!autoEmi) return
    setForm((prev) =>
      prev.emi === String(computed.emi)
        ? prev
        : { ...prev, emi: computed.emi ? String(computed.emi) : '' },
    )
  }, [autoEmi, computed.emi])

  const update = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      // keep the outstanding balance in step with the principal by default
      if (key === 'originalAmount' && (!prev.outstanding || prev.outstanding === prev.originalAmount)) {
        next.outstanding = value
      }
      return next
    })
    setErrors((prevErrors) => ({ ...prevErrors, [key]: undefined }))
  }

  const outstandingAmount = Number(form.outstanding) || Number(form.originalAmount) || 0
  const principal = Number(form.originalAmount) || 0
  const emi = Number(form.emi) || 0
  const repaidPercent =
    principal > 0 ? 100 - ratioPercent(outstandingAmount, principal) : 0

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Give the loan a name'
    if (!form.lender.trim()) next.lender = 'Who is the lender?'
    if (!principal || principal <= 0) next.originalAmount = 'Enter the loan amount'
    if (outstandingAmount < 0) next.outstanding = 'Balance cannot be negative'
    if (outstandingAmount > principal)
      next.outstanding = 'Balance cannot exceed the loan amount'
    if (Number(form.interestRate) < 0 || form.interestRate === '')
      next.interestRate = 'Enter a valid interest rate'
    if (!emi || emi <= 0) next.emi = 'Enter the monthly EMI'
    if (!Number(form.tenureMonths)) next.tenureMonths = 'Enter the tenure in months'
    if (!form.nextPaymentDate) next.nextPaymentDate = 'Pick the next due date'
    if (Number(form.paidMonths) > Number(form.tenureMonths))
      next.paidMonths = 'Instalments paid cannot exceed the tenure'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = (event) => {
    event.preventDefault()
    if (!validate()) return

    const record = addLoan({
      name: form.name.trim(),
      lender: form.lender.trim(),
      type: form.type,
      originalAmount: Math.round(principal),
      outstanding: Math.round(outstandingAmount),
      interestRate: Number(form.interestRate),
      emi: Math.round(emi),
      tenureMonths: Math.round(Number(form.tenureMonths)),
      paidMonths: Math.round(Number(form.paidMonths) || 0),
      startDate: form.startDate,
      nextPaymentDate: form.nextPaymentDate,
      purpose: form.purpose.trim() || 'Added from the demo loan manager',
      coApplicant: form.coApplicant.trim() || '—',
      moratorium: 'Not applicable',
      status: 'Active',
    })

    pushToast({
      title: 'Loan added',
      body: `${record.name} · ${formatINR(record.outstanding)} outstanding, EMI ${formatINR(record.emi)}.`,
      tone: 'emerald',
    })

    onClose?.()
  }

  const Field = ({ htmlFor, label, hint, error, children, className = '' }) => (
    <div className={className}>
      <label htmlFor={htmlFor} className="eyebrow mb-1.5 block">
        {label}
      </label>
      {children}
      {hint && !error ? (
        <p className="muted mt-1.5 text-[11px]">{hint}</p>
      ) : null}
      {error ? (
        <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
          <AlertCircle size={12} /> {error}
        </p>
      ) : null}
    </div>
  )

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Loan"
      description="Track another loan alongside your education and personal loans."
      icon={Plus}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="add-loan-form">
            Add Loan
          </Button>
        </>
      }
    >
      <form id="add-loan-form" onSubmit={submit} className="space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field htmlFor="loan-name" label="Loan name" error={errors.name}>
            <input
              id="loan-name"
              className="input"
              placeholder="e.g. Car Loan"
              value={form.name}
              onChange={(event) => update('name', event.target.value)}
              autoFocus
            />
          </Field>

          <Field htmlFor="loan-lender" label="Lender" error={errors.lender}>
            <div className="relative">
              <Building2
                size={15}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="loan-lender"
                className="input pr-10"
                placeholder="e.g. ICICI Bank"
                value={form.lender}
                onChange={(event) => update('lender', event.target.value)}
              />
            </div>
          </Field>

          <Field htmlFor="loan-type" label="Loan type">
            <select
              id="loan-type"
              className="input appearance-none"
              value={form.type}
              onChange={(event) => update('type', event.target.value)}
            >
              {LOAN_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </Field>

          <Field
            htmlFor="loan-amount"
            label="Loan amount (₹)"
            error={errors.originalAmount}
            hint="The amount originally sanctioned"
          >
            <div className="relative">
              <BadgeIndianRupee
                size={15}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="loan-amount"
                type="number"
                min="0"
                step="any"
                className="input tabular pl-10"
                placeholder="500000"
                value={form.originalAmount}
                onChange={(event) => update('originalAmount', event.target.value)}
              />
            </div>
          </Field>

          <Field
            htmlFor="loan-outstanding"
            label="Outstanding balance (₹)"
            error={errors.outstanding}
            hint="Leave as-is for a brand-new loan"
          >
            <input
              id="loan-outstanding"
              type="number"
              min="0"
              step="any"
              className="input tabular"
              placeholder={form.originalAmount || '500000'}
              value={form.outstanding}
              onChange={(event) => update('outstanding', event.target.value)}
            />
          </Field>

          <Field htmlFor="loan-rate" label="Interest rate (% p.a.)" error={errors.interestRate}>
            <div className="relative">
              <Percent
                size={15}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="loan-rate"
                type="number"
                min="0"
                max="36"
                step="any"
                className="input tabular pr-10"
                value={form.interestRate}
                onChange={(event) => update('interestRate', event.target.value)}
              />
            </div>
          </Field>

          <Field
            htmlFor="loan-tenure"
            label="Tenure (months)"
            error={errors.tenureMonths}
            hint={
              Number(form.tenureMonths)
                ? `${(Number(form.tenureMonths) / 12).toFixed(
                    Number(form.tenureMonths) % 12 === 0 ? 0 : 1,
                  )} years`
                : undefined
            }
          >
            <input
              id="loan-tenure"
              type="number"
              min="1"
              max="480"
              step="1"
              className="input tabular"
              value={form.tenureMonths}
              onChange={(event) => update('tenureMonths', event.target.value)}
            />
          </Field>

          <Field htmlFor="loan-paid" label="Instalments paid" error={errors.paidMonths}>
            <input
              id="loan-paid"
              type="number"
              min="0"
              step="1"
              className="input tabular"
              value={form.paidMonths}
              onChange={(event) => update('paidMonths', event.target.value)}
            />
          </Field>

          <Field htmlFor="loan-emi" label="Monthly EMI (₹)" error={errors.emi}>
            <div className="flex items-center gap-2">
              <input
                id="loan-emi"
                type="number"
                min="0"
                step="any"
                readOnly={autoEmi}
                className={`input tabular ${autoEmi ? 'bg-slate-50 text-slate-500 dark:bg-slate-950/60 dark:text-slate-400' : ''}`}
                value={form.emi}
                onChange={(event) => update('emi', event.target.value)}
              />
              <button
                type="button"
                onClick={() => setAutoEmi((value) => !value)}
                title="Toggle automatic EMI calculation"
                className={`chip shrink-0 ${
                  autoEmi ? 'bg-emerald-600 text-white' : 'chip-idle'
                }`}
              >
                <Calculator size={12} />
                Auto
              </button>
            </div>
          </Field>

          <Field htmlFor="loan-start" label="Start date">
            <div className="relative">
              <Calendar
                size={15}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="loan-start"
                type="date"
                className="input"
                value={form.startDate}
                onChange={(event) => update('startDate', event.target.value)}
              />
            </div>
          </Field>

          <Field htmlFor="loan-next" label="Next payment date" error={errors.nextPaymentDate}>
            <div className="relative">
              <Calendar
                size={15}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="loan-next"
                type="date"
                className="input"
                value={form.nextPaymentDate}
                onChange={(event) => update('nextPaymentDate', event.target.value)}
              />
            </div>
          </Field>

          <Field htmlFor="loan-purpose" label="Purpose (optional)" className="sm:col-span-2">
            <input
              id="loan-purpose"
              className="input"
              placeholder="e.g. Two-wheeler purchase"
              value={form.purpose}
              onChange={(event) => update('purpose', event.target.value)}
            />
          </Field>
        </div>

        {/* live summary */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
              <Landmark size={18} strokeWidth={2.1} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="heading text-[13px] font-semibold">
                {form.name.trim() || 'New loan'} · {form.type}
              </p>
              <p className="muted text-[11px]">
                {form.lender.trim() || 'Lender'} · next due{' '}
                {form.nextPaymentDate
                  ? formatLongDate(form.nextPaymentDate)
                  : 'not set'}
              </p>
            </div>
            <span className="badge bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
              {Math.round(repaidPercent)}% repaid
            </span>
          </div>

          <ProgressBar value={repaidPercent} className="mt-3" height="h-1.5" />

          <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-4">
            {[
              { label: 'Monthly EMI', value: formatINR(emi) },
              { label: 'Outstanding', value: formatINR(outstandingAmount) },
              { label: 'Total interest', value: formatINR(computed.totalInterest) },
              { label: 'Total payable', value: formatINR(computed.totalPayment) },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl bg-white p-3 dark:bg-slate-900"
              >
                <p className="muted text-[10px] font-semibold uppercase tracking-wide">
                  {item.label}
                </p>
                <p className="tabular heading mt-0.5 text-sm font-bold">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <p className="muted mt-3 flex items-start gap-2 text-[11px] leading-snug">
            <Wallet size={13} className="mt-px shrink-0" />
            The loan is saved in your browser and immediately counts towards the
            outstanding balance, monthly EMI total and debt-to-income ratio.
          </p>
        </div>
      </form>
    </Modal>
  )
}

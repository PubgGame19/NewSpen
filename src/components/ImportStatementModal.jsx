import { useMemo, useRef, useState } from 'react'
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Layers,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  Square,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { CATEGORIES } from '../data/mockData'
import {
  getSampleCsvTemplate,
  getStatementHeadersAndPreview,
  parseBankStatement,
} from '../services/statementParser'
import { formatINR, formatShortDate } from '../utils/format'
import Button from './ui/Button'
import Badge from './ui/Badge'

const ALL_IMPORT_CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Entertainment',
  'Salary',
  'Investment',
  'Refund',
  'Income',
  'Other',
]

export default function ImportStatementModal({ isOpen, onClose, onImportSuccess }) {
  const [file, setFile] = useState(null)
  const [rawText, setRawText] = useState('')
  const [rawContentText, setRawContentText] = useState('')
  const [headers, setHeaders] = useState([])
  const [columnMapping, setColumnMapping] = useState(null)
  const [showMapper, setShowMapper] = useState(false)
  const [error, setError] = useState('')
  const [parsedRows, setParsedRows] = useState([])
  const [importing, setImporting] = useState(false)
  const [pasteMode, setPasteMode] = useState(false)
  const fileInputRef = useRef(null)

  const resetState = () => {
    setFile(null)
    setRawText('')
    setRawContentText('')
    setHeaders([])
    setColumnMapping(null)
    setShowMapper(false)
    setError('')
    setParsedRows([])
    setImporting(false)
    setPasteMode(false)
  }

  const handleClose = () => {
    resetState()
    onClose()
  }

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0]
    if (!selected) return
    setError('')
    setFile(selected)

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const content = event.target?.result
        if (typeof content === 'string') {
          processRawContent(content)
        }
      } catch (err) {
        setError(err.message || 'Failed to read file')
      }
    }
    reader.onerror = () => setError('Error reading the uploaded file.')
    reader.readAsText(selected)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const dropped = e.dataTransfer.files?.[0]
    if (!dropped) return
    setError('')
    setFile(dropped)

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const content = event.target?.result
        if (typeof content === 'string') {
          processRawContent(content)
        }
      } catch (err) {
        setError(err.message || 'Failed to read file')
      }
    }
    reader.readAsText(dropped)
  }

  const processRawContent = (text) => {
    try {
      setError('')
      setRawContentText(text)
      const meta = getStatementHeadersAndPreview(text)
      setHeaders(meta.headers)
      setColumnMapping(meta.detectedCols)
      const rows = parseBankStatement(text, meta.detectedCols)
      setParsedRows(rows)
    } catch (err) {
      setError(err.message || 'Could not parse bank statement')
      setParsedRows([])
    }
  }

  const handleMappingChange = (field, newIdx) => {
    const nextMapping = { ...columnMapping, [field]: Number(newIdx) }
    setColumnMapping(nextMapping)
    try {
      setError('')
      const rows = parseBankStatement(rawContentText, nextMapping)
      setParsedRows(rows)
    } catch (err) {
      setError(err.message || 'Failed to re-parse with selected column mapping')
    }
  }

  const toggleDualMode = () => {
    const nextMapping = { ...columnMapping, isDualColumn: !columnMapping.isDualColumn }
    setColumnMapping(nextMapping)
    try {
      setError('')
      const rows = parseBankStatement(rawContentText, nextMapping)
      setParsedRows(rows)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDownloadSample = () => {
    const sample = getSampleCsvTemplate()
    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'sample-bank-statement.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const toggleSelectAll = () => {
    const allSelected = parsedRows.every((r) => r.selected)
    setParsedRows((prev) => prev.map((r) => ({ ...r, selected: !allSelected })))
  }

  const toggleRow = (id) => {
    setParsedRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r)),
    )
  }

  const toggleRowSign = (id) => {
    setParsedRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r
        const nextAmount = -r.amount
        let nextCat = r.category
        if (nextAmount > 0 && ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment'].includes(r.category)) {
          nextCat = 'Income'
        } else if (nextAmount < 0 && ['Income', 'Salary', 'Investment'].includes(r.category)) {
          nextCat = 'Other'
        }
        return { ...r, amount: nextAmount, category: nextCat }
      }),
    )
  }

  const setAllToSpend = () => {
    setParsedRows((prev) =>
      prev.map((r) => ({
        ...r,
        amount: -Math.abs(r.amount),
        category: ['Income', 'Salary', 'Investment'].includes(r.category) ? 'Other' : r.category,
      })),
    )
  }

  const setAllToIncome = () => {
    setParsedRows((prev) =>
      prev.map((r) => ({
        ...r,
        amount: Math.abs(r.amount),
        category: ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment'].includes(r.category)
          ? 'Income'
          : r.category,
      })),
    )
  }

  const toggleAllSigns = () => {
    setParsedRows((prev) =>
      prev.map((r) => ({
        ...r,
        amount: -r.amount,
      })),
    )
  }

  const updateRowCategory = (id, newCategory) => {
    setParsedRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, category: newCategory } : r)),
    )
  }

  const selectedRows = useMemo(
    () => parsedRows.filter((r) => r.selected),
    [parsedRows],
  )

  const summary = useMemo(() => {
    let debits = 0
    let credits = 0
    let debitCount = 0
    let creditCount = 0

    selectedRows.forEach((r) => {
      if (r.amount < 0) {
        debits += Math.abs(r.amount)
        debitCount++
      } else {
        credits += r.amount
        creditCount++
      }
    })

    return { debits, credits, debitCount, creditCount }
  }, [selectedRows])

  const handleCommitImport = async () => {
    if (selectedRows.length === 0) return
    setImporting(true)
    try {
      await onImportSuccess(selectedRows)
      handleClose()
    } catch (err) {
      setError(err.message || 'Failed to save transactions.')
      setImporting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade">
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <FileSpreadsheet size={20} />
            </span>
            <div>
              <h3 className="heading text-[16px] font-bold">
                Import Bank Statement / CSV
              </h3>
              <p className="muted text-[12px]">
                Upload CSV statements from PhonePe, Google Pay, Paytm, SBI, HDFC, ICICI, or Axis.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <div className="text-[12.5px] leading-snug">
                <strong className="font-semibold">Parse Notice:</strong> {error}
              </div>
            </div>
          )}

          {parsedRows.length === 0 ? (
            /* Upload step */
            <div className="space-y-4">
              {!pasteMode ? (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center transition hover:border-emerald-500 hover:bg-emerald-50/20 dark:border-slate-700 dark:hover:border-emerald-500/50 dark:hover:bg-emerald-500/5 cursor-pointer"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.tsv,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Upload size={26} />
                  </div>
                  <h4 className="heading mt-3 text-[15px] font-semibold">
                    Click to browse or drag & drop CSV statement
                  </h4>
                  <p className="muted mt-1 text-[12px] max-w-sm">
                    Auto-maps Date, Narration, and genuine Transaction Amounts. Ignores bank account / card numbers.
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      .CSV
                    </span>
                    <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      .TSV
                    </span>
                    <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      .TXT
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="eyebrow block" htmlFor="csv-raw">
                    Paste raw CSV lines here:
                  </label>
                  <textarea
                    id="csv-raw"
                    rows={8}
                    className="input font-mono text-[12px]"
                    placeholder="Date,Description,Debited From,Amount,Type&#10;2026-09-28,Swiggy Bangalore,SBI - 3048,450.00,DEBIT&#10;2026-09-29,Salary Credit,Infosys,75000.00,CREDIT"
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                  />
                  <Button
                    variant="primary"
                    onClick={() => processRawContent(rawText)}
                    disabled={!rawText.trim()}
                  >
                    Parse Pasted Text
                  </Button>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[12px]">
                <button
                  type="button"
                  onClick={() => setPasteMode((prev) => !prev)}
                  className="font-medium text-emerald-600 hover:underline dark:text-emerald-400 inline-flex items-center gap-1.5"
                >
                  <FileText size={14} />
                  {pasteMode ? 'Switch to file upload' : 'Paste CSV text manually instead'}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadSample}
                  className="muted hover:text-emerald-600 dark:hover:text-emerald-400 inline-flex items-center gap-1"
                >
                  <Download size={13} />
                  Download sample template (.csv)
                </button>
              </div>
            </div>
          ) : (
            /* Preview & Mapper step */
            <div className="space-y-4">
              {/* Summary banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-900/50">
                <div>
                  <p className="muted text-[10px] font-semibold uppercase tracking-wider">
                    Total Found
                  </p>
                  <p className="heading text-[14px] font-bold mt-0.5">
                    {parsedRows.length} rows
                  </p>
                </div>
                <div>
                  <p className="muted text-[10px] font-semibold uppercase tracking-wider">
                    Selected
                  </p>
                  <p className="heading text-[14px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {selectedRows.length} rows
                  </p>
                </div>
                <div>
                  <p className="muted text-[10px] font-semibold uppercase tracking-wider">
                    Debits (Spend)
                  </p>
                  <p className="tabular text-[14px] font-bold text-rose-600 mt-0.5">
                    {formatINR(summary.debits)} ({summary.debitCount})
                  </p>
                </div>
                <div>
                  <p className="muted text-[10px] font-semibold uppercase tracking-wider">
                    Credits (Income)
                  </p>
                  <p className="tabular text-[14px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {formatINR(summary.credits)} ({summary.creditCount})
                  </p>
                </div>
              </div>

              {/* Column Mapping Header Bar */}
              {headers.length > 0 && columnMapping && (
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-900/60">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal size={15} className="text-emerald-600 dark:text-emerald-400" />
                      <span className="text-[12px] font-semibold">
                        Statement Column Mapping
                      </span>
                      <span className="text-[11px] text-slate-500">
                        ({columnMapping.isDualColumn ? 'Dual Debit/Credit Mode' : 'Single Amount Column Mode'})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowMapper((prev) => !prev)}
                      className="text-[11px] font-medium text-emerald-600 hover:underline dark:text-emerald-400 inline-flex items-center gap-1"
                    >
                      {showMapper ? 'Hide Mapping' : 'Adjust Mapping Dropdowns'}
                      {showMapper ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>
                  </div>

                  {showMapper && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500 font-medium">Mode:</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (columnMapping.isDualColumn) toggleDualMode()
                          }}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer ${
                            !columnMapping.isDualColumn
                              ? 'bg-emerald-600 text-white'
                              : 'border border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          Single Amount Column
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!columnMapping.isDualColumn) toggleDualMode()
                          }}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer ${
                            columnMapping.isDualColumn
                              ? 'bg-emerald-600 text-white'
                              : 'border border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          Dual Columns (Separate Debit & Credit)
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
                        {/* Date Col */}
                        <div>
                          <label className="block text-slate-500 font-medium mb-1">
                            Date Column:
                          </label>
                          <select
                            value={columnMapping.dateIdx}
                            onChange={(e) => handleMappingChange('dateIdx', e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11.5px] dark:border-slate-700 dark:bg-slate-800"
                          >
                            {headers.map((h, idx) => (
                              <option key={`date-${idx}`} value={idx}>
                                {idx + 1}. {h || `Column ${idx + 1}`}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Description Col */}
                        <div>
                          <label className="block text-slate-500 font-medium mb-1">
                            Description / Narration:
                          </label>
                          <select
                            value={columnMapping.descIdx}
                            onChange={(e) => handleMappingChange('descIdx', e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11.5px] dark:border-slate-700 dark:bg-slate-800"
                          >
                            {headers.map((h, idx) => (
                              <option key={`desc-${idx}`} value={idx}>
                                {idx + 1}. {h || `Column ${idx + 1}`}
                              </option>
                            ))}
                          </select>
                        </div>

                        {!columnMapping.isDualColumn ? (
                          <>
                            {/* Amount Col */}
                            <div>
                              <label className="block text-slate-500 font-medium mb-1">
                                Amount Column:
                              </label>
                              <select
                                value={columnMapping.amountIdx}
                                onChange={(e) => handleMappingChange('amountIdx', e.target.value)}
                                className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11.5px] dark:border-slate-700 dark:bg-slate-800"
                              >
                                {headers.map((h, idx) => (
                                  <option key={`amt-${idx}`} value={idx}>
                                    {idx + 1}. {h || `Column ${idx + 1}`}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Type (Dr/Cr) Col */}
                            <div>
                              <label className="block text-slate-500 font-medium mb-1">
                                Type (Dr/Cr) Column:
                              </label>
                              <select
                                value={columnMapping.typeIdx}
                                onChange={(e) => handleMappingChange('typeIdx', e.target.value)}
                                className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11.5px] dark:border-slate-700 dark:bg-slate-800"
                              >
                                <option value={-1}>-- Auto-detect (from Narration/Sign) --</option>
                                {headers.map((h, idx) => (
                                  <option key={`type-${idx}`} value={idx}>
                                    {idx + 1}. {h || `Column ${idx + 1}`}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Debit Col */}
                            <div>
                              <label className="block text-slate-500 font-medium mb-1">
                                Debit (Withdrawal) Column:
                              </label>
                              <select
                                value={columnMapping.debitIdx}
                                onChange={(e) => handleMappingChange('debitIdx', e.target.value)}
                                className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11.5px] dark:border-slate-700 dark:bg-slate-800"
                              >
                                <option value={-1}>-- None --</option>
                                {headers.map((h, idx) => (
                                  <option key={`deb-${idx}`} value={idx}>
                                    {idx + 1}. {h || `Column ${idx + 1}`}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Credit Col */}
                            <div>
                              <label className="block text-slate-500 font-medium mb-1">
                                Credit (Deposit) Column:
                              </label>
                              <select
                                value={columnMapping.creditIdx}
                                onChange={(e) => handleMappingChange('creditIdx', e.target.value)}
                                className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11.5px] dark:border-slate-700 dark:bg-slate-800"
                              >
                                <option value={-1}>-- None --</option>
                                {headers.map((h, idx) => (
                                  <option key={`cred-${idx}`} value={idx}>
                                    {idx + 1}. {h || `Column ${idx + 1}`}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Table header controls & batch flip tools */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="flex items-center gap-1.5 text-[12px] font-medium text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400"
                  >
                    {parsedRows.every((r) => r.selected) ? (
                      <CheckSquare size={16} className="text-emerald-600" />
                    ) : (
                      <Square size={16} />
                    )}
                    Select / Deselect All
                  </button>

                  <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-700">
                    <span className="text-[11px] text-slate-400">Quick set:</span>
                    <button
                      type="button"
                      onClick={setAllToSpend}
                      title="Set all selected transactions as Spend (negative)"
                      className="rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10.5px] font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 cursor-pointer"
                    >
                      All Spend (−)
                    </button>
                    <button
                      type="button"
                      onClick={setAllToIncome}
                      title="Set all selected transactions as Income (positive)"
                      className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300 cursor-pointer"
                    >
                      All Income (+)
                    </button>
                    <button
                      type="button"
                      onClick={toggleAllSigns}
                      title="Invert Spend and Income for all rows"
                      className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10.5px] font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
                    >
                      Invert (±)
                    </button>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  onClick={() => {
                    setParsedRows([])
                    setFile(null)
                  }}
                  className="text-slate-500 hover:text-rose-600 text-[11px]"
                >
                  Upload another file
                </Button>
              </div>

              {/* Transactions Table */}
              <div className="max-h-[360px] overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-[12px]">
                  <thead className="sticky top-0 bg-slate-100/90 backdrop-blur font-semibold text-slate-600 dark:bg-slate-800/90 dark:text-slate-300">
                    <tr>
                      <th className="py-2.5 pl-3 pr-2 w-10">#</th>
                      <th className="py-2.5 px-2">Date</th>
                      <th className="py-2.5 px-2">Description</th>
                      <th className="py-2.5 px-2">Category</th>
                      <th className="py-2.5 px-2">Type</th>
                      <th className="py-2.5 pr-3 pl-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {parsedRows.map((row) => (
                      <tr
                        key={row.id}
                        className={`transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40 ${
                          !row.selected ? 'opacity-40 line-through' : ''
                        }`}
                      >
                        <td className="py-2 pl-3 pr-2">
                          <button
                            type="button"
                            onClick={() => toggleRow(row.id)}
                            className="text-slate-400 hover:text-emerald-600"
                          >
                            {row.selected ? (
                              <CheckSquare size={15} className="text-emerald-600" />
                            ) : (
                              <Square size={15} />
                            )}
                          </button>
                        </td>
                        <td className="py-2 px-2 whitespace-nowrap font-mono text-[11px]">
                          {row.date}
                        </td>
                        <td className="py-2 px-2 max-w-[220px]">
                          <p className="heading truncate font-medium text-[12px]">
                            {row.description}
                          </p>
                          {row.note && (
                            <p className="muted truncate text-[10px]">{row.note}</p>
                          )}
                        </td>
                        <td className="py-2 px-2">
                          <select
                            value={row.category}
                            onChange={(e) =>
                              updateRowCategory(row.id, e.target.value)
                            }
                            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
                          >
                            {ALL_IMPORT_CATEGORIES.map((catName) => (
                              <option key={catName} value={catName}>
                                {catName}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-2 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => toggleRowSign(row.id)}
                            title="Click to flip Spend / Income"
                            className={`rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold transition cursor-pointer ${
                              row.amount < 0
                                ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400'
                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400'
                            }`}
                          >
                            {row.amount < 0 ? '− Spend' : '+ Income'}
                          </button>
                        </td>
                        <td
                          className={`py-2 pr-3 pl-2 text-right tabular whitespace-nowrap font-bold ${
                            row.amount > 0
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {row.amount > 0 ? '+' : ''}
                          {formatINR(row.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <Button variant="ghost" onClick={handleClose} disabled={importing}>
            Cancel
          </Button>

          {parsedRows.length > 0 && (
            <Button
              variant="primary"
              icon={Check}
              onClick={handleCommitImport}
              disabled={selectedRows.length === 0 || importing}
            >
              {importing
                ? 'Importing to Ledger...'
                : `Import ${selectedRows.length} Transactions`}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

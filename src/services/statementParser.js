/**
 * ------------------------------------------------------------------
 * SPENANCE — Bank Statement & CSV Parser
 * Supports HDFC, SBI, ICICI, Axis, Paytm, and generic CSV/TSV statements.
 * Auto-detects columns, normalizes dates, classifies categories & methods.
 * ------------------------------------------------------------------
 */

import { CATEGORIES, PAYMENT_METHODS } from '../data/mockData.js'

/**
 * Universal CSV row parser compliant with RFC 4180 (handles commas inside quotes).
 */
export function parseCsvText(rawText) {
  if (!rawText || !rawText.trim()) return []

  const lines = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .filter((line) => line.trim().length > 0)

  if (lines.length < 2) return []

  // Detect delimiter: comma, tab, or semicolon
  const firstLine = lines[0]
  let delimiter = ','
  if (firstLine.includes('\t')) delimiter = '\t'
  else if (firstLine.includes(';') && !firstLine.includes(',')) delimiter = ';'

  const rows = []
  for (const line of lines) {
    const row = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      const nextChar = line[i + 1]

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === delimiter && !inQuotes) {
        row.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    row.push(current.trim())
    rows.push(row)
  }

  return rows
}

/**
 * Normalizes different date formats (DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY) into YYYY-MM-DD.
 */
export function normalizeDate(dateStr) {
  if (!dateStr) return new Date().toISOString().slice(0, 10)
  const clean = dateStr.trim().replace(/['"]/g, '')

  // If already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean

  // DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const parts = clean.split(/[-/.]/)
  if (parts.length === 3) {
    let day = parseInt(parts[0], 10)
    let month = parseInt(parts[1], 10)
    let year = parseInt(parts[2], 10)

    // Handle 2-digit year (e.g. 26 -> 2026)
    if (year < 100) year += 2000

    // If first part is 4 digits, it's YYYY-MM-DD
    if (parts[0].length === 4) {
      year = parseInt(parts[0], 10)
      month = parseInt(parts[1], 10)
      day = parseInt(parts[2], 10)
    } else if (day > 12 && month <= 12) {
      // Unambiguously DD/MM/YYYY
    } else if (month > 12 && day <= 12) {
      // MM/DD/YYYY format
      const temp = day
      day = month
      month = temp
    }

    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }
  }

  // Fallback: try JS Date
  const parsed = new Date(clean)
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10)
  }

  return new Date().toISOString().slice(0, 10)
}

/**
 * Intelligent categorization based on transaction narration & description.
 */
export function autoCategorize(narration = '', isIncome = false) {
  const text = (narration || '').toLowerCase()

  if (isIncome || /salary|payroll|stipend|freelance|dividend|bonus|interest|refund|cashback/.test(text)) {
    if (/salary|payroll|stipend/.test(text)) return 'Salary'
    if (/dividend|interest|stock|mutual fund/.test(text)) return 'Investment'
    if (/refund|cashback/.test(text)) return 'Refund'
    return 'Income'
  }

  if (
    /swiggy|zomato|mcdonald|starbucks|dominos|kfc|burger|pizza|blinkit|zepto|grofers|bigbasket|supermarket|grocery|food|restaurant|cafe|dining|chai|tea|bakery|dosa|biryani|subway/.test(
      text
    )
  ) {
    return 'Food'
  }
  if (
    /uber|ola|rapido|metro|petrol|fuel|diesel|indian oil|iocl|bpcl|hpcl|bharat petroleum|fastag|toll|parking|auto|irctc|railway|train|flight|indigo/.test(
      text
    )
  ) {
    return 'Transport'
  }
  if (
    /netflix|spotify|prime|hotstar|disney|pvr|inox|bookmyshow|cinema|movie|steam|playstation|sonyliv|youtube|game/.test(
      text
    )
  ) {
    return 'Entertainment'
  }
  if (
    /amazon|flipkart|myntra|zara|h&m|ajio|nykaa|croma|reliance|decathlon|mall|retail|clothing|apparel|shoe|watch/.test(
      text
    )
  ) {
    return 'Shopping'
  }
  if (
    /rent|landlord|bescom|electricity|power|gas|cylinder|indane|bharatgas|hp gas|water|wifi|airtel|jio|act|broadband|recharge|maintenance|bill|apollo|pharmacy|medplus|1mg|hospital|clinic|doctor|medicine|health|udemy|coursera|college|school|tuition|fees|book|training|course|exam|university|emi|loan|bajaj|cred|credit card bill|cc payment|finance/.test(
      text
    )
  ) {
    return 'Bills'
  }

  return 'Other'
}

/**
 * Intelligent payment method detection from narration.
 */
export function autoDetectPaymentMethod(narration = '') {
  const text = narration.toLowerCase()
  if (/upi|@ok|@paytm|@axl|@ibl|@ybl|gpay|phonepe|paytm/.test(text)) {
    return 'UPI'
  }
  if (/neft|imps|rtgs|inb|net banking|transfer/.test(text)) {
    return 'Net Banking'
  }
  if (/pos|atm|debit card|visa debit|mastercard/.test(text)) {
    return 'Debit Card'
  }
  if (/credit card|cred|cc bill/.test(text)) {
    return 'Credit Card'
  }
  if (/cash|atm wdl|atm cash/.test(text)) {
    return 'Cash'
  }
  return 'UPI'
}

/**
 * Checks if a column header refers to an account, card, source, or destination rather than an amount.
 */
function isAccountOrCard(headerStr = '') {
  return /from|to|acc|account|card|bank|vpa|source|dest|mode|channel|via|by|wallet|upi\s*id|ending/i.test(
    headerStr
  )
}

/**
 * Checks if a column header refers to balance rather than a transaction amount.
 */
function isBalance(headerStr = '') {
  return /balance|bal\b|closing|available/i.test(headerStr)
}

/**
 * Strips commas, currency symbols, and extra spacing to parse numbers safely.
 * Returns 0 if text contains bank or account words (e.g. 'State Bank of India - 3048').
 */
export function parseCleanNumber(val) {
  if (val === null || val === undefined) return 0
  const str = String(val).trim()
  if (!str) return 0

  // Reject text containing known non-monetary bank or account keywords
  if (
    /\b(bank|india|state|hdfc|icici|axis|sbi|kotak|punjab|bob|pnb|paytm|airtel|upi|vpa|a\/c|acc|card|ending|failed|success|completed|pending|status)\b/i.test(
      str
    )
  ) {
    return 0
  }

  // Check if string contains Dr / Cr suffix
  const isDr = /\b(dr|debit|debited)\b/i.test(str)
  const isCr = /\b(cr|credit|credited)\b/i.test(str)

  let cleaned = str
    .replace(/[₹$€£]/g, '')
    .replace(/\b(inr|rs\.?|dr\.?|cr\.?)\b/gi, '')
    .replace(/,/g, '')
    .trim()

  // Handle accounting parentheses: (500) -> -500
  if (/^\(.*\)$/.test(cleaned)) {
    cleaned = '-' + cleaned.replace(/[()]/g, '')
  }

  // Match pure number format: e.g. -123.45 or +123.45 or 123.45
  const match = cleaned.match(/^[+-]?\d+(?:\.\d+)?$/)
  if (!match) {
    const looseMatch = cleaned.match(/[+-]?\d+(?:\.\d+)?/)
    if (!looseMatch) return 0
    // If the original string had multiple words or excessive letters, reject it
    if (/[a-zA-Z]{3,}/.test(str)) return 0
    cleaned = looseMatch[0]
  }

  const num = parseFloat(cleaned)
  if (isNaN(num)) return 0
  if (isDr) return -Math.abs(num)
  if (isCr) return Math.abs(num)
  return num
}

/**
 * Identifies column indexes in the header row.
 */
export function identifyColumns(headerRow) {
  const normalized = headerRow.map((col) => col.trim().toLowerCase())

  let dateIdx = -1
  let descIdx = -1
  let amountIdx = -1
  let debitIdx = -1
  let creditIdx = -1
  let refIdx = -1
  let typeIdx = -1

  normalized.forEach((header, idx) => {
    // Exclude balance columns from all amount/debit/credit matches
    if (isBalance(header)) return

    // Date column
    if (
      dateIdx === -1 &&
      (header.includes('date') ||
        header === 'txn date' ||
        header === 'transaction date' ||
        header === 'value date')
    ) {
      dateIdx = idx
    }
    // Debit / Withdrawal Amount (MUST NOT be an account, card, or 'debited from' column)
    else if (
      debitIdx === -1 &&
      !isAccountOrCard(header) &&
      (header.includes('withdrawal') ||
        header.includes('debit amt') ||
        header.includes('dr amt') ||
        header === 'debit' ||
        header === 'withdrawal' ||
        header === 'dr' ||
        header.includes('spent') ||
        header.includes('outflow'))
    ) {
      debitIdx = idx
    }
    // Credit / Deposit Amount (MUST NOT be an account, card, or 'credited to' column)
    else if (
      creditIdx === -1 &&
      !isAccountOrCard(header) &&
      (header.includes('deposit') ||
        header.includes('credit amt') ||
        header.includes('cr amt') ||
        header === 'credit' ||
        header === 'deposit' ||
        header === 'cr' ||
        header.includes('received') ||
        header.includes('inflow'))
    ) {
      creditIdx = idx
    }
    // Single Amount (MUST NOT be account or balance)
    else if (
      amountIdx === -1 &&
      !isAccountOrCard(header) &&
      (header.includes('amount') ||
        header === 'amt' ||
        header === 'transaction amount' ||
        header === 'txn amount')
    ) {
      amountIdx = idx
    }
    // Narration / Description
    else if (
      descIdx === -1 &&
      (header.includes('desc') ||
        header.includes('narration') ||
        header.includes('particular') ||
        header.includes('remark') ||
        header.includes('detail') ||
        header.includes('memo') ||
        header.includes('payee') ||
        header.includes('merchant') ||
        header.includes('activity'))
    ) {
      descIdx = idx
    }
    // Ref / Chq
    else if (
      refIdx === -1 &&
      (header.includes('ref') ||
        header.includes('chq') ||
        header.includes('utr') ||
        header.includes('txn id') ||
        header.includes('transaction id'))
    ) {
      refIdx = idx
    }
    // Type (Dr / Cr / Transaction Type)
    else if (
      typeIdx === -1 &&
      !isAccountOrCard(header) &&
      (header.includes('type') ||
        header.includes('cr/dr') ||
        header.includes('dr/cr') ||
        header.includes('credit/debit') ||
        header.includes('debit/credit') ||
        header.includes('d/c') ||
        header.includes('dr_cr') ||
        header.includes('cr_dr') ||
        header === 'mode' ||
        header === 'action' ||
        header === 'status')
    ) {
      typeIdx = idx
    }
  })

  // If descIdx is still not found, check if there's "paid to" or "credited to"
  if (descIdx === -1) {
    const paidToIdx = normalized.findIndex((h) =>
      /paid to|credited to|payee|receiver/i.test(h)
    )
    if (paidToIdx !== -1) descIdx = paidToIdx
  }

  // Fallbacks if specific matches weren't found
  if (dateIdx === -1) dateIdx = 0
  if (descIdx === -1) descIdx = Math.min(1, normalized.length - 1)

  // Dual column ONLY if both debit and credit columns exist and are distinct
  const isDual = debitIdx !== -1 && creditIdx !== -1 && debitIdx !== creditIdx

  return {
    dateIdx,
    descIdx,
    amountIdx,
    debitIdx,
    creditIdx,
    refIdx,
    typeIdx,
    isDualColumn: isDual,
  }
}

/**
 * Extracts headers and preview rows from raw CSV text to facilitate UI column mapping.
 */
export function getStatementHeadersAndPreview(rawText) {
  const rows = parseCsvText(rawText)
  if (rows.length < 2) {
    throw new Error('The file contains less than 2 lines. Please upload a valid CSV bank statement.')
  }

  let headerRowIdx = 0
  for (let i = 0; i < Math.min(10, rows.length); i++) {
    const joined = rows[i].join(' ').toLowerCase()
    if (
      joined.includes('date') &&
      (joined.includes('amount') ||
        joined.includes('debit') ||
        joined.includes('balance') ||
        joined.includes('particular') ||
        joined.includes('narration') ||
        joined.includes('credit'))
    ) {
      headerRowIdx = i
      break
    }
  }

  const headerRow = rows[headerRowIdx]
  const detectedCols = identifyColumns(headerRow)
  const dataRows = rows.slice(headerRowIdx + 1).filter((r) => r.some((c) => c.trim()))

  return {
    headers: headerRow,
    headerRowIdx,
    detectedCols,
    totalRows: dataRows.length,
    sampleRows: dataRows.slice(0, 5),
  }
}

/**
 * Parses raw text from a bank statement or CSV file into structured transaction rows.
 * Accepts optional customCols mapping object to allow users to override detected columns.
 */
export function parseBankStatement(rawText, customCols = null) {
  const rows = parseCsvText(rawText)
  if (rows.length < 2) {
    throw new Error('The file contains less than 2 lines. Please upload a valid CSV bank statement.')
  }

  // Find the header row (sometimes statements have title lines at the top)
  let headerRowIdx = 0
  for (let i = 0; i < Math.min(10, rows.length); i++) {
    const joined = rows[i].join(' ').toLowerCase()
    if (
      joined.includes('date') &&
      (joined.includes('amount') ||
        joined.includes('debit') ||
        joined.includes('balance') ||
        joined.includes('particular') ||
        joined.includes('narration') ||
        joined.includes('credit'))
    ) {
      headerRowIdx = i
      break
    }
  }

  const headerRow = rows[headerRowIdx]
  const detected = identifyColumns(headerRow)
  const cols = customCols ? { ...detected, ...customCols } : detected

  // Check dual column status based on active column indices
  const isDual =
    cols.debitIdx !== -1 &&
    cols.creditIdx !== -1 &&
    cols.debitIdx !== cols.creditIdx &&
    (cols.amountIdx === -1 || customCols?.isDualColumn)

  const parsed = []
  const dataRows = rows.slice(headerRowIdx + 1)

  dataRows.forEach((row, rowIdx) => {
    // Skip empty rows
    if (!row || row.length === 0 || row.every((c) => !c.trim())) return

    const rawDate = row[cols.dateIdx] || ''
    const rawDesc = row[cols.descIdx] || 'Bank Transaction'
    const rawRef = cols.refIdx !== -1 ? row[cols.refIdx] : ''

    // Compute amount and sign
    let amount = 0
    let isIncome = false

    if (isDual) {
      const debitRaw = cols.debitIdx !== -1 ? parseCleanNumber(row[cols.debitIdx]) : 0
      const creditRaw = cols.creditIdx !== -1 ? parseCleanNumber(row[cols.creditIdx]) : 0

      if (creditRaw > 0) {
        amount = Math.abs(creditRaw)
        isIncome = true
      } else if (debitRaw > 0) {
        amount = -Math.abs(debitRaw)
        isIncome = false
      }
    } else if (cols.amountIdx !== -1) {
      const rawCell = row[cols.amountIdx] ? String(row[cols.amountIdx]).trim() : ''
      const rawCellUpper = rawCell.toUpperCase()
      let val = parseCleanNumber(rawCell)
      const typeVal = cols.typeIdx !== -1 ? String(row[cols.typeIdx] || '').trim().toUpperCase() : ''
      const descVal = rawDesc.toUpperCase()

      // 1. Raw cell indicator (e.g. 500 Cr, +500, 450 Dr, -450)
      const rawHasCredit = rawCellUpper.includes('CR') || rawCellUpper.startsWith('+')
      const rawHasDebit = rawCellUpper.includes('DR') || rawCellUpper.startsWith('-') || rawCellUpper.startsWith('(')

      // 2. Type column indicator
      const typeHasCredit =
        /\b(CR|CREDIT|CREDITED|RECEIVED|REFUND|INFLOW|DEPOSIT|INWARD|BONUS|INTEREST|CASHBACK)\b/i.test(typeVal) ||
        typeVal === 'CR' ||
        typeVal === 'C'

      const typeHasDebit =
        /\b(DR|DEBIT|DEBITED|PAID|PAYMENT|OUTFLOW|WITHDRAWAL|OUTWARD|SENT|PURCHASE)\b/i.test(typeVal) ||
        typeVal === 'DR' ||
        typeVal === 'D'

      // 3. Narration indicator
      const descHasCredit =
        /\b(SALARY|PAYROLL|STIPEND|REFUND|CASHBACK|DIVIDEND|INTEREST CREDIT|CREDITED|RECEIVED FROM|TRANSFER FROM|INWARD)\b/i.test(descVal)

      const descHasDebit =
        /\b(PAID TO|DEBITED|TRANSFER TO|OUTWARD|PURCHASE|SWIGGY|ZOMATO|UBER|OLA|BLINKIT|ZEPTO|AMAZON|FLIPKART|BILL|RECHARGE)\b/i.test(descVal)

      if (rawHasCredit || typeHasCredit || (descHasCredit && !typeHasDebit)) {
        amount = Math.abs(val)
        isIncome = true
      } else if (rawHasDebit || typeHasDebit || descHasDebit) {
        amount = -Math.abs(val)
        isIncome = false
      } else {
        // Fallback: If val was negative in CSV (-450), it is an expense.
        // Otherwise, standard bank statements without credit markers are expenses.
        amount = -Math.abs(val)
        isIncome = false
      }
    }

    // Skip zero amount rows or footer summary rows
    if (amount === 0) return

    const category = autoCategorize(rawDesc, isIncome)
    const method = autoDetectPaymentMethod(rawDesc)
    const date = normalizeDate(rawDate)

    parsed.push({
      id: `imported-${Date.now()}-${rowIdx}-${Math.random().toString(16).slice(2, 6)}`,
      date,
      description: cleanNarration(rawDesc),
      rawDescription: rawDesc,
      amount: amount, // Negative for expense, positive for income
      category,
      method,
      note: rawRef ? `Ref: ${rawRef}` : 'Imported from bank statement',
      selected: true, // Selected by default for import
    })
  })

  if (parsed.length === 0) {
    throw new Error(
      'Could not parse any valid transaction rows. Please ensure your CSV has Date and Amount/Debit/Credit columns.'
    )
  }

  return parsed
}

/**
 * Cleans ugly bank narrations like "UPI/3218321/Swiggy Bangalore/09321" into "Swiggy Bangalore".
 */
export function cleanNarration(raw) {
  if (!raw || typeof raw !== 'string') return 'Bank Transaction'
  let clean = raw.trim()

  // Remove common prefix patterns
  clean = clean.replace(/^(Payment to|Paid to|Transfer to|Received from|Refund from)\s+/i, '')
  clean = clean.replace(/^(Debited from|Credited to)\s+/i, '')
  clean = clean.replace(/^(UPI|NEFT|IMPS|RTGS|POS|ACH|NACH|BIL)\/+/i, '')
  clean = clean.replace(/^[0-9]+\/+/i, '') // Leading reference digits
  clean = clean.replace(/\/[0-9a-zA-Z._-]+$/i, '') // Trailing bank refs

  // Replace multiple spaces
  clean = clean.replace(/\s+/g, ' ').trim()
  return clean.length > 1 ? clean : (raw.trim() || 'Bank Transaction')
}

/**
 * Generates a ready-to-test sample CSV file for users to test or model their statements after.
 */
export function getSampleCsvTemplate() {
  const today = new Date()
  const d = (daysAgo) => {
    const target = new Date(today)
    target.setDate(today.getDate() - daysAgo)
    return target.toISOString().slice(0, 10)
  }

  return `Date,Description,Withdrawal (Debit),Deposit (Credit),Ref / UPI ID
${d(1)},Swiggy Bangalore UPI/483921/food,480.00,,upi-483921
${d(2)},Uber India Ride New Delhi,340.00,,uber-ride-89
${d(3)},Monthly Salary Credit Infosys Ltd,,75000.00,NEFT-INFY-002
${d(4)},Netflix Subscription AutoDebit,649.00,,sub-net-991
${d(5)},Amazon India Retail Order,1899.00,,amazon-3891
${d(6)},BESCOM Electricity Bill Bangalore,1240.00,,bescom-bill-33
${d(7)},Apollo Pharmacy Bangalore,560.00,,apollo-med-12`
}

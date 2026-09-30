/**
 * ------------------------------------------------------------------
 * SPENANCE — Google Gemini AI Integration
 * Direct integration with Gemini 1.5 Pro / Flash API
 * Analyzes live transactions, budgets, cash flow & loans.
 * ------------------------------------------------------------------
 */

const GEMINI_LOCAL_KEY = 'spenance.gemini.key'
const DEFAULT_MODEL = 'gemini-1.5-pro'
const FALLBACK_MODEL = 'gemini-1.5-flash'

/**
 * Returns the currently configured Gemini API Key from .env or localStorage.
 */
export function getGeminiApiKey() {
  if (typeof window !== 'undefined') {
    const custom = window.localStorage.getItem(GEMINI_LOCAL_KEY)
    if (custom && custom.trim().length > 10) return custom.trim()
  }
  return (import.meta.env.VITE_GEMINI_API_KEY || '').trim()
}

/**
 * Saves a user-provided Gemini API Key to local storage.
 */
export function setGeminiApiKey(key) {
  if (typeof window === 'undefined') return
  if (!key) {
    window.localStorage.removeItem(GEMINI_LOCAL_KEY)
  } else {
    window.localStorage.setItem(GEMINI_LOCAL_KEY, key.trim())
  }
}

/**
 * Checks whether a valid Gemini API key is configured.
 */
export function isGeminiConfigured() {
  const key = getGeminiApiKey()
  return Boolean(key && key.length > 15)
}

/**
 * Tests a candidate Gemini API key by making a lightweight request.
 */
export async function testGeminiApiKey(candidateKey) {
  const key = candidateKey || getGeminiApiKey()
  if (!key || key.trim().length < 15) {
    return { success: false, error: 'API key is too short or empty.' }
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent?key=${key.trim()}`
  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: 'Respond with the single word: "READY"' }],
      },
    ],
    generationConfig: { maxOutputTokens: 10 },
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}))
      const msg = errJson.error?.message || `HTTP ${res.status}`
      return { success: false, error: msg }
    }

    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    return { success: true, text: text.trim() }
  } catch (err) {
    return { success: false, error: err.message || 'Network connection failed.' }
  }
}


/**
 * Builds a structured financial context prompt with the user's live data.
 */
function buildFinancialPrompt(financialContext, userQuestion) {
  const {
    balance = 0,
    totalIncome = 0,
    totalExpenses = 0,
    netSavings = 0,
    savingsRate = 0,
    budgetTotal = 0,
    budgetRemaining = 0,
    budgetUsagePercent = 0,
    score = { total: 0 },
    loans = [],
    emiTotal = 0,
    transactions = [],
    categoryRows = [],
    userName = 'User',
  } = financialContext

  const activeLoans = loans.filter((l) => l.status !== 'Closed')
  const loanSummary = activeLoans.length
    ? activeLoans
        .map(
          (l) =>
            `- ${l.name} (${l.lender}): Outstanding ₹${l.outstanding}, Rate: ${l.interestRate}%, EMI: ₹${l.emi}, Next Due: ${l.nextPaymentDate}`,
        )
        .join('\n')
    : 'None (Debt-free)'

  const recentTxns = transactions.slice(0, 15).map(
    (t) =>
      `- ${t.date}: ${t.description} (${t.category}) | ${t.amount > 0 ? '+' : '-'}₹${Math.abs(t.amount)} via ${t.method || 'UPI'}`,
  ).join('\n') || 'No transactions recorded yet.'

  const categoryBudgets = categoryRows
    .map(
      (c) =>
        `- ${c.category}: Spent ₹${c.spent} of ₹${c.limit} (${c.usedPercent.toFixed(1)}% used)`,
    )
    .join('\n')

  return `
You are SPENANCE AI, an elite personal financial advisor and wealth coach.
You are analyzing the live financial portfolio of ${userName}.

CURRENT LIVE FINANCIAL SNAPSHOT (Amounts in INR ₹):
- Current Live Balance: ₹${balance.toLocaleString('en-IN')}
- Total Income: ₹${totalIncome.toLocaleString('en-IN')}
- Total Expenses: ₹${totalExpenses.toLocaleString('en-IN')}
- Net Savings: ₹${netSavings.toLocaleString('en-IN')} (Savings Rate: ${savingsRate.toFixed(1)}%)
- Monthly Budget Envelope: ₹${budgetTotal.toLocaleString('en-IN')} | Remaining: ₹${budgetRemaining.toLocaleString('en-IN')} (${budgetUsagePercent.toFixed(1)}% used)
- Financial Health Score: ${score.total}/100
- Monthly Loan EMIs: ₹${emiTotal.toLocaleString('en-IN')}
- Active Loans:
${loanSummary}

CATEGORY ENVELOPE SPENDING:
${categoryBudgets}

RECENT LIVE TRANSACTIONS (Newest First):
${recentTxns}

USER QUESTION / REQUEST:
"${userQuestion}"

INSTRUCTIONS:
1. Provide a sharp, direct, empathetic, and highly actionable response tailored specifically to the live figures above.
2. Reference actual numbers, categories, or loans from the user's data when relevant.
3. Suggest concrete optimization tips (e.g. 50/30/20 rule, loan avalanche strategy, emergency fund targets).
4. If there is no data or zero balance/transactions, encourage them with exact practical starting steps (e.g., setting a monthly budget or logging their primary income source).
5. At the very end of your response, provide 3 short, punchy bullet points under the heading "### Key Actionables:".
`
}

/**
 * Sends a query with the user's live financial context to the Gemini API.
 */
export async function askGeminiFinancialAdvisor(userQuestion, financialContext) {
  const apiKey = getGeminiApiKey()
  if (!apiKey) {
    throw new Error('GEMINI_KEY_MISSING')
  }

  const promptText = buildFinancialPrompt(financialContext, userQuestion)

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: promptText }],
      },
    ],
    generationConfig: {
      temperature: 0.65,
      maxOutputTokens: 800,
    },
  }

  // Try Gemini 1.5 Pro first; fallback to Gemini 1.5 Flash if rate-limited or unavailable
  for (const model of [DEFAULT_MODEL, FALLBACK_MODEL]) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMsg = errorData.error?.message || `HTTP ${response.status}`
        // If 404 or model not found, loop to next fallback model
        if (response.status === 404 || errorMsg.includes('not found')) {
          continue
        }
        throw new Error(errorMsg)
      }

      const data = await response.json()
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text
      if (!rawText) {
        throw new Error('Gemini returned an empty response. Please try again.')
      }

      // Parse response into main text and highlights
      return parseGeminiResponse(rawText)
    } catch (err) {
      if (model === FALLBACK_MODEL) {
        throw err
      }
    }
  }

  throw new Error('Unable to connect to Google Gemini API.')
}

/**
 * Separates response text from bullet actionables
 */
function parseGeminiResponse(rawText) {
  const parts = rawText.split(/### Key Actionables:?/i)
  const mainText = parts[0].trim()
  const highlights = []

  if (parts[1]) {
    const lines = parts[1].split('\n')
    for (const line of lines) {
      const clean = line.replace(/^[-*•\d.]+\s*/, '').trim()
      if (clean) highlights.push(clean)
    }
  }

  return {
    response: mainText,
    highlights: highlights.slice(0, 3),
  }
}

/**
 * ------------------------------------------------------------------
 * SPENANCE — Smart Built-in Financial Advisor Engine
 * Provides instant, zero-latency, personalized financial analysis
 * based on live user balances, category envelopes, loans & cash flow.
 * Works out-of-the-box for everyone without requiring an external API key.
 * ------------------------------------------------------------------
 */

function formatINR(val) {
  const num = Math.round(val || 0)
  return '₹' + num.toLocaleString('en-IN')
}

function parseTargetAmount(text) {
  // Support expressions like "50000", "50k", "1.5 lakh", "2 lakhs", "₹50,000"
  const clean = text.replace(/,/g, '')

  const lakhMatch = clean.match(/([\d.]+)\s*(?:lakh|lac|lakhs|lacs)/i)
  if (lakhMatch) {
    return parseFloat(lakhMatch[1]) * 100000
  }

  const kMatch = clean.match(/([\d.]+)\s*k\b/i)
  if (kMatch) {
    return parseFloat(kMatch[1]) * 1000
  }

  const numMatch = clean.match(/(?:rs\.?|inr|₹)?\s*(\b\d{3,9}\b)/i)
  if (numMatch) {
    return parseInt(numMatch[1], 10)
  }

  return null
}

export function generateSmartFinancialResponse(question, ctx = {}) {
  const text = (question || '').toLowerCase()

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
  } = ctx

  const hasData = transactions.length > 0 || totalIncome > 0 || totalExpenses > 0 || balance > 0
  const activeLoans = loans.filter((l) => l.status !== 'Closed')

  // -------------------------------------------------------------------------
  // 1. Fresh / Empty Profile check
  // -------------------------------------------------------------------------
  if (!hasData) {
    return {
      response: `Hello ${userName}! It looks like your SPENANCE portfolio is currently empty. 
To unlock detailed financial intelligence, start by logging your primary monthly income, setting your monthly budget envelopes, or importing a bank statement CSV. Once you record your first few transactions, I will analyze your cash flow, spending patterns, and debt ratios continuously!`,
      highlights: [
        'Set your monthly income in Settings',
        'Define spending limits in Budget page',
        'Add first expense or import Bank Statement CSV',
      ],
    }
  }

  // -------------------------------------------------------------------------
  // 2. Affordability / Purchase Query ("Can I afford...", "buy phone", etc.)
  // -------------------------------------------------------------------------
  const isAffordQuery =
    /afford|buy|purchase|spend|kharid|le lu|lelu|can i get|phone|iphone|laptop|bike|car/i.test(text)
  const targetAmount = parseTargetAmount(text)

  if (isAffordQuery) {
    if (targetAmount) {
      const emergencyBufferNeeded = totalExpenses > 0 ? totalExpenses * 3 : 30000
      const safeSpendable = Math.max(0, balance - emergencyBufferNeeded)
      const canAffordCash = balance >= targetAmount && balance - targetAmount >= emergencyBufferNeeded * 0.5

      if (canAffordCash) {
        return {
          response: `**Yes, you can afford this ${formatINR(targetAmount)} purchase.** 
Your current liquid balance is **${formatINR(balance)}**. Deducting this purchase leaves **${formatINR(balance - targetAmount)}**, which comfortably preserves your basic liquidity reserve. 
Your monthly net savings are currently running at **${formatINR(netSavings)}/month** (${savingsRate.toFixed(1)}% savings rate), meaning you will quickly replenish your cash buffer within ${Math.ceil(targetAmount / Math.max(1, netSavings))} month(s).`,
          highlights: [
            `Balance post-purchase: ${formatINR(balance - targetAmount)}`,
            `Replenishment speed: ~${Math.ceil(targetAmount / Math.max(1, netSavings))} month(s)`,
            'Tip: Opt for upfront payment or 0% cost EMI to earn rewards',
          ],
        }
      } else if (balance >= targetAmount) {
        return {
          response: `**Caution:** While you technically have **${formatINR(balance)}** in your account to cover the **${formatINR(targetAmount)}** price tag, doing so will dangerously deplete your cash buffer down to just **${formatINR(balance - targetAmount)}**. 
Financially, an emergency buffer of at least 3 months of living costs (${formatINR(emergencyBufferNeeded)}) is recommended before making large discretionary purchases.`,
          highlights: [
            `Remaining balance: ${formatINR(balance - targetAmount)} (High risk)`,
            'Alternative: Save for 2-3 months to buy without draining safety net',
            'Consider no-cost EMI only if total monthly EMIs stay below 30% of income',
          ],
        }
      } else {
        const shortfall = targetAmount - balance
        const monthsToSave = netSavings > 0 ? Math.ceil(shortfall / netSavings) : 'several'
        return {
          response: `**Not recommended right now.** The item costs **${formatINR(targetAmount)}**, but your active balance is **${formatINR(balance)}** (shortfall of **${formatINR(shortfall)}**). 
With your current net savings of **${formatINR(netSavings)}/month**, you can safely reach this target in approximately **${monthsToSave} month(s)** by parking dedicated savings in a liquid fund.`,
          highlights: [
            `Shortfall: ${formatINR(shortfall)}`,
            `Target timeline: ~${monthsToSave} months with current savings pace`,
            'Avoid high-interest consumer credit cards for non-essential purchases',
          ],
        }
      }
    } else {
      return {
        response: `To evaluate whether you can afford this purchase, what is the estimated cost? 
Currently, your live cash balance is **${formatINR(balance)}**, your monthly loan EMIs are **${formatINR(emiTotal)}**, and your average net monthly savings are **${formatINR(netSavings)}**. 
Feel free to ask something like: *"Can I afford a laptop worth ₹65,000?"*`,
        highlights: [
          `Current Liquid Cash: ${formatINR(balance)}`,
          `Monthly Savings Pace: ${formatINR(netSavings)}/mo`,
          `Monthly Debt EMIs: ${formatINR(emiTotal)}`,
        ],
      }
    }
  }

  // -------------------------------------------------------------------------
  // 3. Spending & Category Breakdown ("Where am I spending most?", "Analyze")
  // -------------------------------------------------------------------------
  if (
    /where|kaha|kahape|spending|spent|kharcha|most|highest|biggest|top|analyze|breakdown|category|envelope/i.test(
      text
    )
  ) {
    const sortedCategories = [...categoryRows].sort((a, b) => (b.spent || 0) - (a.spent || 0))
    const topCategory = sortedCategories[0]
    const secondCategory = sortedCategories[1]

    const overBudgets = sortedCategories.filter((c) => c.usedPercent >= 100)

    let breakdownText = `Here is your live spending analysis for this billing cycle:\n\n`
    breakdownText += `Total monthly outflows stand at **${formatINR(totalExpenses)}** across **${transactions.length} recorded transactions**.`

    if (topCategory && topCategory.spent > 0) {
      const topShare = totalExpenses > 0 ? ((topCategory.spent / totalExpenses) * 100).toFixed(1) : 0
      breakdownText += ` Your largest spending envelope is **${topCategory.category}**, where you have spent **${formatINR(topCategory.spent)}** (${topShare}% of total expenses).`
    }

    if (secondCategory && secondCategory.spent > 0) {
      breakdownText += ` Your second highest category is **${secondCategory.category}** at **${formatINR(secondCategory.spent)}**.`
    }

    if (overBudgets.length > 0) {
      breakdownText += `\n\n⚠️ **Budget Alert:** You have exceeded your defined limit in **${overBudgets.map((c) => c.category).join(', ')}**.`
    } else if (budgetRemaining > 0) {
      breakdownText += `\n\n✅ You still have **${formatINR(budgetRemaining)}** headroom remaining in your monthly budget envelopes.`
    }

    return {
      response: breakdownText,
      highlights: [
        `Top Expense: ${topCategory?.category || 'None'} (${formatINR(topCategory?.spent || 0)})`,
        `Overall Budget Utilized: ${budgetUsagePercent.toFixed(1)}%`,
        `Headroom Left: ${formatINR(budgetRemaining)}`,
      ],
    }
  }

  // -------------------------------------------------------------------------
  // 4. Savings Strategies & Optimization ("How to save more?", "Reduce expense")
  // -------------------------------------------------------------------------
  if (/save|saving|bachat|save more|cut|reduce|optimize|kam karu|bachaye/i.test(text)) {
    const discretionaryCategories = categoryRows.filter((c) =>
      ['Food', 'Shopping', 'Entertainment', 'Personal Care'].includes(c.category)
    )
    const discretionarySpend = discretionaryCategories.reduce((sum, c) => sum + (c.spent || 0), 0)
    const potentialMonthlySavings = Math.round(discretionarySpend * 0.2)

    return {
      response: `You are currently saving **${formatINR(netSavings)}/month**, representing a **${savingsRate.toFixed(1)}% savings rate** against your total income of **${formatINR(totalIncome)}**. 

**Personalized Optimization Roadmap:**
1. **Target Discretionary Envelopes:** You spent **${formatINR(discretionarySpend)}** across Food, Shopping, and Entertainment this cycle. Trimming just 15-20% from these areas will immediately liberate **${formatINR(potentialMonthlySavings)} every month** (${formatINR(potentialMonthlySavings * 12)} annually).
2. **Automate Pay-Yourself-First:** On salary day, auto-transfer your target savings into a recurring deposit or index SIP before discretionary spending begins.
3. **The 50/30/20 Rule Benchmark:** Allocate 50% (${formatINR(totalIncome * 0.5)}) for Essential Needs, 30% (${formatINR(totalIncome * 0.3)}) for Lifestyle Wants, and 20% (${formatINR(totalIncome * 0.2)}) for Wealth Building & Debt Clearance.`,
      highlights: [
        `Current Savings Rate: ${savingsRate.toFixed(1)}%`,
        `Quick Win Potential: +${formatINR(potentialMonthlySavings)}/month`,
        `Target 20% Savings: ${formatINR(totalIncome * 0.2)}/month`,
      ],
    }
  }

  // -------------------------------------------------------------------------
  // 5. Loans & Debt Management ("Loans", "EMI", "Prepayment")
  // -------------------------------------------------------------------------
  if (/loan|emi|debt|udhar|karza|interest|prepay|avalanche|snowball/i.test(text)) {
    if (activeLoans.length === 0) {
      return {
        response: `**Excellent news:** You currently have **zero active loans or debts** in SPENANCE! 
Being 100% debt-free gives you a major compounding advantage. Rather than servicing interest to banks, you can route your discretionary cash flow directly into equity index funds, PPF, or building a high-yield emergency buffer.`,
        highlights: [
          'Debt-to-Income: 0% (Optimal)',
          'Zero monthly EMI liabilities',
          'Deploy surplus into compounding SIP investments',
        ],
      }
    }

    const sortedByRate = [...activeLoans].sort((a, b) => (b.interestRate || 0) - (a.interestRate || 0))
    const highestInterestLoan = sortedByRate[0]
    const totalOutstanding = activeLoans.reduce((sum, l) => sum + (l.outstanding || 0), 0)

    return {
      response: `You are currently servicing **${activeLoans.length} active loan(s)** with a total outstanding balance of **${formatINR(totalOutstanding)}** and monthly EMIs of **${formatINR(emiTotal)}**.

**Debt Acceleration Strategy (Debt Avalanche):**
- Prioritize **${highestInterestLoan.name} (${highestInterestLoan.lender})** first, as it carries your highest interest rate of **${highestInterestLoan.interestRate}%**.
- Contributing an extra prepayment of just ₹2,000 to ₹5,000 towards the principal of this loan every month will drastically slash total interest charges and shorten your repayment horizon by months.`,
      highlights: [
        `Total Debt Outstanding: ${formatINR(totalOutstanding)}`,
        `Monthly EMI Outflow: ${formatINR(emiTotal)}`,
        `Highest Rate Priority: ${highestInterestLoan.name} (${highestInterestLoan.interestRate}%)`,
      ],
    }
  }

  // -------------------------------------------------------------------------
  // 6. Financial Health & Score Breakdown ("Health", "Score", "Rating")
  // -------------------------------------------------------------------------
  if (/health|score|rating|how am i doing|kaisa hai|status|review|grade/i.test(text)) {
    const totalScore = score?.total || 0
    let rating = 'Good'
    if (totalScore >= 85) rating = 'Excellent'
    else if (totalScore >= 70) rating = 'Good'
    else if (totalScore >= 50) rating = 'Fair'
    else rating = 'Needs Attention'

    return {
      response: `Your composite SPENANCE Financial Health Score is **${totalScore}/100** (**${rating}**). 

**4-Pillar Health Audit:**
- **Savings Discipline:** Your savings rate is **${savingsRate.toFixed(1)}%** ${savingsRate >= 25 ? '✅ (Healthy)' : '⚠️ (Target: 20-30%)'}.
- **Budget Control:** You have utilized **${budgetUsagePercent.toFixed(1)}%** of your monthly envelopes ${budgetUsagePercent <= 85 ? '✅ (Controlled)' : '⚠️ (Near ceiling)'}.
- **Debt Burden:** Your monthly EMIs of ${formatINR(emiTotal)} represent a debt-to-income ratio of **${totalIncome > 0 ? ((emiTotal / totalIncome) * 100).toFixed(1) : 0}%** (Benchmark: < 30%).
- **Liquidity Buffer:** Current cash balance stands at **${formatINR(balance)}**.`,
      highlights: [
        `Overall Score: ${totalScore}/100 (${rating})`,
        `Savings Pace: ${savingsRate.toFixed(1)}%`,
        `Debt Ratio: ${totalIncome > 0 ? ((emiTotal / totalIncome) * 100).toFixed(1) : 0}%`,
      ],
    }
  }

  // -------------------------------------------------------------------------
  // 7. General / Conversational Fallback
  // -------------------------------------------------------------------------
  return {
    response: `Hello ${userName}! I have analyzed your live portfolio. 
You currently hold **${formatINR(balance)}** in active balance, **${formatINR(totalIncome)}** in income, and **${formatINR(totalExpenses)}** in monthly expenses (${savingsRate.toFixed(1)}% savings rate). 

You can ask me anything about your finances, for example:
- *"Where am I spending the most money?"*
- *"Can I afford a new purchase of ₹45,000?"*
- *"How can I improve my savings rate?"*
- *"What is my loan payoff strategy?"*`,
    highlights: [
      `Active Balance: ${formatINR(balance)}`,
      `Net Savings: ${formatINR(netSavings)}/month`,
      `Active Loans: ${activeLoans.length} (${formatINR(emiTotal)}/mo EMI)`,
    ],
  }
}

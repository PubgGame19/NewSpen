/**
 * ------------------------------------------------------------------
 * SPENANCE — Smart Built-in Financial Advisor Engine
 * Flexible, conversational, bilingual (English & Hinglish),
 * with deep financial knowledge (investing, savings, debt, affordability)
 * and live portfolio integration.
 * ------------------------------------------------------------------
 */

function formatINR(val) {
  const num = Math.round(val || 0)
  return '₹' + num.toLocaleString('en-IN')
}

function isHinglish(text) {
  const hindiKeywords = [
    'bhai', 'kya', 'kaise', 'kare', 'karu', 'karun', 'hoga', 'hogi', 'hai', 'hain',
    'paisa', 'paise', 'kharcha', 'kharch', 'bachaye', 'bachau', 'lelu', 'kharidu',
    'kharid', 'batana', 'batao', 'krna', 'sahi', 'galat', 'kitna', 'kaha', 'kahan',
    'chahiye', 'sakta', 'sakti', 'mujhe', 'mera', 'meri', 'mere', 'kaunsa', 'udhar',
  ]
  const words = text.toLowerCase().split(/\s+/)
  return words.some((w) => hindiKeywords.includes(w))
}

function parseTargetAmount(text) {
  const clean = text.replace(/,/g, '')

  const croreMatch = clean.match(/([\d.]+)\s*(?:cr|crore|crores)/i)
  if (croreMatch) return parseFloat(croreMatch[1]) * 10000000

  const lakhMatch = clean.match(/([\d.]+)\s*(?:lakh|lac|lakhs|lacs|l)\b/i)
  if (lakhMatch) return parseFloat(lakhMatch[1]) * 100000

  const kMatch = clean.match(/([\d.]+)\s*k\b/i)
  if (kMatch) return parseFloat(kMatch[1]) * 1000

  const numMatch = clean.match(/(?:rs\.?|inr|₹)?\s*(\b\d{3,9}\b)/i)
  if (numMatch) return parseInt(numMatch[1], 10)

  return null
}

export function generateSmartFinancialResponse(question = '', ctx = {}) {
  const rawText = question.trim()
  const text = rawText.toLowerCase()
  const hinglish = isHinglish(text)

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
  const targetAmount = parseTargetAmount(text)

  // =========================================================================
  // 1. CASUAL GREETINGS & INTRO ("Hi", "Hello", "Kaise ho", "Bhai", etc.)
  // =========================================================================
  if (/^(hi|hello|hey|yo|namaste|kem cho|kaise ho|kya haal|who are you|bhai)\b/i.test(text) && text.length < 35) {
    if (hinglish) {
      return {
        response: `Arre hello ${userName}! Main SPENANCE ka AI financial advisor hoon. 
Aap mujhse personal finance, monthly budgeting, SIP vs FD, loans, ya koi bhi kharcha karne se pehle affordability advice le sakte ho. 

Aap kya jaan na chahte ho aaj?
- *"Bhai kya main 50k ka phone le sakta hu?"*
- *"Paise kaise bachau (50/30/20 rule)?"*
- *"SIP shuru karu ya FD sahi hai?"*
- *"Emergency fund kitna hona chahiye?"*`,
        highlights: [
          'Affordability checks (Phone, Laptop, etc.)',
          'Savings & 50/30/20 budget framework',
          'SIP, Mutual Funds & Debt payoff guidance',
        ],
      }
    }
    return {
      response: `Hello ${userName}! I am SPENANCE AI, your personal wealth and financial coach.
I can analyze your live spending, evaluate big purchases before you swipe, optimize debt repayments, and recommend practical wealth-building strategies.

Here are a few things you can ask me:
- *"Can I afford a new purchase of ₹50,000?"*
- *"How should I invest my monthly savings (SIP vs FD)?"*
- *"Where is most of my money going?"*
- *"How does the 50/30/20 budget rule work?"*`,
      highlights: [
        'Ask about affordability on any purchase',
        'Explore SIP vs FD investment strategies',
        'Audit your monthly spending & savings rate',
      ],
    }
  }

  // =========================================================================
  // 2. INVESTING, SIP, MUTUAL FUNDS, FD, STOCKS, CRYPTO
  // =========================================================================
  if (/sip|mutual fund|fd|fixed deposit|invest|investment|stocks|share market|crypto|nifty|compounding/i.test(text)) {
    const isSIPvsFD = /sip.*fd|fd.*sip|fixed deposit/i.test(text)
    const isCrypto = /crypto|bitcoin/i.test(text)

    if (isCrypto) {
      return {
        response: hinglish
          ? `**Crypto Investment Advice:**
Crypto extremely high-risk aur volatile asset hai. Agar aap invest karna chahte hain:
1. **Total portfolio ka max 3-5%** hi crypto (Bitcoin/Ethereum) me dalein.
2. Apne emergency fund ya monthly expenses ka paisa kabhi crypto me mat lagayein.
3. Pehle foundation solid karein: Emergency Fund + Health Insurance + Nifty 50 Index Fund SIP.`
          : `**Crypto Investment Strategy:**
Cryptocurrency is highly speculative and volatile. Recommended guidelines:
1. **Cap exposure at 3–5%** of your total investable net worth.
2. Never allocate emergency funds or borrowed money into crypto assets.
3. Build your foundational base first: Liquid Emergency Fund + Term/Health Insurance + Broad-market Index SIPs.`,
        highlights: [
          'Cap crypto at 3-5% of total investments',
          'Prioritize liquid emergency fund first',
          'Focus core portfolio on Index Mutual Funds',
        ],
      }
    }

    if (isSIPvsFD) {
      return {
        response: hinglish
          ? `**SIP vs Fixed Deposit (FD) — Kaunsa kab chunein?**

1. **Short-term / Emergency (0–2 saal): 👉 FD ya Liquid Fund**
   - FD capital safety aur guaranteed ~6.5–7.5% returns deti hai. Emergency fund aur short-term goals ke liye best hai.
2. **Long-term Wealth Building (3–5+ saal): 👉 Equity SIP (Mutual Funds)**
   - Nifty 50 / Flexicap mutual funds me SIP compounding ka fayda deti hai aur historically 12–14% annual return generate karti hai, jo inflation ko beat karta hai.

**Smart Formula:**
- Emergency Fund (3–6 mahine ka kharcha) = FD / Auto-sweep Savings Account.
- Monthly bachat ka 60-70% = Nifty 50 Index Mutual Fund SIP.`
          : `**SIP vs Fixed Deposit (FD) — Which one should you choose?**

1. **Short-Term & Emergency Buffer (0–2 Years): 👉 Fixed Deposit (FD)**
   - FDs guarantee capital protection with predictable 6.5–7.5% returns. Essential for emergency liquidity and commitments due within 24 months.
2. **Long-Term Wealth Creation (3–5+ Years): 👉 Equity Mutual Fund SIP**
   - Systematic Investment Plans (SIP) harness compounding and rupee-cost averaging. Historically, broad market index funds yield 12–14% CAGR, comfortably beating inflation.

**Ideal Allocation:**
- Emergency Reserve (3–6 months essential spend) = Safe Bank FD / Liquid Fund.
- Long-term monthly surplus = Diversified Index / Flexi-cap SIP.`,
        highlights: [
          'FD for Emergency & short-term safety (< 2 yrs)',
          'SIP for beating inflation & wealth compounding (5+ yrs)',
          'Automate SIP deduction right after salary day',
        ],
      }
    }

    return {
      response: hinglish
        ? `**Smart Investing Roadmap for Beginners:**

1. **Pehle Safety Net (Pillar 1):**
   - Apne 3 se 6 mahine ke kharche ke barabar Emergency Fund banayein (FD / High-interest savings account me).
2. **Index Fund SIP (Pillar 2):**
   - Nifty 50 Index Fund ya Nifty LargeMidcap me monthly SIP shuru karein (starting even with ₹500 or ₹1,000/month). Compounding me time sabse bada factor hota hai.
3. **50/30/20 Discipline (Pillar 3):**
   - Monthly income ka kam se kam 20% pehle invest karein, baaki bache paise se lifestyle kharche karein.`
        : `**Smart Wealth Building Roadmap:**

1. **Liquidity First:** Establish a 3–6 month emergency cushion in high-yield liquid funds or bank FDs before entering equities.
2. **Low-cost Broad Market SIPs:** Allocate to low-cost Nifty 50 or Large & Midcap index funds. Consistent monthly compounding delivers exponential results over 7–10 year horizons.
3. **Pay Yourself First:** Automate your investment deduction immediately on salary credit before discretionary spending starts.`,
      highlights: [
        'Automate monthly SIPs in low-cost Index Funds',
        'Keep 3-6 months liquid emergency reserve',
        'Reinvest compounding returns for long-term growth',
      ],
    }
  }

  // =========================================================================
  // 3. 50/30/20 RULE, HOW TO SAVE, SALARY MANAGEMENT
  // =========================================================================
  if (/50.*30.*20|50\/30\/20|how to save|bachat|save more|paisa kaise|salary.*khatam|manage salary/i.test(text)) {
    const incomeRef = totalIncome > 0 ? totalIncome : 50000
    const needsAmt = Math.round(incomeRef * 0.5)
    const wantsAmt = Math.round(incomeRef * 0.3)
    const savingsAmt = Math.round(incomeRef * 0.2)

    if (hinglish) {
      return {
        response: `**50/30/20 Rule: Salary Manage Karne Ka Sabse Asaan Formula**

Maan lijiye aapki monthly income **${formatINR(incomeRef)}** hai, to ise 3 hisson me baantein:

1. **50% Needs (Zaroori Kharche): ${formatINR(needsAmt)}**
   - Rent/Housing, Groceries, Electricity, Wi-Fi, Basic EMIs, Health insurance.
2. **30% Wants (Shauk aur Lifestyle): ${formatINR(wantsAmt)}**
   - Dining out, Shopping, Movies, Weekend travel, OTT subscriptions. Is se zyada nahi hona chahiye.
3. **20% Savings & Wealth (Aapka Future): ${formatINR(savingsAmt)}**
   - Emergency fund, Index Fund SIPs, PPF, Extra debt prepayment.

💡 **Golden Tip:** Salary aate hi pehle 20% (${formatINR(savingsAmt)}) SIP ya savings account me transfer kar do. Jo bache, usi me poora mahina chalao!`,
        highlights: [
          `50% Needs: ${formatINR(needsAmt)} (Rent, Bills, Food)`,
          `30% Wants: ${formatINR(wantsAmt)} (Leisure & Shopping)`,
          `20% Savings: ${formatINR(savingsAmt)} (SIP & Emergency Buffer)`,
        ],
      }
    }

    return {
      response: `**The 50/30/20 Budgeting Blueprint**

Benchmarked against an income of **${formatINR(incomeRef)}/month**, distribute your cash flows as follows:

1. **50% for Needs (${formatINR(needsAmt)}):**
   - Non-negotiable essentials: Rent, utilities, groceries, transportation, insurance, and minimum debt payments.
2. **30% for Wants (${formatINR(wantsAmt)}):**
   - Discretionary choices: Dining out, leisure, electronics, vacations, streaming services.
3. **20% for Savings & Investments (${formatINR(savingsAmt)}):**
   - Building your liquid emergency buffer, mutual fund SIPs, retirement funds, and accelerated debt payoff.

💡 **Rule of Thumb:** If your fixed needs exceed 50%, audit non-essential subscriptions or lifestyle creep to restore your 20% wealth-building buffer.`,
      highlights: [
        `Needs Cap: 50% (${formatINR(needsAmt)})`,
        `Wants Cap: 30% (${formatINR(wantsAmt)})`,
        `Savings Target: 20% (${formatINR(savingsAmt)})`,
      ],
    }
  }

  // =========================================================================
  // 4. EMERGENCY FUND
  // =========================================================================
  if (/emergency fund|emergency buffer|suraksha fund|kitna hona chahiye/i.test(text)) {
    const monthlyExp = totalExpenses > 0 ? totalExpenses : (totalIncome > 0 ? Math.round(totalIncome * 0.6) : 30000)
    const target3mo = monthlyExp * 3
    const target6mo = monthlyExp * 6

    if (hinglish) {
      return {
        response: `**Emergency Fund Kitna Aur Kahan Rakhna Chahiye?**

1. **Size Kitna Ho?**
   - Kam se kam **3 se 6 mahine ke essential living expenses**.
   - Agar aapka monthly basic kharcha ~${formatINR(monthlyExp)} hai, to aapka target **${formatINR(target3mo)} se ${formatINR(target6mo)}** hona chahiye.
2. **Kahan Rakhein?**
   - Is paise ko **Equity ya Shares me bilkul mat lagayein** (market gir sakta hai).
   - Ise **High-yield Savings Account / Sweep-in FD / Liquid Mutual Fund** me rakhein jahan 10 minute me paisa nikaal sakein.
3. **Kab Use Karein?**
   - Sirf unexpected emergencies me: Job loss, medical issue, ya urgent home repair. Gadgets ya shopping ke liye nahi!`,
        highlights: [
          `Target Buffer: ${formatINR(target3mo)} – ${formatINR(target6mo)} (3-6 months)`,
          'Keep in Liquid Mutual Fund or Bank FD (Zero market risk)',
          'Never lock emergency funds in illiquid assets',
        ],
      }
    }

    return {
      response: `**Emergency Fund Architecture**

1. **Target Sizing:**
   - Benchmark: **3 to 6 months of baseline operating expenses**.
   - Assuming monthly commitments around ~${formatINR(monthlyExp)}, your recommended safety reserve is **${formatINR(target3mo)} to ${formatINR(target6mo)}**.
2. **Where to Park It:**
   - Prioritize instant liquidity and capital preservation over high returns.
   - Recommended vehicles: Sweep-in Bank FDs, Overnight/Liquid Mutual Funds, or High-yield Savings Accounts.
3. **Capital Protection Rule:**
   - Never expose emergency capital to equity market volatility. Its purpose is peace of mind, not capital growth.`,
      highlights: [
        `Recommended Size: ${formatINR(target3mo)} - ${formatINR(target6mo)}`,
        'Vehicle: Sweep-in FD or Liquid Fund',
        'Guarantees insulation against sudden income shocks',
      ],
    }
  }

  // =========================================================================
  // 5. CREDIT CARDS, CIBIL SCORE, DEBT TRAPS
  // =========================================================================
  if (/credit card|cibil|credit score|interest rate|minimum due/i.test(text)) {
    if (hinglish) {
      return {
        response: `**Credit Card & 750+ CIBIL Score Master Guide:**

1. **Hamesha Full Bill Pay Karein:**
   - Kabhi bhi "Minimum Amount Due" ke trap me mat phasna! Credit cards 36% se 45% annual interest charge karte hain jo financial disaster ban sakta hai.
2. **30% Credit Utilization Rule:**
   - Agar aapki card limit ₹1,00,000 hai, to mahine me ₹30,000 se zyada spend mat karein. Is se CIBIL score 750+ तेजी se badhta hai.
3. **Grace Period Ka Fayda Uthayein:**
   - Credit card par 45-50 days ka interest-free window milta hai. Smartly use karein to rewards aur cashbacks milte hain.`,
        highlights: [
          'Pay 100% total bill on time — never minimum due',
          'Keep credit utilization under 30% of limit',
          '750+ CIBIL unlocks lowest loan interest rates',
        ],
      }
    }

    return {
      response: `**Credit Card Mastery & 750+ CIBIL Score Rules:**

1. **Avoid the Minimum Due Trap:**
   - Credit cards carry punitive revolving interest rates (36%–44% APR). Always settle the full statement balance before the due date.
2. **Maintain < 30% Credit Utilization Ratio (CUR):**
   - Utilizing more than 30% of your sanction limit signals credit hunger to credit bureaus and depresses your credit score.
3. **Build a 750+ CIBIL Profile:**
   - A spotless repayment history qualifies you for prime home and auto loan rates, saving lakhs in long-term borrowing costs.`,
      highlights: [
        'Always pay full statement balance before due date',
        'Cap credit utilization below 30%',
        'A 750+ CIBIL score secures prime interest rates',
      ],
    }
  }

  // =========================================================================
  // 6. AFFORDABILITY CHECKS ("Can I afford...", "buy phone", "50k", etc.)
  // =========================================================================
  if (/afford|buy|purchase|kharid|le lu|lelu|can i get|phone|iphone|laptop|car|bike/i.test(text) || targetAmount) {
    const amount = targetAmount || 50000

    if (hasData && balance > 0) {
      const emergencyBufferNeeded = totalExpenses > 0 ? totalExpenses * 3 : 30000
      const canAffordCash = balance >= amount && balance - amount >= emergencyBufferNeeded * 0.5

      if (canAffordCash) {
        return {
          response: hinglish
            ? `**Haan bhai, aap ye ${formatINR(amount)} ka purchase afford kar sakte ho!** 
Aapka current balance **${formatINR(balance)}** hai. Is kharche ke baad bhi aapke paas **${formatINR(balance - amount)}** bachenge, jo aapki liquidity maintain rakhega. 
Aapki monthly savings **${formatINR(netSavings)}/month** chal rahi hai, yaani aap agle ~${Math.max(1, Math.ceil(amount / Math.max(1, netSavings)))} mahine me ye paisa wapas replenish kar lenge.`
            : `**Yes, you can comfortably afford this ${formatINR(amount)} purchase.** 
Your current cash balance is **${formatINR(balance)}**. Deducting this purchase leaves **${formatINR(balance - amount)}**, preserving your essential liquidity cushion. 
With current net savings of **${formatINR(netSavings)}/month**, you will replenish this expenditure in approximately ${Math.max(1, Math.ceil(amount / Math.max(1, netSavings)))} month(s).`,
          highlights: [
            `Remaining balance: ${formatINR(balance - amount)}`,
            `Replenishment speed: ~${Math.max(1, Math.ceil(amount / Math.max(1, netSavings)))} months`,
            'Take advantage of 0% interest EMI or card cashback points',
          ],
        }
      } else if (balance >= amount) {
        return {
          response: hinglish
            ? `**Thoda sochiye:** Technically aapke account me **${formatINR(balance)}** hain to aap ${formatINR(amount)} de sakte ho, lekin aisa karne se aapka balance sirf **${formatINR(balance - amount)}** reh jayega. 
Agar koi sudden emergency aayi to mushkil ho sakti hai. 

**Recommendation:**
- Agar zaroori nahi hai to 1–2 mahine rukiye aur thoda aur save karke lijiye.
- Ya 0% No-Cost EMI le sakte hain agar monthly EMI aapki salary ke 15% se kam ho.`
            : `**Exercise Caution:** While your current account balance of **${formatINR(balance)}** can technically cover the **${formatINR(amount)}** price, it drains your liquidity down to **${formatINR(balance - amount)}**. 
A healthy financial baseline requires retaining at least 3 months of emergency expenses before making major discretionary purchases.`,
          highlights: [
            `Balance post-purchase: ${formatINR(balance - amount)} (Tight liquidity)`,
            'Recommendation: Save for 1-2 more months before pulling trigger',
            'Consider No-Cost EMI only if EMI stays under 15% of income',
          ],
        }
      } else {
        const shortfall = amount - balance
        return {
          response: hinglish
            ? `**Abhi recommend nahi karunga:** Item ka cost **${formatINR(amount)}** hai, aur aapka active balance **${formatINR(balance)}** hai (kam se kam **${formatINR(shortfall)}** ki kami hai). 
Credit card loan ya high-interest EMI par non-essential cheezein lena debt trap me daal sakta hai. 
Aap monthly target banakar savings karein, fir aasaani se cash me buy karein!`
            : `**Not recommended at this time:** The purchase price is **${formatINR(amount)}**, while your liquid balance is **${formatINR(balance)}** (shortfall of **${formatINR(shortfall)}**). 
Financing non-essential electronics or luxury goods on high-interest consumer credit can lead to debt traps.`,
          highlights: [
            `Funding Shortfall: ${formatINR(shortfall)}`,
            'Avoid high-interest consumer financing for wants',
            'Set up a short-term recurring savings goal instead',
          ],
        }
      }
    }

    // Benchmark advice when live balance has not been logged yet
    return {
      response: hinglish
        ? `**${formatINR(amount)} Ke Purchase Ka Golden Rule:**

Aap is kharche ko aasaani se afford kar sakte hain agar:
1. **The 50% Monthly Salary Rule:** Is item ki cost aapki monthly take-home salary ke 50% se kam honi chahiye.
2. **The 3x Emergency Buffer:** Ise lene ke baad bhi aapke paas kam se kam 3 mahine ke kharche ka emergency buffer bacha hona chahiye.
3. **Zero High-Interest Debt:** Agar credit card bill ya high-interest loan bacha hai, to pehle use clear karein.

💡 *Aap Settings ya Dashboard me apni income aur balance record karein, fir main aapke live numbers par exact calculation karke bataunga!*`
        : `**Affordability Rule of Thumb for ${formatINR(amount)}:**

You can comfortably afford this purchase if you meet three criteria:
1. **The 50% Take-Home Rule:** The item's total cost does not exceed 50% of your single month's net income.
2. **The Liquidity Test:** Paying upfront leaves your 3-month emergency safety net intact.
3. **Debt Freedom:** You carry no revolving high-interest credit card debt.

💡 *Record your monthly income and current balance in SPENANCE to get exact live affordability calculations!*`,
      highlights: [
        'Item cost should be < 50% of monthly income',
        'Preserve 3-month emergency reserve',
        'Never take personal loans for lifestyle gadgets',
      ],
    }
  }

  // =========================================================================
  // 7. USER SPENDING / PORTFOLIO BREAKDOWN (When asking about their numbers)
  // =========================================================================
  if (/where.*spending|kharcha.*kaha|mera paisa|highest.*expense|breakdown|category/i.test(text)) {
    if (!hasData) {
      return {
        response: hinglish
          ? `Bhai abhi tak aapne SPENANCE me koi transactions ya expenses record nahi kiye hain! 
Jaise hi aap **Add Expense** button se apna pehla kharcha dalein ya **Bank Statement CSV** import karein, main aapko chart aur category-wise exact breakdown dikha dunga.`
          : `You haven't recorded any expenses or transactions in SPENANCE yet. 
Once you log your transactions or import a bank statement CSV, I will generate a real-time category breakdown showing your highest outflows!`,
        highlights: [
          'Click "+ Add Expense" to record daily spends',
          'Or use "Import Statement" to upload bank CSV',
          'Real-time spending breakdowns update instantly',
        ],
      }
    }

    const sortedCategories = [...categoryRows].sort((a, b) => (b.spent || 0) - (a.spent || 0))
    const topCategory = sortedCategories[0]
    const secondCategory = sortedCategories[1]

    return {
      response: hinglish
        ? `**Aapka Live Spending Breakdown:**
Is mahine aapka total kharcha **${formatINR(totalExpenses)}** raha hai (${transactions.length} transactions me).
- **Sabse bada kharcha:** **${topCategory?.category || 'None'}** me **${formatINR(topCategory?.spent || 0)}** खर्च hua hai.
${secondCategory ? `- **Doosra bada kharcha:** **${secondCategory.category}** me **${formatINR(secondCategory.spent)}**.` : ''}
${budgetRemaining > 0 ? `Aapke paas monthly budget me abhi **${formatINR(budgetRemaining)}** bache hue hain.` : ''}`
        : `**Your Live Spending Analysis:**
Total monthly outflow stands at **${formatINR(totalExpenses)}** across **${transactions.length} transactions**.
- **Largest expense envelope:** **${topCategory?.category || 'None'}** at **${formatINR(topCategory?.spent || 0)}**.
${secondCategory ? `- **Second largest:** **${secondCategory.category}** at **${formatINR(secondCategory.spent)}**.` : ''}
${budgetRemaining > 0 ? `You still have **${formatINR(budgetRemaining)}** remaining in your monthly budget envelopes.` : ''}`,
      highlights: [
        `Top Expense: ${topCategory?.category || 'None'} (${formatINR(topCategory?.spent || 0)})`,
        `Budget Headroom: ${formatINR(budgetRemaining)}`,
        `Total Outflow: ${formatINR(totalExpenses)}`,
      ],
    }
  }

  // =========================================================================
  // 8. LOANS & DEBT (When asking about loans/EMIs)
  // =========================================================================
  if (/loan|emi|karza|udhar|debt|prepay|avalanche/i.test(text)) {
    if (activeLoans.length === 0) {
      return {
        response: hinglish
          ? `Badiya baat ye hai ki aapke portfolio me **zero active loans** hain! Aap 100% debt-free hain. Is financial freedom ka fayda uthayein aur extra cash flow ko SIP ya index funds me invest karein.`
          : `Great news: You have **zero active loans or debts** in SPENANCE! You are completely debt-free. Channel that freedom into compounding wealth through equity index funds and SIPs.`,
        highlights: [
          'Debt-to-Income: 0% (Optimal)',
          'Zero monthly EMI liabilities',
          'Deploy surplus into compounding SIP investments',
        ],
      }
    }

    const highestRateLoan = [...activeLoans].sort((a, b) => (b.interestRate || 0) - (a.interestRate || 0))[0]
    const totalDebt = activeLoans.reduce((sum, l) => sum + (l.outstanding || 0), 0)

    return {
      response: hinglish
        ? `Aapke paas **${activeLoans.length} active loan(s)** hain, jinki total outstanding **${formatINR(totalDebt)}** aur monthly EMI **${formatINR(emiTotal)}** hai.
**Debt Avalanche Tip:** Sabse pehle **${highestRateLoan.name} (${highestRateLoan.interestRate}%)** ko prepay karein, kyunki iska interest rate sabse high hai!`
        : `You are servicing **${activeLoans.length} active loan(s)** with total outstanding of **${formatINR(totalDebt)}** and monthly EMIs of **${formatINR(emiTotal)}**.
**Avalanche Priority:** Direct any surplus prepayments to **${highestRateLoan.name} (${highestRateLoan.interestRate}%)** first to save maximum interest.`,
      highlights: [
        `Total Debt: ${formatINR(totalDebt)}`,
        `Monthly EMI Outflow: ${formatINR(emiTotal)}`,
        `Highest Rate Loan: ${highestRateLoan.name} (${highestRateLoan.interestRate}%)`,
      ],
    }
  }

  // =========================================================================
  // 9. GENERAL ADVISOR FALLBACK
  // =========================================================================
  if (hinglish) {
    return {
      response: `Main aapka personal finance advisor hoon! 
Aap mujhse kisi bhi financial topic par pooch sakte ho:
- **Affordability:** *"Bhai kya main 40k ka phone le sakta hu?"*
- **Budgeting:** *"50/30/20 rule kya hai aur paise kaise bachau?"*
- **Investing:** *"SIP me invest karu ya bank FD me?"*
- **Emergency Reserve:** *"Emergency fund kitna hona chahiye?"*
- **Debt & Loans:** *"Sabse pehle kaunsa loan chukana chahiye?"*`,
      highlights: [
        'Ask about any purchase affordability',
        'Learn budgeting, SIP, FD & compounding strategies',
        'Audit your loans, EMIs & emergency funds',
      ],
    }
  }

  return {
    response: `I am your personal financial advisor! You can ask me any question about your wealth and spending:
- **Affordability:** *"Can I afford a new gadget of ₹45,000?"*
- **Budgeting:** *"How do I implement the 50/30/20 framework?"*
- **Investing:** *"Should I choose an Equity SIP or Bank FD?"*
- **Emergency Funds:** *"How large should my emergency buffer be?"*
- **Debt Elimination:** *"What is the fastest way to pay off loans?"*`,
    highlights: [
      'Evaluate purchase affordability',
      'Optimize monthly savings and budget envelopes',
      'Compare SIP vs FD and investment strategies',
    ],
  }
}

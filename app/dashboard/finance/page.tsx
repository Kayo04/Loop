import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Wallet, Plus, ArrowUpRight, ArrowDownRight, Target, Calendar, PieChart as PieChartIcon, BarChart3 } from "lucide-react"
import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { TransactionFormWrapper } from "@/components/transaction-form-wrapper"
import { CategoryPieChart, MonthlyTrendChart, DailyActivityChart } from "@/components/finance-charts"
import { TransactionActions } from "@/components/transaction-actions"

import { MonthSelector } from "@/components/month-selector"
import { ExportButton } from "@/components/export-button"
import { LockScreen } from "@/components/lock-screen"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"
import { getUserTier } from "@/app/dashboard/actions"

type Props = {
  searchParams: Promise<{ month?: string }>
}

export default async function FinancePage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // PROTECT ROUTE (PRO ONLY)
  const tier = await getUserTier(user.id)
  if (tier === 'free') {
    return (
        <div className="relative min-h-screen">
            <LockScreen />
            <div className="filter blur-sm opacity-50 pointer-events-none select-none" aria-hidden="true">
                <DashboardSkeleton />
            </div>
        </div>
    )
  }

  // Wait for searchParams (Next.js 15+ requirement)
  const resolvedParams = await searchParams
  const monthParam = resolvedParams?.month

  // Get selected month from URL or default to current (YYYY-MM)
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonthNum = today.getMonth() + 1 // 1-12
  const defaultMonthStr = `${currentYear}-${String(currentMonthNum).padStart(2, '0')}`
  
  // Validate format YYYY-MM
  const monthRegex = /^\d{4}-\d{2}$/
  const selectedMonthParam = (monthParam && monthRegex.test(monthParam)) ? monthParam : defaultMonthStr
  
  // Parse year and month safely
  const [yearStr, monthStr] = selectedMonthParam.split('-')
  const year = parseInt(yearStr, 10)
  const month = parseInt(monthStr, 10)

  // 1. Current Month Start (YYYY-MM-01)
  const currentMonth = `${selectedMonthParam}-01`

  // 2. Next Month Start (Logic to handle Dec -> Jan)
  let nextMonthYear = year
  let nextMonthNum = month + 1
  if (nextMonthNum > 12) {
    nextMonthNum = 1
    nextMonthYear++
  }
  const nextMonth = `${nextMonthYear}-${String(nextMonthNum).padStart(2, '0')}-01`

  // 3. Last Month Start (Logic to handle Jan -> Dec previous year)
  let lastMonthYear = year
  let lastMonthNum = month - 1
  if (lastMonthNum < 1) {
    lastMonthNum = 12
    lastMonthYear--
  }
  const lastMonth = `${lastMonthYear}-${String(lastMonthNum).padStart(2, '0')}-01`
  
  // Base Date object for other Utils (formatting etc) - safe to use middle of month to avoid timezone shifts affecting month
  const now = new Date(year, month - 1, 15)

  // Fetch all transaction dates to determine available months
  const { data: allDates } = await supabase
    .from("transactions")
    .select("date")
    .eq("user_id", user.id)
    .order("date", { ascending: false })

  // Extract unique months (YYYY-MM)
  const availableMonthsSet = new Set<string>()
  // Always add current month so it's never empty
  const currentMonthISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  availableMonthsSet.add(currentMonthISO)

  if (allDates) {
    allDates.forEach(t => {
      const monthStr = t.date.substring(0, 7) // "YYYY-MM"
      availableMonthsSet.add(monthStr)
    })
  }

  // Convert to array and sort descending (newest first)
  const availableMonths = Array.from(availableMonthsSet).sort().reverse()

  // Fetch categories
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user.id)
    .order("name")

  // Fetch transactions for selected month
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", currentMonth)
    .lt("date", nextMonth) // Ensure we only get this month's data
    .order("date", { ascending: false })
    .order("id", { ascending: false })

  // Fetch last month transactions for comparison
  const { data: lastMonthTransactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", lastMonth)
    .lt("date", currentMonth)



  // Calculate current month totals
  const totalIncome = (transactions || [])
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0)

  const totalExpenses = (transactions || [])
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0)

  const balance = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0

  // Calculate last month totals for comparison
  const lastMonthIncome = (lastMonthTransactions || [])
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0)

  const lastMonthExpenses = (lastMonthTransactions || [])
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0)

  // Calculate month-over-month changes
  const incomeChange = lastMonthIncome > 0 ? ((totalIncome - lastMonthIncome) / lastMonthIncome) * 100 : 0
  const expenseChange = lastMonthExpenses > 0 ? ((totalExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 0

  // --- HISTORY & TRENDS (Last 6 Months) ---
  // 1. Calculate start date (5 months before current month)
  let historyStartYear = year
  let historyStartMonth = month - 5
  if (historyStartMonth < 1) {
    historyStartMonth += 12
    historyStartYear--
  }
  const historyStartDate = `${historyStartYear}-${String(historyStartMonth).padStart(2, '0')}-01`

  // 2. Fetch history transactions
  const { data: historyTransactions } = await supabase
    .from("transactions")
    .select("date, type, amount")
    .eq("user_id", user.id)
    .gte("date", historyStartDate)
    .lte("date", nextMonth) // Up to the end of current month
    .order("date", { ascending: true })

  // 3. Aggregate by month
  const historyMap = new Map<string, { income: number; expenses: number }>()
  
  // Initialize all 6 months with 0 to ensure continuous line
  for (let i = 0; i < 6; i++) {
    let m = historyStartMonth + i
    let y = historyStartYear
    if (m > 12) {
      m -= 12
      y++
    }
    const key = `${y}-${String(m).padStart(2, '0')}`
    historyMap.set(key, { income: 0, expenses: 0 })
  }
  // Also ensure current month is in map (if loop didn't cover it due to math drift)
  if (!historyMap.has(selectedMonthParam)) {
     historyMap.set(selectedMonthParam, { income: 0, expenses: 0 })
  }

  // Fill with data
  ;(historyTransactions || []).forEach(t => {
    const monthKey = t.date.substring(0, 7) // YYYY-MM
    if (historyMap.has(monthKey)) {
      const val = parseFloat(t.amount)
      const data = historyMap.get(monthKey)!
      if (t.type === 'income') data.income += val
      else data.expenses += val
    }
  })

  // Format for Chart
  const trendData = Array.from(historyMap.entries()).map(([key, value]) => {
     const [y, m] = key.split('-')
     const dateObj = new Date(parseInt(y), parseInt(m) - 1, 1)
     return {
       month: dateObj.toLocaleDateString('pt-PT', { month: 'short' }), // "jan", "fev"
       fullDate: key,
       income: value.income,
       expenses: value.expenses
     }
  })

  // Calculate spending by category
  const spendingByCategory: Record<string, number> = {}
  const incomeByCategory: Record<string, number> = {}
  
  ;(transactions || []).forEach(t => {
    if (t.type === "expense") {
      spendingByCategory[t.category] = (spendingByCategory[t.category] || 0) + parseFloat(t.amount)
    } else {
      incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + parseFloat(t.amount)
    }
  })

  // Prepare chart data
  const categoryChartData = Object.entries(spendingByCategory).map(([name, value], index) => ({
    name,
    value,
    color: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'][index % 8]
  }))

  // Calculate daily expenses for chart
  const dailyExpensesMap = new Map<number, number>()
  // Initialize all days
  const daysInMonthTotal = new Date(year, month, 0).getDate() // Correct days in month
  for (let i = 1; i <= daysInMonthTotal; i++) {
    dailyExpensesMap.set(i, 0)
  }
  
  (transactions || []).forEach(t => {
    if (t.type === 'expense') {
      const day = new Date(t.date).getDate()
      // Ensure we map to the correct day if dates are accurate
      dailyExpensesMap.set(day, (dailyExpensesMap.get(day) || 0) + parseFloat(t.amount))
    }
  })

  const dailyActivityData = Array.from(dailyExpensesMap.entries()).map(([day, amount]) => ({
    day,
    amount
  }))

  // Calculate KPIs
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  
  // Filter for days passed relative to the VIEWED month.
  // If viewing a past month, daysPassed = daysInMonth.
  // If viewing current month, daysPassed = today's date.
  // If viewing future month, daysPassed = 0 (or restrict logic).
  const nowRef = new Date()
  let daysPassed = daysInMonth // Default to full month if past

  if (now.getMonth() === nowRef.getMonth() && now.getFullYear() === nowRef.getFullYear()) {
      daysPassed = nowRef.getDate()
  } else if (now > nowRef) {
      daysPassed = 0 // Future month
  }

  const avgDailySpending = daysPassed > 0 ? totalExpenses / daysPassed : 0
  const biggestExpenseCategory = Object.entries(spendingByCategory).sort((a, b) => b[1] - a[1])[0]
  
  // Find single biggest expense transaction
  const biggestExpenseTransaction = (transactions || [])
    .filter(t => t.type === 'expense')
    .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))[0]
  


  const formattedDate = new Date(currentMonth).toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)

  return (
    <div className="space-y-8 pb-10 font-sans">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-6">
        <div>
          <div className="mb-2">
             <MonthSelector availableMonths={availableMonths} />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
            Dashboard Financeiro
          </h1>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <ExportButton transactions={transactions || []} />
          <TransactionFormWrapper categories={categories || []} budgets={[]} currentMonth={currentMonth} />
        </div>
      </div>

      {/* PERFORMANCE KPI TILES */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Target size={20} className="text-blue-500" />
          Indicadores de Performance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Receitas */}
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-none shadow-xl shadow-green-200 dark:shadow-none rounded-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex justify-between items-start mb-2">
                <p className="text-green-100 text-xs font-bold uppercase tracking-wider">Receitas</p>
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <ArrowUpRight size={16} className="text-white" />
                </div>
              </div>
              <h3 className="text-3xl font-black tracking-tight">€{totalIncome.toFixed(2)}</h3>
              <p className="text-green-100 text-xs mt-2 flex items-center gap-1">
                {incomeChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {Math.abs(incomeChange).toFixed(1)}% vs mês anterior
              </p>
            </CardContent>
          </Card>

          {/* Despesas */}
          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-none shadow-xl shadow-red-200 dark:shadow-none rounded-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex justify-between items-start mb-2">
                <p className="text-red-100 text-xs font-bold uppercase tracking-wider">Despesas</p>
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <ArrowDownRight size={16} className="text-white" />
                </div>
              </div>
              <h3 className="text-3xl font-black tracking-tight">€{totalExpenses.toFixed(2)}</h3>
              <p className="text-red-100/90 text-xs mt-2 flex items-center gap-1">
                {expenseChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {Math.abs(expenseChange).toFixed(1)}% vs mês anterior
              </p>

              {biggestExpenseTransaction && (
                <div className="mt-4 pt-3 border-t border-white/20 flex justify-between items-center">
                  <span className="text-red-100 text-xs font-medium opacity-80 whitespace-nowrap mr-2">Maior compra:</span>
                  <span className="font-bold text-sm tracking-wide">
                    €{parseFloat(biggestExpenseTransaction.amount).toFixed(2)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Balanço */}
          <Card className={`${balance >= 0 ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-orange-500 to-orange-600'} text-white border-none shadow-xl ${balance >= 0 ? 'shadow-blue-200' : 'shadow-orange-200'} dark:shadow-none rounded-2xl overflow-hidden relative`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex justify-between items-start mb-2">
                <p className="text-white/90 text-xs font-bold uppercase tracking-wider">Balanço</p>
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Wallet size={16} className="text-white" />
                </div>
              </div>
              <h3 className="text-3xl font-black tracking-tight">{balance >= 0 ? '+' : ''}€{balance.toFixed(2)}</h3>
              <p className="text-white/90 text-xs mt-2">Taxa poupança: {savingsRate}%</p>
            </CardContent>
          </Card>

          {/* Gasto Médio Diário */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl">
            <CardContent className="p-6 h-full flex flex-col justify-between">
              <div className="flex justify-between items-start mb-2">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Média Diária</p>
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Calendar size={16} className="text-purple-500" />
                </div>
              </div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">€{avgDailySpending.toFixed(2)}</h3>
              <p className="text-slate-400 text-xs mt-2">Dia {daysPassed} de {daysInMonth}</p>
            </CardContent>
          </Card>



          {/* Aderência ao Orçamento */}

        </div>
      </div>

      {/* HISTORY TRENDS SECTION */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-blue-500" />
          Tendência Semestral
        </h2>
        <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
            <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Evolução Receitas vs Despesas</CardTitle>
              <p className="text-sm text-slate-500 mt-1">Últimos 6 meses</p>
            </CardHeader>
            <CardContent className="p-6">
              <MonthlyTrendChart data={trendData} />
            </CardContent>
          </Card>
      </div>

      {/* CHARTS SECTION */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <BarChart3 size={20} className="text-blue-500" />
          Análise Visual
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Category Distribution */}
          <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
            <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PieChartIcon size={18} className="text-blue-500" />
                Distribuição por Categoria
              </CardTitle>
              <p className="text-sm text-slate-500 mt-1">Despesas do mês</p>
            </CardHeader>
            <CardContent className="p-6">
              <CategoryPieChart data={categoryChartData} />
            </CardContent>
          </Card>

          {/* Budget vs Actual */}
          {/* Daily Activity */}
          <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
            <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 size={18} className="text-blue-500" />
                Atividade Diária
              </CardTitle>
              <p className="text-sm text-slate-500 mt-1">Gasto por dia</p>
            </CardHeader>
            <CardContent className="p-6">
              <DailyActivityChart data={dailyActivityData} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* BREAKDOWN SECTION */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <BarChart3 size={20} className="text-blue-500" />
          Análise Detalhada
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Income Breakdown */}
          <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
            <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Receitas por Categoria</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {Object.keys(incomeByCategory).length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  Sem receitas este mês
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {Object.entries(incomeByCategory)
                    .sort((a, b) => b[1] - a[1])
                    .map(([category, amount]) => {
                      const percentage = totalIncome > 0 ? (amount / totalIncome) * 100 : 0
                      return (
                        <div key={category} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-slate-900 dark:text-white">{category}</span>
                            <span className="font-bold text-green-600">€{amount.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-green-500 transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-slate-400 w-12 text-right">{percentage.toFixed(0)}%</span>
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Expense Breakdown */}
          <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
            <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Despesas por Categoria</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {Object.keys(spendingByCategory).length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  Sem despesas este mês
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {Object.entries(spendingByCategory)
                    .sort((a, b) => b[1] - a[1])
                    .map(([category, amount]) => {
                      const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
                      
                      return (
                        <div key={category} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-slate-900 dark:text-white">{category}</span>
                            <div className="text-right">
                              <span className="font-bold text-slate-900 dark:text-white">
                                €{amount.toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-slate-400 w-12 text-right">{percentage.toFixed(0)}%</span>
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* TRANSAÇÕES RECENTES */}
      <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Transações Recentes</CardTitle>
              <p className="text-sm text-slate-500 mt-1">
                {(transactions || []).length} transações este mês
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {(transactions || []).length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-slate-400 mb-4">Ainda não tens transações este mês</p>
              <p className="text-sm text-slate-500">Clica em "Nova Transação" para começar</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {(transactions || []).slice(0, 10).map((transaction) => (
                <div key={transaction.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${transaction.type === 'income' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                        {transaction.type === 'income' ? '💰' : '💸'}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-white">
                          {transaction.description || transaction.category}
                        </p>
                        <p className="text-xs text-slate-400">
                          {transaction.category} • {new Date(transaction.date).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className={`font-bold text-right ${transaction.type === 'income' ? 'text-green-600' : 'text-slate-900 dark:text-white'}`}>
                        {transaction.type === 'income' ? '+' : '-'}€{parseFloat(transaction.amount).toFixed(2)}
                      </p>
                      <TransactionActions transaction={transaction} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      


    </div>
  )
}
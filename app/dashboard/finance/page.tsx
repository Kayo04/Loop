import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Wallet, Plus, ArrowUpRight, ArrowDownRight, Edit, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { TransactionFormWrapper } from "@/components/transaction-form-wrapper"
import { deleteTransaction } from "./actions"

export default async function FinancePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Get current month
  const now = new Date()
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

  // Fetch categories
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user.id)
    .order("name")

  // Fetch transactions for current month
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", currentMonth)
    .order("date", { ascending: false })

  // Fetch budgets for current month
  const { data: budgets } = await supabase
    .from("budgets")
    .select("*")
    .eq("user_id", user.id)
    .eq("month", currentMonth)

  // Calculate totals
  const totalIncome = (transactions || [])
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0)

  const totalExpenses = (transactions || [])
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0)

  const balance = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0

  // Calculate spending by category
  const spendingByCategory: Record<string, number> = {}
  ;(transactions || [])
    .filter(t => t.type === "expense")
    .forEach(t => {
      spendingByCategory[t.category] = (spendingByCategory[t.category] || 0) + parseFloat(t.amount)
    })

  // Merge budgets with spending
  const budgetData = (budgets || []).map(budget => {
    const spent = spendingByCategory[budget.category] || 0
    const category = (categories || []).find(c => c.name === budget.category && c.type === "expense")
    return {
      ...budget,
      spent,
      emoji: category?.emoji || "💰",
    }
  })

  const currentDate = new Date().toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })
  const capitalizedDate = currentDate.charAt(0).toUpperCase() + currentDate.slice(1)

  return (
    <div className="space-y-8 pb-10 font-sans">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-6">
        <div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1 uppercase tracking-wider flex items-center gap-2">
            <Wallet size={14} /> {capitalizedDate}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
            Minhas Finanças
          </h1>
        </div>
        <TransactionFormWrapper categories={categories || []} />
      </div>

      {/* GRID DE RESUMO */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
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
            <p className="text-green-100 text-xs mt-2">Este mês</p>
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
            <p className="text-red-100 text-xs mt-2">Este mês</p>
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
            <p className="text-white/90 text-xs mt-2">{balance >= 0 ? 'Positivo' : 'Negativo'}</p>
          </CardContent>
        </Card>

        {/* Taxa de Poupança */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl">
          <CardContent className="p-6 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Poupança</p>
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <TrendingUp size={16} className="text-purple-500" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{savingsRate}%</h3>
            <p className="text-slate-400 text-xs mt-2">Do rendimento</p>
          </CardContent>
        </Card>
      </div>

      {/* ORÇAMENTO POR CATEGORIA */}
      {budgetData.length > 0 && (
        <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Orçamento por Categoria</CardTitle>
            <p className="text-sm text-slate-500 mt-1">Acompanha os teus gastos mensais</p>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {budgetData.map((budget) => {
              const percentage = Math.min((budget.spent / parseFloat(budget.monthly_limit)) * 100, 100)
              const isNearLimit = percentage >= 80
              const isOverLimit = percentage >= 100
              
              return (
                <div key={budget.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{budget.emoji}</span>
                      <span className="font-medium text-slate-900 dark:text-white">{budget.category}</span>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold ${isOverLimit ? 'text-red-600' : isNearLimit ? 'text-orange-600' : 'text-slate-900 dark:text-white'}`}>
                        €{budget.spent.toFixed(2)}
                      </span>
                      <span className="text-slate-400 text-sm"> / €{parseFloat(budget.monthly_limit).toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${isOverLimit ? 'bg-red-500' : isNearLimit ? 'bg-orange-500' : 'bg-blue-500'}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-400">
                    {percentage.toFixed(0)}% utilizado • Restam €{(parseFloat(budget.monthly_limit) - budget.spent).toFixed(2)}
                  </p>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

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
              {(transactions || []).map((transaction) => {
                const category = (categories || []).find(c => c.name === transaction.category && c.type === transaction.type)
                return (
                  <div key={transaction.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${transaction.type === 'income' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                          {category?.emoji || "💰"}
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
                      <div className="flex items-center gap-3">
                        <p className={`font-bold text-right ${transaction.type === 'income' ? 'text-green-600' : 'text-slate-900 dark:text-white'}`}>
                          {transaction.type === 'income' ? '+' : '-'}€{parseFloat(transaction.amount).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}
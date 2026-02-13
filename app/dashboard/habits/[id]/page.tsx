import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CalendarDays, Award, Zap, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { StatsCharts } from "@/components/habit-stats-charts" 
import { LockScreen } from "@/components/lock-screen"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"
import { getUserTier } from "@/app/dashboard/actions" 

export default async function HabitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: habit } = await supabase
    .from("habits")
    .select("*, habit_logs(*)")
    .eq("id", id)
    .single()

  if (!habit) redirect("/dashboard")

  // PROTECT ROUTE (PRO ONLY)
  const supabaseAuth = await createClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (user) {
      const tier = await getUserTier(user.id)
      if (tier === 'free') {
          return (
            <div className="relative min-h-screen">
                <LockScreen />
                <div className="filter blur-sm opacity-50 pointer-events-none select-none">
                    <DashboardSkeleton />
                </div>
            </div>
          )
      }
  }

  // --- LÓGICA DE STREAK REAL ---
  const calculateStreak = (logs: any[]) => {
    const dates = logs.map(l => l.completed_at)
    const uniqueDates = [...new Set(dates)]
    const sortedDates = uniqueDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    if (!sortedDates.includes(today) && !sortedDates.includes(yesterday)) return 0

    let streak = 0
    let currentCheck = sortedDates.includes(today) ? today : yesterday

    while (sortedDates.includes(currentCheck)) {
      streak++
      const d = new Date(currentCheck)
      d.setDate(d.getDate() - 1)
      currentCheck = d.toISOString().split('T')[0]
    }
    return streak
  }

  // --- LÓGICA DE MELHOR SEQUÊNCIA (BEST STREAK) ---
  const calculateBestStreak = (logs: any[]) => {
    const dates = logs.map(l => l.completed_at)
    // Ordenar cronologicamente para iterar
    const uniqueDates = [...new Set(dates)].sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

    if (uniqueDates.length === 0) return 0

    let maxStreak = 0
    let currentStreak = 0
    let lastDate: Date | null = null

    for (const dateStr of uniqueDates) {
        const currentDate = new Date(dateStr)
        
        if (!lastDate) {
            currentStreak = 1
            maxStreak = 1
        } else {
            const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime())
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

            if (diffDays === 1) {
                currentStreak++
            } else {
                currentStreak = 1
            }
            
            if (currentStreak > maxStreak) {
                maxStreak = currentStreak
            }
        }
        lastDate = currentDate
    }

    return maxStreak
  }

  const totalCompletions = habit.habit_logs.length
  const currentStreak = calculateStreak(habit.habit_logs)
  const bestStreak = calculateBestStreak(habit.habit_logs)

  return (
    <div className="space-y-8 pb-20 font-sans max-w-5xl mx-auto">
      
      {/* TOPO */}
      <div>
        <Link href="/dashboard" className="inline-block mb-4">
            <span className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2">
                <ArrowLeft size={16} /> Voltar ao Dashboard
            </span>
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{habit.title}</h1>
                <div className="flex items-center gap-3 mt-3 text-sm text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                        <CalendarDays size={14} />
                        Criado a {new Date(habit.created_at).toLocaleDateString('pt-PT', {day: 'numeric', month: 'short', year: 'numeric'})}
                    </span>
                </div>
            </div>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         
         {/* Total */}
         <Card className="bg-blue-600 dark:bg-blue-700 text-white border-none shadow-xl shadow-blue-500/20 rounded-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-5 -mt-5 pointer-events-none group-hover:bg-white/20 transition-all"></div>
            <CardContent className="p-5 flex items-center justify-between relative z-10">
                <div>
                    <p className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">Total Feitos</p>
                    <h3 className="text-3xl font-black flex items-baseline gap-2">
                        {totalCompletions} <span className="text-base font-medium opacity-70">vezes</span>
                    </h3>
                </div>
                <div className="bg-white/20 p-3 rounded-xl">
                    <Award size={24} className="text-white" />
                </div>
            </CardContent>
         </Card>

         {/* Streak Atual */}
         <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <CardContent className="p-5 flex items-center justify-between h-full">
                <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Sequência Atual</p>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white flex items-baseline gap-2">
                        {currentStreak} <span className="text-base font-medium text-slate-400">dias</span>
                    </h3>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-xl text-orange-500">
                    <Zap size={24} fill="currentColor" />
                </div>
            </CardContent>
         </Card>

         {/* Melhor Sequência (NOVA) */}
         <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <CardContent className="p-5 flex items-center justify-between h-full">
                <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Melhor Sequência</p>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white flex items-baseline gap-2">
                        {bestStreak} <span className="text-base font-medium text-slate-400">dias</span>
                    </h3>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-xl text-green-600">
                    <TrendingUp size={24} />
                </div>
            </CardContent>
         </Card>
      </div>

      {/* GRÁFICOS */}
      <div className="pt-4">
         <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 px-1">Análise de Performance</h2>
         <StatsCharts logs={habit.habit_logs} createdAt={habit.created_at} />
      </div>

    </div>
  )
}
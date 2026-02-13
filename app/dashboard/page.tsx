import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase-server"
import { ModeToggle } from "@/components/mode-toggle"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Calendar, Flame, CheckCircle } from "lucide-react"
import { HabitHistory } from "@/components/habit-history"
import { HabitTracker } from "@/components/habit-tracker"

export default async function Dashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  
  // Buscar Hábitos
  const { data: habitsData } = await supabase
    .from("habits")
    .select(`id, title, created_at, habit_logs ( completed_at )`)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  // --- FUNÇÃO PODEROSA PARA CALCULAR STREAK ---
  const calculateStreak = (dates: string[]) => {
    // Ordenar datas (mais recente primeiro) e remover duplicados
    const uniqueDates = [...new Set(dates)]
    const sortedDates = uniqueDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    // Se não fez nem hoje nem ontem, o streak morreu (é 0)
    if (!sortedDates.includes(today) && !sortedDates.includes(yesterday)) return 0

    let streak = 0
    // Começamos a contar a partir de hoje (se feito) ou de ontem
    let currentCheck = sortedDates.includes(today) ? today : yesterday

    while (sortedDates.includes(currentCheck)) {
      streak++
      // Recuar 1 dia
      const d = new Date(currentCheck)
      d.setDate(d.getDate() - 1)
      currentCheck = d.toISOString().split('T')[0]
    }
    return streak
  }

  // --- PROCESSAR DADOS ---
  const today = new Date().toISOString().split('T')[0]
  const totalHabits = habitsData?.length || 0
  
  let completedTodayCount = 0
  
  const habits = (habitsData || []).map((habit) => {
    // Extrair histórico (com verificação de segurança)
    const history = (habit.habit_logs || []).map((log) => log.completed_at)
    
    // Verificar se completou hoje
    if (history.includes(today)) {
      completedTodayCount++
    }

    // CALCULAR STREAK REAL AQUI
    const realStreak = calculateStreak(history)

    return {
      id: habit.id,
      title: habit.title,
      streak: realStreak,
      history: history,
      createdAt: habit.created_at
    }
  })

  const dailyProgress = totalHabits === 0 ? 0 : Math.round((completedTodayCount / totalHabits) * 100)
  
  // Melhor sequência entre todos os hábitos
  const bestStreak = habits.length > 0 
    ? Math.max(0, ...habits.map((h) => h.streak)) 
    : 0

  const firstName = profile?.full_name?.split(' ')[0] || "Visitante"
  const currentDate = new Date().toLocaleDateString('pt-PT', { day: 'numeric', month: 'long' })


  // --- DATAS DO HABIT TRACKER (Server-Side para evitar Hydration Error) ---
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  
  // Mês e dias totais
  const monthName = now.toLocaleString('pt-PT', { month: 'long' })
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Últimos 7 dias
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    return d
  }).reverse()

  const weekDays = last7Days.map(date => ({
      label: date.toLocaleDateString('pt-PT', { weekday: 'narrow' }),
      dateIso: date.toISOString().split('T')[0],
      dayUser: date.getDate(),
      isToday: date.toISOString().split('T')[0] === now.toISOString().split('T')[0]
  }))

  return (
    <div className="space-y-8 pb-10 font-sans">
      
      {/* CABEÇALHO */}
      <div className="flex flex-row justify-between items-end border-b border-slate-100 dark:border-slate-800 pb-6">
        <div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1 uppercase tracking-wider flex items-center gap-2">
            <Calendar size={14} /> {currentDate}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
            Bom dia, {firstName}
          </h1>
        </div>
        <div className="md:hidden"><ModeToggle /></div>
      </div>

      {/* GRID DE RESUMO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Pontuação */}
          <Card className="col-span-1 md:col-span-1 bg-blue-600 text-white border-none shadow-xl shadow-blue-200 dark:shadow-none rounded-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
            <CardContent className="p-6 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-blue-100 text-xs font-bold uppercase tracking-wider">Pontuação</p>
                        <h3 className="text-4xl font-black mt-1 tracking-tight">{dailyProgress}%</h3>
                    </div>
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <TrendingUp size={20} className="text-white" />
                    </div>
                </div>
                <div className="mt-4">
                    <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white transition-all duration-1000" style={{ width: `${dailyProgress}%` }}></div>
                    </div>
                </div>
            </CardContent>
          </Card>

          {/* Streak */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl">
            <CardContent className="p-6 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Melhor Sequência</p>
                        <h3 className="text-4xl font-bold text-slate-900 dark:text-white mt-1 tracking-tight">{bestStreak}</h3>
                    </div>
                    <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <Flame size={20} className="text-orange-500" />
                    </div>
                </div>
                <p className="text-slate-400 text-xs mt-2">Dias sem falhar.</p>
            </CardContent>
          </Card>

          {/* Concluídos Hoje */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl">
            <CardContent className="p-6 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Concluídos Hoje</p>
                        <h3 className="text-4xl font-bold text-slate-900 dark:text-white mt-1 tracking-tight">
                            {completedTodayCount}<span className="text-xl text-slate-400 font-medium">/{totalHabits}</span>
                        </h3>
                    </div>
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                        <CheckCircle size={20} className="text-emerald-500" />
                    </div>
                </div>
                <p className="text-slate-400 text-xs mt-2">Objetivos alcançados.</p>
            </CardContent>
          </Card>
      </div>

      {/* SECÇÃO DO GRÁFICO DE PROGRESSO */}
      <HabitHistory habits={habits} />

      {/* LISTA DE HÁBITOS */}
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">A Tua Lista</h2>
      <HabitTracker 
        habits={habits} 
        weekDays={weekDays} 
        monthName={monthName} 
        daysInMonth={daysInMonth} 
      />
    </div>
  )
}
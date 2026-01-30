"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

export function StatsCharts({ logs, createdAt }: { logs: any[], createdAt: string }) {
  
  // --- 1. CONFIGURAÇÃO DO HEATMAP (GRID COMPLETO) ---
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const currentYear = today.getFullYear()
  
  const startDate = new Date(currentYear, 0, 1)
  const startDayOfWeek = startDate.getDay() 
  startDate.setDate(startDate.getDate() - startDayOfWeek)

  const calendarGrid = []
  for (let i = 0; i < 371; i++) {
    const d = new Date(startDate)
    d.setDate(d.getDate() + i)
    calendarGrid.push(d)
  }

  const logsSet = new Set(logs.map(l => l.completed_at)) 

  // --- 2. DADOS BARRAS ---
  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const dataByDay = daysOfWeek.map(day => ({ name: day, total: 0 }))
  logs.forEach(log => {
      const dayIndex = new Date(log.completed_at).getDay()
      dataByDay[dayIndex].total += 1
  })

  // --- 3. DADOS CIRCULAR (Cálculo Correto) ---
  const creationDate = new Date(createdAt)
  creationDate.setHours(0,0,0,0)
  
  // Dias totais desde que o hábito foi criado
  const diffTime = Math.abs(today.getTime() - creationDate.getTime());
  const totalDaysSinceStart = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1); 

  // Contagem de feitos (limitada ao número de dias possíveis para evitar bugs visuais)
  const totalCompleted = logs.length
  const displayCompleted = Math.min(totalCompleted, totalDaysSinceStart)
  const displayMissed = totalDaysSinceStart - displayCompleted
  
  const pieData = [
    { name: 'Feito', value: displayCompleted },
    { name: 'Falhou', value: displayMissed },
  ]
  
  // Cores: Azul Vibrante vs Cinzento Suave
  const PIE_COLORS = ['#2563eb', '#e2e8f0'] 

  return (
    <div className="space-y-6">

        {/* --- HEATMAP ANUAL (Mantém-se igual, estava perfeito) --- */}
        <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
            <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-1">Mapa Anual</CardTitle>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">Consistência em {currentYear}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                         <div className="flex items-center gap-1"><div className="w-3 h-3 bg-slate-100 dark:bg-slate-800 rounded-[2px]"></div> Futuro</div>
                         <div className="flex items-center gap-1"><div className="w-3 h-3 bg-slate-300 dark:bg-slate-600 rounded-[2px]"></div> Falhou</div>
                         <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-600 rounded-[2px]"></div> Feito</div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex justify-center w-full">
                    <div className="grid grid-rows-7 grid-flow-col gap-[3px]">
                        {calendarGrid.map((date, i) => {
                            const dateStr = date.toISOString().split('T')[0]
                            const dateObj = new Date(date)
                            dateObj.setHours(0,0,0,0)

                            const isCurrentYear = date.getFullYear() === currentYear
                            const isCompleted = logsSet.has(dateStr)
                            const isToday = dateObj.getTime() === today.getTime()
                            const isPast = dateObj < today

                            let colorClass = "bg-slate-100 dark:bg-slate-800" 
                            let statusText = "Futuro"

                            if (!isCurrentYear) colorClass = "opacity-0 pointer-events-none" 
                            else if (isCompleted) { colorClass = "bg-blue-600 shadow-sm"; statusText = "Concluído" } 
                            else if (isToday) { colorClass = "bg-white dark:bg-slate-900 border-2 border-blue-500 border-dashed"; statusText = "Hoje" } 
                            else if (isPast) { colorClass = "bg-slate-300 dark:bg-slate-600"; statusText = "Falhou" }

                            return (
                                <div 
                                    key={`${dateStr}-${i}`}
                                    title={isCurrentYear ? `${dateStr}: ${statusText}` : ""}
                                    className={`w-3 h-3 md:w-3.5 md:h-3.5 rounded-[2px] transition-all hover:scale-125 ${colorClass}`}
                                />
                            )
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>


        {/* --- GRÁFICOS SECUNDÁRIOS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* GRÁFICO 1: Barras (Corrigido Hover) */}
            <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-1">Frequência Semanal</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dataByDay}>
                                <defs>
                                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                                        <stop offset="100%" stopColor="#2563eb" stopOpacity={0.8}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} dy={10} />
                                {/* CORREÇÃO: cursor={{fill: 'transparent'}} remove o fundo cinzento feio */}
                                <Tooltip 
                                    cursor={{fill: 'transparent'}} 
                                    contentStyle={{borderRadius: '12px', border:'none', backgroundColor: '#1e293b', color: '#fff'}} 
                                />
                                <Bar dataKey="total" fill="url(#barGradient)" radius={[6, 6, 6, 6]} barSize={28} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* GRÁFICO 2: Circular (Preenchido e com Rácio) */}
            <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-1">Taxa de Sucesso</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[180px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={pieData} 
                                    cx="50%" 
                                    cy="50%" 
                                    innerRadius={0} // 0 = Círculo Cheio (Tarte)
                                    outerRadius={80} 
                                    dataKey="value" 
                                    stroke="none" 
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{borderRadius: '12px', border:'none', backgroundColor: '#1e293b', color: '#fff'}} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    
                    {/* Texto em baixo: "X / Y dias" */}
                    <div className="text-center mt-[-10px]">
                        <p className="text-2xl font-black text-slate-900 dark:text-white">
                            {displayCompleted} <span className="text-lg text-slate-400 font-medium">/ {totalDaysSinceStart}</span>
                        </p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Dias Concluídos</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  )
}
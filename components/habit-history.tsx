"use client"

import { useState, useMemo } from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Calendar, TrendingUp } from "lucide-react"

type HabitData = {
  id: string
  title: string
  history: string[] // strings de datas ISO
  createdAt: string
}

export function HabitHistory({ habits }: { habits: HabitData[] }) {
  const [selectedDate, setSelectedDate] = useState(new Date())

  // Helpers para navegação de meses
  const nextMonth = () => {
    const d = new Date(selectedDate)
    d.setMonth(d.getMonth() + 1)
    if (d <= new Date()) setSelectedDate(d)
  }

  const prevMonth = () => {
    const d = new Date(selectedDate)
    d.setMonth(d.getMonth() - 1)
    setSelectedDate(d)
  }

  const isCurrentMonth = () => {
    const today = new Date()
    return selectedDate.getMonth() === today.getMonth() && selectedDate.getFullYear() === today.getFullYear()
  }

  // CALCULAR DADOS DIÁRIOS (Para o mês selecionado)
  const dailyData = useMemo(() => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    // Total de hábitos ativos (simplificado: não verifica data de criação para não complicar visualização retroativa)
    // Se quiséssemos ser precisos, filtraríamos habits.filter(h => new Date(h.createdAt) <= date)
    const totalHabits = habits.length
    if (totalHabits === 0) return []

    const data = []
    
    for (let day = 1; day <= daysInMonth; day++) {
      // Data atual do loop
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const isFuture = new Date(dateStr) > new Date()

      if (isFuture) {
        data.push({
            day: day,
            score: 0,
            completions: 0,
            isFuture: true
        })
        continue
      }

      // Contar completados neste dia
      let completions = 0
      habits.forEach(habit => {
        if (habit.history.includes(dateStr)) {
          completions++
        }
      })

      const score = Math.round((completions / totalHabits) * 100)
      
      data.push({
        day: day,
        score: score,
        completions: completions,
        total: totalHabits,
        date: dateStr,
        isFuture: false
      })
    }
    return data
  }, [selectedDate, habits])

  // CALCULAR DADOS MENSAIS (Visão Geral - Últimos 6 meses)
  const monthlyData = useMemo(() => {
    const data = []
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
    
    // Últimos 6 meses
    for (let i = 5; i >= 0; i--) {
        const d = new Date()
        d.setMonth(d.getMonth() - i)
        const year = d.getFullYear()
        const month = d.getMonth()
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        
        let totalCompletions = 0
        // Ajuste para não contar dias futuros no score possível
        let possibleDays = daysInMonth
        if (i === 0) { // Mês atual
            possibleDays = new Date().getDate()
        }
        
        const totalPossible = habits.length * possibleDays
        
        habits.forEach(habit => {
             habit.history.forEach(hDate => {
                 const hd = new Date(hDate)
                 if (hd.getMonth() === month && hd.getFullYear() === year) {
                     totalCompletions++
                 }
             })
        })

        const score = totalPossible > 0 ? Math.round((totalCompletions / totalPossible) * 100) : 0

        data.push({
            name: monthNames[month],
            fullName: `${monthNames[month]} ${year}`,
            score: Math.min(100, score),
            year,
            month,
            active: month === selectedDate.getMonth() && year === selectedDate.getFullYear()
        })
    }
    return data
  }, [habits, selectedDate])

  return (
    <div className="space-y-6">
        {/* GRÁFICO MENSAL (Selector) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <TrendingUp size={18} className="text-blue-500" />
                        Histórico Mensal
                    </h2>
                    <p className="text-sm text-slate-500">Clica numa barra para ver os detalhes desse mês.</p>
                </div>
            </div>

            <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                         <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} vertical={false} />
                        <XAxis 
                            dataKey="name" 
                            stroke="#94a3b8" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false}
                        />
                        <Tooltip 
                            cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-white dark:bg-slate-800 p-2 border border-slate-100 dark:border-slate-700 shadow-lg rounded-lg text-xs">
                                            <p className="font-bold">{payload[0].payload.fullName}</p>
                                            <p>Score: <span className="text-blue-500 font-bold">{payload[0].value}%</span></p>
                                            <p className="text-slate-400 mt-1">Clique para ver dias</p>
                                        </div>
                                    )
                                }
                                return null
                            }}
                        />
                        <Bar dataKey="score" radius={[4, 4, 0, 0]} onClick={(data: any) => {
                            const newDate = new Date()
                            newDate.setFullYear(data.year)
                            newDate.setMonth(data.month)
                            setSelectedDate(newDate)
                        }}>
                             {monthlyData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.active ? '#3b82f6' : '#cbd5e1'} className="transition-all duration-300 hover:opacity-80 cursor-pointer" />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* GRÁFICO DIÁRIO (Detalhe) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Calendar size={18} className="text-indigo-500" />
                        Detalhes de {selectedDate.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}
                    </h2>
                    <p className="text-sm text-slate-500">Performance diária no mês selecionado.</p>
                </div>
                
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8">
                        <ArrowLeft size={14} />
                    </Button>
                    <span className="text-sm font-bold min-w-[100px] text-center capitalize">
                       {selectedDate.toLocaleDateString('pt-PT', { month: 'short' })}
                    </span>
                    <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={nextMonth} 
                        disabled={isCurrentMonth()}
                        className="h-8 w-8 disabled:opacity-30"
                    >
                        <ArrowRight size={14} />
                    </Button>
                </div>
            </div>

            <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyData} barGap={2}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} vertical={false} />
                        <XAxis 
                            dataKey="day" 
                            stroke="#94a3b8" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false}
                            interval={2} // Mostrar a cada 2 dias para não sobrecarregar
                        />
                        <YAxis hide domain={[0, 100]} />
                        <Tooltip 
                            cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload
                                    if (data.isFuture) return null 
                                    
                                    return (
                                        <div className="bg-white dark:bg-slate-800 p-3 border border-slate-100 dark:border-slate-700 shadow-lg rounded-lg text-sm">
                                            <p className="font-bold mb-1">Dia {data.day}</p>
                                            <p className="text-slate-600 dark:text-slate-300">
                                                Completados: <span className="font-bold text-slate-900 dark:text-white">{data.completions}/{data.total}</span>
                                            </p>
                                            <p className="text-indigo-500 font-bold text-lg mt-1">{data.score}%</p>
                                        </div>
                                    )
                                }
                                return null
                            }}
                        />
                        <Bar dataKey="score" radius={[2, 2, 0, 0]}>
                            {dailyData.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={entry.isFuture ? 'transparent' : (entry.score === 100 ? '#22c55e' : entry.score >= 50 ? '#6366f1' : '#f43f5e')} 
                                    opacity={entry.isFuture ? 0 : 1}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
  )
}

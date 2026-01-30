"use client"

import { useState } from "react"
import Link from "next/link"
import { createHabit, toggleHabit, deleteHabit } from "@/app/dashboard/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle2, Circle, Trash2, Plus, Flame, CalendarDays, MoreHorizontal } from "lucide-react"

type HabitWithHistory = {
  id: string
  title: string
  streak: number
  history: string[]
}

export function HabitTracker({ habits }: { habits: HabitWithHistory[] }) {
  const [isAdding, setIsAdding] = useState(false)
  
  // --- LÓGICA DO CALENDÁRIO ---
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const monthName = now.toLocaleString('pt-PT', { month: 'long' })
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const currentDay = now.getDate()
  const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

  return (
    <div className="space-y-6">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mt-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Os teus Hábitos</h2>
            <Button onClick={() => setIsAdding(!isAdding)} size="sm" className="bg-slate-900 dark:bg-white dark:text-slate-900 rounded-xl px-4 font-bold shadow-sm transition-transform active:scale-95">
                {isAdding ? "Cancelar" : <><Plus className="w-4 h-4 mr-2" /> Novo</>}
            </Button>
        </div>

        {/* Formulário de Adicionar */}
        {isAdding && (
            <form action={async (formData) => { await createHabit(formData); setIsAdding(false); }} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex gap-2 animate-in fade-in slide-in-from-top-2 mb-6">
              <Input name="title" placeholder="Escreve o novo hábito..." autoFocus required className="flex-1 bg-white dark:bg-slate-800 dark:text-white border-0 shadow-sm rounded-xl h-12 text-lg px-4" />
              <Button type="submit" size="lg" className="h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-6">Guardar</Button>
            </form>
        )}

        {/* --- GRID DE HÁBITOS (Lado a Lado) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          
          {habits.map((habit) => {
             const todayISO = new Date().toISOString().split('T')[0]
             const isDoneToday = habit.history.includes(todayISO)
             
             return (
                <div key={habit.id} className="relative group bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:translate-y-[-2px] hover:border-blue-200 dark:hover:border-slate-700 transition-all duration-300 flex flex-col justify-between">
                   
                   {/* 1. TOPO: Título e Botões */}
                   <div className="flex justify-between items-start mb-4">
                      {/* Título e Streak */}
                      <Link href={`/dashboard/habits/${habit.id}`} className="flex-1 pr-2">
                         <h4 className={`font-bold text-lg leading-tight line-clamp-2 ${isDoneToday ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-900 dark:text-white'}`}>
                            {habit.title}
                         </h4>
                         <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mt-1.5">
                            <Flame size={12} className={habit.streak > 0 ? "text-orange-500 fill-orange-500" : "text-slate-300"} />
                            {habit.streak} dias seguidos
                         </div>
                      </Link>

                      {/* Botão de Check */}
                      <button 
                        onClick={(e) => {
                            e.stopPropagation()
                            toggleHabit(habit.id)
                        }} 
                        className="active:scale-90 transition-transform focus:outline-none flex-shrink-0 ml-2"
                      >
                         {isDoneToday ? (
                            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-green-500/30">
                               <CheckCircle2 size={20} strokeWidth={3} />
                            </div>
                         ) : (
                            <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-300 hover:border-blue-400 hover:text-blue-500 transition-all">
                               <Circle size={20} strokeWidth={2} />
                            </div>
                         )}
                      </button>
                   </div>

                   {/* 2. CALENDÁRIO COMPACTO */}
                   <Link href={`/dashboard/habits/${habit.id}`} className="block mt-auto">
                       <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex justify-between items-center mb-2">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{capitalizedMonth}</p>
                             {/* Botão de Apagar (Escondido, aparece no hover) */}
                             <button onClick={(e) => { e.preventDefault(); deleteHabit(habit.id); }} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 size={14} />
                             </button>
                          </div>
                          
                          <div className="grid grid-cols-7 gap-1">
                             {/* Dias da Semana */}
                             {weekDays.map((d, i) => (
                                <div key={i} className="text-center text-[9px] font-bold text-slate-300 dark:text-slate-600 mb-0.5">{d}</div>
                             ))}

                             {/* Espaços Vazios */}
                             {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}

                             {/* Dias */}
                             {daysArray.map(day => {
                                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                                const isCompleted = habit.history.includes(dateStr)
                                const isToday = day === currentDay
                                const isFuture = day > currentDay

                                let cellClass = "bg-slate-50 dark:bg-slate-800 text-slate-300"
                                if (isCompleted) cellClass = "bg-green-500 text-white shadow-sm"
                                else if (isToday) cellClass = "bg-white dark:bg-slate-900 text-blue-500 border border-dashed border-blue-400"
                                else if (isFuture) cellClass = "opacity-30"

                                return (
                                   <div 
                                      key={day} 
                                      className={`aspect-square rounded-[4px] flex items-center justify-center text-[9px] font-bold transition-all ${cellClass}`}
                                   >
                                      {day}
                                   </div>
                                )
                             })}
                          </div>
                       </div>
                   </Link>
                </div>
             )
          })}
          
          {/* Cartão de "Adicionar Novo" no final do grid */}
          <button onClick={() => setIsAdding(true)} className="min-h-[200px] rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all flex flex-col items-center justify-center group">
             <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-white flex items-center justify-center transition-colors mb-3">
                <Plus size={24} />
             </div>
             <span className="text-sm font-bold text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">Criar Hábito</span>
          </button>

        </div>
    </div>
  )
}
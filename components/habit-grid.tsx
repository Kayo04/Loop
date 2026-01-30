"use client"

import Link from "next/link"
import { toggleHabit } from "@/app/dashboard/actions"
import { CheckCircle2, Circle, Flame, ArrowUpRight } from "lucide-react"

type Habit = {
  id: string
  title: string
  streak: number
  history: string[] // Lista de datas YYYY-MM-DD
}

export function HabitGrid({ habits }: { habits: Habit[] }) {
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {habits.map((habit) => {
        const isDoneToday = habit.history.includes(today)

        return (
          <div key={habit.id} className="relative group bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-40">
            
            {/* Topo do Cartão */}
            <div className="flex justify-between items-start">
              <div className={`p-2 rounded-xl transition-colors ${isDoneToday ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                <Flame size={20} className={habit.streak > 0 ? "text-orange-500 fill-orange-500" : ""} />
              </div>
              
              {/* Link para a página de detalhes */}
              <Link href={`/dashboard/habits/${habit.id}`} className="opacity-0 group-hover:opacity-100 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all">
                <ArrowUpRight size={18} className="text-slate-500" />
              </Link>
            </div>

            {/* Título */}
            <div className="mt-2">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight line-clamp-2">
                    {habit.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">{habit.streak} dias seguidos</p>
            </div>

            {/* Botão de Check Gigante (Área clicável) */}
            <button 
                onClick={(e) => {
                    e.preventDefault() // Para não abrir o link ao clicar no check
                    toggleHabit(habit.id)
                }}
                className="absolute bottom-4 right-4 active:scale-90 transition-transform"
            >
                {isDoneToday ? (
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-500/30">
                        <CheckCircle2 size={24} strokeWidth={3} />
                    </div>
                ) : (
                    <div className="w-10 h-10 border-2 border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center text-slate-300 hover:border-blue-500 hover:text-blue-500 transition-colors bg-white dark:bg-slate-900">
                        <Circle size={24} />
                    </div>
                )}
            </button>

          </div>
        )
      })}

      {/* Cartão de Adicionar Novo (Fake, só visual) */}
      <Link href="/dashboard/habits" className="flex flex-col items-center justify-center h-40 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all cursor-pointer group">
         <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
            <span className="text-2xl text-slate-400 group-hover:text-blue-500 pb-1">+</span>
         </div>
         <p className="text-sm font-bold text-slate-400 group-hover:text-blue-500 mt-3">Novo Hábito</p>
      </Link>
    </div>
  )
}
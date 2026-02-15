"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { createHabit, toggleHabit, deleteHabit } from "@/app/dashboard/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle2, Circle, Trash2, Plus, Flame, MoreHorizontal, Calendar, Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type HabitWithHistory = {
  id: string
  title: string
  streak: number
  history: string[]
}

type WeekDate = {
    label: string
    dateIso: string
    dayUser: number
    isToday: boolean
}

type HabitTrackerProps = {
    habits: HabitWithHistory[]
    weekDays: WeekDate[]
    monthName: string
    daysInMonth: number
}

export function HabitTracker({ habits, weekDays, monthName, daysInMonth }: HabitTrackerProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [isPending, startTransition] = useTransition()
  
  // As datas agora vêm do servidor (page.tsx) para evitar erros de hidratação (Hydration Failure)
  const headers = weekDays

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
            <form action={(formData) => {
                startTransition(async () => {
                    await createHabit(formData);
                    setIsAdding(false);
                });
            }} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex gap-2 animate-in fade-in slide-in-from-top-2 mb-6">
              <Input name="title" placeholder="Escreve o novo hábito..." autoFocus required className="flex-1 bg-white dark:bg-slate-800 dark:text-white border-0 shadow-sm rounded-xl h-12 text-lg px-4" />
              <Button type="submit" size="lg" disabled={isPending} className="h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 min-w-[100px]">
                  {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Guardar"}
              </Button>
            </form>
        )}

        {/* --- TABELA TIPO EXCEL (Layout Profissional) --- */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-950">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[300px] pl-6 font-bold text-slate-500 uppercase text-xs tracking-wider">Hábito</TableHead>
                            {/* Cabeçalhos dos Dias */}
                            {headers.map((h, i) => (
                                <TableHead key={i} className={`text-center p-0 w-10 h-14 ${h.isToday ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}`}>
                                    <div className="flex flex-col items-center justify-center h-full">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">{h.label}</span>
                                        <span className={`text-xs font-bold mt-0.5 w-6 h-6 flex items-center justify-center rounded-full ${h.isToday ? "bg-blue-600 text-white" : "text-slate-600 dark:text-slate-300"}`}>
                                            {h.dayUser}
                                        </span>
                                    </div>
                                </TableHead>
                            ))}
                            <TableHead className="w-[200px] text-center font-bold text-slate-500 uppercase text-xs tracking-wider">Progresso Mensal</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {habits.map((habit, index) => {
                             // Calcular progresso do mês atual
                             const currentMonthStr = new Date().toISOString().slice(0, 7)
                             const completionsMonth = habit.history.filter(d => d.startsWith(currentMonthStr)).length
                             const progress = Math.round((completionsMonth / daysInMonth) * 100)
                             
                             return (
                                <TableRow key={habit.id} className="group transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                    {/* Título + Streak */}
                                    <TableCell className="pl-6 py-4 font-medium">
                                        <Link href={`/dashboard/habits/${habit.id}`} className="block hover:opacity-80 transition-opacity">
                                            <div className="flex flex-col">
                                                <span className="text-slate-900 dark:text-white font-bold text-base truncate max-w-[200px] sm:max-w-none">{habit.title}</span>
                                                <div className="flex items-center gap-1 mt-1">
                                                     <Flame size={12} className={habit.streak > 0 ? "text-orange-500 fill-orange-500" : "text-slate-300"} />
                                                     <span className={`text-xs ${habit.streak > 0 ? "text-orange-600 dark:text-orange-400 font-bold" : "text-slate-400"}`}>
                                                        {habit.streak} dias
                                                     </span>
                                                </div>
                                            </div>
                                        </Link>
                                    </TableCell>
                                    
                                    {/* Grid de Checkboxes (7 dias) */}
                                    {headers.map((h, i) => {
                                        const isCompleted = habit.history.includes(h.dateIso)
                                        return (
                                            <TableCell key={i} className={`p-0 text-center ${h.isToday ? "bg-blue-50/30 dark:bg-blue-900/5" : ""}`}>
                                                <div className="flex items-center justify-center h-full">
                                                    <button 
                                                        onClick={() => toggleHabit(habit.id, h.dateIso)}
                                                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                                                            isCompleted 
                                                                ? "bg-green-500 text-white shadow-sm scale-100" 
                                                                : "bg-slate-100 dark:bg-slate-800 text-slate-300 hover:border-blue-400 hover:text-blue-400 border border-transparent scale-90 hover:scale-100"
                                                        }`}
                                                    >
                                                        {isCompleted ? <CheckCircle2 size={16} strokeWidth={3} /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />}
                                                    </button>
                                                </div>
                                            </TableCell>
                                        )
                                    })}

                                    {/* Progresso Mensal */}
                                    <TableCell className="px-4">
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between text-xs font-medium">
                                                <span className="text-slate-500">{completionsMonth}/{daysInMonth}</span>
                                                <span className="text-blue-600 dark:text-blue-400">{progress}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* Ações */}
                                    <TableCell className="pr-6 text-right">
                                        <button onClick={() => deleteHabit(habit.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                            <Trash2 size={16} />
                                        </button>
                                    </TableCell>
                                </TableRow>
                             )
                        })}
                    </TableBody>
                </Table>
                
                {habits.length === 0 && (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <Calendar size={32} />
                        </div>
                        <h3 className="text-slate-900 dark:text-white font-bold text-lg">Sem hábitos ainda</h3>
                        <p className="text-slate-500 mb-6 max-w-xs mx-auto text-sm">Cria o teu primeiro hábito para começares a ver a magia acontecer.</p>
                        <Button onClick={() => setIsAdding(true)} variant="outline">Criar Primeiro Hábito</Button>
                    </div>
                )}
            </div>
        </div>
    </div>
  )
}
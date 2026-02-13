"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

interface MonthSelectorProps {
    availableMonths?: string[]
}

export function MonthSelector({ availableMonths = [] }: MonthSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const monthParam = searchParams.get("month")

  // Determinar o valor atual (ou o mês atual se não houver parametro)
  const today = new Date()
  const currentMonthISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  const selectedValue = monthParam || currentMonthISO

  const handleValueChange = (value: string) => {
     // Se for o mês atual, limpar o parametro para URL mais limpo, ou manter explicito?
     // Manter explicito é mais facil para lógica de "voltar".
     // Mas o utilizador pode querer limpar. Vamos forçar o URL com ?month=YYYY-MM sempre que muda.
     
     if (value === currentMonthISO) {
         router.push("/dashboard/finance") // Limpa o URL para o mês atual
     } else {
         router.push(`/dashboard/finance?month=${value}`)
     }
  }

  // Função auxiliar para formatar "2026-02" -> "Fevereiro 2026"
  const formatMonthLabel = (isoDate: string) => {
      const [year, month] = isoDate.split('-')
      const date = new Date(parseInt(year), parseInt(month) - 1, 1)
      const label = date.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })
      return label.charAt(0).toUpperCase() + label.slice(1)
  }

  // Se não houver meses disponíveis (primeira utilização), mostra pelo menos o atual
  const options = availableMonths.length > 0 ? availableMonths : [currentMonthISO]

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedValue} onValueChange={handleValueChange}>
        <SelectTrigger className="w-auto min-w-[180px] bg-transparent border-0 shadow-none hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl h-10 font-bold text-2xl md:text-3xl text-slate-800 dark:text-white px-3 -ml-3 focus:ring-0">
          <div className="flex items-center gap-2">
            <SelectValue placeholder="Selecionar Mês" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {options.map((monthStr) => (
            <SelectItem key={monthStr} value={monthStr} className="font-medium cursor-pointer">
              {formatMonthLabel(monthStr)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

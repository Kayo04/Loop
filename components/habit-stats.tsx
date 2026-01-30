"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

type StatData = {
  day: string
  completed: number
}

// Dados falsos para preencher o gráfico enquanto não tens histórico suficiente
const mockData = [
  { day: "Seg", completed: 2 },
  { day: "Ter", completed: 4 },
  { day: "Qua", completed: 3 },
  { day: "Qui", completed: 5 },
  { day: "Sex", completed: 4 },
  { day: "Sáb", completed: 1 },
  { day: "Dom", completed: 0 },
]

export function HabitStats({ history }: { history?: any }) {
  // Nota: Futuramente podemos ligar o 'history' real aqui.
  // Por agora usamos dados de exemplo para veres o visual bonito.

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>Performance Semanal</CardTitle>
        <p className="text-sm text-slate-500">Hábitos completados nos últimos 7 dias</p>
      </CardHeader>
      <CardContent className="pl-0">
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockData}>
              <XAxis 
                dataKey="day" 
                stroke="#888888" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip 
                cursor={{fill: 'transparent'}}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Bar 
                dataKey="completed" 
                fill="currentColor" 
                radius={[4, 4, 0, 0]} 
                className="fill-slate-900 dark:fill-slate-100" 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
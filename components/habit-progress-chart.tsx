"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

type MonthlyProgress = {
  month: string
  score: number // 0-100
  completions: number
}

export function HabitProgressChart({ data }: { data: MonthlyProgress[] }) {
  if (data.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">
        Ainda não há dados suficientes para mostrar o progresso histórico.
      </div>
    )
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-slate-900 dark:text-white mb-1 capitalize">{data.month}</p>
          <div className="space-y-1">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Pontuação Média: <span className="font-bold text-blue-600 dark:text-blue-400">{data.score}%</span>
            </p>
            <p className="text-xs text-slate-500">
              {data.completions} hábitos completados
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} vertical={false} />
        <XAxis 
          dataKey="month" 
          stroke="#94a3b8" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false}
        />
        <YAxis 
          stroke="#94a3b8" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
        <Bar 
          dataKey="score" 
          fill="#3b82f6" 
          radius={[4, 4, 0, 0]} 
          name="Pontuação"
          maxBarSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

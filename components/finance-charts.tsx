"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, AreaChart, Area } from 'recharts'

type CategoryData = {
  name: string
  value: number
  color: string
}

type MonthlyData = {
  month: string
  income: number
  expenses: number
}

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6']

export function CategoryPieChart({ data }: { data: CategoryData[] }) {
  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-slate-400">
        Sem dados para mostrar
      </div>
    )
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-slate-900 dark:text-white mb-1">{data.name}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            <span className="font-bold text-slate-900 dark:text-white">€{data.value.toFixed(2)}</span>
            {data.percent && ` (${(data.percent * 100).toFixed(1)}%)`}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
          outerRadius={90}
          fill="#8884d8"
          dataKey="value"
          stroke="#1e293b"
          strokeWidth={2}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          wrapperStyle={{ paddingTop: '10px' }}
          iconType="circle"
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function BudgetComparisonChart({ data }: { data: { category: string; actual: number; budget: number }[] }) {
  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-slate-400">
        Sem orçamentos definidos
      </div>
    )
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-slate-900 dark:text-white mb-2">{data.category}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Gasto Real:</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">€{data.actual.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Orçamento:</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">€{data.budget.toFixed(2)}</span>
            </div>
          </div>
          {data.actual > data.budget && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-2 font-medium">
              ⚠️ Acima do orçamento!
            </p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} barGap={8}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
        <XAxis 
          dataKey="category" 
          stroke="#64748B" 
          tick={{ fill: '#64748B', fontSize: 12 }}
          tickLine={{ stroke: '#64748B' }}
        />
        <YAxis 
          stroke="#64748B"
          tick={{ fill: '#64748B', fontSize: 12 }}
          tickLine={{ stroke: '#64748B' }}
          tickFormatter={(value) => `€${value}`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} />
        <Legend 
          wrapperStyle={{ paddingTop: '20px' }}
          iconType="circle"
        />
        <Bar 
          dataKey="actual" 
          fill="#3B82F6" 
          name="Gasto Real" 
          radius={[8, 8, 0, 0]}
          maxBarSize={60}
        />
        <Bar 
          dataKey="budget" 
          fill="#10B981" 
          name="Orçamento" 
          radius={[8, 8, 0, 0]}
          maxBarSize={60}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function MonthlyTrendChart({ data }: { data: MonthlyData[] }) {
  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-slate-400">
        Sem dados históricos
      </div>
    )
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-4">
          <p className="font-bold text-slate-900 dark:text-white mb-2">{label}</p>
          <div className="space-y-2">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center gap-3 min-w-[150px]">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-slate-500 dark:text-slate-400 flex-1">
                  {entry.name}:
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  €{entry.value.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
        <XAxis 
          dataKey="month" 
          stroke="#94A3B8" 
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12 }}
          dy={10}
        />
        <YAxis 
          stroke="#94A3B8" 
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `€${value}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          iconType="circle"
          wrapperStyle={{ paddingTop: '20px' }}
        />
        <Area 
          type="monotone" 
          dataKey="income" 
          stroke="#10B981" 
          strokeWidth={3}
          fillOpacity={1} 
          fill="url(#colorIncome)" 
          name="Receitas"
        />
        <Area 
          type="monotone" 
          dataKey="expenses" 
          stroke="#EF4444" 
          strokeWidth={3}
          fillOpacity={1} 
          fill="url(#colorExpenses)" 
          name="Despesas"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function DailyActivityChart({ data }: { data: { day: number; amount: number }[] }) {
  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-slate-400">
        Sem atividade este mês
      </div>
    )
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-3">
          <p className="font-bold text-slate-900 dark:text-white mb-1">Dia {label}</p>
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            €{payload[0].value.toFixed(2)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} barSize={30}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
        <XAxis 
          dataKey="day" 
          stroke="#94A3B8" 
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12 }}
          dy={10}
        />
        <YAxis 
          stroke="#94A3B8" 
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `€${value}`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
        <Bar 
          dataKey="amount" 
          fill="#3B82F6" 
          radius={[4, 4, 0, 0]}
          name="Gasto Diário"
        >
            {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.amount > 100 ? '#EF4444' : '#3B82F6'} />
            ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

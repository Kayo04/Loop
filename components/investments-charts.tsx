"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, PieChart as PieIcon } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, Pie, PieChart as RechartsPie } from "recharts"

type DividendData = {
    month: string
    amount: number
}

type AllocationData = {
    name: string
    value: number
    color: string
}

export function DividendHistoryChart({ data }: { data: DividendData[] }) {
    return (
        <Card className="col-span-1 lg:col-span-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                    Evolução de Dividendos (Simulado)
                </CardTitle>
            </CardHeader>
            <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <XAxis 
                            dataKey="month" 
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
                            tickFormatter={(value) => `€${value}`} 
                        />
                        <Tooltip 
                            formatter={(value: number) => [`€${value.toFixed(2)}`, "Dividendos"]}
                            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderColor: '#e2e8f0', borderRadius: '12px', color: '#000' }}
                            cursor={{ fill: 'transparent' }}
                        />
                        <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.amount > 100 ? '#10b981' : '#3b82f6'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

export function AllocationPieChart({ data }: { data: AllocationData[] }) {
    return (
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <PieIcon className="w-5 h-5 text-purple-500" />
                    Alocação
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center min-h-[350px]">
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <RechartsPie width={400} height={400}>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </RechartsPie>
                    </ResponsiveContainer>
                </div>
                {/* Custom Legend */}
                <div className="grid grid-cols-2 gap-4 w-full mt-4">
                    {data.map((item) => (
                        <div key={item.name} className="flex items-center gap-2 text-sm">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
                            <span className="font-bold ml-auto">{item.value}%</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

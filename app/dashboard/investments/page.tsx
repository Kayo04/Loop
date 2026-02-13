import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, DollarSign, Wallet, Calendar, ArrowUpRight, BarChart3, PieChart as PieIcon, Trash2, Banknote } from "lucide-react"
import { getAssets, deleteAsset } from "@/app/dashboard/investments/actions"
import { AddAssetDialog } from "@/components/add-asset-dialog"
import { BulkAddAssetDialog } from "@/components/bulk-add-asset-dialog" // NEW
import { Button } from "@/components/ui/button"
import { DividendHistoryChart, AllocationPieChart } from "@/components/investments-charts"
import { RefreshAssetsButton } from "@/components/refresh-assets-button"
import { LockScreen } from "@/components/lock-screen"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"
import { getUserTier } from "@/app/dashboard/actions"
import { createClient } from "@/lib/supabase-server"

// --- TYPES ---
type Asset = {
    id: string
    symbol: string
    name: string
    type: string  
    quantity: number
    buy_price: number
    current_price: number
    currency: string
    annual_dividend_per_share: number
    next_payment_date: string | null // NEW
}

// --- HELPER COMPONENT FOR DELETE BUTTON ---
function DeleteAssetButton({ id }: { id: string }) {
    return (
        <form action={async () => {
            "use server"
            await deleteAsset(id)
        }}>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20">
                <Trash2 size={16} />
            </Button>
        </form>
    )
}

export default async function InvestmentsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // PROTECT ROUTE (PRO ONLY)
    const tier = await getUserTier(user.id)
    if (tier === 'free') {
      return (
        <div className="relative min-h-screen">
            <LockScreen />
            <div className="filter blur-sm opacity-50 pointer-events-none select-none" aria-hidden="true">
                <DashboardSkeleton />
            </div>
        </div>
      )
    }

    // 1. FETCH ASSETS
    const assets = await getAssets() as Asset[]

    // 2. CALCULATE METRICS (DIVIDEND FOCUS)
    let totalValue = 0
    let totalInvested = 0
    let totalAnnualIncome = 0

    // Allocation Logic - Top 4 + Others
    const allocationBySymbol: Record<string, number> = {}

    assets.forEach(asset => {
        const currentValue = asset.quantity * asset.current_price
        const investedValue = asset.quantity * asset.buy_price
        const annualIncome = asset.quantity * (asset.annual_dividend_per_share || 0)
        
        totalValue += currentValue
        totalInvested += investedValue
        totalAnnualIncome += annualIncome
        
        // Group by Symbol
        allocationBySymbol[asset.symbol] = (allocationBySymbol[asset.symbol] || 0) + currentValue
    })

    // Sort and Top 5
    const sortedAllocation = Object.entries(allocationBySymbol)
        .sort(([, a], [, b]) => b - a)

    const top5 = sortedAllocation.slice(0, 5)
    const others = sortedAllocation.slice(5).reduce((acc, [, val]) => acc + val, 0)

    const finalAllocationData = top5.map(([name, value], index) => {
        const colors = ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444"] 
        return {
            name,
            value: parseFloat(((value / totalValue) * 100).toFixed(1)),
            color: colors[index]
        }
    })

    if (others > 0) {
        finalAllocationData.push({
            name: "Outros",
            value: parseFloat(((others / totalValue) * 100).toFixed(1)),
            color: "#64748b" // slate-500
        })
    }

    const monthlyIncome = totalAnnualIncome / 12
    const yieldOnCost = totalInvested > 0 ? (totalAnnualIncome / totalInvested) * 100 : 0
    const currentYield = totalValue > 0 ? (totalAnnualIncome / totalValue) * 100 : 0

    // Prepare Dividend Projection Data (Mock distribution for now, but scaled to Total Annual)
    // In a real app we'd use payment dates. Here we just distribute evenly or use seasonality if known.
    // Let's just evenly distribute the Total Annual Income for the visual to look "full" if data exists.
    const dividendHistory = assets.length > 0 ? Array.from({ length: 12 }, (_, i) => {
        const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
        // Simple mock randomization around the average
        const variation = (Math.random() * 0.4) + 0.8 // 0.8 to 1.2
        return {
            month: monthNames[i],
            amount: (monthlyIncome * variation) 
        }
    }) : []
    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                        Portfolio de Dividendos
                    </h1>
                    <p className="text-slate-500 mt-2">
                        Foco total em renda passiva.
                    </p>
                </div>
                <div className="flex gap-2">
                    <RefreshAssetsButton />
                    <BulkAddAssetDialog />
                    <AddAssetDialog />
                </div>
            </div>

            {/* KPI CARDS - DIVIDEND FOCUSED */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Card 1: Renda Anual */}
                <Card className="bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Renda Anual Estimada</CardTitle>
                        <Banknote className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            €{totalAnnualIncome.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            €{monthlyIncome.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} / mês (média)
                        </p>
                    </CardContent>
                </Card>

                {/* Card 2: Yield on Cost */}
                <Card className="bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Yield on Cost</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{yieldOnCost.toFixed(2)}%</div>
                        <p className="text-xs text-slate-400 mt-1">
                            Baseado no capital investido
                        </p>
                    </CardContent>
                </Card>

                 {/* Card 3: Valor do Portfolio */}
                 <Card className="bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Capital Investido</CardTitle>
                        <Wallet className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">€{totalInvested.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}</div>
                        <p className="text-xs text-slate-500 mt-1">
                             Valor Atual: €{totalValue.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} ({currentYield.toFixed(2)}% Yield)
                        </p>
                    </CardContent>
                </Card>

                {/* Card 4: Total Ativos */}
                <Card className="bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Fontes de Renda</CardTitle>
                        <PieIcon className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{assets.length}</div>
                        <p className="text-xs text-slate-500 mt-1">
                            Ativos pagadores
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* CHARTS ROW */}
            {assets.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <DividendHistoryChart data={dividendHistory} />
                    <AllocationPieChart data={finalAllocationData} />
                </div>
            )}

            {/* ASSETS TABLE */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                <CardHeader>
                    <CardTitle>Meus Ativos & Dividendos</CardTitle>
                </CardHeader>
                <CardContent>
                    {assets.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-slate-500 mb-4">Começa a construir a tua bola de neve de dividendos!</p>
                            <div className="flex justify-center gap-2">
                                <BulkAddAssetDialog />
                                <AddAssetDialog />
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50">
                                    <tr>
                                        <th className="px-4 py-3 rounded-l-lg">Ativo</th>
                                        <th className="px-4 py-3">Qtd.</th>
                                        <th className="px-4 py-3 text-right text-blue-600 dark:text-blue-400">Div. Anual</th>
                                        <th className="px-4 py-3 text-right">Yield (Cost)</th>
                                        <th className="px-4 py-3 text-right font-bold text-green-600 dark:text-green-500">Renda Anual</th>
                                        <th className="px-4 py-3 text-right text-slate-500">Próx. Pagamento</th>
                                        <th className="px-4 py-3 text-right rounded-r-lg">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {assets.map((asset) => {
                                        const annualIncome = asset.quantity * (asset.annual_dividend_per_share || 0)
                                        const yieldOnCost = asset.buy_price > 0 ? (asset.annual_dividend_per_share / asset.buy_price) * 100 : 0
                                        
                                        return (
                                            <tr key={asset.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-4 py-3 font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-xs uppercase">
                                                            {asset.symbol.substring(0, 2)}
                                                        </div>
                                                        <div>
                                                            <div className="text-slate-900 dark:text-white font-bold">{asset.symbol}</div>
                                                            <div className="text-xs text-slate-500">{asset.name}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                                                    {asset.quantity}
                                                </td>
                                                <td className="px-4 py-3 text-right text-blue-600 dark:text-blue-400 font-medium">
                                                    €{asset.annual_dividend_per_share?.toFixed(2) || '0.00'}
                                                </td>
                                                <td className="px-4 py-3 text-right text-slate-500">
                                                    {yieldOnCost.toFixed(2)}%
                                                </td>
                                                <td className="px-4 py-3 text-right font-bold text-green-600 dark:text-green-500">
                                                    €{annualIncome.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm text-slate-500">
                                                    {asset.next_payment_date ? new Date(asset.next_payment_date).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long' }) : '-'}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <DeleteAssetButton id={asset.id} />
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, TrendingUp, Wallet } from "lucide-react"

interface NetWorthSummaryProps {
    assets: any[]
}

export function NetWorthSummary({ assets }: NetWorthSummaryProps) {
    // 1. Calculate Totals
    const investments = assets.filter(a => a.type !== 'other')
    const fixedAssets = assets.filter(a => a.type === 'other')

    const totalInvestments = investments.reduce((acc, curr) => acc + (curr.quantity * curr.current_price), 0)
    const totalFixed = fixedAssets.reduce((acc, curr) => acc + (curr.quantity * curr.current_price), 0)
    const totalNetWorth = totalInvestments + totalFixed

    const investmentPercentage = totalNetWorth > 0 ? (totalInvestments / totalNetWorth) * 100 : 0
    const fixedPercentage = totalNetWorth > 0 ? (totalFixed / totalNetWorth) * 100 : 0

    return (
        <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Card className="bg-gradient-to-br from-green-500 to-emerald-600 border-none text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-green-100">
                        Património Total
                    </CardTitle>
                    <Wallet className="h-4 w-4 text-green-100" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(totalNetWorth)}
                    </div>
                    <p className="text-xs text-green-100 mt-1">
                        Soma de todos os teus ativos
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Investimentos</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                        {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(totalInvestments)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Stocks, Crypto, ETFs ({investmentPercentage.toFixed(1)}%)
                    </p>
                    <div className="mt-3 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 transition-all" style={{ width: `${investmentPercentage}%` }} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ativos Fixos</CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-purple-600">
                        {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(totalFixed)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Imobiliário, Veículos, etc ({fixedPercentage.toFixed(1)}%)
                    </p>
                    <div className="mt-3 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 transition-all" style={{ width: `${fixedPercentage}%` }} />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

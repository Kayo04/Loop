"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Building2, TrendingUp, Loader2, Check, ChevronsUpDown, Wallet, PieChart as PieChartIcon } from "lucide-react"
import { useState, useMemo, useEffect } from "react"
import { createFixedAsset, deleteAsset, previewStockAsset, createAsset } from "@/app/dashboard/investments/actions"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { POPULAR_ASSETS } from "@/app/dashboard/investments/popular-assets"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts'

interface AssetManagerProps {
    assets: any[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function AssetManager({ assets }: AssetManagerProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    // --- FIXED ASSET STATE ---
    const [fixedName, setFixedName] = useState("")
    const [fixedValue, setFixedValue] = useState("")
    const [fixedCategory, setFixedCategory] = useState("Real Estate")

    // --- MARKET ASSET STATE ---
    const [symbol, setSymbol] = useState("")
    const [quantity, setQuantity] = useState("")
    const [previewData, setPreviewData] = useState<any>(null)
    const [isPreviewLoading, setIsPreviewLoading] = useState(false)
    const [openCombobox, setOpenCombobox] = useState(false)
    const [searchValue, setSearchValue] = useState("")

    // --- HANDLERS: FIXED ---
    async function handleAddFixed(e: React.FormEvent) {
        e.preventDefault()
        setIsLoading(true)

        const formData = new FormData()
        formData.append("name", fixedName)
        formData.append("value", fixedValue)
        formData.append("category", fixedCategory)

        try {
            const result = await createFixedAsset(formData)

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Ativo Fixo adicionado!")
                setFixedName("")
                setFixedValue("")
            }
        } catch (err) {
            console.error("Client Error:", err)
            toast.error("Erro inesperado ao criar ativo.")
        }
        setIsLoading(false)
    }

    // --- HANDLERS: MARKET ---
    async function handlePreview(overrideSymbol?: string) {
        const sym = overrideSymbol || symbol
        if (!sym) return
        
        setIsPreviewLoading(true)
        setPreviewData(null)
        
        try {
            const result = await previewStockAsset(sym.trim())
            
            if (result.error || !result.data) {
                toast.error(result.error || "Ativo não encontrado.")
            } else {
                setPreviewData(result.data)
                // If success, ensure symbol state matches
                if (overrideSymbol) setSymbol(overrideSymbol)
            }
        } catch (error) {
            console.error(error)
            toast.error("Erro ao comunicar com o servidor.")
        } finally {
            setIsPreviewLoading(false)
        }
    }

    async function handleAddMarket(e: React.FormEvent) {
        e.preventDefault()
        if (!previewData) return

        setIsLoading(true)
        const formData = new FormData()
        formData.append("symbol", previewData.symbol)
        formData.append("name", previewData.name)
        formData.append("quantity", quantity)
        formData.append("type", "stock") 
        formData.append("buy_price", previewData.price.toString())
        formData.append("current_price", previewData.price.toString())
        formData.append("annual_dividend_per_share", previewData.annualDividendRate.toString())

        const result = await createAsset(formData)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success(`${previewData.symbol} adicionado! 🚀`)
            setSymbol("")
            setQuantity("")
            setPreviewData(null)
            setSearchValue("")
        }
        setIsLoading(false)
    }

    async function handleDelete(id: string) {
        if (!confirm("Tem a certeza?")) return
        await deleteAsset(id)
        toast.success("Ativo removido.")
    }

    const { /*fixedAssets, marketAssets,*/ allAssets, chartData } = useMemo(() => {
        // Define Market Types
        const marketTypes = ['stock', 'crypto', 'etf']
        
        const fixed = assets.filter(a => !marketTypes.includes(a.type))
        const market = assets.filter(a => marketTypes.includes(a.type))
        
        // Prepare chart data
        const dataMap = new Map<string, number>()
        
        // Add Fixed Assets to Chart
        fixed.forEach(a => {
            const cat = getCategoryLabel(a.type) // Use type as category
            const val = dataMap.get(cat) || 0
            dataMap.set(cat, val + a.current_price)
        })

        // Add Market Assets to Chart
        market.forEach(a => {
            const cat = a.symbol ? 'Stocks/Crypto' : 'Investimentos'
            const val = dataMap.get(cat) || 0
            const totalValue = a.quantity ? a.current_price * a.quantity : a.current_price
            dataMap.set(cat, val + totalValue)
        })

        const chart = Array.from(dataMap.entries()).map(([name, value]) => ({ name, value }))

        // Prepare Unified List
        const all = [...fixed, ...market].sort((a,b) => (b.updated_at || "").localeCompare(a.updated_at || ""))

        return { fixedAssets: fixed, marketAssets: market, allAssets: all, chartData: chart }
    }, [assets])

    const totalNetWorth = allAssets.reduce((acc, curr) => {
        const val = curr.quantity ? curr.current_price * curr.quantity : curr.current_price
        return acc + val
    }, 0)


    return (
        <div className="space-y-8">
            
            {/* TOP SECTION: INPUT & CHART */}
            <div className="grid xl:grid-cols-2 gap-8 items-start">
                
                {/* LEFT: UNIFIED INPUT */}
                <Card className="min-h-[400px] border-none shadow-lg bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2">
                            <Wallet className="w-5 h-5" />
                            Gestor de Património
                        </CardTitle>
                        <CardDescription>Adiciona e gere os teus ativos num só lugar.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="fixed" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-4">
                                <TabsTrigger value="fixed">Ativos Fixos</TabsTrigger>
                                <TabsTrigger value="market">Investimentos</TabsTrigger>
                            </TabsList>
                            
                            {/* TAB: FIXED */}
                            <TabsContent value="fixed" className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300">
                                <div className="p-4 bg-purple-50/50 dark:bg-purple-900/10 rounded-lg border border-purple-100 dark:border-purple-800/20 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300 mb-2 font-medium">
                                        <Building2 className="w-4 h-4" />
                                        Bens Materiais
                                    </div>
                                    <p className="text-xs text-muted-foreground">Regista imóveis, veículos ou dinheiro.</p>
                                </div>

                                <form onSubmit={handleAddFixed} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Nome do Bem</Label>
                                        <Input 
                                            placeholder="Ex: Apartamento, Carro, Dinheiro Vivo..." 
                                            value={fixedName}
                                            onChange={(e) => setFixedName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Valor (€)</Label>
                                            <Input 
                                                type="number" 
                                                placeholder="0.00" 
                                                value={fixedValue}
                                                onChange={(e) => setFixedValue(e.target.value)}
                                                required
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Tipo</Label>
                                            <Select value={fixedCategory} onValueChange={setFixedCategory}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Real Estate">Imobiliário</SelectItem>
                                                    <SelectItem value="Vehicle">Veículo</SelectItem>
                                                    <SelectItem value="Cash">Dinheiro</SelectItem>
                                                    <SelectItem value="Other">Outro</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white" disabled={isLoading}>
                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar Ativo Fixo"}
                                    </Button>
                                </form>
                            </TabsContent>

                            {/* TAB: MARKET */}
                            <TabsContent value="market" className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                                <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800/20 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300 mb-2 font-medium">
                                        <TrendingUp className="w-4 h-4" />
                                        Mercados Financeiros
                                    </div>
                                    <p className="text-xs text-muted-foreground">Ações, Cripto e ETFs com preços em tempo real.</p>
                                </div>

                                <form onSubmit={handleAddMarket} className="space-y-4">
                                     <div className="grid grid-cols-[1fr_2.5fr] gap-4">
                                        <div className="space-y-2">
                                            <Label>Qtd.</Label>
                                            <Input 
                                                type="number" 
                                                placeholder="10" 
                                                value={quantity}
                                                onChange={(e) => setQuantity(e.target.value)}
                                                required
                                                min="0.00000001"
                                                step="any"
                                                className="font-bold"
                                            />
                                        </div>
                                        <div className="space-y-2 flex flex-col">
                                            <Label>Ativo (Nome ou Símbolo)</Label>
                                            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        aria-expanded={openCombobox}
                                                        className="w-full justify-between font-normal"
                                                    >
                                                        {symbol ? symbol : "Procurar..."}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[300px] p-0" align="start">
                                                    <Command>
                                                        <CommandInput 
                                                            placeholder="Bitcoin, Apple, SPY..." 
                                                            value={searchValue}
                                                            onValueChange={setSearchValue}
                                                        />
                                                        <CommandList>
                                                            <CommandEmpty>
                                                                <div className="p-2">
                                                                     <p className="text-sm text-muted-foreground mb-2">Não encontrado.</p>
                                                                     <Button 
                                                                        variant="default" 
                                                                        size="sm" 
                                                                        className="w-full h-auto py-2 bg-blue-600 hover:bg-blue-700 text-white"
                                                                        type="button"
                                                                        onClick={() => {
                                                                            if (searchValue) {
                                                                                setSymbol(searchValue.toUpperCase())
                                                                                setOpenCombobox(false)
                                                                                handlePreview(searchValue.toUpperCase())
                                                                            }
                                                                        }}
                                                                    >
                                                                        Usar &quot;{searchValue}&quot;
                                                                    </Button>
                                                                </div>
                                                            </CommandEmpty>
                                                            <CommandGroup heading="Sugestões">
                                                                {POPULAR_ASSETS.map((asset) => (
                                                                     <CommandItem
                                                                        key={asset.symbol}
                                                                        value={asset.name + " " + asset.symbol} 
                                                                        onSelect={() => {
                                                                            setSymbol(asset.symbol)
                                                                            setOpenCombobox(false)
                                                                            handlePreview(asset.symbol)
                                                                        }}
                                                                    >
                                                                        <Check className={cn("mr-2 h-4 w-4", symbol === asset.symbol ? "opacity-100" : "opacity-0")} />
                                                                        <span className="font-bold w-16">{asset.symbol}</span>
                                                                        <span className="text-muted-foreground truncate">{asset.name}</span>
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                     </div>

                                    {/* PREVIEW */}
                                    {previewData && (
                                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 space-y-3 border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2">
                                            <div className="flex items-center gap-3">
                                                 <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center font-bold text-[10px] text-blue-600">
                                                    {previewData.symbol.substring(0, 2)}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-bold text-sm truncate">{previewData.name}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: previewData.currency }).format(previewData.price)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center text-sm border-t border-slate-200 dark:border-slate-800 pt-2">
                                                <span className="text-muted-foreground">Total Estimado:</span>
                                                <span className="font-bold text-green-600 dark:text-green-400">
                                                    {quantity && !isNaN(Number(quantity)) 
                                                        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: previewData.currency }).format(previewData.price * Number(quantity))
                                                        : "---"}
                                                </span>
                                            </div>
                                            <Button type="submit" size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
                                                Confirmar Investimento
                                            </Button>
                                        </div>
                                    )}
                                </form>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* RIGHT: CHART */}
                <Card className="min-h-[400px] flex flex-col border-none shadow-lg bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieChartIcon className="w-5 h-5" />
                            Distribuição
                        </CardTitle>
                        <CardDescription>
                            Total: <span className="font-bold text-foreground">{new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(totalNetWorth)}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-[300px]">
                        {isMounted && chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip 
                                        formatter={(value: any) => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(Number(value))}
                                        contentStyle={{ backgroundColor: '#1e293b', color: '#fff', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                             <div className="h-full flex items-center justify-center text-muted-foreground flex-col gap-4">
                                <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800">
                                    <PieChartIcon className="w-8 h-8 opacity-20" />
                                </div>
                                <p>{isMounted ? "Sem dados para gráfico." : "A carregar..."}</p>
                             </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* BOTTOM: UNIFIED TABLE */}
             <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>Todos os Ativos</CardTitle>
                    <CardDescription>Lista completa do teu património e investimentos.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome / Símbolo</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead className="text-right">Qtd.</TableHead>
                                <TableHead className="text-right">Valor Unit.</TableHead>
                                <TableHead className="text-right">Valor Total</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {allAssets.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                        Ainda não tens ativos registados.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                allAssets.map((asset) => {
                                    const marketTypes = ['stock', 'crypto', 'etf']
                                    const isFixed = !marketTypes.includes(asset.type)
                                    const quantity = asset.quantity || 1;
                                    const totalVal = quantity * asset.current_price;

                                    return (
                                        <TableRow key={asset.id} className="group">
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-8 h-8 rounded-full flex items-center justify-center",
                                                        isFixed ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600" : "bg-blue-100 dark:bg-blue-900/30 text-blue-600"
                                                    )}>
                                                        {isFixed ? <Building2 className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                                                    </div>
                                                    <div>
                                                        {/* FIXED ASSETS: Show Name (Subtitle: Symbol or HIDDEN) */}
                                                        {isFixed ? (
                                                            <>
                                                                <div>{asset.name}</div>
                                                                {/* <div className="text-xs text-muted-foreground">Ativo Fixo</div> */}
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div>{asset.symbol}</div>
                                                                <div className="text-xs text-muted-foreground">{asset.name}</div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={cn(
                                                    "px-2 py-1 rounded-full text-xs font-medium",
                                                    isFixed ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                                )}>
                                                    {isFixed ? getCategoryLabel(asset.type) : (asset.type === 'crypto' ? 'Cripto' : 'Ação')}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right font-mono">
                                                {isFixed ? "1" : quantity}
                                            </TableCell>
                                            <TableCell className="text-right text-muted-foreground font-mono">
                                                {isFixed ? "-" : new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(asset.current_price)}
                                            </TableCell>
                                            <TableCell className="text-right font-bold font-mono">
                                                {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(totalVal)}
                                            </TableCell>
                                            <TableCell>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all opacity-0 group-hover:opacity-100"
                                                    onClick={() => handleDelete(asset.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

function getCategoryLabel(cat: string) {
    const map: Record<string, string> = {
        'Real Estate': 'Imobiliário',
        'Vehicle': 'Veículo',
        'Cash': 'Dinheiro',
        'Other': 'Outro'
    }
    return map[cat] || cat
}

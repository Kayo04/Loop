"use client"

import { useState } from "react"
import { createAsset } from "@/app/dashboard/investments/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"

export function AddAssetDialog() {
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)

        const formData = new FormData(e.currentTarget)
        const result = await createAsset(formData)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Ativo adicionado com sucesso!")
            setIsOpen(false)
        }
        setIsSubmitting(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20">
                    <Plus className="mr-2 h-4 w-4" /> Adicionar Ativo
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Novo Ativo</DialogTitle>
                    <DialogDescription>
                        Adiciona ações, criptomoedas ou outros investimentos ao teu portfolio.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Símbolo</label>
                            <Input name="symbol" placeholder="AAPL" required className="uppercase font-bold" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tipo</label>
                            <Select name="type" required defaultValue="stock">
                                <SelectTrigger>
                                    <SelectValue placeholder="Tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="stock">Ação</SelectItem>
                                    <SelectItem value="reit">REIT</SelectItem>
                                    <SelectItem value="crypto">Crypto</SelectItem>
                                    <SelectItem value="etf">ETF</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Nome</label>
                        <Input name="name" placeholder="Apple Inc." required />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Qtd.</label>
                            <Input name="quantity" type="number" step="0.00000001" min="0" placeholder="10" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Preço Compra</label>
                            <Input name="buy_price" type="number" step="0.01" min="0" placeholder="150.00" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Preço Atual</label>
                            <Input name="current_price" type="number" step="0.01" min="0" placeholder="180.00" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Div. Anual / Ação</label>
                            <Input name="annual_dividend_per_share" type="number" step="0.0001" min="0" placeholder="0.96" />
                        </div>
                    </div>


                    <DialogFooter className="pt-4">
                        <Button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 text-white hover:bg-slate-800">
                            {isSubmitting ? <Loader2 className="animate-spin" /> : "Guardar Ativo"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

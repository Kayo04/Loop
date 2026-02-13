"use client"

import { useState } from "react"
import { createAssetsBulk } from "@/app/dashboard/investments/actions"
import { Button } from "@/components/ui/button"

import { Textarea } from "@/components/ui/textarea"
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
import { Upload, Loader2, Info } from "lucide-react"
import { toast } from "sonner"

export function BulkAddAssetDialog() {
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [data, setData] = useState("")

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            const text = event.target?.result as string
            if (text) {
                setData(text)
                toast.success("Ficheiro lido com sucesso!")
            }
        }
        reader.readAsText(file)
    }

    const handleSubmit = async () => {
        if (!data.trim()) return

        setIsSubmitting(true)
        const result = await createAssetsBulk(data)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success(`${result.count} ativos importados com sucesso!`)
            setIsOpen(false)
            setData("")
        }
        setIsSubmitting(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Upload className="h-4 w-4" /> Importar em Massa
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Importar Assets</DialogTitle>
                    <DialogDescription>
                        Carrega um ficheiro CSV ou cola a tua lista manualmente.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex gap-3 text-sm text-blue-700 dark:text-blue-300">
                        <Info className="h-5 w-5 shrink-0" />
                        <div>
                            <p className="font-bold">Formato (CSV ou Texto):</p>
                            <pre className="mt-1 text-xs opacity-80 whitespace-pre-wrap">
                                Símbolo, Quantidade, Preço, Div. Anual (Valor)
                            </pre>
                            <p className="text-[10px] mt-2 opacity-70">
                                Dica: Coloca 0 no Preço e Div. Anual para buscar automático!
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Carregar Ficheiro (.csv, .txt)</label>
                        <Input 
                            type="file" 
                            accept=".csv,.txt" 
                            onChange={handleFileUpload}
                            className="curso-pointer"
                        />
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-slate-950 px-2 text-slate-500">Ou cola manualmente</span>
                        </div>
                    </div>

                    <Textarea 
                        placeholder="AAPL, 10, 0, 0 (Busca preço automático)&#10;KO, 20, 50.50, 2.04 (Manual)" 
                        className="h-[150px] font-mono text-sm"
                        value={data}
                        onChange={(e) => setData(e.target.value)}
                    />
                </div>

                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={isSubmitting || !data.trim()} className="bg-slate-900 text-white hover:bg-slate-800">
                        {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
                        Importar Ativos
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

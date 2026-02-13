"use client"

import { useState, useMemo } from "react"
import { createTransaction, parseTransactionText } from "@/app/dashboard/finance/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Sparkles, Send, Loader2, Check } from "lucide-react"
import { toast } from "sonner"

type TransactionFormProps = {
  onClose: () => void
  categories: { name: string; emoji: string; type: string }[]
  budgets: { id: string; category: string; monthly_limit: string; month: string }[]
  defaultMonth?: string // YYYY-MM-DD
}

type DraftTransaction = {
  amount: number
  category: string
  description: string
  type: string
}

export function TransactionForm({ onClose, categories, budgets, defaultMonth }: TransactionFormProps) {
  // Manual Form State
  const [type, setType] = useState<"income" | "expense">("expense")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // AI Chat State
  const [aiInput, setAiInput] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [drafts, setDrafts] = useState<DraftTransaction[] | null>(null)
  const [isSavingDrafts, setIsSavingDrafts] = useState(false)

  // Calculate default date based on the viewed month
  const defaultDateValue = useMemo(() => {
     if (!defaultMonth) return new Date().toISOString().split('T')[0]

     const today = new Date()
     const viewDate = new Date(defaultMonth)
     
     // Check if we are viewing the current month (ignoring day)
     const isCurrentMonth = 
        today.getMonth() === viewDate.getMonth() && 
        today.getFullYear() === viewDate.getFullYear()

     if (isCurrentMonth) {
         return today.toISOString().split('T')[0] // Use today
     } else {
         return defaultMonth // Use the 1st of that month (since defaultMonth is YYYY-MM-01)
     }
  }, [defaultMonth])

  // Combine budget categories with existing categories for suggestions
  const allSuggestions = useMemo(() => {
    const budgetCategories = budgets.map(b => ({ name: b.category, emoji: '💰', type: 'expense' }))
    const combined = [...budgetCategories, ...categories]
    // Remove duplicates
    const unique = combined.filter((item, index, self) => 
      index === self.findIndex(t => t.name === item.name)
    )
    return unique
  }, [budgets, categories])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const result = await createTransaction(formData)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Transação guardada!")
      onClose()
    }
    setIsSubmitting(false)
  }

  // AI Handlers
  const handleAnalyze = async () => {
    if (!aiInput.trim()) return
    setIsAnalyzing(true)
    try {
      const result = await parseTransactionText(aiInput)
      if (result && result.length > 0) {
        setDrafts(result)
      } else {
        toast.error("Não consegui identificar despesas. Tenta: 'Jantar 20 euros'")
      }
    } catch (error) {
      toast.error("Erro ao analisar texto")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleConfirmDrafts = async () => {
    if (!drafts) return
    setIsSavingDrafts(true)
    
    let successCount = 0
    let errors = 0
    
    // date logic same as manual
    const dateToSave = defaultDateValue

    await Promise.all(drafts.map(async (draft) => {
        const formData = new FormData()
        formData.append("type", draft.type)
        formData.append("amount", draft.amount.toString())
        formData.append("category", draft.category)
        formData.append("description", draft.description)
        formData.append("date", dateToSave)

        const res = await createTransaction(formData)
        if (res?.success) successCount++
        else errors++
    }))

    if (errors === 0) {
        toast.success(`${successCount} despesas guardadas com sucesso!`)
        onClose()
    } else {
        toast.warning(`${successCount} guardadas, ${errors} falharam.`)
    }
    setIsSavingDrafts(false)
  }

  const handleResetAi = () => {
    setDrafts(null)
    setAiInput("")
  }

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <Card className="w-full max-w-5xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 z-50 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X size={20} />
        </Button>

        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
            
            {/* LEFT COLUMN: MANUAL FORM */}
            <div className="p-6 flex flex-col h-full min-h-[550px]">
              <div className="flex items-center gap-3 mb-8">
                 <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl">
                    <span className="text-2xl">✍️</span>
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Nova Transação</h3>
                    <p className="text-sm text-slate-500">Registo manual de despesas.</p>
                 </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col">
                {/* Type Selector */}
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    Tipo
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setType("expense")}
                      className={`py-3 px-4 rounded-xl font-bold transition-all ${
                        type === "expense"
                          ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      Despesa
                    </button>
                    <button
                      type="button"
                      onClick={() => setType("income")}
                      className={`py-3 px-4 rounded-xl font-bold transition-all ${
                        type === "income"
                          ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      Receita
                    </button>
                  </div>
                  <input type="hidden" name="type" value={type} />
                </div>

                {/* Amount */}
                <div>
                  <label htmlFor="amount" className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    Valor (€)
                  </label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                    className="text-lg font-bold"
                  />
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    Categoria
                  </label>
                  <Input
                    id="category"
                    name="category"
                    type="text"
                    required
                    placeholder="Ex: Gasolina, Salário..."
                    className="font-medium"
                    list="category-suggestions"
                  />
                  {allSuggestions.length > 0 && (
                    <datalist id="category-suggestions">
                      {allSuggestions.map((cat) => (
                        <option key={cat.name} value={cat.name} />
                      ))}
                    </datalist>
                  )}
                </div>

                {/* Date */}
                <div>
                  <label htmlFor="date" className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    Data
                  </label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    required
                    defaultValue={defaultDateValue}
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    Descrição (opcional)
                  </label>
                  <Input
                    id="description"
                    name="description"
                    type="text"
                    placeholder="Ex: Compras no supermercado"
                  />
                </div>

                {/* Submit */}
                <div className="pt-4 mt-auto">
                  <Button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 text-white font-bold h-14 rounded-xl shadow-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "A guardar..." : "Guardar Transação"}
                  </Button>
                </div>
              </form>
            </div>

            {/* RIGHT COLUMN: AI CHAT */}
            <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col h-full min-h-[550px]">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-2xl">
                    <Sparkles className="text-purple-600 dark:text-purple-400" size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Assistente IA</h3>
                    <p className="text-sm text-slate-500">Diz-me o que gastaste...</p>
                </div>
              </div>

              {!drafts ? (
                <div className="space-y-4 flex-1 flex flex-col">
                  <Textarea
                    placeholder="Ex: 'Jantar 25 euros e uber 8 euros'"
                    className="resize-none text-lg p-4 min-h-[150px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-purple-500 shadow-sm"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleAnalyze()
                        }
                    }}
                  />
                  <div className="pt-4 mt-auto">
                    <Button 
                        onClick={handleAnalyze} 
                        className="bg-purple-600 hover:bg-purple-700 text-white w-full h-14 rounded-xl font-bold shadow-lg shadow-purple-500/20"
                        disabled={isAnalyzing || !aiInput.trim()}
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="animate-spin mr-2" /> Analisando...
                            </>
                        ) : (
                            <>
                                <Sparkles size={18} className="mr-2" /> Analisar com IA
                            </>
                        )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 flex-1 flex flex-col">
                   <div className="flex justify-between items-center">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                            Encontrei {drafts.length} despesa(s):
                        </p>
                        <Button variant="ghost" size="sm" onClick={handleResetAi} className="text-xs text-slate-400">
                            Editar
                        </Button>
                   </div>
                   
                   <div className="space-y-3 overflow-auto pr-1 custom-scrollbar flex-1">
                      {drafts.map((draft, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${draft.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                               <span className="text-xs font-bold">€</span>
                            </div>
                            <div>
                              <p className="font-medium text-sm text-slate-900 dark:text-white capitalize leading-tight">{draft.description}</p>
                              <p className="text-xs text-slate-500 capitalize">{draft.category}</p>
                            </div>
                          </div>
                          <span className={`font-bold ${draft.type === 'income' ? 'text-green-600' : 'text-slate-900 dark:text-white'}`}>
                            {draft.type === 'income' ? '+' : '-'}€{draft.amount.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 mt-auto">
                        <Button 
                            onClick={handleConfirmDrafts} 
                            className="bg-green-600 hover:bg-green-700 text-white w-full h-14 rounded-xl font-bold shadow-lg shadow-green-500/20"
                            disabled={isSavingDrafts}
                        >
                            {isSavingDrafts ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                <>
                                    <Check size={18} className="mr-2" /> Confirmar Tudo
                                </>
                            )}
                        </Button>
                    </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

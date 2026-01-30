"use client"

import { useState } from "react"
import { createTransaction } from "@/app/dashboard/finance/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"

type TransactionFormProps = {
  onClose: () => void
  categories: { name: string; emoji: string; type: string }[]
}

export function TransactionForm({ onClose, categories }: TransactionFormProps) {
  const [type, setType] = useState<"income" | "expense">("expense")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const result = await createTransaction(formData)

    if (result.error) {
      alert(result.error)
    } else {
      onClose()
    }
    setIsSubmitting(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
              Nova Transação
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X size={20} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="Ex: Gasolina, Salário, Supermercado..."
                className="font-medium"
              />
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
                defaultValue={new Date().toISOString().split('T')[0]}
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
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold"
                disabled={isSubmitting}
              >
                {isSubmitting ? "A guardar..." : "Guardar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

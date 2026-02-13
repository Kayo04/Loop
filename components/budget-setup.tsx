"use client"

import { useState } from "react"
import { setBudget } from "@/app/dashboard/finance/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Plus, TrendingUp } from "lucide-react"

type BudgetSetupProps = {
  onClose: () => void
  currentMonth: string
}

export function BudgetSetup({ onClose, currentMonth }: BudgetSetupProps) {
  const [budgets, setBudgets] = useState<{ category: string; limit: string }[]>([
    { category: "", limit: "" }
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addBudgetRow = () => {
    setBudgets([...budgets, { category: "", limit: "" }])
  }

  const removeBudgetRow = (index: number) => {
    setBudgets(budgets.filter((_, i) => i !== index))
  }

  const updateBudget = (index: number, field: "category" | "limit", value: string) => {
    const newBudgets = [...budgets]
    newBudgets[index][field] = value
    setBudgets(newBudgets)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Save all budgets
    for (const budget of budgets) {
      if (budget.category && budget.limit) {
        await setBudget(budget.category, parseFloat(budget.limit), currentMonth)
      }
    }

    setIsSubmitting(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4 sticky top-0 bg-white dark:bg-slate-900 z-10">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="text-blue-500" size={24} />
                Configurar Orçamento
              </CardTitle>
              <p className="text-sm text-slate-500 mt-1">
                Define limites mensais para cada categoria
              </p>
            </div>
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
            {budgets.map((budget, index) => (
              <div key={index} className="flex gap-3 items-start">
                <div className="flex-1">
                  <Input
                    placeholder="Categoria (ex: Alimentação)"
                    value={budget.category}
                    onChange={(e) => updateBudget(index, "category", e.target.value)}
                    required
                  />
                </div>
                <div className="w-40">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Limite (€)"
                    value={budget.limit}
                    onChange={(e) => updateBudget(index, "limit", e.target.value)}
                    required
                  />
                </div>
                {budgets.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeBudgetRow(index)}
                    className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                  >
                    <X size={18} />
                  </Button>
                )}
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addBudgetRow}
              className="w-full border-dashed border-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-500"
            >
              <Plus size={16} className="mr-2" />
              Adicionar Categoria
            </Button>

            <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
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
                {isSubmitting ? "A guardar..." : "Guardar Orçamento"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

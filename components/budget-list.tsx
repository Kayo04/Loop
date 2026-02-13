"use client"

import { useState } from "react"
import { deleteBudget } from "@/app/dashboard/finance/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, TrendingUp, X } from "lucide-react"

type Budget = {
  id: string
  category: string
  monthly_limit: string
  month: string
}

type BudgetListProps = {
  budgets: Budget[]
  onClose: () => void
}

export function BudgetList({ budgets, onClose }: BudgetListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string, category: string) => {
    if (!confirm(`Tens a certeza que queres apagar o orçamento de "${category}"?`)) return
    
    setDeletingId(id)
    await deleteBudget(id)
    // Page will auto-refresh due to revalidatePath
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4 sticky top-0 bg-white dark:bg-slate-900 z-10">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="text-blue-500" size={24} />
                Gerir Orçamentos
              </CardTitle>
              <p className="text-sm text-slate-500 mt-1">
                {budgets.length} {budgets.length === 1 ? 'orçamento definido' : 'orçamentos definidos'}
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
          {budgets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 mb-2">Ainda não tens orçamentos definidos</p>
              <p className="text-sm text-slate-500">Clica em "Configurar Orçamento" para criar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {budgets.map((budget) => (
                <div
                  key={budget.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 dark:text-white text-lg">
                      {budget.category}
                    </p>
                    <p className="text-sm text-slate-500">
                      Limite mensal: <span className="font-bold text-slate-900 dark:text-white">€{parseFloat(budget.monthly_limit).toFixed(2)}</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                      onClick={() => handleDelete(budget.id, budget.category)}
                      disabled={deletingId === budget.id}
                      title="Apagar orçamento"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              onClick={onClose}
              className="w-full bg-slate-600 hover:bg-slate-700 text-white font-bold"
            >
              Fechar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

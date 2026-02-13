"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { List } from "lucide-react"
import { BudgetList } from "./budget-list"

type Budget = {
  id: string
  category: string
  monthly_limit: string
  month: string
}

export function BudgetListWrapper({ budgets }: { budgets: Budget[] }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="border-slate-300 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl px-4 font-medium"
        title="Ver orçamentos"
      >
        <List className="w-4 h-4 mr-2" /> Ver Orçamentos
      </Button>

      {isOpen && (
        <BudgetList
          budgets={budgets}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  )
}

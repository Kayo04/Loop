"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Target } from "lucide-react"
import { BudgetSetup } from "./budget-setup"

export function BudgetSetupWrapper({ currentMonth }: { currentMonth: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl px-6 font-bold"
      >
        <Target className="w-4 h-4 mr-2" /> Configurar Orçamento
      </Button>

      {isOpen && (
        <BudgetSetup
          onClose={() => setIsOpen(false)}
          currentMonth={currentMonth}
        />
      )}
    </>
  )
}

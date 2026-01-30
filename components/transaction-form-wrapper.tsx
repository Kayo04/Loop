"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { TransactionForm } from "./transaction-form"

type Category = {
  name: string
  emoji: string
  type: string
}

export function TransactionFormWrapper({ categories }: { categories: Category[] }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 font-bold shadow-sm"
      >
        <Plus className="w-4 h-4 mr-2" /> Nova Transação
      </Button>

      {isOpen && (
        <TransactionForm
          onClose={() => setIsOpen(false)}
          categories={categories}
        />
      )}
    </>
  )
}

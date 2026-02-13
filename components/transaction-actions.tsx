"use client"

import { useState } from "react"
import { deleteTransaction } from "@/app/dashboard/finance/actions"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"

type Transaction = {
  id: string
  type: string
  amount: string
  category: string
  description: string | null
  date: string
  created_at: string
}

export function TransactionActions({ transaction }: { transaction: Transaction }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Tens a certeza que queres apagar esta transação?")) return
    
    setIsDeleting(true)
    await deleteTransaction(transaction.id)
    // Page will auto-refresh due to revalidatePath in the action
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-400">
        {formatTime(transaction.created_at)}
      </span>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20"
          title="Editar"
        >
          <Pencil size={14} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
          onClick={handleDelete}
          disabled={isDeleting}
          title="Apagar"
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  )
}

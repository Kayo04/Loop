"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

type Transaction = {
  id: string
  date: string
  amount: string | number
  type: string
  category: string
  description: string | null
}

type Props = {
  transactions: Transaction[]
}

export function ExportButton({ transactions }: Props) {
  const handleExport = () => {
    if (!transactions || transactions.length === 0) return

    // Define CSV Headers
    const headers = ["Data", "Tipo", "Categoria", "Descrição", "Valor (€)"]
    
    // Map data to rows
    const rows = transactions.map(t => [
      t.date,
      t.type === 'income' ? 'Receita' : 'Despesa',
      `"${t.category}"`, // Quote strings that might have commas
      `"${t.description || ''}"`,
      t.amount
    ])

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    // Create Blob and Download Link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `transacoes_export_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={handleExport}
      title="Exportar para CSV"
      className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white"
    >
      <Download size={18} />
    </Button>
  )
}

"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertTriangle } from "lucide-react"
import { cancelSubscription } from "@/app/dashboard/actions"
import { toast } from "sonner"

export function CancelSubscriptionDialog() {
  const [confirmed, setConfirmed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleCancel = async () => {
    if (!confirmed) {
      toast.error("Por favor, confirma que queres cancelar")
      return
    }

    setIsLoading(true)
    try {
      await cancelSubscription()
      toast.success("Subscrição cancelada com sucesso")
      setConfirmed(false)
    } catch (error) {
      toast.error("Erro ao cancelar subscrição")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200">
          Cancelar Subscrição
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-950/30 rounded-full">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <AlertDialogTitle>Cancelar Subscrição Pro?</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-4 pt-4">
            <div>Ao cancelar a tua subscrição:</div>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Perderás acesso a todas as funcionalidades premium</li>
              <li>Os teus dados serão mantidos em segurança</li>
              <li>Podes reativar a qualquer momento</li>
            </ul>
            
            <div className="flex items-center space-x-2 pt-4">
              <Checkbox 
                id="confirm" 
                checked={confirmed}
                onCheckedChange={(checked) => setConfirmed(checked as boolean)}
              />
              <label
                htmlFor="confirm"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Confirmo que quero cancelar a subscrição
              </label>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setConfirmed(false)}>
            Manter Subscrição
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            disabled={!confirmed || isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? "A cancelar..." : "Sim, Cancelar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

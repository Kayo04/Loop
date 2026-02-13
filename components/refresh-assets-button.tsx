"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { refreshAllAssets } from "@/app/dashboard/investments/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function RefreshAssetsButton() {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    async function handleRefresh() {
        setIsLoading(true)
        try {
            const result = await refreshAllAssets()
            if (result.error) {
                toast.error("Erro ao atualizar: " + result.error)
            } else {
                toast.success(`Atualizado! ${result.updatedCount || 0} ativos sincronizados.`)
                router.refresh()
            }
        } catch (e) {
            toast.error("Erro desconhecido ao atualizar.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={isLoading}
            className="gap-2"
        >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "A atualizar..." : "Atualizar Preços"}
        </Button>
    )
}

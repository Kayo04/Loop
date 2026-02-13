
import { getAllAssets } from "../investments/actions"
import { getUserTier } from "../actions"
import { LockScreen } from "@/components/lock-screen"
import { createClient } from "@/lib/supabase-server"
import { NetWorthSummary } from "@/components/net-worth/net-worth-summary"
import { AssetManager } from "@/components/net-worth/asset-manager"

export default async function NetWorthPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
        return <div className="p-8">Por favor faz login.</div>
    }

    // PROTECT ROUTE (PRO ONLY)
    const tier = await getUserTier(user.id)
    if (tier === 'free') {
      return (
        <div className="relative min-h-[500px]">
           <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                <LockScreen title="Calculadora de Net Worth" />
            </div>
            {/* Background Content (Blurred) */}
            <div className="p-8 opacity-20 pointer-events-none">
                <h1 className="text-3xl font-bold mb-8">O Teu Net Worth</h1>
                <div className="grid gap-4 md:grid-cols-3 mb-8">
                     <div className="h-32 bg-slate-200 rounded-xl" />
                     <div className="h-32 bg-slate-200 rounded-xl" />
                     <div className="h-32 bg-slate-200 rounded-xl" />
                </div>
            </div>
        </div>
      )
    }

    const assets = await getAllAssets()

    return (
        <div className="p-8 pb-20 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400">
                    O Teu Net Worth
                </h1>
                <p className="text-muted-foreground mt-2">
                    A soma de todos os teus investimentos e ativos fixos.
                </p>
            </div>

            <NetWorthSummary assets={assets} />

            <AssetManager assets={assets} />
        </div>
    )
}

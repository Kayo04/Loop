"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Lock, Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function LockScreen({ title }: { title?: string }) {
  
  // Disable Scroll on Mount
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 dark:bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-500">
      <Card className="w-full max-w-md border-0 shadow-2xl shadow-indigo-500/20 overflow-hidden relative mx-4">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 z-0"></div>
            
            <CardContent className="p-8 text-center relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30">
                    <Lock className="w-8 h-8 text-white" />
                </div>

                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 flex items-center justify-center gap-2">
                    {title || "Loop PRO"} <Sparkles size={20} className="text-yellow-500 fill-yellow-500" />
                </h2>
                
                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-[280px] mx-auto leading-relaxed">
                    Esta funcionalidade é exclusiva para membros duma subscrição Loop PRO. Desbloqueia todo o potencial.
                </p>

                <div className="flex flex-col gap-3 w-full">
                    <Link href="/dashboard/plans" className="w-full">
                        <Button className="w-full h-12 text-base font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]">
                            Fazer Upgrade Agora <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </Link>
                    <Link href="/dashboard" className="w-full">
                        <Button variant="ghost" className="w-full h-12 rounded-xl text-slate-500 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                            Voltar ao Dashboard
                        </Button>
                    </Link>
                </div>
            </CardContent>
      </Card>
    </div>
  )
}

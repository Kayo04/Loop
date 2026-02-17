"use client"

import { useState } from "react"
import { Check, Zap, Star, Shield, Smartphone, ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import Link from "next/link"

export default function PlansPage() {
  const [isAnnual, setIsAnnual] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleUpgrade = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAnnual }),
      })

      if (!response.ok) {
        throw new Error("Failed to start checkout")
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
        console.error("Checkout error:", error)
        // Optionally show toast error here
    } finally {
        setIsLoading(false)
    }
  }

  return (
    <div className="space-y-12 pb-20 font-sans max-w-6xl mx-auto">
      
      {/* HEADER */}
      <div className="text-center space-y-4 pt-8">
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight">
            Investe na tua <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">Liberdade</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Escolhe o plano ideal para a tua jornada financeira. Cancela a qualquer momento.
        </p>

        {/* TOGGLE */}
        <div className="flex items-center justify-center gap-4 mt-8 bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-full w-fit mx-auto border border-slate-200 dark:border-slate-800">
            <button 
                onClick={() => setIsAnnual(false)}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${!isAnnual ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"}`}
            >
                Mensal
            </button>
            <button 
                onClick={() => setIsAnnual(true)}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${isAnnual ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"}`}
            >
                Anual <span className="text-[10px] text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">-20%</span>
            </button>
        </div>
      </div>

      {/* CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start relative px-4 md:px-0 max-w-5xl mx-auto">
         
         {/* PLANO GRÁTIS */}
         <Card className="border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden h-full flex flex-col bg-slate-50/50 dark:bg-slate-900/20 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <CardHeader className="p-8 pb-4">
                <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">Gratuito</CardTitle>
                <CardDescription className="text-slate-500 mt-2">
                    Para quem está a começar a organizar as finanças.
                </CardDescription>
                <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900 dark:text-white">€0</span>
                    <span className="text-slate-500">/sempre</span>
                </div>
            </CardHeader>
            <CardContent className="p-8 pt-4 flex-1">
                <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="text-slate-600 dark:text-slate-300">Acesso ao Dashboard Básico</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="text-slate-600 dark:text-slate-300">3 Ativos de Investimento</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="text-slate-600 dark:text-slate-300">5 Hábitos Diários</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="text-slate-600 dark:text-slate-300">Histórico de 30 dias</span>
                    </li>
                </ul>
            </CardContent>
            <CardFooter className="p-8 pt-0">
                <Button variant="outline" className="w-full h-12 text-base font-bold rounded-xl border-slate-200 dark:border-slate-700 bg-transparent" disabled>
                    Plano Atual
                </Button>
            </CardFooter>
         </Card>

         {/* PLANO PREMIUM (Loop PRO) */}
         <Card className="border-0 shadow-2xl shadow-violet-500/20 relative overflow-hidden h-full flex flex-col transform md:-translate-y-4 md:hover:-translate-y-6 transition-transform duration-300">
            {/* GRADIENT BACKGROUND */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 z-0"></div>
            
            <div className="absolute top-0 right-0 p-4 z-10">
                <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-white/30 shadow-lg">
                    <Star size={12} fill="currentColor" /> MAIS POPULAR
                </span>
            </div>

            <CardHeader className="p-8 pb-4 relative z-10">
                <CardTitle className="text-2xl font-black text-white flex items-center gap-2">
                    Loop PRO <Sparkles size={20} className="text-yellow-300 fill-yellow-300 animate-pulse" />
                </CardTitle>
                <CardDescription className="text-blue-100 mt-2 font-medium opacity-90">
                    Desbloqueia todo o teu potencial financeiro.
                </CardDescription>
                
                {/* Launch Discount Badge */}
                <div className="mt-4 inline-flex items-center gap-2 bg-yellow-400/20 backdrop-blur-sm border border-yellow-400/30 px-3 py-1.5 rounded-full">
                    <Zap size={14} className="text-yellow-300 fill-yellow-300" />
                    <span className="text-yellow-100 text-xs font-bold">DESCONTO DE LANÇAMENTO</span>
                </div>
                
                <div className="mt-6 space-y-2">
                    {/* Original Price (Strikethrough) */}
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-blue-200 line-through opacity-60">
                            {isAnnual ? "€6.66" : "€7.99"}
                        </span>
                        <span className="text-xs text-blue-200 bg-red-500/20 px-2 py-0.5 rounded-full font-bold">
                            -{isAnnual ? "38%" : "38%"}
                        </span>
                    </div>
                    
                    {/* Current Discounted Price */}
                    <div className="flex items-baseline gap-1">
                        <span className="text-6xl font-black text-white tracking-tight">
                            {isAnnual ? "€4.16" : "€4.99"}
                        </span>
                        <span className="text-blue-100 font-medium text-xl">/mês</span>
                    </div>
                </div>
                
                {isAnnual && (
                  <p className="text-xs text-blue-100 bg-black/20 px-3 py-1.5 rounded-lg inline-block mt-2 font-medium backdrop-blur-sm">
                    Cobrado anualmente (€49.99/ano)
                  </p>
                )}
            </CardHeader>
            <CardContent className="p-8 pt-4 flex-1 relative z-10">
                <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                        <div className="bg-white/20 p-1 rounded-full backdrop-blur-sm">
                            <Check className="w-3 h-3 text-white shrink-0" strokeWidth={3} />
                        </div>
                        <span className="text-white font-medium text-lg leading-tight">Ativos e Dividendos Ilimitados</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <div className="bg-white/20 p-1 rounded-full backdrop-blur-sm">
                            <Check className="w-3 h-3 text-white shrink-0" strokeWidth={3} />
                        </div>
                        <span className="text-white font-medium text-lg leading-tight">Hábitos e Rotinas Ilimitados</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <div className="bg-white/20 p-1 rounded-full backdrop-blur-sm">
                            <Check className="w-3 h-3 text-white shrink-0" strokeWidth={3} />
                        </div>
                        <span className="text-white font-medium text-lg leading-tight">Projeção Futura de Dividendos</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <div className="bg-white/20 p-1 rounded-full backdrop-blur-sm">
                            <Check className="w-3 h-3 text-white shrink-0" strokeWidth={3} />
                        </div>
                        <span className="text-white font-medium text-lg leading-tight">Loop AI Coach (Dicas Personalizadas)</span>
                    </li>
                </ul>
            </CardContent>
            <CardFooter className="p-8 pt-0 relative z-10 flex flex-col items-center">
                <Button 
                    onClick={handleUpgrade}
                    disabled={isLoading}
                    className="w-full h-14 text-lg font-bold rounded-xl bg-white text-purple-600 hover:bg-slate-50 transition-all shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
                >
                    {isLoading ? "A carregar..." : "Começar Agora"} <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <p className="text-center w-full text-xs text-blue-100 mt-4 opacity-80 font-medium">
                    Cancela a qualquer momento. Sem fidelização.
                </p>
            </CardFooter>
         </Card>
      </div>

      {/* FAQ ou Social Proof (Opcional - mas dá credibilidade) */}
      <div className="mt-20 text-center border-t border-slate-100 dark:border-slate-800 pt-12">
        <h3 className="text-slate-500 mb-6 font-bold uppercase text-xs tracking-wider">Junta-te a milhares de investidores</h3>
        <div className="flex justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all">
             {/* Placeholders de logos de "Confiança" */}
             <Shield className="w-8 h-8 text-slate-400" />
             <Smartphone className="w-8 h-8 text-slate-400" />
             <Star className="w-8 h-8 text-slate-400" />
        </div>
      </div>

    </div>
  )
}

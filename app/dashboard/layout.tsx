"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { LayoutDashboard, Repeat, LogOut, Menu, X, TrendingUp, Sparkles, Wallet } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signOut()
    router.refresh()
    router.push("/login")
  }

  const navItems = [
    { href: "/dashboard", label: "Visão Geral", icon: LayoutDashboard },
    { href: "/dashboard/habits", label: "Hábitos", icon: Repeat },
    { href: "/dashboard/finance", label: "Finanças", icon: Wallet },
  ]

  return (
    <div className="flex h-screen bg-[#FAFAFA] dark:bg-[#09090b] transition-colors duration-300 font-sans text-slate-900 dark:text-slate-100">
      
      {/* --- SIDEBAR DESKTOP (EXPANDABLE) --- */}
      <aside className="hidden md:flex flex-col fixed inset-y-0 z-50 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 
        w-[88px] hover:w-[280px] transition-all duration-300 ease-in-out group overflow-hidden shadow-sm hover:shadow-2xl">
        
        {/* Logo */}
        <div className="h-24 flex items-center px-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-2.5 rounded-xl shadow-lg shadow-blue-500/20 flex-shrink-0">
                <TrendingUp size={24} strokeWidth={2.5} />
            </div>
            {/* Texto do Logo (Só aparece no hover) */}
            <span className="text-2xl font-extrabold tracking-tight opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap delay-75">
              Loop.
            </span>
          </div>
        </div>

        {/* Navegação */}
        <div className="flex-1 px-4 py-4 space-y-2 overflow-y-auto hide-scrollbar">
            <p className="px-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap text-center group-hover:text-left">
              Menu
            </p>
          
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link 
                key={item.href}
                href={item.href} 
                className={`flex items-center px-3.5 py-3.5 rounded-xl transition-all duration-200 relative
                  ${isActive 
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" 
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                  }`}
              >
                <item.icon size={22} className={`flex-shrink-0 transition-colors ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500"}`} strokeWidth={isActive ? 2.5 : 2} />
                
                {/* Texto do Link (Desliza e aparece) */}
                <span className={`ml-4 font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 ${isActive ? "font-bold" : ""}`}>
                  {item.label}
                </span>

                {/* Indicador Ativo (Pequeno ponto azul quando fechado) */}
                {isActive && (
                   <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full group-hover:opacity-0 transition-opacity" />
                )}
              </Link>
            )
          })}
        </div>

        {/* Rodapé (Banner Pro + Logout) */}
        <div className="p-4 space-y-4 flex-shrink-0">
           
           {/* Banner Pro (Desaparece quando fechado) */}
           <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-4 text-white relative overflow-hidden opacity-0 group-hover:opacity-100 h-0 group-hover:h-auto transition-all duration-300 w-0 group-hover:w-full">
              <div className="w-[200px]"> {/* Wrapper para fixar largura do conteudo */}
                <Sparkles className="absolute top-2 right-2 text-yellow-400 opacity-50" />
                <p className="font-bold mb-1 text-sm">Loop Pro</p>
                <p className="text-[10px] text-slate-300 mb-3 leading-tight">Desbloqueia gráficos avançados.</p>
                <button className="text-[10px] bg-white text-slate-900 font-bold px-3 py-1.5 rounded-lg w-full hover:bg-slate-100 transition-colors">Ver Planos</button>
              </div>
           </div>

           <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="px-1 pb-3 flex justify-center group-hover:justify-between items-center transition-all">
                    <span className="text-xs font-medium text-slate-500 hidden group-hover:block whitespace-nowrap">Tema</span>
                    <ModeToggle />
                </div>
                
                <button 
                    onClick={handleSignOut}
                    className="flex items-center justify-center group-hover:justify-start px-3 py-2.5 w-full text-sm font-medium text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors group/logout"
                >
                    <LogOut size={20} className="flex-shrink-0 group-hover/logout:stroke-red-600 dark:group-hover/logout:stroke-red-400 transition-colors" />
                    <span className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Sair</span>
                </button>
           </div>
        </div>
      </aside>

      {/* --- SIDEBAR MOBILE (Permanece igual) --- */}
      <div className={`md:hidden fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 ${isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={() => setIsMobileMenuOpen(false)}></div>
      
      <aside className={`md:hidden fixed inset-y-0 left-0 z-50 w-[280px] bg-white dark:bg-slate-950 shadow-2xl transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
         <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
                <div className="bg-blue-600 text-white p-1.5 rounded-lg"><TrendingUp size={20} /></div>
                <span className="font-bold text-xl">Loop.</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                <X className="w-5 h-5" />
            </Button>
         </div>
         <nav className="p-4 space-y-1">
            {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                <Link 
                    key={item.href} 
                    href={item.href} 
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className={`flex items-center gap-4 px-4 py-3 text-[15px] font-medium rounded-xl ${
                        isActive ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"
                    }`}
                >
                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} /> {item.label}
                </Link>
            )})}
         </nav>
      </aside>

      {/* --- ÁREA PRINCIPAL --- */}
      {/* ATENÇÃO: md:pl-[88px] alinha o conteúdo com a barra fechada */}
      <main className="flex-1 md:pl-[88px] flex flex-col h-screen overflow-hidden transition-all duration-300">
        <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:hidden flex-shrink-0 sticky top-0 z-40">
            <div className="flex items-center gap-2 font-bold text-lg">Loop.</div>
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </Button>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { LayoutDashboard, LogOut, Menu, X, TrendingUp, Sparkles, Wallet, Zap, Landmark, User, Settings } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface DashboardShellProps {
  children: React.ReactNode
  user: any
  profile: any
}

export function DashboardShell({ children, user, profile }: DashboardShellProps) {
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
    { href: "/dashboard/finance", label: "Finanças", icon: Wallet },
    { href: "/dashboard/networth", label: "Património", icon: Landmark },
    { href: "/dashboard/investments", label: "Investimentos", icon: TrendingUp },
    { href: "/dashboard/focus", label: "Foco", icon: Zap },
    { href: "/dashboard/plans", label: "Planos", icon: Sparkles },
  ]

  // Initials for Avatar
  const initials = profile?.full_name 
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() 
    : user?.email?.substring(0, 2).toUpperCase() || "U"

  const avatarUrl = user?.user_metadata?.avatar_url || profile?.avatar_url

  return (
    <div className="flex h-screen bg-[#FAFAFA] dark:bg-[#09090b] transition-colors duration-300 font-sans text-slate-900 dark:text-slate-100">
      
      <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 
        w-[88px] hover:w-[280px] transition-all duration-300 ease-in-out group overflow-hidden shadow-sm hover:shadow-2xl">
        
        <div className="h-24 flex items-center px-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-2.5 rounded-xl shadow-lg shadow-blue-500/20 flex-shrink-0">
                <TrendingUp size={24} strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-extrabold tracking-tight opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap delay-75">
              Loop.
            </span>
          </div>
        </div>

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
                
                <span className={`ml-4 font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 ${isActive ? "font-bold" : ""}`}>
                  {item.label}
                </span>

                {isActive && (
                   <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full group-hover:opacity-0 transition-opacity" />
                )}
              </Link>
            )
          })}
        </div>

        <div className="p-4 flex-shrink-0">

           {profile?.subscription_tier !== 'pro' && (
             <div className="mb-3 overflow-hidden max-h-0 group-hover:max-h-40 transition-all duration-300 ease-in-out">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-4 text-white relative overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                  <div className="w-[200px]">
                    <Sparkles className="absolute top-2 right-2 text-yellow-400 opacity-50" />
                    <p className="font-bold mb-1 text-sm">Loop Pro</p>
                    <p className="text-[10px] text-slate-300 mb-3 leading-tight">Desbloqueia gráficos avançados.</p>
                    <Link href="/dashboard/plans">
                        <button className="text-[10px] bg-white text-slate-900 font-bold px-3 py-1.5 rounded-lg w-full hover:bg-slate-100 transition-colors">Ver Planos</button>
                    </Link>
                  </div>
                </div>
             </div>
           )}

           <div className="space-y-1">
                
                <div className="flex items-center justify-between p-2 mx-1 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group/user-row relative">
                    
                    <Link href="/dashboard/settings" className="flex items-center flex-1 min-w-0 mr-2">
                        <div className="relative flex-shrink-0">
                            <Avatar className="h-9 w-9 border-2 border-white dark:border-slate-800 shadow-sm transition-transform group-hover/user-row:scale-105">
                                <AvatarImage src={avatarUrl} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-[10px] font-bold">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-900"></div>
                        </div>
                        
                        <div className="ml-3 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-0 group-hover:w-auto">
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{profile?.full_name || "Utilizador"}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Configurações</p>
                        </div>
                    </Link>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-10 group-hover:translate-x-0">
                         <ModeToggle />
                    </div>
                </div>
                
                <button 
                    onClick={handleSignOut}
                    className="flex items-center px-3 py-2.5 mx-1 w-[calc(100%-8px)] text-sm font-medium text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors group/logout overflow-hidden whitespace-nowrap"
                >
                    <LogOut size={20} className="flex-shrink-0 group-hover/logout:stroke-red-600 dark:group-hover/logout:stroke-red-400 transition-colors" />
                    <span className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">Sair</span>
                </button>
           </div>
        </div>
      </aside>

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
         
         <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
             <Link href="/dashboard/settings" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-slate-200 dark:border-slate-700">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback className="bg-blue-600 text-white text-xs">{initials}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{profile?.full_name || "Utilizador"}</p>
                    <p className="text-xs text-slate-500">Ver Definições</p>
                </div>
             </Link>
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

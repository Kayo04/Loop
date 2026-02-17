import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { User, CreditCard, Globe, LogOut, Loader2, Sparkles, ShieldCheck, Mail, Wallet, Calendar, MessageSquare } from "lucide-react"
import { updateProfile } from "../actions"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CancelSubscriptionDialog } from "@/components/cancel-subscription-dialog"
import Link from "next/link"

export const metadata = {
  title: "Definições | Loop Finance",
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const currentTier = profile?.subscription_tier || 'free'
  const currentCurrency = profile?.currency || 'EUR'
  const subscriptionStatus = profile?.subscription_status || 'free'
  const billingCycle = profile?.billing_cycle || 'monthly'
  const subscriptionStartDate = profile?.subscription_start_date
  const initials = profile?.full_name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || "U"

  // Calculate next billing date
  const getNextBillingDate = () => {
    if (!subscriptionStartDate || currentTier === 'free') return null
    const startDate = new Date(subscriptionStartDate)
    const today = new Date()
    const monthsToAdd = billingCycle === 'yearly' ? 12 : 1
    
    let nextBilling = new Date(startDate)
    while (nextBilling < today) {
      nextBilling.setMonth(nextBilling.getMonth() + monthsToAdd)
    }
    return nextBilling
  }

  const nextBillingDate = getNextBillingDate()
  const formattedNextBilling = nextBillingDate 
    ? nextBillingDate.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  return (
    <div className="flex flex-col gap-8 pb-10 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
       
       {/* HEADER SECTION */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
              Definições da Conta
            </h1>
            <p className="text-muted-foreground mt-1">Gere o teu perfile, subscrição e preferências.</p>
          </div>
          <form action="/auth/signout" method="post">
               <Button variant="ghost" className="gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
                   <LogOut className="w-4 h-4" /> Terminar Sessão
               </Button>
           </form>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN (Profile & General) */}
          <div className="md:col-span-2 space-y-8">
              
              {/* PROFILE CARD */}
              <Card className="border-none shadow-lg bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                  <CardHeader className="flex flex-row items-center gap-4">
                     <div className="relative">
                        <Avatar className="w-16 h-16 border-2 border-white dark:border-slate-800 shadow-md">
                            <AvatarImage src={user.user_metadata?.avatar_url} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-xl">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900"></div>
                     </div>
                     <div className="space-y-1">
                        <CardTitle className="text-xl">O Teu Perfil</CardTitle>
                        <CardDescription>Informações visíveis na tua conta.</CardDescription>
                     </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                     <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-muted-foreground">
                                <User className="w-4 h-4" /> Nome Completo
                            </Label>
                            <Input value={profile?.full_name || "Sem nome"} disabled className="bg-slate-50/50 dark:bg-slate-950/50 font-medium" />
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="w-4 h-4" /> Email
                            </Label>
                            <Input value={user.email || ""} disabled className="bg-slate-50/50 dark:bg-slate-950/50 font-medium opacity-80" />
                        </div>
                     </div>
                  </CardContent>
              </Card>

              {/* LOCALE / CURRENCY CARD */}
              <Card className="border-none shadow-lg bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                  <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-emerald-500" />
                        Regionalização
                     </CardTitle>
                     <CardDescription>Define a moeda e formato para os teus dados financeiros.</CardDescription>
                  </CardHeader>
                  <CardContent>
                     <form action={updateProfile} className="flex flex-col gap-6">
                        <div className="space-y-2 w-full">
                           <Label htmlFor="currency">Moeda Principal</Label>
                           <Select name="currency" defaultValue={currentCurrency}>
                              <SelectTrigger className="w-full bg-slate-50/50 dark:bg-slate-950/50">
                                 <SelectValue placeholder="Selecione a moeda" />
                              </SelectTrigger>
                              <SelectContent>
                                 <SelectItem value="EUR">🇪🇺 Euro (EUR)</SelectItem>
                                 <SelectItem value="USD">🇺🇸 Dólar Americano (USD)</SelectItem>
                              </SelectContent>
                           </Select>
                           <p className="text-xs text-muted-foreground">Isto altera o símbolo monetário em todo o dashboard.</p>
                        </div>
                        <div className="flex justify-end w-full">
                            <Button type="submit" className="w-full md:w-auto bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800">
                                Atualizar Preferências
                            </Button>
                        </div>
                     </form>
                  </CardContent>
              </Card>
          </div>

          {/* RIGHT COLUMN (Subscription) */}
          <div className="md:col-span-1 space-y-8">
             <Card className={`relative overflow-hidden border-2 shadow-xl ${currentTier === 'pro' ? 'border-purple-500/30 bg-gradient-to-br from-slate-900 to-slate-800 text-white' : 'border-slate-200 dark:border-slate-800'}`}>
                
                {/* Background Effects for PRO */}
                {currentTier === 'pro' && (
                    <>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>
                    </>
                )}

                <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                        <div className={`p-2 rounded-lg ${currentTier === 'pro' ? 'bg-white/10' : 'bg-purple-100 dark:bg-purple-900/20'}`}>
                            <Sparkles className={`w-5 h-5 ${currentTier === 'pro' ? 'text-yellow-400' : 'text-purple-600'}`} />
                        </div>
                        {currentTier === 'pro' && (
                            <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full text-[10px] font-bold tracking-wider uppercase">Pro Member</span>
                        )}
                    </div>
                    <CardTitle className="text-2xl">
                        {currentTier === 'pro' ? 'Plano Pro' : 'Plano Gratuito'}
                    </CardTitle>
                    <CardDescription className={currentTier === 'pro' ? 'text-slate-300' : ''}>
                        {currentTier === 'pro' 
                            ? 'Tens acesso a todas as funcionalidades premium.' 
                            : 'Estás a usar a versão básica do Loop.'
                        }
                    </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                    <div className={`space-y-3 text-sm ${currentTier === 'pro' ? 'text-slate-200' : 'text-slate-600 dark:text-slate-400'}`}>
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 opacity-70" />
                            <span>Ativos Ilimitados</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Wallet className="w-4 h-4 opacity-70" />
                            <span>Gestão de Património Avançada</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 opacity-70" />
                            <span>Multi-moeda</span>
                        </div>
                    </div>

                    {currentTier === 'pro' && formattedNextBilling && subscriptionStatus === 'active' && (
                        <div className="pt-4 border-t border-white/10 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-slate-300">
                                    <Calendar className="w-4 h-4" />
                                    <span>Próxima Cobrança</span>
                                </div>
                                <span className="font-semibold text-white">{formattedNextBilling}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-300">Ciclo de Faturação</span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-bold text-white border border-white/20">
                                    {billingCycle === 'yearly' ? (
                                        <>
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            Anual
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Mensal
                                        </>
                                    )}
                                </span>
                            </div>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex-col gap-2">
                    {currentTier === 'pro' && subscriptionStatus === 'active' ? (
                        <CancelSubscriptionDialog />
                    ) : currentTier === 'pro' && subscriptionStatus === 'cancelled' ? (
                        <div className="w-full text-center py-2">
                            <div className="text-sm text-slate-300">Subscrição cancelada</div>
                            <div className="text-xs text-slate-400 mt-1">Acesso até {formattedNextBilling}</div>
                        </div>
                    ) : (
                        <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 transition-opacity border-0" asChild>
                            <a href="/dashboard/plans">
                                Fazer Upgrade Agora
                            </a>
                        </Button>
                    )}
                </CardFooter>
             </Card>

             {/* INFO / HELP */}
             <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 p-6 border border-slate-100 dark:border-slate-800">
                 <h3 className="font-semibold text-sm mb-2 text-slate-900 dark:text-white flex items-center gap-2">
                     <MessageSquare className="w-4 h-4" />
                     Precisas de ajuda?
                 </h3>
                 <p className="text-xs text-muted-foreground mb-4">
                     Se tiveres alguma dúvida sobre a tua conta ou faturação, entra em contacto com o suporte.
                 </p>
                 <Button variant="outline" size="sm" className="w-full text-xs h-8" asChild>
                     <Link href="/dashboard/support">
                         Contactar Suporte
                     </Link>
                 </Button>
             </div>
          </div>
       </div>
    </div>
  )
}

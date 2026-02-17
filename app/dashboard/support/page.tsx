import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Lightbulb, Bug, HelpCircle, Send } from "lucide-react"
import { submitSupportMessage } from "../actions"

export const metadata = {
  title: "Suporte | Loop Finance",
}

export default async function SupportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single()

  const categories = [
    { value: "help", label: "Preciso de Ajuda", icon: HelpCircle, color: "text-blue-500" },
    { value: "idea", label: "Tenho uma Ideia", icon: Lightbulb, color: "text-yellow-500" },
    { value: "bug", label: "Reportar Bug", icon: Bug, color: "text-red-500" },
    { value: "other", label: "Outro", icon: MessageSquare, color: "text-slate-500" },
  ]

  return (
    <div className="flex flex-col gap-8 pb-10 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
       
       <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
            Contactar Suporte
          </h1>
          <p className="text-muted-foreground">
            Tens alguma dúvida, ideia ou problema? Estamos aqui para ajudar!
          </p>
       </div>

       <Card className="border-none shadow-lg bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
          
          <CardHeader>
             <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                Envia-nos uma Mensagem
             </CardTitle>
             <CardDescription>
                Responderemos o mais rápido possível. Normalmente em 24-48 horas.
             </CardDescription>
          </CardHeader>

          <CardContent>
             <form action={submitSupportMessage} className="space-y-6">
                
                <div className="space-y-2">
                   <Label htmlFor="category">Categoria</Label>
                   <Select name="category" required>
                      <SelectTrigger className="bg-slate-50/50 dark:bg-slate-950/50">
                         <SelectValue placeholder="Seleciona uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                         {categories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                               <div className="flex items-center gap-2">
                                  <cat.icon className={`w-4 h-4 ${cat.color}`} />
                                  {cat.label}
                               </div>
                            </SelectItem>
                         ))}
                      </SelectContent>
                   </Select>
                </div>

                <div className="space-y-2">
                   <Label htmlFor="subject">Assunto</Label>
                   <Input
                      id="subject"
                      name="subject"
                      placeholder="Descreve brevemente o teu pedido"
                      required
                      className="bg-slate-50/50 dark:bg-slate-950/50"
                   />
                </div>

                <div className="space-y-2">
                   <Label htmlFor="message">Mensagem</Label>
                   <Textarea
                      id="message"
                      name="message"
                      placeholder="Descreve em detalhe a tua questão, ideia ou problema..."
                      required
                      rows={8}
                      className="bg-slate-50/50 dark:bg-slate-950/50 resize-none"
                   />
                   <p className="text-xs text-muted-foreground">
                      Quanto mais detalhes forneceres, melhor poderemos ajudar!
                   </p>
                </div>

                <div className="flex justify-end">
                   <Button type="submit" className="gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900">
                      <Send className="w-4 h-4" />
                      Enviar Mensagem
                   </Button>
                </div>
             </form>
          </CardContent>
       </Card>

       <Card className="border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <CardHeader>
             <CardTitle className="text-lg">Outras Formas de Contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
             <div>
                <p className="font-medium">Email Direto</p>
                <p className="text-muted-foreground">support@loop.com</p>
             </div>
             <div>
                <p className="font-medium">Horário de Suporte</p>
                <p className="text-muted-foreground">24/7 - Sempre disponível</p>
             </div>
          </CardContent>
       </Card>
    </div>
  )
}

"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Lightbulb, Bug, HelpCircle, Send, CheckCircle2, Loader2 } from "lucide-react"
import { submitSupportMessage } from "@/app/dashboard/actions"

const categories = [
  { value: "help", label: "Preciso de Ajuda", icon: HelpCircle, color: "text-blue-500" },
  { value: "idea", label: "Tenho uma Ideia", icon: Lightbulb, color: "text-yellow-500" },
  { value: "bug", label: "Reportar Bug", icon: Bug, color: "text-red-500" },
  { value: "other", label: "Outro", icon: MessageSquare, color: "text-slate-500" },
]

export function SupportForm() {
  const [isPending, startTransition] = useTransition()
  const [sent, setSent] = useState(false)
  const [category, setCategory] = useState("")

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      await submitSupportMessage(formData)
      setSent(true)
    })
  }

  if (sent) {
    return (
      <Card className="border-none shadow-lg bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <CardContent className="flex flex-col items-center justify-center gap-4 py-16">
          <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-4">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-xl font-semibold">Mensagem enviada!</h2>
          <p className="text-muted-foreground text-center max-w-sm">
            Recebemos a tua mensagem e iremos responder o mais breve possível. Obrigado pelo contacto!
          </p>
          <Button
            variant="outline"
            className="mt-2"
            onClick={() => { setSent(false); setCategory("") }}
          >
            Enviar outra mensagem
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-none shadow-lg bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
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
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select name="category" required value={category} onValueChange={setCategory}>
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
              disabled={isPending}
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
              disabled={isPending}
              className="bg-slate-50/50 dark:bg-slate-950/50 resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Quanto mais detalhes forneceres, melhor poderemos ajudar!
            </p>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isPending}
              className="gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  A enviar...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar Mensagem
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

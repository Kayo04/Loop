import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { SupportForm } from "@/components/support/support-form"

export const metadata = {
  title: "Suporte | Loop Finance",
}

export default async function SupportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

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

      <SupportForm />
    </div>
  )
}

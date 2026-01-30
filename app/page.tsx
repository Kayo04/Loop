import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase-server"

export default async function Home() {
  // 1. Liga ao Supabase
  const supabase = await createClient()

  // 2. Vê se o utilizador existe
  const { data: { user } } = await supabase.auth.getUser()

  // 3. Redirecionamento Inteligente
  if (user) {
    // Se já tem conta aberta, vai direto ao trabalho
    redirect("/dashboard")
  } else {
    // Se não, vai para o login
    redirect("/login")
  }
} 
"use server"

import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

// 1. Criar um novo Hábito
export async function createHabit(formData: FormData) {
  const supabase = await createClient()
  const title = formData.get("title") as string
  
  if (!title) return

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from("habits").insert({
    title,
    user_id: user.id,
  })

  revalidatePath("/dashboard") // Atualiza a página automaticamente
}

// 2. Apagar um Hábito
export async function deleteHabit(habitId: string) {
  const supabase = await createClient()
  await supabase.from("habits").delete().eq("id", habitId)
  revalidatePath("/dashboard")
}

// 3. Marcar/Desmarcar como Feito (Toggle)
export async function toggleHabit(habitId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const today = new Date().toISOString().split("T")[0] // Data formato YYYY-MM-DD

  // Verifica se já foi feito hoje
  const { data: existingLog } = await supabase
    .from("habit_logs")
    .select("id")
    .eq("habit_id", habitId)
    .eq("completed_at", today)
    .single()

  if (existingLog) {
    // Se já existe, apaga (Desmarcar)
    await supabase.from("habit_logs").delete().eq("id", existingLog.id)
  } else {
    // Se não existe, cria (Marcar como feito)
    await supabase.from("habit_logs").insert({
      habit_id: habitId,
      user_id: user.id,
      completed_at: today
    })
  }

  revalidatePath("/dashboard")
}
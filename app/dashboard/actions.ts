"use server"

import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

// --- HELPER DE ACESSO ---
export async function getUserTier(userId: string) {
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", userId)
    .single()

  return profile?.subscription_tier || 'free'
}

// 1. Criar um novo Hábito
export async function createHabit(formData: FormData) {
  const supabase = await createClient()
  const title = formData.get("title") as string

  if (!title) return

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // VERIFICAÇÃO DE LIMITES (FREE = MAX 5)
  const tier = await getUserTier(user.id)
  if (tier === 'free') {
    const { count } = await supabase
      .from("habits")
      .select("*", { count: 'exact', head: true })
      .eq("user_id", user.id)

    if (count && count >= 5) {
      // Retornar erro ou lidar com UI feedback (por agora silencioso ou toast se implementado)
      // Idealmente passariamos estado para o cliente mostrando erro.
      // Como é server action pura, vamos apenas abortar para segurança.
      return { error: "Limite de 5 hábitos atingido. Faça upgrade." }
    }
  }

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
export async function toggleHabit(habitId: string, date?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const targetDate = date || new Date().toISOString().split("T")[0] // Data específica ou hoje

  // Verifica se já foi feito nessa data
  const { data: existingLog } = await supabase
    .from("habit_logs")
    .select("id")
    .eq("habit_id", habitId)
    .eq("completed_at", targetDate)
    .single()

  if (existingLog) {
    // Se já existe, apaga (Desmarcar)
    await supabase.from("habit_logs").delete().eq("id", existingLog.id)
  } else {
    // Se não existe, cria (Marcar como feito)
    await supabase.from("habit_logs").insert({
      habit_id: habitId,
      user_id: user.id,
      completed_at: targetDate
    })
  }

  revalidatePath("/dashboard")
}

// 4. Update Profile (Currency, etc.)
export async function updateProfile(formData: FormData) {
  "use server" // Ensure it's treated as a server action if called directly
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const currency = formData.get("currency") as string

  if (currency) {
    await supabase
      .from("profiles")
      .update({ currency })
      .eq("id", user.id)
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/settings")
  return { success: true }
}
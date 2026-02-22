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
  "use server"
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
}

// 5. Cancel Subscription
export async function cancelSubscription() {
  "use server"
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Get user profile for email and Stripe subscription ID
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, subscription_start_date, billing_cycle, stripe_subscription_id")
    .eq("id", user.id)
    .single()

  // Cancel in Stripe at period end (user keeps access until billing date)
  if (profile?.stripe_subscription_id) {
    try {
      const { stripe } = await import("@/lib/stripe")

      // Cancel at period end - user keeps access until next billing date
      await stripe.subscriptions.update(profile.stripe_subscription_id, {
        cancel_at_period_end: true,
      })
    } catch (error) {
      console.error("Error cancelling Stripe subscription:", error)
      // Continue with database update even if Stripe fails
    }
  }

  // Update database to mark as cancelled (but keep tier until period ends)
  await supabase
    .from("profiles")
    .update({
      subscription_status: 'cancelled',
      // Keep tier as 'pro' - Stripe webhook will change to 'free' when period ends
    })
    .eq("id", user.id)

  // Send cancellation email
  if (profile?.email) {
    const { sendCancellationEmail } = await import("@/lib/send-email")

    // Calculate access until date (end of current billing period)
    const startDate = profile.subscription_start_date ? new Date(profile.subscription_start_date) : new Date()
    const accessUntil = new Date(startDate)
    const monthsToAdd = profile.billing_cycle === 'yearly' ? 12 : 1
    accessUntil.setMonth(accessUntil.getMonth() + monthsToAdd)

    await sendCancellationEmail({
      email: profile.email,
      name: profile.full_name || 'Utilizador',
      accessUntil: accessUntil.toLocaleDateString('pt-PT', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
    })
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/settings")
}

// 6. Submit Support Message
export async function submitSupportMessage(formData: FormData) {
  "use server"
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const subject = formData.get("subject") as string
  const message = formData.get("message") as string
  const category = formData.get("category") as string

  if (!subject || !message || !category) return

  await supabase.from("support_messages").insert({
    user_id: user.id,
    subject,
    message,
    category,
    status: 'open'
  })

  revalidatePath("/dashboard/support")
}
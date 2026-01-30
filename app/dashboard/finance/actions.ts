"use server"

import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

// ============================================
// TRANSACTION ACTIONS
// ============================================

export async function createTransaction(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    const type = formData.get("type") as string
    const amount = parseFloat(formData.get("amount") as string)
    const category = formData.get("category") as string
    const description = formData.get("description") as string
    const date = formData.get("date") as string

    if (!type || !amount || !category || !date) {
        return { error: "Missing required fields" }
    }

    const { error } = await supabase.from("transactions").insert({
        user_id: user.id,
        type,
        amount,
        category,
        description,
        date,
    })

    if (error) return { error: error.message }

    revalidatePath("/dashboard/finance")
    return { success: true }
}

export async function updateTransaction(id: string, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    const type = formData.get("type") as string
    const amount = parseFloat(formData.get("amount") as string)
    const category = formData.get("category") as string
    const description = formData.get("description") as string
    const date = formData.get("date") as string

    const { error } = await supabase
        .from("transactions")
        .update({
            type,
            amount,
            category,
            description,
            date,
            updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", user.id)

    if (error) return { error: error.message }

    revalidatePath("/dashboard/finance")
    return { success: true }
}

export async function deleteTransaction(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id)

    if (error) return { error: error.message }

    revalidatePath("/dashboard/finance")
    return { success: true }
}

// ============================================
// BUDGET ACTIONS
// ============================================

export async function setBudget(category: string, limit: number, month: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    const { error } = await supabase
        .from("budgets")
        .upsert({
            user_id: user.id,
            category,
            monthly_limit: limit,
            month,
            updated_at: new Date().toISOString(),
        }, {
            onConflict: 'user_id,category,month'
        })

    if (error) return { error: error.message }

    revalidatePath("/dashboard/finance")
    return { success: true }
}

export async function deleteBudget(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    const { error } = await supabase
        .from("budgets")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id)

    if (error) return { error: error.message }

    revalidatePath("/dashboard/finance")
    return { success: true }
}

// ============================================
// RECURRING TRANSACTION ACTIONS
// ============================================

export async function createRecurring(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    const type = formData.get("type") as string
    const amount = parseFloat(formData.get("amount") as string)
    const category = formData.get("category") as string
    const description = formData.get("description") as string
    const frequency = formData.get("frequency") as string
    const start_date = formData.get("start_date") as string

    const { error } = await supabase.from("recurring_transactions").insert({
        user_id: user.id,
        type,
        amount,
        category,
        description,
        frequency,
        start_date,
        next_occurrence: start_date,
    })

    if (error) return { error: error.message }

    revalidatePath("/dashboard/finance")
    return { success: true }
}

export async function toggleRecurring(id: string, isActive: boolean) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    const { error } = await supabase
        .from("recurring_transactions")
        .update({ is_active: isActive })
        .eq("id", id)
        .eq("user_id", user.id)

    if (error) return { error: error.message }

    revalidatePath("/dashboard/finance")
    return { success: true }
}

// ============================================
// CATEGORY ACTIONS
// ============================================

export async function createCategory(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    const name = formData.get("name") as string
    const type = formData.get("type") as string
    const emoji = formData.get("emoji") as string || "💰"
    const color = formData.get("color") as string || "#3B82F6"

    const { error } = await supabase.from("categories").insert({
        user_id: user.id,
        name,
        type,
        emoji,
        color,
    })

    if (error) return { error: error.message }

    revalidatePath("/dashboard/finance")
    return { success: true }
}

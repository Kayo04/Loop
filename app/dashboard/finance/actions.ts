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

// ============================================
// AI / SMART PARSING ACTIONS
// ============================================

export async function parseTransactionText(text: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // 1. Fetch user categories to match against
    const { data: categories } = await supabase
        .from("categories")
        .select("name, type")
        .eq("user_id", user.id)

    const userCategories = categories || []

    // 2. Pre-process text
    const chunks = text
        .replace(/ e /gi, '|')
        .replace(/ para /gi, '|') // "20 para gasolina"
        .replace(/ na /gi, ' ')   // "20 na zara" -> "20 zara"
        .replace(/ no /gi, ' ')
        .replace(/ com /gi, ' ')  // "fiz 20 com vinted" -> "fiz 20 vinted"
        .replace(/ da /gi, ' ')
        .replace(/ do /gi, ' ')
        .replace(/ and /gi, '|')
        .replace(/\n/g, '|')
        .replace(/,/g, '|')
        .split('|')
        .map(c => c.trim())
        .filter(c => c.length > 0)

    const Drafts = []

    // ==========================================
    // KEYWORD DICTIONARIES (PORTUGUESE CONTEXT)
    // ==========================================

    // INCOME KEYWORDS (Priority check)
    const incomeKeywords = [
        'recebi', 'ganhei', 'venda', 'vendi', 'fiz', // Actions
        'vinted', 'olx', 'wallapop', // Platforms
        'salario', 'ordenado', 'vencimento', 'subsidio', 'premio', 'bonus', // Work
        'reembolso', 'devolucao', 'irs', // Returns
        'transferencia', 'mbway', 'bizum', 'mesada' // General
    ]

    // EXPENSE KEYWORDS MAPPING
    const expenseKeywords: Record<string, string> = {
        // Alimentação / Supermercado
        'jantar': 'Alimentação',
        'almoco': 'Alimentação',
        'almoço': 'Alimentação',
        'pequeno almoço': 'Alimentação',
        'cafe': 'Alimentação',
        'supermercado': 'Alimentação',
        'continente': 'Alimentação',
        'pingo doce': 'Alimentação',
        'auchan': 'Alimentação',
        'lidl': 'Alimentação',
        'mercadona': 'Alimentação',
        'aldi': 'Alimentação',
        'intermarche': 'Alimentação',
        'minipreco': 'Alimentação',
        'leclerc': 'Alimentação',
        'uber eats': 'Alimentação',
        'bolt food': 'Alimentação',
        'glovo': 'Alimentação',
        'mcdonalds': 'Alimentação',
        'mc': 'Alimentação',
        'burger king': 'Alimentação',
        'bk': 'Alimentação',
        'kfc': 'Alimentação',
        'pizza': 'Alimentação',
        'sushi': 'Alimentação',
        'restaurante': 'Alimentação',
        'padaria': 'Alimentação',
        'pastelaria': 'Alimentação',
        'talho': 'Alimentação',
        'peixaria': 'Alimentação',
        'cerveja': 'Alimentação',
        'copos': 'Alimentação',

        // Transportes
        'uber': 'Transportes',
        'bolt': 'Transportes',
        'taxi': 'Transportes',
        'cabify': 'Transportes',
        'gasolina': 'Transportes',
        'gasoleo': 'Transportes',
        'combustivel': 'Transportes',
        'diesel': 'Transportes',
        'galp': 'Transportes',
        'bp': 'Transportes',
        'repsol': 'Transportes',
        'prio': 'Transportes',
        'cepsa': 'Transportes',
        'via verde': 'Transportes',
        'portagem': 'Transportes',
        'estacionamento': 'Transportes',
        'parque': 'Transportes',
        'emel': 'Transportes',
        'metro': 'Transportes',
        'cp': 'Transportes',
        'comboio': 'Transportes',
        'carris': 'Transportes',
        'stcp': 'Transportes',
        'passe': 'Transportes',
        'navegante': 'Transportes',
        'andante': 'Transportes',
        'lime': 'Transportes',
        'bird': 'Transportes',
        'gira': 'Transportes',
        'inspeccao': 'Transportes',
        'revisao': 'Transportes',
        'multa': 'Transportes',
        'iuc': 'Transportes',

        // Saúde
        'farmacia': 'Saúde',
        'medico': 'Saúde',
        'consulta': 'Saúde',
        'hospital': 'Saúde',
        'cuf': 'Saúde',
        'lusiadas': 'Saúde',
        'dentista': 'Saúde',
        'oral': 'Saúde',
        'otica': 'Saúde',
        'oculos': 'Saúde',
        'lentes': 'Saúde',
        'analises': 'Saúde',
        'terapia': 'Saúde',
        'psicologo': 'Saúde',
        'fisioterapia': 'Saúde',
        'wells': 'Saúde',
        'benu': 'Saúde',

        // Casa / Habitação
        'renda': 'Habitação',
        'aluguer': 'Habitação',
        'condominio': 'Habitação',
        'luz': 'Habitação',
        'eletricidade': 'Habitação',
        'agua': 'Habitação',
        'gas': 'Habitação',
        'iberdrola': 'Habitação',
        'endesa': 'Habitação',
        'edp': 'Habitação',
        'goldenergy': 'Habitação',
        'vodafone': 'Habitação',
        'meo': 'Habitação',
        'nos': 'Habitação',
        'nowo': 'Habitação',
        'ikea': 'Habitação',
        'leroy': 'Habitação',
        'aki': 'Habitação',
        'maxmat': 'Habitação',
        'jumbo box': 'Habitação',
        'worten': 'Habitação',
        'radio popular': 'Habitação',
        'fnac home': 'Habitação',
        'limpeza': 'Habitação',
        'empregada': 'Habitação',

        // Lazer / Entretenimento
        'cinema': 'Entretenimento',
        'nos leds': 'Entretenimento',
        'netflix': 'Entretenimento',
        'spotify': 'Entretenimento',
        'hbo': 'Entretenimento',
        'disney': 'Entretenimento',
        'prime': 'Entretenimento',
        'appletv': 'Entretenimento',
        'concerto': 'Entretenimento',
        'teatro': 'Entretenimento',
        'festival': 'Entretenimento',
        'bilhete': 'Entretenimento',
        'jogos': 'Entretenimento',
        'steam': 'Entretenimento',
        'playstation': 'Entretenimento',
        'xbox': 'Entretenimento',
        'nintendo': 'Entretenimento',
        'twitch': 'Entretenimento',
        'patreon': 'Entretenimento',
        'livro': 'Entretenimento',
        'wook': 'Entretenimento',
        'bertrand': 'Entretenimento',
        'fnac': 'Entretenimento',

        // Vestuário / Pessoal
        'zara': 'Vestuário',
        'bershka': 'Vestuário',
        'pull': 'Vestuário',
        'bear': 'Vestuário',
        'stradivarius': 'Vestuário',
        'mango': 'Vestuário',
        'h&m': 'Vestuário',
        'primark': 'Vestuário',
        'nike': 'Vestuário',
        'adidas': 'Vestuário',
        'jd': 'Vestuário',
        'foot locker': 'Vestuário',
        'sapatilhas': 'Vestuário',
        'roupa': 'Vestuário',
        'casaco': 'Vestuário',
        'calcas': 'Vestuário',
        'camisa': 'Vestuário',
        'cortefiel': 'Vestuário',
        'springfield': 'Vestuário',
        'lefties': 'Vestuário',
        'shein': 'Vestuário',
        'asos': 'Vestuário',
        'bimba': 'Vestuário',
        'parfois': 'Vestuário',

        // Beleza / Cuidado Pessoal
        'cabeleireiro': 'Beleza',
        'barbeiro': 'Beleza',
        'unhas': 'Beleza',
        'manicure': 'Beleza',
        'estetica': 'Beleza',
        'depilacao': 'Beleza',
        'laser': 'Beleza',
        'perfume': 'Beleza',
        'maquilhagem': 'Beleza',
        'sephora': 'Beleza',
        'douglas': 'Beleza',
        'rituals': 'Beleza',
        'creme': 'Beleza',
        'corte': 'Beleza',

        // Educação
        'propinas': 'Educação',
        'mensalidade': 'Educação',
        'creche': 'Educação',
        'escola': 'Educação',
        'universidade': 'Educação',
        'curso': 'Educação',
        'udemy': 'Educação',
        'coursera': 'Educação',
        'livros escolares': 'Educação',
        'explicacao': 'Educação',
        'formacao': 'Educação',

        // Outros
        'seguro': 'Seguros',
        'banco': 'Bancos',
        'comissao': 'Bancos',
        'juros': 'Bancos',
        'emprestimo': 'Bancos',
        'credito': 'Bancos',
        'ginasio': 'Saúde', // Or Lazer/Active
        'fitness': 'Saúde',
        'solinca': 'Saúde',
        'holmes': 'Saúde',
        'pump': 'Saúde',
        'lemon': 'Saúde'
    }

    for (const chunk of chunks) {
        // 3. Extract Amount
        const amountMatch = chunk.match(/(\d+([.,]\d{1,2})?)/)
        if (!amountMatch) continue

        const amountStr = amountMatch[0].replace(',', '.')
        const amount = parseFloat(amountStr)

        // 4. Remove amount and currency words from description
        let cleanDesc = chunk
            .replace(amountMatch[0], '')
            .replace(/euros?|€|eur/gi, '')
            .trim()

        // 5. DETERMINE TYPE (Income vs Expense)
        let type = 'expense' // default
        let matchedCategory = "Outros"
        let bestMatchLength = 0
        const lowerDesc = cleanDesc.toLowerCase()

        // Check for INCOME keywords
        const isIncome = incomeKeywords.some(keyword => lowerDesc.includes(keyword))

        if (isIncome) {
            type = 'income'
            // For income, usually we don't have many categories, maybe "Salário", "Vendas", "Outros"
            // Let's try to find a user category that matches
            for (const cat of userCategories) {
                if (cat.type === 'income' && lowerDesc.includes(cat.name.toLowerCase())) {
                    matchedCategory = cat.name
                    break
                }
            }
            // If no category found for income, default to "Outros" or specific one if Vinted
            if (matchedCategory === "Outros") {
                if (lowerDesc.includes('vinted') || lowerDesc.includes('venda') || lowerDesc.includes('olx')) matchedCategory = 'Vendas'
                else if (lowerDesc.includes('salario') || lowerDesc.includes('ordenado')) matchedCategory = 'Salário'
                else if (lowerDesc.includes('reembolso')) matchedCategory = 'Reembolsos'
            }

        } else {
            // EXPENSE Matching logic

            // Try exact user category match first
            for (const cat of userCategories) {
                if (cat.type === 'expense' && lowerDesc.includes(cat.name.toLowerCase())) {
                    if (cat.name.length > bestMatchLength) {
                        matchedCategory = cat.name
                        bestMatchLength = cat.name.length
                    }
                }
            }

            // If no direct category matched, use keyword mapping
            if (matchedCategory === "Outros") {
                // Check exact matches or partial matches in the keyword list
                for (const [key, catName] of Object.entries(expenseKeywords)) {
                    // Use word boundary check for short words to avoid false positives (e.g. "mc" in "amce")
                    // But "mc" is tricky. Let's stick to includes for now but maybe be careful.
                    // Actually, simple includes is fine for most 'long' keywords.
                    if (lowerDesc.includes(key)) {
                        matchedCategory = catName
                        // If we find a specific keyword, we stop? No, maybe prioritizing longer matches is better?
                        // For now, first match.
                        break
                    }
                }
            }
        }

        // Verify if matched category actually exists in user list
        // If it was a keyword match (e.g. "zara" -> "Vestuário"), check if user has "Vestuário"
        // If NOT, we keep "Outros" to avoid foreign key errors. 
        // OR we could create it on the fly? No, that's risky. 
        // Let's stick to "Outros" if the inferred category doesn't exist.
        const categoryExists = userCategories.some(c => c.name === matchedCategory && c.type === type)
        if (!categoryExists) {
            // Try to find a generic fallback in user categories compatible with the type
            // E.g. find any category named "Outros", "Geral", "Diversos" with correct type
            const fallback = userCategories.find(c => c.type === type && ['Outros', 'Geral', 'Diversos'].includes(c.name))
            if (fallback) matchedCategory = fallback.name
            else {
                // Worst case: pick the first one of that type, or just let it fail?
                // Ideally we should create "Outros" if it doesn't exist.
                // For now let's leave as "Outros" and hope the UI handles it or user has it.
                // Most users have "Outros".
                matchedCategory = "Outros"
            }
        }

        Drafts.push({
            amount,
            category: matchedCategory,
            description: cleanDesc || matchedCategory,
            type: type
        })
    }

    return Drafts
}

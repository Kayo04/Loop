"use server"

import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"
import { fetchStockData } from "./stock-service"

// 1. GET ASSETS
export async function getAssets() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data } = await supabase
        .from("assets")
        .select("*")
        .eq("user_id", user.id)
        .neq("type", "other") // Exclude fixed assets
        .order("quantity", { ascending: false })

    return data || []
}

// 1.1 GET ALL ASSETS (For Net Worth - includes Fixed Assets)
export async function getAllAssets() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data } = await supabase
        .from("assets")
        .select("*")
        .eq("user_id", user.id)
        // No filter on type, we want everything
        .order("quantity", { ascending: false })

    return data || []
}


// 1.5 PREVIEW STOCK ASSET (Smart)
export async function previewStockAsset(symbol: string) {
    console.log("Server Action: previewStockAsset called with:", symbol)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    if (!symbol) return { error: "Símbolo obrigatório" }

    // Fetch user currency preference
    const { data: profile } = await supabase.from("profiles").select("currency").eq("id", user.id).single()
    const userCurrency = profile?.currency || 'EUR'

    try {
        const data = await fetchStockData(symbol, userCurrency)
        console.log("Server Action: fetchStockData result:", data ? "Success" : "Null")
        if (!data) return { error: "Ativo não encontrado ou erro ao obter cotação." }
        return { success: true, data }
    } catch (error) {
        console.error("Server Action Error:", error)
        return { error: "Erro interno ao buscar cotação." }
    }
}

// 1.5 CREATE FIXED ASSET (Manual)
export async function createFixedAsset(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    const name = formData.get("name") as string
    const value = parseFloat(formData.get("value") as string)
    const category = formData.get("category") as string // Real Estate, Vehicle, etc.

    // Fetch user currency preference
    const { data: profile } = await supabase.from("profiles").select("currency").eq("id", user.id).single()
    const userCurrency = profile?.currency || 'EUR'

    if (!name || isNaN(value)) {
        return { error: "Nome e Valor são obrigatórios." }
    }

    // Generate specific symbol for fixed assets to avoid collisions
    const symbol = `FIXED_${Date.now()}`

    const { error } = await supabase.from("assets").insert({
        user_id: user.id,
        symbol,
        name,
        type: category, // Store category (Real Estate, Vehicle, etc.) as type
        quantity: 1,
        buy_price: value,
        current_price: value,
        currency: userCurrency,
        annual_dividend_per_share: 0,
    })

    if (error) return { error: error.message }

    revalidatePath("/dashboard/networth")
    revalidatePath("/dashboard/investments")
    return { success: true }
}

// 2. CREATE ASSET (Single) - With Upsert/Merge Logic
export async function createAsset(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    const symbol = (formData.get("symbol") as string)?.toUpperCase()
    const name = formData.get("name") as string
    const type = formData.get("type") as string
    const quantity = parseFloat(formData.get("quantity") as string)

    // Get manual inputs
    let buy_price = parseFloat(formData.get("buy_price") as string)
    let current_price = parseFloat(formData.get("current_price") as string)
    let annual_dividend_per_share = parseFloat(formData.get("annual_dividend_per_share") as string)
    let next_payment_date: string | null = null

    if (!symbol || !type || isNaN(quantity)) {
        return { error: "Símbolo, Tipo e Quantidade são obrigatórios." }
    }

    // Fetch user currency preference
    const { data: profile } = await supabase.from("profiles").select("currency, subscription_tier").eq("id", user.id).single()
    const userCurrency = profile?.currency || 'EUR'
    const tier = profile?.subscription_tier || 'free'

    // VERIFICAÇÃO DE LIMITES
    const { data: existingAssetCheck } = await supabase
        .from("assets")
        .select("id")
        .eq("user_id", user.id)
        .eq("symbol", symbol)
        .single()

    if (!existingAssetCheck) {
        if (tier === 'free') {
            const { count } = await supabase.from("assets").select("*", { count: 'exact', head: true }).eq("user_id", user.id)
            if (count && count >= 3) {
                return { error: "Limite de 3 ativos atingido no plano Gratuito." }
            }
        }
    }

    // ALWAYS FETCH DATA to get latest metadata in USER CURRENCY
    const stockData = await fetchStockData(symbol, userCurrency)

    let finalType = type;
    if (stockData) {
        if (!current_price) current_price = stockData.price
        if (!buy_price) buy_price = stockData.price
        if (!annual_dividend_per_share) annual_dividend_per_share = stockData.annualDividendRate
        if (stockData.nextPaymentDate) next_payment_date = stockData.nextPaymentDate

        // Use the type from stock service if it's more specific than generic "stock"
        if (stockData.type && stockData.type !== 'other') {
            finalType = stockData.type;
        }
    }

    // CHECK FOR EXISTING ASSET
    const { data: existingAsset } = await supabase
        .from("assets")
        .select("*")
        .eq("user_id", user.id)
        .eq("symbol", symbol)
        .single()

    if (existingAsset) {
        // UPSERT: Update existing
        const newQuantity = existingAsset.quantity + quantity

        // Weighted Average Buy Price
        const totalCostExists = existingAsset.quantity * existingAsset.buy_price
        const totalCostNew = quantity * (buy_price || 0)
        const newBuyPrice = newQuantity > 0 ? (totalCostExists + totalCostNew) / newQuantity : 0

        const { error } = await supabase
            .from("assets")
            .update({
                quantity: newQuantity,
                buy_price: newBuyPrice,
                current_price: current_price || existingAsset.current_price,
                annual_dividend_per_share: annual_dividend_per_share || existingAsset.annual_dividend_per_share,
                next_payment_date: next_payment_date || existingAsset.next_payment_date,
                updated_at: new Date().toISOString(),
                // Update type if we have a better one now
                type: finalType !== existingAsset.type ? finalType : existingAsset.type,
                currency: userCurrency // Always enforce current user currency
            })
            .eq("id", existingAsset.id)

        if (error) return { error: error.message }
    } else {
        // INSERT NEW
        const { error } = await supabase.from("assets").insert({
            user_id: user.id,
            symbol,
            name: name || (stockData?.name ?? symbol),
            type: finalType,
            quantity,
            buy_price: buy_price || 0,
            current_price: current_price || 0,
            annual_dividend_per_share: annual_dividend_per_share || 0,
            next_payment_date,
            currency: userCurrency // Save currency!
        })

        if (error) return { error: error.message }
    }

    revalidatePath("/dashboard/investments")
    revalidatePath("/dashboard/networth")
    return { success: true }
}

// 2.1 CREATE ASSETS BULK - With Upsert/Merge Logic
export async function createAssetsBulk(data: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    // Fetch user currency preference
    const { data: profile } = await supabase.from("profiles").select("currency, subscription_tier").eq("id", user.id).single()
    const userCurrency = profile?.currency || 'EUR'
    const tier = profile?.subscription_tier || 'free'

    const lines = data.split('\n').filter(line => line.trim().length > 0)
    const itemsToProcess = []

    // 1. Parsing Phase
    for (const line of lines) {
        const parts = line.split(',').map(p => p.trim())
        if (parts.length < 2) continue

        const symbol = parts[0].toUpperCase()
        const quantity = parseFloat(parts[1])
        if (!symbol || isNaN(quantity)) continue

        let current_price = parseFloat(parts[2] || "0")
        let annual_dividend_per_share = parseFloat(parts[3] || "0")

        // Fetch fresh data in USER CURRENCY
        const stockData = await fetchStockData(symbol, userCurrency)

        let next_payment_date = null
        let name = symbol
        let buy_price = current_price

        if (stockData) {
            name = stockData.name
            if (current_price === 0) current_price = stockData.price
            if (annual_dividend_per_share === 0) annual_dividend_per_share = stockData.annualDividendRate
            if (buy_price === 0) buy_price = stockData.price

            if (stockData.nextPaymentDate) next_payment_date = stockData.nextPaymentDate
        }

        itemsToProcess.push({
            symbol,
            name,
            type: (stockData?.type && stockData.type !== 'other') ? stockData.type : 'stock',
            quantity,
            buy_price,
            current_price,
            annual_dividend_per_share,
            next_payment_date,
            currency: userCurrency
        })
    }

    if (itemsToProcess.length === 0) {
        return { error: "Não foram encontrados dados válidos." }
    }

    // VERIFICAÇÃO DE LIMITES (FREE = MAX 3)
    if (tier === 'free') {
        const { count } = await supabase.from("assets").select("*", { count: 'exact', head: true }).eq("user_id", user.id)
        const currentCount = count || 0

        // Calculate how many NEW items are being added (approximation: assuming all unique in batch are new for simplicity, or we can just say current + batch > 3)
        // Stricter check: 
        if (currentCount + itemsToProcess.length > 3) {
            // Check intersection if we really want to be nice, but for now strict:
            return { error: `Limite de 3 ativos. Tens ${currentCount} e tentaste adicionar ${itemsToProcess.length}.` }
        }
    }

    // 2. Execution Phase (Upsert)
    let count = 0
    for (const item of itemsToProcess) {
        const { data: existingAsset } = await supabase
            .from("assets")
            .select("*")
            .eq("user_id", user.id)
            .eq("symbol", item.symbol)
            .single()

        if (existingAsset) {
            // Merge
            const newQuantity = existingAsset.quantity + item.quantity
            const totalCostExists = existingAsset.quantity * existingAsset.buy_price
            const totalCostNew = item.quantity * item.buy_price
            const newBuyPrice = newQuantity > 0 ? (totalCostExists + totalCostNew) / newQuantity : 0

            await supabase.from("assets").update({
                quantity: newQuantity,
                buy_price: newBuyPrice,
                current_price: item.current_price || existingAsset.current_price,
                annual_dividend_per_share: item.annual_dividend_per_share || existingAsset.annual_dividend_per_share,
                next_payment_date: item.next_payment_date || existingAsset.next_payment_date,
                updated_at: new Date().toISOString(),
                currency: item.currency // Enforce currency update
            }).eq("id", existingAsset.id)
        } else {
            // Insert
            await supabase.from("assets").insert({
                user_id: user.id,
                ...item
            })
        }
        count++
    }

    revalidatePath("/dashboard/investments")
    revalidatePath("/dashboard/networth")
    return { success: true, count }
}


// 3. DELETE ASSET
export async function deleteAsset(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    const { error } = await supabase
        .from("assets")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id)

    if (error) return { error: error.message }

    revalidatePath("/dashboard/investments")
    revalidatePath("/dashboard/networth")
    return { success: true }
}

// 4. UPDATE PRICE (Quick Edit)
export async function updateAssetPrice(id: string, price: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    const { error } = await supabase
        .from("assets")
        .update({ current_price: price, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user.id)

    if (error) return { error: error.message }

    revalidatePath("/dashboard/investments")
    revalidatePath("/dashboard/networth")
    return { success: true }
}

// 5. REFRESH ALL ASSETS
export async function refreshAllAssets() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "User not found" }
    }

    // 1. Get all assets
    const { data: assets, error } = await supabase
        .from("assets")
        .select("*")
        .eq("user_id", user.id)

    if (error) return { error: error.message }
    if (!assets || assets.length === 0) return { success: true }

    // Fetch user currency preference
    const { data: profile } = await supabase.from("profiles").select("currency").eq("id", user.id).single()
    const userCurrency = profile?.currency || 'EUR'

    // 2. Refresh each in parallel (with limit)
    let updatedCount = 0;

    // Process in chunks to avoid rate limits if many assets
    const updates = assets.map(async (asset) => {
        // Skip fixed assets if we want? Or update them too? 
        // Fixed assets usually don't have symbols like 'FIXED_...' that work in Yahoo.
        // Let's soft check symbol.
        if (asset.symbol.startsWith("FIXED_")) return;

        const stockData = await fetchStockData(asset.symbol, userCurrency);
        if (stockData) {
            await supabase.from("assets").update({
                current_price: stockData.price,
                currency: stockData.currency, // Force update currency symbol to match user preference
                annual_dividend_per_share: stockData.annualDividendRate,
                next_payment_date: stockData.nextPaymentDate,
                updated_at: new Date().toISOString()
            }).eq("id", asset.id);
            updatedCount++;
        }
    });

    await Promise.all(updates);

    revalidatePath("/dashboard/investments")
    revalidatePath("/dashboard/networth")
    return { success: true, updatedCount }
}


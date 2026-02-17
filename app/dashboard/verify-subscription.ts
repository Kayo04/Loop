"use server"

import { createClient } from "@/lib/supabase-server"
import { stripe } from "@/lib/stripe"
import { sendWelcomeEmail } from "@/lib/send-email"

export async function verifyAndUpgradeSubscription(sessionId: string) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { success: false, error: "Not authenticated" }
        }

        // Retrieve the session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId)

        if (session.payment_status !== 'paid') {
            return { success: false, error: "Payment not completed" }
        }

        if (session.metadata?.userId !== user.id) {
            return { success: false, error: "Session user mismatch" }
        }

        // Check if already upgraded
        const { data: currentProfile } = await supabase
            .from("profiles")
            .select("subscription_tier")
            .eq("id", user.id)
            .single()

        if (currentProfile?.subscription_tier === 'pro') {
            return { success: true, alreadyUpgraded: true }
        }

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        )

        const isAnnual = subscription.items.data[0].price.recurring?.interval === 'year'

        // Get user profile for email
        const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", user.id)
            .single()

        // Update profile to PRO - only update columns that definitely exist
        const updateData: any = {
            subscription_tier: "pro",
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: subscription.id,
        }

        // Try to add optional fields if they exist
        try {
            updateData.subscription_status = "active"
            updateData.subscription_start_date = new Date().toISOString()
            updateData.billing_cycle = isAnnual ? "yearly" : "monthly"
        } catch (e) {
            // If these fields don't exist, continue without them
            console.log("Some subscription fields may not exist in database")
        }

        const { error } = await supabase
            .from("profiles")
            .update(updateData)
            .eq("id", user.id)

        if (error) {
            console.error("Error updating profile:", error)
            // Try with minimal fields if full update failed
            const { error: minimalError } = await supabase
                .from("profiles")
                .update({
                    subscription_tier: "pro",
                })
                .eq("id", user.id)

            if (minimalError) {
                console.error("Minimal update also failed:", minimalError)
                return { success: false, error: "Database update failed" }
            }
        }

        // Send welcome email
        if (profile?.email) {
            const nextBillingDate = new Date()
            nextBillingDate.setMonth(nextBillingDate.getMonth() + (isAnnual ? 12 : 1))

            await sendWelcomeEmail({
                email: profile.email,
                name: profile.full_name || 'Utilizador',
                plan: isAnnual ? 'Annual' : 'Monthly',
                amount: (session.amount_total || 0) / 100,
                nextBillingDate: nextBillingDate.toLocaleDateString('pt-PT', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                }),
                transactionId: session.id,
            })
        }

        return { success: true }
    } catch (error) {
        console.error("Error verifying subscription:", error)
        return { success: false, error: "Verification failed" }
    }
}

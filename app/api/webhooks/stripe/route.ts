import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createClient } from "@supabase/supabase-js"
import Stripe from "stripe"
import { sendWelcomeEmail } from "@/lib/send-email"

// Admin Client for Webhook (Service Role)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
    const body = await req.text()
    const signature = (await headers()).get("Stripe-Signature") as string

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
    }

    // IDEMPOTENCY CHECK: Prevent duplicate webhook processing
    const { data: existingEvent } = await supabaseAdmin
        .from("webhook_events")
        .select("id")
        .eq("stripe_event_id", event.id)
        .single()

    if (existingEvent) {
        console.log(`Webhook ${event.id} already processed, skipping`)
        return new NextResponse(null, { status: 200 })
    }

    const session = event.data.object as Stripe.Checkout.Session

    // Handle successful subscription checkout
    if (event.type === "checkout.session.completed") {
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        )

        if (!session?.metadata?.userId) {
            return new NextResponse("User ID is missing in session metadata", { status: 400 })
        }

        // Get user profile for email
        const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("full_name, email")
            .eq("id", session.metadata.userId)
            .single()

        // Update Profile to PRO
        const isAnnual = subscription.items.data[0].price.recurring?.interval === 'year'
        const { error } = await supabaseAdmin
            .from("profiles")
            .update({
                subscription_tier: "pro",
                subscription_status: "active",
                subscription_start_date: new Date().toISOString(),
                billing_cycle: isAnnual ? "yearly" : "monthly",
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: subscription.id,
            })
            .eq("id", session.metadata.userId)

        if (error) {
            console.error("Error updating profile:", error)
            return new NextResponse("Database update failed", { status: 500 })
        }

        // Mark webhook as processed
        await supabaseAdmin
            .from("webhook_events")
            .insert({
                stripe_event_id: event.id,
                event_type: event.type,
            })

        // Send welcome email (don't await - fire and forget)
        if (profile?.email) {
            const nextBillingDate = new Date()
            nextBillingDate.setMonth(nextBillingDate.getMonth() + (isAnnual ? 12 : 1))

            sendWelcomeEmail({
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
            }).catch(err => console.error("Email send failed:", err))
        }
    }

    // Handle subscription deletion/cancellation
    if (event.type === "customer.subscription.deleted") {
        const subscription = event.data.object as Stripe.Subscription

        // Find user by subscription ID
        const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("id")
            .eq("stripe_subscription_id", subscription.id)
            .single()

        if (profile) {
            await supabaseAdmin
                .from("profiles")
                .update({
                    subscription_tier: "free",
                    subscription_status: "expired",
                    stripe_subscription_id: null
                })
                .eq("id", profile.id)
        }

        // Mark webhook as processed
        await supabaseAdmin
            .from("webhook_events")
            .insert({
                stripe_event_id: event.id,
                event_type: event.type,
            })
    }

    return new NextResponse(null, { status: 200 })
}

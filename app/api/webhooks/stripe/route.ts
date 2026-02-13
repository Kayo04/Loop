import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createClient } from "@supabase/supabase-js"
import Stripe from "stripe"

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

    const session = event.data.object as Stripe.Checkout.Session

    // Handle successful subscription checkout
    if (event.type === "checkout.session.completed") {
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        )

        if (!session?.metadata?.userId) {
            return new NextResponse("User ID is missing in session metadata", { status: 400 })
        }

        // Update Profile to PRO
        const { error } = await supabaseAdmin
            .from("profiles")
            .update({
                subscription_tier: "pro",
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: subscription.id,
            })
            .eq("id", session.metadata.userId)

        if (error) {
            console.error("Error updating profile:", error)
            return new NextResponse("Database update failed", { status: 500 })
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
                    stripe_subscription_id: null
                })
                .eq("id", profile.id)
        }
    }

    return new NextResponse(null, { status: 200 })
}

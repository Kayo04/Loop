import { createClient } from "@/lib/supabase-server"
import { stripe } from "@/lib/stripe"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { isAnnual } = await req.json().catch(() => ({ isAnnual: false }))

        const priceData = isAnnual
            ? {
                name: "Loop PRO (Anual)",
                amount: 4999, // 49.99 EUR
                interval: "year",
            }
            : {
                name: "Loop PRO (Mensal)",
                amount: 499, // 4.99 EUR
                interval: "month",
            }

        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "eur",
                        product_data: {
                            name: priceData.name,
                            description: "Acesso total a todas as funcionalidades premium.",
                        },
                        unit_amount: priceData.amount,
                        recurring: {
                            interval: priceData.interval as "month" | "year",
                        },
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                userId: user.id,
            },
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/plans?canceled=true`,
        })

        return NextResponse.json({ url: session.url })
    } catch (error) {
        console.error("[CHECKOUT_ERROR]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

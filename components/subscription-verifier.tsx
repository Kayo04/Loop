"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { verifyAndUpgradeSubscription } from "@/app/dashboard/verify-subscription"
import { toast } from "sonner"

export function SubscriptionVerifier() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const sessionId = searchParams.get("session_id")
    const success = searchParams.get("success")

    if (success === "true" && sessionId) {
      // Verify and upgrade subscription
      verifyAndUpgradeSubscription(sessionId).then((result) => {
        if (result.success) {
          if (!result.alreadyUpgraded) {
            toast.success("Bem-vindo ao Loop Pro! 🎉")
          }
          // Remove query params and reload
          router.replace("/dashboard")
          window.location.reload()
        } else {
          toast.error("Erro ao ativar subscrição. Contacta o suporte.")
          console.error("Subscription verification error:", result.error)
        }
      })
    }
  }, [searchParams, router])

  return null
}

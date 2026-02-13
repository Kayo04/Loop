import { createClient } from "@/lib/supabase-server"
import { getUserTier } from "@/app/dashboard/actions"
import { LockScreen } from "@/components/lock-screen"
import { FocusTimer } from "@/components/focus-timer"

export default async function FocusPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // PROTECT ROUTE (PRO ONLY)
  const tier = await getUserTier(user.id)
  if (tier === 'free') {
    return (
        <div className="relative min-h-screen">
            <LockScreen />
            {/* Render actual component but blurred */}
            <div className="filter blur-xl opacity-30 pointer-events-none select-none h-full overflow-hidden">
                <FocusTimer />
            </div>
        </div>
    )
  }

  return <FocusTimer />
}

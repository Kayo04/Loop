import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { DashboardShell } from "@/components/dashboard-shell"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch Profile for Avatar/Name
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, subscription_tier")
    .eq("id", user.id)
    .single()

  return (
    <DashboardShell user={user} profile={profile}>
      {children}
    </DashboardShell>
  )
}
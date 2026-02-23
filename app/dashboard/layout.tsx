import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { DashboardShell } from "@/components/dashboard-shell"

export const dynamic = 'force-dynamic'


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

  // Fetch Profile for Avatar/Name/Tier
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single()

  return (
    <DashboardShell user={user} profile={profile}>
      {children}
    </DashboardShell>
  )
}
import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase-server"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>
}) {
  const params = await searchParams;

  const login = async (formData: FormData) => {
    "use server"
    
    let email = formData.get("email") as string
    let password = formData.get("password") as string

    // LIMPEZA PROFUNDA NO LOGIN TAMBÉM
    if (email) {
      email = email.trim().toLowerCase()
      email = email.replace(/[\u200B-\u200D\uFEFF]/g, '')
    }

    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return redirect("/login?message=Email ou password errados")
    }

    return redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Bem-vindo de volta</CardTitle>
          <CardDescription>Login Seguro</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={login} className="space-y-4">
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="tiago@gmail.com" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput id="password" name="password" required />
            </div>

            {params?.message && (
              <p className="text-sm text-red-500 text-center bg-red-50 p-2 rounded border border-red-200">
                {decodeURIComponent(params.message)}
              </p>
            )}

            <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800">
              Entrar
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-slate-500">
            Ainda não tens conta?{" "}
            <Link href="/register" className="text-blue-600 hover:underline">
              Criar conta
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
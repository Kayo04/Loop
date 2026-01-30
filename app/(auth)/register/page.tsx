import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase-server"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input" // Confirma se tens este ficheiro criado
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>
}) {
  const params = await searchParams;

  const signup = async (formData: FormData) => {
    "use server"
    
    // 1. Receber e Limpar os Dados
    const fullName = (formData.get("fullName") as string || "").trim()
    const email = (formData.get("email") as string || "").trim().toLowerCase()
    const password = (formData.get("password") as string || "").trim()

    console.log(`Tentativa de Registo: ${email}`)

    // 2. Validação simples
    if (!email || !password || password.length < 6) {
        return redirect("/register?message=Preenche tudo. Password mín. 6 caracteres.")
    }

    const supabase = await createClient()

    // 3. Criar conta
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      console.error("Erro Supabase:", error.message)
      return redirect(`/register?message=${encodeURIComponent(error.message)}`)
    }

    // Sucesso
    return redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Criar Conta Nova</CardTitle>
          <CardDescription>Começa do zero</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={signup} className="space-y-4">
            
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input id="fullName" name="fullName" placeholder="Teu Nome" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="admin@loop.local" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput id="password" name="password" minLength={6} required />
            </div>

            {params?.message && (
              <p className="text-sm text-red-500 text-center bg-red-50 p-2 rounded">
                {decodeURIComponent(params.message)}
              </p>
            )}

            <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800">
              Criar Conta
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-slate-500">
             Já tens conta? <Link href="/login" className="text-blue-600 hover:underline">Entrar</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
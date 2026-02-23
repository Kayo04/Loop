import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase-server"
import { SubmitButton } from "@/components/auth/submit-button"
import { PasswordInput } from "@/components/auth/password-input"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>
}) {
  const params = await searchParams

  const login = async (formData: FormData) => {
    "use server"

    let email = formData.get("email") as string
    let password = formData.get("password") as string

    if (email) {
      email = email.trim().toLowerCase()
      email = email.replace(/[\u200B-\u200D\uFEFF]/g, "")
    }

    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      return redirect(`/login?message=${encodeURIComponent(error.message)}`)
    }

    return redirect("/dashboard")
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        .auth-bg {
          height: 100vh;
          background: linear-gradient(135deg, #0f0f1a 0%, #0d1117 50%, #0a0a14 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', sans-serif;
          padding: 1rem;
          position: relative;
          overflow: hidden;
        }
        
        .auth-bg::before {
          content: '';
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%);
          top: -200px;
          right: -100px;
          pointer-events: none;
        }

        .auth-bg::after {
          content: '';
          position: absolute;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%);
          bottom: -100px;
          left: -100px;
          pointer-events: none;
        }

        .auth-card {
          width: 100%;
          max-width: 440px;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          padding: 2.5rem;
          position: relative;
          z-index: 10;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.06);
        }

        .auth-logo {
          display: flex;
          justify-content: center;
          margin-bottom: 2rem;
        }

        .auth-logo-text {
          font-size: 1.8rem;
          font-weight: 800;
          background: linear-gradient(135deg, #fff 0%, #94a3b8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.02em;
        }

        .auth-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 0.5rem;
        }

        .auth-subtitle {
          font-size: 0.9rem;
          color: #64748b;
          margin-bottom: 2rem;
        }

        .auth-label {
          display: block;
          font-size: 0.8rem;
          font-weight: 500;
          color: #94a3b8;
          margin-bottom: 0.5rem;
          letter-spacing: 0.02em;
          text-transform: uppercase;
        }

        .auth-input {
          width: 100%;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #fff;
          font-size: 0.95rem;
          font-family: 'Inter', sans-serif;
          transition: all 0.2s;
          outline: none;
          box-sizing: border-box;
        }

        .auth-input::placeholder { color: #475569; }

        .auth-input:focus {
          border-color: rgba(99, 102, 241, 0.6);
          background: rgba(99, 102, 241, 0.05);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .auth-field { margin-bottom: 1.25rem; }

        .auth-btn {
          width: 100%;
          padding: 0.85rem;
          background: linear-gradient(135deg, #6366f1, #3b82f6);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-size: 1rem;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 0.5rem;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
        }

        .auth-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
        }

        .auth-btn:active { transform: translateY(0); }

        .auth-error {
          padding: 0.75rem 1rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 10px;
          color: #f87171;
          font-size: 0.85rem;
          text-align: center;
          margin-bottom: 1rem;
        }

        .auth-footer {
          text-align: center;
          margin-top: 1.5rem;
          font-size: 0.875rem;
          color: #475569;
        }

        .auth-link {
          color: #818cf8;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }

        .auth-link:hover { color: #6366f1; text-decoration: underline; }

        .auth-divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 1.5rem 0;
        }

        .auth-divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255, 255, 255, 0.07);
        }

        .auth-features {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .auth-feature-item {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          color: #64748b;
        }

        .auth-feature-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #3b82f6);
          flex-shrink: 0;
        }
      `}</style>

      <div className="auth-bg">
        <div className="auth-card">
          <div className="auth-logo">
            <span className="auth-logo-text">Loop</span>
          </div>

          <h1 className="auth-title">Bem-vindo de volta</h1>
          <p className="auth-subtitle">Entra na tua conta para continuar</p>

          <form action={login}>
            <div className="auth-field">
              <label className="auth-label" htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                className="auth-input"
                placeholder="joao@gmail.com"
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="password">Password</label>
              <PasswordInput
                id="password"
                name="password"
                className="auth-input"
                required
              />
            </div>

            {params?.message && (
              <div className="auth-error">
                {decodeURIComponent(params.message)}
              </div>
            )}

            <SubmitButton label="Entrar na conta →" loadingLabel="A entrar..." />
          </form>

          <div className="auth-footer">
            Ainda não tens conta?{" "}
            <Link href="/register" className="auth-link">Criar conta grátis</Link>
          </div>
        </div>
      </div>
    </>
  )
}
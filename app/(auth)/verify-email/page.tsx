"use client"

import { Suspense, useRef, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase-client"
import Link from "next/link"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const email = searchParams.get("email") || ""

  const [digits, setDigits] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [resent, setResent] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(-1)
    const newDigits = [...digits]
    newDigits[index] = cleaned
    setDigits(newDigits)
    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (paste.length === 6) {
      setDigits(paste.split(""))
      inputRefs.current[5]?.focus()
    }
  }

  const handleVerify = async () => {
    const token = digits.join("")
    if (token.length < 6) {
      setError("Insere os 6 dígitos do código.")
      return
    }
    setLoading(true)
    setError("")
    const supabase = createClient()
    const { error } = await supabase.auth.verifyOtp({ email, token, type: "signup" })
    if (error) {
      setError("Código inválido ou expirado. Tenta novamente.")
      setLoading(false)
    } else {
      router.push("/dashboard")
    }
  }

  const handleResend = async () => {
    const supabase = createClient()
    await supabase.auth.resend({ email, type: "signup" })
    setResent(true)
    setTimeout(() => setResent(false), 5000)
  }

  return (
    <div className="auth-card">
      <div className="auth-logo">
        <span className="auth-logo-text">Loop</span>
      </div>

      <div className="email-icon">📧</div>
      <h1 className="verify-title">Verifica o teu email</h1>
      <p className="verify-subtitle">Enviámos um código de 6 dígitos para:</p>
      <p className="verify-email-display">{email || "o teu email"}</p>

      <div className="otp-row" onPaste={handlePaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el }}
            className={`otp-box${d ? " filled" : ""}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            autoFocus={i === 0}
          />
        ))}
      </div>

      {error && <div className="auth-error">{error}</div>}
      {resent && <div className="auth-success">Código reenviado! Verifica o teu email.</div>}

      <button className="auth-btn" onClick={handleVerify} disabled={loading}>
        {loading ? "A verificar..." : "Verificar conta →"}
      </button>

      <button className="resend-btn" onClick={handleResend}>
        Não recebeste o código? Reenviar
      </button>

      <div className="auth-footer">
        <Link href="/login" className="auth-link">← Voltar ao login</Link>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

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
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%);
          top: -200px; right: -100px;
          pointer-events: none;
        }
        .auth-bg::after {
          content: '';
          position: absolute;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%);
          bottom: -100px; left: -100px;
          pointer-events: none;
        }

        .auth-card {
          width: 100%;
          max-width: 420px;
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 2.5rem;
          position: relative;
          z-index: 10;
          box-shadow: 0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06);
          text-align: center;
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

        .email-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }

        .verify-title {
          font-size: 1.6rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 0.5rem;
        }

        .verify-subtitle {
          font-size: 0.9rem;
          color: #64748b;
          margin-bottom: 0.4rem;
        }

        .verify-email-display {
          font-size: 0.9rem;
          color: #818cf8;
          font-weight: 500;
          margin-bottom: 2rem;
          word-break: break-all;
        }

        .otp-row {
          display: flex;
          gap: 0.6rem;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .otp-box {
          width: 48px;
          height: 56px;
          background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          color: #fff;
          font-size: 1.5rem;
          font-weight: 700;
          font-family: 'Inter', sans-serif;
          text-align: center;
          outline: none;
          transition: all 0.2s;
          caret-color: #6366f1;
        }

        .otp-box:focus {
          border-color: rgba(99,102,241,0.7);
          background: rgba(99,102,241,0.08);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
        }

        .otp-box.filled {
          border-color: rgba(99,102,241,0.5);
          background: rgba(99,102,241,0.06);
        }

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
          box-shadow: 0 4px 15px rgba(99,102,241,0.3);
          margin-bottom: 1rem;
        }

        .auth-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(99,102,241,0.5);
        }

        .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .auth-error {
          padding: 0.75rem 1rem;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.3);
          border-radius: 10px;
          color: #f87171;
          font-size: 0.85rem;
          margin-bottom: 1rem;
        }

        .auth-success {
          padding: 0.75rem 1rem;
          background: rgba(34,197,94,0.1);
          border: 1px solid rgba(34,197,94,0.3);
          border-radius: 10px;
          color: #4ade80;
          font-size: 0.85rem;
          margin-bottom: 1rem;
        }

        .resend-btn {
          background: none;
          border: none;
          color: #818cf8;
          font-size: 0.875rem;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          text-decoration: underline;
          transition: color 0.2s;
        }

        .resend-btn:hover { color: #6366f1; }

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
        }

        .auth-link:hover { color: #6366f1; text-decoration: underline; }
      `}</style>

      <div className="auth-bg">
        <Suspense fallback={
          <div className="auth-card">
            <div className="auth-logo"><span className="auth-logo-text">Loop</span></div>
            <div className="email-icon">📧</div>
            <h1 className="verify-title">A carregar...</h1>
          </div>
        }>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </>
  )
}

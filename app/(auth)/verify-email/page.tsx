import Link from "next/link"

export default function VerifyEmailPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        .auth-bg {
          min-height: 100vh;
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
          text-align: center;
        }

        .email-icon {
          width: 72px;
          height: 72px;
          background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(59,130,246,0.2));
          border: 2px solid rgba(99, 102, 241, 0.3);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          margin: 0 auto 1.5rem;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.3); }
          50% { box-shadow: 0 0 0 12px rgba(99, 102, 241, 0); }
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

        .verify-title {
          font-size: 1.6rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 0.75rem;
        }

        .verify-subtitle {
          font-size: 0.9rem;
          color: #64748b;
          line-height: 1.6;
          margin-bottom: 2rem;
        }

        .verify-subtitle strong {
          color: #94a3b8;
        }

        .verify-steps {
          background: rgba(99, 102, 241, 0.05);
          border: 1px solid rgba(99, 102, 241, 0.15);
          border-radius: 14px;
          padding: 1.25rem;
          margin-bottom: 1.75rem;
          text-align: left;
        }

        .verify-step {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          font-size: 0.85rem;
          color: #94a3b8;
          padding: 0.4rem 0;
        }

        .verify-step-num {
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #6366f1, #3b82f6);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 700;
          color: #fff;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .auth-btn-outline {
          display: inline-block;
          width: 100%;
          padding: 0.85rem;
          background: transparent;
          border: 1px solid rgba(99, 102, 241, 0.4);
          border-radius: 12px;
          color: #818cf8;
          font-size: 0.95rem;
          font-weight: 500;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          box-sizing: border-box;
        }

        .auth-btn-outline:hover {
          background: rgba(99, 102, 241, 0.1);
          border-color: rgba(99, 102, 241, 0.6);
        }

        .auth-footer {
          text-align: center;
          margin-top: 1.25rem;
          font-size: 0.875rem;
          color: #475569;
        }

        .auth-link {
          color: #818cf8;
          text-decoration: none;
          font-weight: 500;
        }

        .auth-link:hover { color: #6366f1; text-decoration: underline; }

        .spam-note {
          font-size: 0.78rem;
          color: #334155;
          margin-top: 1rem;
        }
      `}</style>

      <div className="auth-bg">
        <div className="auth-card">
          <div className="auth-logo">
            <span className="auth-logo-text">Loop</span>
          </div>

          <div className="email-icon">📧</div>

          <h1 className="verify-title">Verifica o teu email</h1>
          <p className="verify-subtitle">
            Enviámos um link de verificação para a tua caixa de entrada.<br />
            <strong>Confirma o email antes de entrar na tua conta.</strong>
          </p>

          <div className="verify-steps">
            <div className="verify-step">
              <span className="verify-step-num">1</span>
              <span>Abre o teu email e procura uma mensagem do Loop</span>
            </div>
            <div className="verify-step">
              <span className="verify-step-num">2</span>
              <span>Clica no botão "Confirmar email" dentro da mensagem</span>
            </div>
            <div className="verify-step">
              <span className="verify-step-num">3</span>
              <span>Volta aqui e entra na tua conta</span>
            </div>
          </div>

          <Link href="/login" className="auth-btn-outline">
            Já verifiquei → Entrar
          </Link>

          <p className="spam-note">
            Não recebeste o email? Verifica a pasta de spam ou{" "}
            <Link href="/register" className="auth-link">tenta registar novamente</Link>
          </p>

          <div className="auth-footer">
            <Link href="/" className="auth-link">← Voltar ao início</Link>
          </div>
        </div>
      </div>
    </>
  )
}

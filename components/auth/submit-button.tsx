"use client"

import { useFormStatus } from "react-dom"

export function SubmitButton({ label, loadingLabel }: { label: string; loadingLabel: string }) {
  const { pending } = useFormStatus()

  return (
    <button type="submit" className="auth-btn" disabled={pending}>
      {pending ? (
        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
          <span style={{
            width: "16px", height: "16px",
            border: "2px solid rgba(255,255,255,0.3)",
            borderTopColor: "#fff",
            borderRadius: "50%",
            display: "inline-block",
            animation: "spin 0.7s linear infinite"
          }} />
          {loadingLabel}
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </span>
      ) : label}
    </button>
  )
}

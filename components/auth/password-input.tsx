"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

interface PasswordInputProps {
  id: string
  name: string
  placeholder?: string
  required?: boolean
  minLength?: number
  className?: string
}

export function PasswordInput({
  id, name, placeholder = "••••••••", required, minLength, className
}: PasswordInputProps) {
  const [show, setShow] = useState(false)

  return (
    <div style={{ position: "relative" }}>
      <input
        id={id}
        name={name}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        className={className}
        style={{ paddingRight: "2.75rem" }}
      />
      <button
        type="button"
        onClick={() => setShow(v => !v)}
        aria-label={show ? "Esconder password" : "Mostrar password"}
        style={{
          position: "absolute",
          right: "0.75rem",
          top: "50%",
          transform: "translateY(-50%)",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "0",
          display: "flex",
          alignItems: "center",
          color: "var(--auth-muted, #94a3b8)",
        }}
        tabIndex={-1}
      >
        {show
          ? <EyeOff size={18} />
          : <Eye size={18} />
        }
      </button>
    </div>
  )
}

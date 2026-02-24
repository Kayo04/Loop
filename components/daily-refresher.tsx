"use client"

import { useEffect } from "react"

export function DailyRefresher() {
  useEffect(() => {
    // Função para calcular os milissegundos até à meia-noite
    const calculateTimeUntilMidnight = () => {
      const now = new Date()
      const tomorrow = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0, 0, 1 // 1 segundo depois da meia-noite para garantir a mudança de dia
      )
      return tomorrow.getTime() - now.getTime()
    }

    // Configurar o temporizador
    const timeoutId = setTimeout(() => {
      // Quando chegar à meia-noite, recarregar a página para o novo dia
      window.location.reload()
    }, calculateTimeUntilMidnight())

    // Limpar o temporizador se o componente for desmontado
    return () => clearTimeout(timeoutId)
  }, [])

  return null
}

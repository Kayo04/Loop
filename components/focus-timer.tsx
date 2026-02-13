"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Pause, RotateCcw, Zap, Coffee, Brain, Settings, Droplets } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ModeToggle } from "@/components/mode-toggle"
import { Input } from "@/components/ui/input"

export function FocusTimer() {
  // Estados
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isActive, setIsActive] = useState(false)
  const [mode, setMode] = useState<"focus" | "shortBreak" | "longBreak" | "custom">("focus")
  const [customMinutes, setCustomMinutes] = useState(30)
  const [totalTime, setTotalTime] = useState(25 * 60) // Para calcular a % inicial corretamente
  
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Configurações de tempo (em segundos)
  const MODES = {
    focus: { 
        time: 25 * 60, 
        label: "Hiper Foco", 
        color: "text-blue-500", 
        liquidColor: "bg-blue-500",
        bg: "bg-blue-50 dark:bg-blue-950/30",
        icon: Zap 
    },
    shortBreak: { 
        time: 5 * 60, 
        label: "Pausa Curta", 
        color: "text-emerald-500", 
        liquidColor: "bg-emerald-500",
        bg: "bg-emerald-50 dark:bg-emerald-950/30",
        icon: Coffee 
    },
    longBreak: { 
        time: 15 * 60, 
        label: "Pausa Longa", 
        color: "text-purple-500", 
        liquidColor: "bg-purple-500",
        bg: "bg-purple-50 dark:bg-purple-950/30",
        icon: Brain 
    },
    custom: {
        time: customMinutes * 60,
        label: "Personalizado",
        color: "text-orange-500",
        liquidColor: "bg-orange-500", // Cor para custom
        bg: "bg-orange-50 dark:bg-orange-950/30",
        icon: Settings
    }
  }

  // Efeito do Timer
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      setIsActive(false)
      if (timerRef.current) clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isActive, timeLeft])

  // Atualizar quando muda o modo
  useEffect(() => {
      if (mode === 'custom') {
          const seconds = customMinutes * 60
          setTimeLeft(seconds)
          setTotalTime(seconds)
      } else {
          setTimeLeft(MODES[mode].time)
          setTotalTime(MODES[mode].time)
      }
      setIsActive(false)
  }, [mode, customMinutes])

  // Formatar tempo MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Controles
  const toggleTimer = () => setIsActive(!isActive)
  
  const resetTimer = () => {
    setIsActive(false)
    if (mode === 'custom') {
        const seconds = customMinutes * 60
        setTimeLeft(seconds)
        setTotalTime(seconds)
    } else {
        setTimeLeft(MODES[mode].time)
        setTotalTime(MODES[mode].time)
    }
  }

  const changeMode = (newMode: "focus" | "shortBreak" | "longBreak" | "custom") => {
    setMode(newMode)
  }

  // Calcular progresso para a animação líquida
  // Queremos que o líquido desça, então height deve ser proportional ao timeLeft
  const progressPercent = Math.min(100, Math.max(0, (timeLeft / totalTime) * 100))
  
  const CurrentIcon = MODES[mode].icon

  return (
    <div className="flex flex-col min-h-[calc(100vh-140px)] justify-center items-center font-sans relative py-8 md:py-0">
       
       <div className="absolute top-4 right-4 md:hidden z-10">
         <ModeToggle />
       </div>

      <div className="text-center mb-8 animate-fade-in-up px-4">
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
          Modo <span className={`bg-clip-text text-transparent bg-gradient-to-r ${mode === 'focus' ? 'from-blue-600 to-indigo-600' : mode === 'shortBreak' ? 'from-emerald-500 to-teal-600' : mode === 'longBreak' ? 'from-purple-500 to-pink-600' : 'from-orange-500 to-red-600'}`}>Concentração</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center justify-center gap-2">
           <Droplets size={16} className="text-blue-400" />
           {isActive ? "O tempo escoa como água..." : "Elimina distrações. Foca no que importa."}
        </p>
      </div>

      <Card className="p-6 md:p-12 rounded-3xl shadow-2xl bg-white dark:bg-slate-900 border-none relative overflow-hidden w-full max-w-sm md:max-w-md mx-auto z-0">
        {/* Background Glow Effect */}
        <div className={`absolute top-0 left-0 w-full h-full opacity-10 transition-colors duration-500 ${MODES[mode].bg} -z-10`}></div>
        
        {/* Selector de Modos */}
        <div className="flex flex-wrap justify-center gap-2 mb-10 relative z-10 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-2xl w-fit mx-auto border border-slate-100 dark:border-slate-800">
            {(Object.keys(MODES) as Array<keyof typeof MODES>).map((m) => {
                const isSelected = mode === m
                return (
                    <button
                        key={m}
                        onClick={() => changeMode(m)}
                        className={`px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-bold transition-all duration-300 ${
                            isSelected 
                                ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white transform scale-105" 
                                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        }`}
                    >
                        {MODES[m].label}
                    </button>
                )
            })}
        </div>

        {/* Input Customizado (Só aparece se modo == custom) */}
        {mode === 'custom' && !isActive && (
            <div className="mb-6 flex justify-center items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <span className="text-sm text-slate-500 font-medium">Minutos:</span>
                <Input 
                    type="number" 
                    min="1" 
                    max="180" 
                    value={customMinutes} 
                    onChange={(e) => setCustomMinutes(Number(e.target.value))}
                    className="w-20 text-center font-bold"
                />
            </div>
        )}

        {/* EFEITO LÍQUIDO (Círculo/Copo) */}
        <div className="relative w-64 h-64 mx-auto mb-10 rounded-full border-4 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 overflow-hidden shadow-inner">
            
            {/* O Líquido */}
            <div 
                className={`absolute bottom-0 left-0 w-full transition-all duration-1000 ease-linear ${MODES[mode].liquidColor} opacity-80`}
                style={{ height: `${progressPercent}%` }}
            >
                {/* Ondas (CSS Animation) - REMOVIDO ROTAÇÃO PARA EVITAR 'CORTE' */}
                <div className="absolute -top-3 left-0 w-[200%] h-6 bg-inherit opacity-50 rounded-[50%] animate-[wave_4s_linear_infinite]"></div>
                <div className="absolute -top-5 left-[-50%] w-[200%] h-10 bg-inherit opacity-30 rounded-[40%] animate-[wave_6s_linear_infinite_reverse]"></div>
            </div>

            {/* Texto Central (Sobreposto) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                <CurrentIcon size={32} className={`mb-2 transition-colors duration-300 ${isActive ? 'text-white drop-shadow-md animate-bounce-slow' : MODES[mode].color}`} />
                <div className={`text-6xl font-black tabular-nums tracking-tighter leading-none transition-colors duration-300 ${isActive && progressPercent > 50 ? 'text-white drop-shadow-md' : 'text-slate-900 dark:text-white'}`}>
                    {formatTime(timeLeft)}
                </div>
                <p className={`mt-2 font-bold uppercase tracking-widest text-[10px] transition-colors duration-300 ${isActive && progressPercent > 50 ? 'text-white/80' : 'text-slate-400'}`}>
                    {isActive ? "Fluindo..." : "Pronto"}
                </p>
            </div>
            
            {/* Brilho do vidro */}
            <div className="absolute top-4 left-4 w-16 h-16 bg-white opacity-20 rounded-full blur-xl pointer-events-none z-30"></div>
        </div>

        {/* Controles */}
        <div className="flex justify-center gap-4 relative z-10">
            <Button
                size="lg"
                onClick={toggleTimer}
                className={`h-16 w-16 rounded-full shadow-xl hover:scale-105 transition-all duration-200 ${
                    isActive 
                        ? "bg-slate-100 text-slate-900 hover:bg-slate-200 border-2 border-slate-200 dark:bg-slate-800 dark:text-white dark:border-slate-700" 
                        : `text-white hover:opacity-90 ${MODES[mode].liquidColor}`
                }`}
            >
                {isActive ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
            </Button>
            
            <Button
                size="lg"
                variant="outline"
                onClick={resetTimer}
                className="h-16 w-16 rounded-full border-2 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
                <RotateCcw size={22} />
            </Button>
        </div>

      </Card>
      
      {/* Texto Motivacional */}
      <div className="mt-8 h-6 text-center">
        {isActive && (
            <p className="text-slate-400 text-sm animate-pulse max-w-sm mx-auto">
                "A consistência é como a água: mole em pedra dura, tanto bate até que fura." 💧
            </p>
        )}
      </div>

      <style jsx global>{`
        @keyframes wave {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-bounce-slow {
            animation: bounce 3s infinite;
        }
      `}</style>
    </div>
  )
}

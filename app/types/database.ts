export interface Habit {
  id: string
  user_id: string
  title: string
  description: string | null
  streak: number
  created_at: string
}

export interface HabitLog {
  id: string
  habit_id: string
  user_id: string
  completed_at: string // Data em formato YYYY-MM-DD
}   
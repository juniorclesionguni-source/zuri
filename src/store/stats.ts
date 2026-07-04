import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface StatsState {
  xp: number
  level: number
  streakDays: number
  booksRead: number
  hoursRead: number
  addXP: (amount: number) => void
  incrementStreak: () => void
}

const LEVEL_XP = [0, 2500, 8000, 20000]

export const useStatsStore = create<StatsState>()(
  persist(
    (set) => ({
      xp: 12400,
      level: 3,
      streakDays: 14,
      booksRead: 23,
      hoursRead: 164,
      addXP: (amount) =>
        set((s) => {
          const newXP = s.xp + amount
          const newLevel = LEVEL_XP.filter((t) => newXP >= t).length
          return { xp: newXP, level: Math.min(newLevel, 4) }
        }),
      incrementStreak: () => set((s) => ({ streakDays: s.streakDays + 1 })),
    }),
    { name: 'zuri-stats' }
  )
)

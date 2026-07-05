import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useAuthStore } from './auth'
import type { UserStatsRow } from '../data/api/stats'

interface StatsState {
  xp: number
  level: number
  streakDays: number
  booksRead: number
  hoursRead: number
  addXP: (amount: number) => void
  incrementStreak: () => void
  hydrate: (stats: UserStatsRow) => void
  load: (userId: string) => Promise<void>
}

const LEVEL_XP = [0, 2500, 8000, 20000]

export const useStatsStore = create<StatsState>()(
  persist(
    (set, get) => ({
      xp: 0,
      level: 1,
      streakDays: 0,
      booksRead: 0,
      hoursRead: 0,
      addXP: (amount) =>
        set((s) => {
          const newXP = s.xp + amount
          const newLevel = Math.min(LEVEL_XP.filter((t) => newXP >= t).length, 4)
          const uid = useAuthStore.getState().user?.id
          if (uid) {
            void import('../data/api/stats').then(({ saveStats }) =>
              saveStats(uid, { xp: newXP, level: newLevel }).catch(() => {})
            )
            if (newLevel > s.level) {
              void (async () => {
                const { createNotification } = await import('../data/api/notifications')
                await createNotification(uid, 'levelup', `Subiste ao nível ${newLevel}! 🎉`, 'Parabéns! Continua a ler para o próximo nível.').catch(() => {})
                const { useNotifications } = await import('./notifications')
                useNotifications.getState().load(uid)
              })()
            }
          }
          return { xp: newXP, level: newLevel }
        }),
      incrementStreak: () =>
        set((s) => {
          const newStreak = s.streakDays + 1
          const uid = useAuthStore.getState().user?.id
          if (uid) {
            void import('../data/api/stats').then(({ saveStats }) =>
              saveStats(uid, { streak_days: newStreak }).catch(() => {})
            )
          }
          return { streakDays: newStreak }
        }),
      hydrate: (stats) =>
        set({
          xp: stats.xp,
          level: stats.level,
          streakDays: stats.streak_days,
          booksRead: stats.books_read,
          hoursRead: stats.hours_read,
        }),
      load: async (userId) => {
        const { fetchStats } = await import('../data/api/stats')
        const row = await fetchStats(userId)
        if (row) get().hydrate(row)
      },
    }),
    { name: 'zuri-stats' }
  )
)

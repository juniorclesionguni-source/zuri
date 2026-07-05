import { create } from 'zustand'
import type { Notif } from '../data/api/notifications'

interface NotifState {
  items: Notif[]
  unread: number
  load: (userId: string) => Promise<void>
  markAllRead: (userId: string) => Promise<void>
}

export const useNotifications = create<NotifState>()((set, get) => ({
  items: [],
  unread: 0,
  load: async (userId) => {
    // import() dinâmico: mantém o supabase-js fora do chunk inicial.
    const api = await import('../data/api/notifications')
    await api.ensureWelcome(userId).catch(() => {})
    const items = await api.listNotifications(userId).catch(() => [] as Notif[])
    set({ items, unread: items.filter((n) => !n.read).length })
  },
  markAllRead: async (userId) => {
    const { items } = get()
    if (!items.some((n) => !n.read)) return
    set({ items: items.map((n) => ({ ...n, read: true })), unread: 0 })
    const api = await import('../data/api/notifications')
    api.markAllRead(userId).catch(() => {})
  },
}))

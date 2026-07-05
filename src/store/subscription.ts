import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type SubStatus = 'inactive' | 'pending' | 'active'

interface SubState {
  status: SubStatus
  expiresAt: string | null
  setPending: () => void
  load: (userId: string) => Promise<void>
  activate: (userId: string) => Promise<void>
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })
}

function calcStatus(row: { status: string; expiresAt: string | null }): SubStatus {
  return row.status === 'active' && row.expiresAt && new Date(row.expiresAt) > new Date()
    ? 'active'
    : 'inactive'
}

export const useSubStore = create<SubState>()(
  persist(
    (set) => ({
      status: 'inactive',
      expiresAt: null,
      setPending: () => set({ status: 'pending' }),
      load: async (userId: string) => {
        const { getSubscription } = await import('../data/api/subscription')
        const row = await getSubscription(userId)
        if (!row) return
        set({ status: calcStatus(row), expiresAt: row.expiresAt ? fmtDate(row.expiresAt) : null })
      },
      activate: async (_userId: string) => {
        const { activateSimulated } = await import('../data/api/subscription')
        const res = await activateSimulated() // servidor activa e devolve o novo estado
        set({ status: calcStatus(res), expiresAt: res.expiresAt ? fmtDate(res.expiresAt) : null })
      },
    }),
    { name: 'zuri-sub' }
  )
)

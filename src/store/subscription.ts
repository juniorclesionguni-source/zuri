import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type SubStatus = 'inactive' | 'pending' | 'active'

interface SubState {
  status: SubStatus
  expiresAt: string | null
  setPending: () => void
  setActive: () => void
}

export const useSubStore = create<SubState>()(
  persist(
    (set) => ({
      status: 'inactive',
      expiresAt: null,
      setPending: () => set({ status: 'pending' }),
      setActive: () => {
        const d = new Date()
        d.setMonth(d.getMonth() + 1)
        set({ status: 'active', expiresAt: d.toLocaleDateString('pt-MZ') })
      },
    }),
    { name: 'zuri-sub' }
  )
)

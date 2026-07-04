import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  dark: boolean
  toggleDark: () => void
  installPromptShown: boolean
  setInstallPromptShown: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      dark: false,
      toggleDark: () => set((s) => ({ dark: !s.dark })),
      installPromptShown: false,
      setInstallPromptShown: () => set({ installPromptShown: true }),
    }),
    { name: 'zuri-ui' }
  )
)

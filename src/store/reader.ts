import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Preferências de leitura — persistem entre sessões (antes resetavam sempre).
// `flow` escolhe entre paginado (estilo Kindle) e scroll vertical contínuo.
// `hintSeen` guarda se já mostrámos a dica de navegação na 1ª abertura.
export type Flow = 'paginated' | 'scrolled'

interface ReaderState {
  theme: string
  fontSize: number
  lineHeight: string
  fontFamily: string
  flow: Flow
  hintSeen: boolean
  setTheme: (t: string) => void
  setFontSize: (s: number) => void
  setLineHeight: (lh: string) => void
  setFontFamily: (f: string) => void
  setFlow: (f: Flow) => void
  setHintSeen: () => void
}

export const useReaderPrefs = create<ReaderState>()(
  persist(
    (set) => ({
      theme: 'sépia',
      fontSize: 17,
      lineHeight: 'Normal',
      fontFamily: 'Lora',
      flow: 'paginated',
      hintSeen: false,
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      setLineHeight: (lineHeight) => set({ lineHeight }),
      setFontFamily: (fontFamily) => set({ fontFamily }),
      setFlow: (flow) => set({ flow }),
      setHintSeen: () => set({ hintSeen: true }),
    }),
    { name: 'zuri-reader' }
  )
)

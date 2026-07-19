import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type SubStatus = 'inactive' | 'pending' | 'active'

interface SubState {
  status: SubStatus
  expiresAt: string | null // ISO; formatar só na exibição
  setPending: () => void
  setActive: () => void // caminho mock (sem Supabase)
  setFromServer: (s: { status: string; expiresAt: string | null }) => void
  hydrate: (userId: string) => Promise<void>
}

// Estado persistido = cache offline do último estado conhecido; o servidor é a fonte de verdade.
export const useSubStore = create<SubState>()(
  persist(
    (set) => ({
      status: 'inactive',
      expiresAt: null,
      setPending: () => set({ status: 'pending' }),
      setActive: () => {
        const d = new Date()
        d.setMonth(d.getMonth() + 1)
        set({ status: 'active', expiresAt: d.toISOString() })
      },
      setFromServer: (s) =>
        set({
          status: (['inactive', 'pending', 'active'].includes(s.status) ? s.status : 'inactive') as SubStatus,
          expiresAt: s.expiresAt,
        }),
      hydrate: async (userId) => {
        const { getSubscription } = await import('../data/api/subscription')
        const s = await getSubscription(userId)
        if (s) useSubStore.getState().setFromServer(s) // undefined = offline, mantém persistido
      },
    }),
    { name: 'zuri-sub' }
  )
)

// ponytail: graça client-side de 7 dias para leitura OFFLINE após expirar — perder o
// acesso a meio do capítulo por saldo M-Pesa é a causa nº1 de churn; mover para o
// servidor se houver abuso.
const GRACE_DAYS = 7

export function canReadOffline(): boolean {
  const { status, expiresAt } = useSubStore.getState()
  if (status === 'active') return true
  if (!expiresAt) return false
  const exp = new Date(expiresAt).getTime()
  return !isNaN(exp) && Date.now() < exp + GRACE_DAYS * 86_400_000
}

export function graceEndsAt(): string | null {
  const { expiresAt } = useSubStore.getState()
  if (!expiresAt) return null
  const exp = new Date(expiresAt).getTime()
  return isNaN(exp) ? null : new Date(exp + GRACE_DAYS * 86_400_000).toISOString()
}

// "activa" expirada no servidor mas ainda dentro do prazo? O servidor manda; aqui só formatamos.
export function formatExpiresAt(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso // estados antigos persistidos já formatados
  return d.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })
}

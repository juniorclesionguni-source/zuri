// Fonte única dos planos no cliente. O servidor (mpesa-initiate) revalida preço/dias
// a partir do id — nunca confia no valor enviado. Manter sincronizado com
// supabase/functions/_shared/plans.ts.
export type PlanId = 'week' | 'fortnight' | 'month' | 'year'

export interface Plan {
  id: PlanId
  label: string // nome no cartão
  price: number // MT
  days: number
  per: string // sufixo (/sem, /mês…)
  note?: string // destaque opcional
}

export const PLANS: Plan[] = [
  { id: 'week', label: 'Semana', price: 15, days: 7, per: '/sem' },
  { id: 'fortnight', label: '14 dias', price: 25, days: 14, per: '/14d' },
  { id: 'month', label: 'Mês', price: 45, days: 30, per: '/mês', note: 'Popular' },
  { id: 'year', label: 'Ano', price: 450, days: 365, per: '/ano', note: '2 meses grátis' },
]

export const DEFAULT_PLAN: PlanId = 'month'

export const getPlan = (id: PlanId): Plan => PLANS.find((p) => p.id === id) ?? PLANS[2]

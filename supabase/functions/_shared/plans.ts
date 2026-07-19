// Fonte de verdade de preço/duração no servidor. O cliente envia só o id do plano;
// o preço e os dias vêm daqui. Manter sincronizado com src/data/plans.ts.
export type PlanId = 'week' | 'fortnight' | 'month' | 'year'

export const PLANS: Record<PlanId, { price: number; days: number }> = {
  week: { price: 15, days: 7 },
  fortnight: { price: 25, days: 14 },
  month: { price: 45, days: 30 },
  year: { price: 450, days: 365 },
}

export const isPlanId = (v: unknown): v is PlanId =>
  typeof v === 'string' && v in PLANS

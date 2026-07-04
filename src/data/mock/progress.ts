import { saveProgress, getProgress } from '../db'

export async function mockSyncProgress(userId: string, bookId: string, pct: number) {
  await saveProgress(userId, bookId, pct)
}

export async function mockGetProgress(userId: string, bookId: string) {
  const p = await getProgress(userId, bookId)
  return p?.progressPct ?? 0
}

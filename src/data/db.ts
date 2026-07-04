import Dexie, { type Table } from 'dexie'

interface ReadingProgress {
  id?: number
  userId: string
  bookId: string
  lastCfi: string
  progressPct: number
  isFinished: boolean
  updatedAt: number
}

interface OfflineBook {
  bookId: string
  path: string
  sizeMb: number
  downloadedAt: number
}

interface ReadingSession {
  id?: number
  userId: string
  bookId: string
  startedAt: number
  endedAt: number
  minutes: number
  day: string // 'YYYY-MM-DD' local
}

interface BookCache {
  id: string
  title: string
  author: string
  genre: string
  cachedAt: number
}

class ZuriDB extends Dexie {
  readingProgress!: Table<ReadingProgress>
  offlineBooks!: Table<OfflineBook>
  readingSessions!: Table<ReadingSession>
  booksCache!: Table<BookCache>

  constructor() {
    super('ZuriDB')
    this.version(1).stores({
      readingProgress: '++id, userId, bookId',
      offlineBooks: 'bookId',
      readingSessions: '++id, bookId, synced',
      booksCache: 'id',
    })
    // v2: índice composto para a lookup userId+bookId em getProgress
    this.version(2).stores({
      readingProgress: '++id, userId, bookId, [userId+bookId]',
    })
    // v3: readingSessions agora armazena sessões reais com userId + day local
    this.version(3).stores({
      readingSessions: '++id, userId, bookId, day',
    })
  }
}

export const db = new ZuriDB()

// ── progress ──────────────────────────────────────────────────────────────────

export async function getProgress(userId: string, bookId: string) {
  return db.readingProgress.where({ userId, bookId }).first()
}

export async function saveProgress(userId: string, bookId: string, pct: number, cfi = '') {
  const existing = await getProgress(userId, bookId)
  const newPct = Math.max(pct, existing?.progressPct ?? 0) // monotonic
  if (existing?.id) {
    await db.readingProgress.update(existing.id, { progressPct: newPct, lastCfi: cfi, updatedAt: Date.now() })
  } else {
    await db.readingProgress.add({ userId, bookId, lastCfi: cfi, progressPct: newPct, isFinished: newPct >= 95, updatedAt: Date.now() })
  }
}

export async function getAllProgress(userId: string) {
  return db.readingProgress.where({ userId }).toArray()
}

// ── reading sessions ──────────────────────────────────────────────────────────

function localDay(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Grava a sessão se durou >= 0.5 min (30 s). */
export async function logSession(userId: string, bookId: string, startedAt: number, endedAt: number): Promise<void> {
  const minutes = (endedAt - startedAt) / 60000
  if (minutes < 0.5) return
  await db.readingSessions.add({ userId, bookId, startedAt, endedAt, minutes, day: localDay(startedAt) })
}

/** Sessões dos últimos N dias (inclusive hoje). */
export async function getSessionsSince(userId: string, days: number): Promise<ReadingSession[]> {
  const cutoff = localDay(Date.now() - days * 86400000)
  return db.readingSessions
    .where('userId').equals(userId)
    .and((s) => !!s.day && s.day >= cutoff)
    .toArray()
}

/** Mapa { 'YYYY-MM-DD': minutos } dos últimos N dias. */
export async function getDailyMinutes(userId: string, days: number): Promise<Record<string, number>> {
  const sessions = await getSessionsSince(userId, days)
  const out: Record<string, number> = {}
  for (const s of sessions) out[s.day] = (out[s.day] ?? 0) + (s.minutes ?? 0)
  return out
}

/** Soma total de minutos lidos (todos os tempos). */
export async function getTotalMinutes(userId: string): Promise<number> {
  const all = await db.readingSessions.where({ userId }).toArray()
  return all.reduce((sum, s) => sum + (s.minutes ?? 0), 0)
}

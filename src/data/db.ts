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
  bookId: string
  startedAt: number
  endedAt: number
  pagesRead: number
  synced: boolean
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
  }
}

export const db = new ZuriDB()

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

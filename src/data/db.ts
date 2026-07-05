import Dexie, { type Table } from 'dexie'
import type { Book } from './catalog'

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
  data: ArrayBuffer // o EPUB inteiro, para ler offline
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

// Catálogo completo em cache para funcionar offline.
type BookCache = Book & { cachedAt: number }

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

// ── catálogo em cache (offline) ─────────────────────────────────────────────────

export async function cacheBooks(books: Book[]): Promise<void> {
  const now = Date.now()
  await db.booksCache.bulkPut(books.map((b) => ({ ...b, cachedAt: now })))
}

export async function getCachedBooks(): Promise<Book[]> {
  // BookCache estende Book — o cachedAt extra é inofensivo.
  return db.booksCache.toArray()
}

// ── livros offline (EPUB guardado) ──────────────────────────────────────────────

/** Descarrega o EPUB e guarda-o em IndexedDB. onProgress recebe 0–100 se houver content-length. */
export async function saveOfflineBook(bookId: string, url: string, onProgress?: (pct: number) => void): Promise<number> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`download falhou (${res.status})`)
  const total = Number(res.headers.get('content-length')) || 0
  const reader = res.body?.getReader()
  const chunks: Uint8Array[] = []
  let received = 0
  if (reader) {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
      received += value.length
      if (total && onProgress) onProgress(Math.min(99, Math.round((received / total) * 100)))
    }
  } else {
    const buf = await res.arrayBuffer()
    chunks.push(new Uint8Array(buf))
    received = buf.byteLength
  }
  const merged = new Uint8Array(received)
  let off = 0
  for (const c of chunks) { merged.set(c, off); off += c.length }
  await db.offlineBooks.put({ bookId, path: url, data: merged.buffer, sizeMb: received / 1048576, downloadedAt: Date.now() })
  if (onProgress) onProgress(100)
  return received
}

export async function getOfflineBook(bookId: string): Promise<OfflineBook | undefined> {
  return db.offlineBooks.get(bookId)
}

export async function listOfflineBooks(): Promise<OfflineBook[]> {
  return db.offlineBooks.toArray()
}

export async function removeOfflineBook(bookId: string): Promise<void> {
  await db.offlineBooks.delete(bookId)
}

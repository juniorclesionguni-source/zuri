/**
 * Agrega métricas reais após uma sessão de leitura.
 * Importado dinamicamente do Reader (cleanup / save-progress effect).
 */
import { getTotalMinutes } from './db'
import { fetchStats, saveStats } from './api/stats'
import { useStatsStore } from '../store/stats'

function localDay(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Actualiza horas lidas + streak no Supabase e no store local. Fire-and-forget. */
export async function updateAggregates(userId: string): Promise<void> {
  const today = localDay(Date.now())

  // Horas — soma total de minutos / 60, arredondado
  getTotalMinutes(userId).then(async (total) => {
    const hours = Math.round(total / 60)
    await saveStats(userId, { hours_read: hours }).catch(() => {})
    useStatsStore.setState({ hoursRead: hours })
  }).catch(() => {})

  // Streak via last_read_date
  fetchStats(userId).then(async (row) => {
    if (row?.last_read_date === today) return // já actualizado hoje
    const yesterday = localDay(Date.now() - 86400000)
    const newStreak = row?.last_read_date === yesterday ? (row.streak_days ?? 0) + 1 : 1
    await saveStats(userId, { streak_days: newStreak, last_read_date: today }).catch(() => {})
    useStatsStore.setState({ streakDays: newStreak })
  }).catch(() => {})
}

/** Incrementa books_read quando um livro cruza 95% pela primeira vez. Fire-and-forget. */
export async function incrementBooksRead(userId: string): Promise<void> {
  const row = await fetchStats(userId)
  const newCount = (row?.books_read ?? 0) + 1
  await saveStats(userId, { books_read: newCount }).catch(() => {})
  useStatsStore.setState({ booksRead: newCount })
}

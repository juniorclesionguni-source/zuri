import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../components/ui/Icon'
import { useAuthStore } from '../../store/auth'
import { useStatsStore } from '../../store/stats'
import { useLibrary } from '../../store/library'
import { useCatalog } from '../../store/catalog'
import { LEVELS } from '../../data/catalog'

function localDay(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function StatsDetail() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { xp, level, streakDays, booksRead, hoursRead } = useStatsStore()
  const progress = useLibrary((s) => s.progress)
  const books = useCatalog((s) => s.books)

  const [dailyMins, setDailyMins] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!user?.id) return
    import('../../data/db').then(({ getDailyMinutes }) =>
      getDailyMinutes(user.id!, 30).then(setDailyMins).catch(() => {})
    )
  }, [user?.id])

  const currentLevel = LEVELS[Math.min(level - 1, LEVELS.length - 1)]

  // Livros terminados (pct >= 95)
  const finishedBooks = books.filter((b) => (progress[b.id]?.pct ?? 0) >= 95)

  // Distribuição por género
  const byGenre: Record<string, number> = {}
  finishedBooks.forEach((b) => { byGenre[b.genre] = (byGenre[b.genre] ?? 0) + 1 })
  const genres = Object.entries(byGenre).sort(([, a], [, b]) => b - a)
  const maxGenre = Math.max(...genres.map(([, c]) => c), 1)

  // Gráfico 30 dias
  const days30 = Array.from({ length: 30 }, (_, i) => localDay(Date.now() - (29 - i) * 86400000))
  const values30 = days30.map((d) => dailyMins[d] ?? 0)
  const maxVal = Math.max(...values30, 1)
  const hasActivity = values30.some((v) => v > 0)
  const avgMins = Math.round(values30.reduce((s, v) => s + v, 0) / 30)

  const card = (label: string, value: string) => (
    <div style={{ background: 'var(--bg2)', borderRadius: 14, padding: '16px 18px', textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 500, color: 'var(--text)' }}>{value}</div>
      <div style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>{label}</div>
    </div>
  )

  return (
    <div style={{ width: '100%', height: '100%', background: 'var(--bg)', overflowY: 'auto', paddingBottom: 48 }}>
      {/* Header */}
      <div style={{ padding: '56px 20px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div onClick={() => navigate(-1)} style={{ cursor: 'pointer', padding: 4 }}>
          <Icon name="chevron-left" size={22} color="var(--text)" strokeWidth={2} />
        </div>
        <h1 style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 22, color: 'var(--text)', margin: 0 }}>Estatísticas</h1>
      </div>

      {/* Totais */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '0 20px' }}>
        {card('livros lidos', String(booksRead))}
        {card('horas lidas', `${hoursRead}h`)}
        {card('streak dias', String(streakDays))}
        {card(`XP · ${currentLevel.name}`, xp.toLocaleString('pt'))}
      </div>

      {/* Gráfico 30 dias */}
      <div style={{ margin: '20px 20px 0', padding: 18, background: 'var(--bg2)', borderRadius: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 700, color: 'var(--text2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Últimos 30 dias</div>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--text3)' }}>
            {hasActivity ? `média ${avgMins} min/dia` : ''}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 60 }}>
          {hasActivity
            ? values30.map((v, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: v > 0 ? Math.max(4, Math.round((v / maxVal) * 54)) : 2,
                    background: v > 0 ? 'var(--accent)' : 'var(--accent-soft)',
                    borderRadius: 2,
                    opacity: v > 0 ? 1 : 0.25,
                  }}
                />
              ))
            : (
              <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--text3)', height: '100%' }}>
                Começa a ler para veres a tua atividade
              </div>
            )}
        </div>
      </div>

      {/* Distribuição por género */}
      <div style={{ margin: '20px 20px 0', padding: 18, background: 'var(--bg2)', borderRadius: 16 }}>
        <div style={{ fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 700, color: 'var(--text2)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>
          Por género
        </div>
        {genres.length === 0
          ? <div style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--text3)' }}>Termina um livro para veres a distribuição</div>
          : genres.map(([genre, count]) => (
            <div key={genre} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--text2)', marginBottom: 4 }}>
                <span>{genre}</span>
                <span style={{ color: 'var(--text3)' }}>{count}</span>
              </div>
              <div style={{ height: 4, background: 'var(--border)', borderRadius: 2 }}>
                <div style={{ width: `${(count / maxGenre) * 100}%`, height: '100%', background: 'var(--accent)', borderRadius: 2 }} />
              </div>
            </div>
          ))}
      </div>

      {/* Livros terminados */}
      <div style={{ margin: '20px 20px 0', padding: '18px 18px 4px', background: 'var(--bg2)', borderRadius: 16 }}>
        <div style={{ fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 700, color: 'var(--text2)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>
          Terminados
        </div>
        {finishedBooks.length === 0
          ? <div style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--text3)', marginBottom: 14 }}>Ainda não terminaste nenhum livro</div>
          : finishedBooks.map((b) => (
            <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              {b.cover_url
                ? <img src={b.cover_url} alt={b.title} style={{ width: 36, height: 52, borderRadius: 4, objectFit: 'cover' }} />
                : <div style={{ width: 36, height: 52, borderRadius: 4, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="book" size={16} color="var(--accent)" strokeWidth={1.5} />
                  </div>
              }
              <div>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{b.title}</div>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{b.author}</div>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

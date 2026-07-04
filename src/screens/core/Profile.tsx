import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../components/ui/Icon'
import { useAuthStore } from '../../store/auth'
import { useStatsStore } from '../../store/stats'
import { useUIStore } from '../../store/ui'
import { LEVELS } from '../../data/catalog'

function localDay(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function Profile({ onLevelUp, onShare }: { onLevelUp: () => void; onShare: (kind: string) => void }) {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { xp, level, streakDays, booksRead, hoursRead } = useStatsStore()
  const toggleDark = useUIStore((s) => s.toggleDark)
  const dark = useUIStore((s) => s.dark)

  const [dailyMins, setDailyMins] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!user?.id) return
    import('../../data/db').then(({ getDailyMinutes }) =>
      getDailyMinutes(user.id!, 30).then(setDailyMins).catch(() => {})
    )
  }, [user?.id])

  const currentLevel = LEVELS[Math.min(level - 1, LEVELS.length - 1)]
  const nextLevel = LEVELS[Math.min(level, LEVELS.length - 1)]
  const xpProgress = nextLevel ? Math.round(((xp - currentLevel.xp) / (nextLevel.xp - currentLevel.xp)) * 100) : 100

  const initial = (user?.name ?? 'U')[0]

  const memberSince = user?.created_at
    ? `Membro desde ${new Date(user.created_at).toLocaleString('pt-PT', { month: 'long', year: 'numeric' })}`
    : 'Leitor Zuri'

  const currentMonth = new Date().toLocaleString('pt-PT', { month: 'long' })
  const monthLabel = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)

  // Gráfico real de 30 dias
  const days30 = Array.from({ length: 30 }, (_, i) => localDay(Date.now() - (29 - i) * 86400000))
  const values30 = days30.map((d) => dailyMins[d] ?? 0)
  const maxVal = Math.max(...values30, 1)
  const hasActivity = values30.some((v) => v > 0)
  const avgMins = Math.round(values30.reduce((s, v) => s + v, 0) / 30)

  return (
    <div style={{ width: '100%', height: '100%', background: 'var(--bg)', overflowY: 'auto', paddingBottom: 96 }}>
      <div style={{ padding: '60px 20px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: 40, background: 'var(--accent-soft)', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 34, color: 'var(--accent)' }}>{initial}</div>
        <h2 style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 500, fontSize: 24, color: 'var(--text)', margin: '14px 0 2px' }}>{user?.name ?? 'Teresa Massingue'}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--accent)' }}>
          <Icon name="award" size={13} strokeWidth={2} color="var(--accent)" />
          {currentLevel.name} · Nível {currentLevel.n}
        </div>
        <div style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{memberSince}</div>
      </div>

      {/* XP bar */}
      <div style={{ margin: '0 20px 24px', padding: 18, background: 'var(--bg2)', borderRadius: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>
          <span>{xp.toLocaleString('pt')} XP</span>
          <span>{nextLevel?.xp.toLocaleString('pt')} XP</span>
        </div>
        <div style={{ height: 6, background: 'var(--border)', borderRadius: 3 }}>
          <div style={{ width: `${xpProgress}%`, height: '100%', background: 'var(--accent)', borderRadius: 3 }} />
        </div>
        <div style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--text3)', marginTop: 8 }}>
          Faltam {Math.max(0, (nextLevel?.xp ?? 0) - xp).toLocaleString('pt')} XP para{' '}
          <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--text2)' }}>{nextLevel?.name ?? 'Nível máximo'}</span>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', margin: '0 20px', background: 'var(--bg2)', borderRadius: 16, padding: '18px 0' }}>
        {[[String(booksRead), 'livros'], [`${hoursRead}h`, 'lidas'], [String(streakDays), 'streak']].map(([n, l], i) => (
          <div key={l} style={{ textAlign: 'center', borderRight: i < 2 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 500, color: 'var(--text)' }}>{n}</div>
            <div style={{ fontFamily: 'var(--sans)', fontSize: 10, color: 'var(--text3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Chart — dados reais de Dexie */}
      <div style={{ margin: '24px 20px 0', padding: 18, background: 'var(--bg2)', borderRadius: 16 }}>
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

      {/* Shortcuts */}
      <div style={{ margin: '24px 20px 0', background: 'var(--bg2)', borderRadius: 16, overflow: 'hidden' }}>
        {[
          { icon: 'bar-chart-2', label: 'Stats detalhados', action: () => navigate('/stats') },
          { icon: 'award', label: 'As minhas conquistas', action: onLevelUp },
          { icon: 'crown', label: 'A minha subscrição', action: () => navigate('/paywall') },
          { icon: 'share-2', label: `Partilhar o meu ${monthLabel}`, action: () => onShare('wrapped') },
          { icon: dark ? 'sun' : 'moon', label: dark ? 'Modo claro' : 'Modo escuro', action: toggleDark },
        ].map((item, i, arr) => (
          <div key={item.label} onClick={item.action} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', borderBottom: i < arr.length - 1 ? '0.5px solid var(--border)' : 'none', cursor: 'pointer' }}>
            <Icon name={item.icon} size={20} color="var(--text2)" strokeWidth={1.5} />
            <div style={{ flex: 1, fontFamily: 'var(--sans)', fontSize: 15, color: 'var(--text)' }}>{item.label}</div>
            <Icon name="chevron-right" size={16} color="var(--text3)" strokeWidth={1.8} />
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--text3)', margin: '28px 0 0' }}>Zuri v1.0.0</div>
    </div>
  )
}

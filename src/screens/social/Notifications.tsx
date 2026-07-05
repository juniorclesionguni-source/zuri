import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../components/ui/Icon'
import { useAuthStore } from '../../store/auth'
import { useNotifications } from '../../store/notifications'

const ICON: Record<string, string> = { levelup: 'award', book: 'book-open', request: 'chevron-up', info: 'bell' }

function ago(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'agora'
  if (s < 3600) return `há ${Math.floor(s / 60)} min`
  if (s < 86400) return `há ${Math.floor(s / 3600)} h`
  if (s < 604800) return `há ${Math.floor(s / 86400)} d`
  return new Date(iso).toLocaleDateString('pt-PT')
}

export function Notifications() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const items = useNotifications((s) => s.items)
  const markAllRead = useNotifications((s) => s.markAllRead)

  // Ao abrir, marca todas como lidas (mostra-as com o realce, mas limpa o contador).
  useEffect(() => {
    if (user?.id) markAllRead(user.id)
  }, [user?.id, markAllRead])

  return (
    <div style={{ width: '100%', height: '100%', background: 'var(--bg)', overflowY: 'auto', paddingBottom: 40 }}>
      <div style={{ padding: '58px 20px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: -6 }}>
          <Icon name="chevron-left" size={24} color="var(--text)" strokeWidth={2} />
        </button>
        <h1 style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 500, fontSize: 30, color: 'var(--text)', margin: 0 }}>Notificações</h1>
      </div>

      {items.length === 0 ? (
        <div style={{ padding: '80px 20px', textAlign: 'center' }}>
          <Icon name="bell" size={40} color="var(--text3)" strokeWidth={1} />
          <p style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--text3)', marginTop: 16 }}>Sem notificações por agora</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '22px 20px 0' }}>
          {items.map((n) => (
            <div key={n.id} style={{ display: 'flex', gap: 14, padding: 14, background: 'var(--bg2)', borderRadius: 14, border: n.read ? '1px solid transparent' : '1px solid var(--accent)' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={ICON[n.type] ?? 'bell'} size={18} color="var(--accent)" strokeWidth={2} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' }}>
                  <div style={{ fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{n.title}</div>
                  <div style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--text3)', flexShrink: 0 }}>{ago(n.created_at)}</div>
                </div>
                {n.body && <div style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--text2)', marginTop: 4, lineHeight: 1.4 }}>{n.body}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

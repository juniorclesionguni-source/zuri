import { useNavigate, useLocation } from 'react-router-dom'
import { useUIStore } from '../../store/ui'
import { Icon } from './Icon'

const TABS = [
  { id: 'home', label: 'Home', icon: 'home', path: '/home' },
  { id: 'explore', label: 'Explorar', icon: 'compass', path: '/explore' },
  { id: 'reading', label: 'A ler', icon: 'book-open', path: '/reading' },
  { id: 'library', label: 'My Zuri', icon: 'library', path: '/library' },
  { id: 'profile', label: 'Perfil', icon: 'user', path: '/profile' },
]

const HIDE_ON = ['/', '/welcome', '/login', '/genres', '/paywall', '/checkout', '/processing', '/success', '/wrapped', '/requests']

export function TabBar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const dark = useUIStore((s) => s.dark)

  const hidden = HIDE_ON.some((p) => pathname === p) || pathname.startsWith('/reader') || pathname.startsWith('/book')
  if (hidden) return null

  return (
    <div className="zuri-bottombar" style={{
      background: dark ? 'rgba(40,35,28,0.92)' : 'rgba(254,248,245,0.92)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      borderTop: '0.5px solid var(--border)',
      paddingTop: 8, paddingBottom: 24,
      display: 'flex', justifyContent: 'space-around',
      zIndex: 30,
    }}>
      {TABS.map((tab) => {
        const isActive = pathname.startsWith(tab.path)
        return (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            style={{
              flex: 1, background: 'none', border: 'none',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              padding: '4px 0', cursor: 'pointer',
              color: isActive ? 'var(--accent)' : 'var(--text3)',
            }}
          >
            <Icon name={tab.icon} size={22} strokeWidth={isActive ? 2 : 1.5} color={isActive ? 'var(--accent)' : 'var(--text3)'} />
            <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, letterSpacing: 0.2, fontFamily: 'var(--sans)' }}>{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}

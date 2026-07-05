import { useNavigate, useLocation } from 'react-router-dom'
import { TABS } from './TabBar'
import { ZuriMark, ZuriWordmark } from './ZuriMark'
import { Icon } from './Icon'

export function Sidebar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <div style={{
      width: 220,
      height: '100%',
      background: 'var(--bg)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>
      {/* Brand */}
      <div style={{ padding: '32px 24px 24px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <ZuriMark size={28} />
        <ZuriWordmark size={13} />
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0 12px' }}>
        {TABS.map((tab) => {
          const active = pathname.startsWith(tab.path)
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                borderRadius: 10,
                border: 'none',
                background: active ? 'var(--accent-soft)' : 'none',
                color: active ? 'var(--accent)' : 'var(--text2)',
                cursor: 'pointer',
                fontFamily: 'var(--sans)',
                fontSize: 14,
                fontWeight: active ? 700 : 500,
                marginBottom: 4,
                textAlign: 'left',
              }}
            >
              <Icon name={tab.icon} size={18} strokeWidth={active ? 2 : 1.5} color={active ? 'var(--accent)' : 'var(--text2)'} />
              {tab.label}
            </button>
          )
        })}
      </nav>
    </div>
  )
}

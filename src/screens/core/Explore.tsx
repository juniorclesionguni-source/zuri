import { useNavigate } from 'react-router-dom'
import { Icon } from '../../components/ui/Icon'
import { CATEGORIES } from '../../data/catalog'

export function Explore() {
  const navigate = useNavigate()

  return (
    <div style={{ width: '100%', height: '100%', background: 'var(--bg)', overflowY: 'auto', paddingBottom: 96 }}>
      <div style={{ padding: '60px 20px 0' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 500, fontSize: 32, color: 'var(--text)', margin: '0 0 20px' }}>Explorar</h1>

        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'var(--bg2)', borderRadius: 999, marginBottom: 28 }}>
          <Icon name="search" size={18} color="var(--text3)" strokeWidth={1.8} />
          <input placeholder="Procurar livros, autores…" style={{ flex: 1, border: 'none', background: 'transparent', fontFamily: 'var(--sans)', fontSize: 15, color: 'var(--text)', outline: 'none' }} />
        </div>
      </div>

      {/* Categories */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 20px' }}>
        {CATEGORIES.map((cat) => (
          <div
            key={cat.name}
            style={{ height: 120, borderRadius: 16, background: 'var(--bg2)', border: '1px solid var(--border)', padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
          >
            <Icon name={cat.icon} size={22} color="var(--accent)" strokeWidth={1.5} />
            <div>
              <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 500, fontSize: 20, color: 'var(--text)', lineHeight: 1.1 }}>{cat.name}</div>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>{cat.count} livros</div>
            </div>
          </div>
        ))}

        {/* Mais Pedidos entry */}
        <div
          onClick={() => navigate('/requests')}
          style={{ gridColumn: '1 / -1', padding: '16px 18px', borderRadius: 16, background: 'var(--bg2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="chevron-up" size={22} color="var(--accent)" strokeWidth={2} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 18, color: 'var(--text)' }}>Mais Pedidos</div>
            <div style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>Vota nos livros que queres ver no Zuri</div>
          </div>
          <Icon name="chevron-right" size={18} color="var(--text3)" strokeWidth={1.8} />
        </div>
      </div>
    </div>
  )
}

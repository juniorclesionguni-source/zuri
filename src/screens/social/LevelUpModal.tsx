import { Icon } from '../../components/ui/Icon'

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

interface Props {
  level?: number
  onClose: () => void
  onShare: () => void
}

export function LevelUpModal({ level = 3, onClose, onShare }: Props) {
  return (
    <div className="zuri-overlay" style={{ zIndex: 250, backdropFilter: 'blur(12px)', background: 'rgba(0,0,0,0.6)' }}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ width: 160, height: 160, borderRadius: 80, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'zpop 0.6s cubic-bezier(0.34,1.56,0.64,1)', marginBottom: 28 }}>
          <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 500, fontSize: 80, color: '#FEF8F5', lineHeight: 1 }}>{ROMAN[level] ?? level}</span>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 700, letterSpacing: '0.25em', color: 'rgba(254,248,245,0.7)', textTransform: 'uppercase', marginBottom: 8 }}>Subiste de nível</div>
          <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 500, fontSize: 44, color: '#FEF8F5', lineHeight: 1 }}>Nível {level}</div>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 15, color: 'rgba(254,248,245,0.65)', marginTop: 10 }}>Continua a ler para desbloquear novas conquistas.</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 320, marginTop: 44 }}>
          <button onClick={onShare} style={{ width: '100%', height: 52, borderRadius: 12, border: 'none', background: '#FEF8F5', color: 'var(--accent)', fontFamily: 'var(--sans)', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Icon name="share-2" size={18} color="var(--accent)" strokeWidth={2} /> Partilhar conquista
          </button>
          <button onClick={onClose} style={{ width: '100%', height: 52, borderRadius: 12, border: '1.5px solid rgba(254,248,245,0.3)', background: 'transparent', color: '#FEF8F5', fontFamily: 'var(--sans)', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
            Continuar a ler
          </button>
        </div>
      </div>
    </div>
  )
}

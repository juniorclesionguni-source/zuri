import { Icon } from '../../components/ui/Icon'

interface Props {
  theme: string
  fontSize: number
  lineHeight: string
  fontFamily: string
  onTheme: (t: string) => void
  onFontSize: (s: number) => void
  onLineHeight: (lh: string) => void
  onFontFamily: (f: string) => void
  onClose: () => void
}

const THEMES = [
  { id: 'claro',  bg: '#FEF8F5', text: '#3A2020' },
  { id: 'sépia',  bg: '#F5EDE6', text: '#3A2020' },
  { id: 'escuro', bg: '#28231C', text: '#EEE4D0' },
  { id: 'oled',   bg: '#000',    text: '#E0D5C0' },
]

export function ReaderSettings({ theme, fontSize, lineHeight, fontFamily, onTheme, onFontSize, onLineHeight, onFontFamily, onClose }: Props) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 100 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'var(--bg)', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: '16px 24px 40px', maxHeight: '72%', overflowY: 'auto' }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 18px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 500, fontSize: 22, color: 'var(--text)', margin: 0 }}>Preferências</h2>
          <div onClick={onClose} style={{ cursor: 'pointer' }}><Icon name="x" size={22} color="var(--text3)" strokeWidth={1.8} /></div>
        </div>

        <div style={{ fontFamily: 'var(--sans)', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 12 }}>Tipo de letra</div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          {[{ n: 'Nunito', f: 'var(--sans)' }, { n: 'Lora', f: 'var(--reader)' }, { n: 'Georgia', f: 'Georgia, serif' }].map((f) => (
            <button key={f.n} onClick={() => onFontFamily(f.n)} style={{ flex: 1, padding: '14px 0', borderRadius: 12, border: `1.5px solid ${fontFamily === f.n ? 'var(--accent)' : 'var(--border)'}`, background: fontFamily === f.n ? 'var(--accent-soft)' : 'transparent', fontFamily: f.f, fontSize: 16, color: 'var(--text)', cursor: 'pointer' }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>Aa</div>
              <div style={{ fontSize: 11, fontFamily: 'var(--sans)', fontWeight: 600, color: fontFamily === f.n ? 'var(--accent)' : 'var(--text3)' }}>{f.n}</div>
            </button>
          ))}
        </div>

        <div style={{ fontFamily: 'var(--sans)', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 12 }}>Tamanho</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <button onClick={() => onFontSize(Math.max(14, fontSize - 1))} style={{ width: 44, height: 44, borderRadius: 22, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 14 }}>A−</span>
          </button>
          <div style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--serif)', fontSize: 28, color: 'var(--text)' }}>{fontSize}</div>
          <button onClick={() => onFontSize(Math.min(24, fontSize + 1))} style={{ width: 44, height: 44, borderRadius: 22, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 18 }}>A+</span>
          </button>
        </div>

        <div style={{ fontFamily: 'var(--sans)', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 12 }}>Entrelinha</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {['Compacto', 'Normal', 'Arejado'].map((o) => (
            <button key={o} onClick={() => onLineHeight(o)} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: `1px solid ${lineHeight === o ? 'var(--accent)' : 'var(--border)'}`, background: lineHeight === o ? 'var(--accent-soft)' : 'transparent', fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 600, color: lineHeight === o ? 'var(--accent)' : 'var(--text2)', cursor: 'pointer' }}>{o}</button>
          ))}
        </div>

        <div style={{ fontFamily: 'var(--sans)', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 12 }}>Tema</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
          {THEMES.map((th) => (
            <button key={th.id} onClick={() => onTheme(th.id)} style={{ padding: 0, borderRadius: 12, border: `2px solid ${theme === th.id ? 'var(--accent)' : 'transparent'}`, background: 'transparent', cursor: 'pointer' }}>
              <div style={{ background: th.bg, color: th.text, borderRadius: 8, padding: '12px 8px', height: 56, fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 16, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                Aa
                <div style={{ fontSize: 8, opacity: 0.6, textTransform: 'capitalize', fontStyle: 'normal', letterSpacing: '0.1em', fontFamily: 'var(--sans)', fontWeight: 700, marginTop: 4 }}>{th.id}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

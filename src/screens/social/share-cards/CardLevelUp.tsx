import { ZuriMark } from '../../../components/ui/ZuriMark'

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

export function CardLevelUp({ level = 3 }: { level?: number }) {
  return (
    <div style={{ width: 1080, height: 1920, background: '#FEF8F5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', boxSizing: 'border-box' }}>
      <div style={{ position: 'absolute', top: 90, left: 90 }}><ZuriMark size={52} color="#C96A58" stroke={2} /></div>

      <div style={{ width: 560, height: 560, borderRadius: 280, background: '#C96A58', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 500, fontSize: 200, color: '#FEF8F5', lineHeight: 1 }}>{ROMAN[level] ?? level}</div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 80 }}>
        <div style={{ fontFamily: 'var(--sans)', fontSize: 36, fontWeight: 700, letterSpacing: '0.2em', color: '#C96A58', textTransform: 'uppercase' }}>Subi de nível</div>
        <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 70, color: '#28231C', marginTop: 16, lineHeight: 1.1 }}>Nível {level}</div>
        <div style={{ fontFamily: 'var(--sans)', fontSize: 36, color: 'rgba(40,35,28,0.5)', marginTop: 20 }}>no Zuri</div>
      </div>

      <div style={{ position: 'absolute', bottom: 90, fontFamily: 'var(--sans)', fontSize: 30, color: 'rgba(40,35,28,0.3)', letterSpacing: '0.08em' }}>zuribook.page</div>
    </div>
  )
}

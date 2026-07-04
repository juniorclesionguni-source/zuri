import { ZuriMark } from '../../../components/ui/ZuriMark'

export function CardStreak({ days = 14 }: { days?: number }) {
  return (
    <div style={{ width: 1080, height: 1920, background: '#1A1510', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', boxSizing: 'border-box' }}>
      {/* dot grid */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.08 }}>
        {Array.from({ length: 20 }).map((_, r) =>
          Array.from({ length: 12 }).map((_, c) => (
            <circle key={`${r}-${c}`} cx={90 + c * 90} cy={90 + r * 90} r={5} fill="#D8B880" />
          ))
        )}
      </svg>

      <div style={{ position: 'absolute', top: 90, left: 90 }}><ZuriMark size={52} color="#D8B880" stroke={2} /></div>

      <div style={{ textAlign: 'center', zIndex: 1 }}>
        <div style={{ fontFamily: 'var(--sans)', fontSize: 36, fontWeight: 700, letterSpacing: '0.25em', color: 'rgba(216,184,128,0.6)', textTransform: 'uppercase' }}>Streak</div>
        <div style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 280, lineHeight: 0.9, color: '#D8B880' }}>{days}</div>
        <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 64, color: '#FEF8F5', marginTop: 24 }}>dias seguidos</div>
        <div style={{ fontFamily: 'var(--sans)', fontSize: 32, color: 'rgba(254,248,245,0.5)', marginTop: 20 }}>a ler no Zuri</div>
      </div>

      <div style={{ position: 'absolute', bottom: 90, fontFamily: 'var(--sans)', fontSize: 30, color: 'rgba(254,248,245,0.4)', letterSpacing: '0.08em' }}>zuri.app</div>
    </div>
  )
}

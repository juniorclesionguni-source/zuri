import { ZuriMark } from '../../../components/ui/ZuriMark'

export function CardQuote({ quote = 'A terra é sempre a terra de alguém.', book = 'Terra Sonâmbula', author = 'Mia Couto' }: { quote?: string; book?: string; author?: string }) {
  return (
    <div style={{ width: 1080, height: 1920, background: '#FEF8F5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 120, boxSizing: 'border-box', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 90, left: 90 }}><ZuriMark size={52} color="#C96A58" stroke={2} /></div>

      {/* decorative quote mark */}
      <div style={{ fontFamily: 'var(--serif)', fontSize: 400, lineHeight: 0.6, color: '#C96A58', opacity: 0.12, position: 'absolute', top: 180, left: 80, userSelect: 'none' }}>"</div>

      <div style={{ position: 'relative', textAlign: 'center', zIndex: 1 }}>
        <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 72, lineHeight: 1.3, color: '#28231C' }}>{quote}</div>
        <div style={{ marginTop: 80 }}>
          <div style={{ width: 48, height: 2, background: '#C96A58', margin: '0 auto 28px' }} />
          <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 42, color: '#C96A58' }}>{book}</div>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 34, color: 'rgba(40,35,28,0.6)', marginTop: 10 }}>{author}</div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 90, fontFamily: 'var(--sans)', fontSize: 30, color: 'rgba(40,35,28,0.3)', letterSpacing: '0.08em' }}>zuri.app</div>
    </div>
  )
}

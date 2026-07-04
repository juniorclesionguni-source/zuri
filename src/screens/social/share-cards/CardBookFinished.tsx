import { BookCover } from '../../../components/ui/BookCover'
import { ZuriMark } from '../../../components/ui/ZuriMark'

export function CardBookFinished({ book = { title: 'Terra Sonâmbula', author: 'Mia Couto' }, rating = 5 }: { book?: { title: string; author: string }; rating?: number }) {
  return (
    <div style={{ width: 1080, height: 1920, background: '#28231C', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 100, boxSizing: 'border-box', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 90, left: 90 }}><ZuriMark size={52} color="#D8B880" stroke={2} /></div>
      <div style={{ position: 'absolute', top: 90, right: 90, fontFamily: 'var(--sans)', fontSize: 32, fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(216,184,128,0.5)' }}>TERMINEI</div>

      <BookCover title={book.title} author={book.author} w={420} h={630} />

      <div style={{ marginTop: 80, textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 500, fontSize: 72, color: '#FEF8F5', lineHeight: 1.05 }}>{book.title}</div>
        <div style={{ fontFamily: 'var(--sans)', fontSize: 40, color: 'rgba(254,248,245,0.7)', marginTop: 20 }}>{book.author}</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 40 }}>
          {[1,2,3,4,5].map((s) => (
            <svg key={s} width={52} height={52} viewBox="0 0 24 24" fill={s <= rating ? '#D8B880' : 'none'} stroke="#D8B880" strokeWidth={1.6}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          ))}
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 90, fontFamily: 'var(--sans)', fontSize: 30, color: 'rgba(254,248,245,0.4)', letterSpacing: '0.08em' }}>zuri.app</div>
    </div>
  )
}

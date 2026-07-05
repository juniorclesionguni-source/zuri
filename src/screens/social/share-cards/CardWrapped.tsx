import { ZuriMark } from '../../../components/ui/ZuriMark'
import { BookCover } from '../../../components/ui/BookCover'

export function CardWrapped({ month = 'SETEMBRO', stats = { books: 23, hours: 164, streak: 14 }, book = { title: 'Terra Sonâmbula', author: 'Mia Couto' } }: { month?: string; stats?: { books: number; hours: number; streak: number }; book?: { title: string; author: string; cover_url?: string } }) {
  const rows = [
    ['Livros lidos', String(stats.books)],
    ['Horas de leitura', `${stats.hours}h`],
    ['Streak máximo', `${stats.streak} dias`],
  ]
  return (
    <div style={{ width: 1080, height: 1920, background: '#C96A58', display: 'flex', flexDirection: 'column', padding: 100, boxSizing: 'border-box', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 40, fontWeight: 700, letterSpacing: '0.3em', color: 'rgba(254,248,245,0.7)' }}>{month}</div>
          <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 500, fontSize: 100, color: '#FEF8F5', lineHeight: 1, marginTop: 12 }}>o meu mês<br/>no Zuri</div>
        </div>
        <ZuriMark size={80} color="#FEF8F5" stroke={2.5} />
      </div>

      <div style={{ marginTop: 100 }}>
        {rows.map(([l, v], i) => (
          <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '36px 0', borderBottom: i < rows.length - 1 ? '1px solid rgba(254,248,245,0.25)' : 'none' }}>
            <div style={{ fontFamily: 'var(--sans)', fontSize: 42, color: 'rgba(254,248,245,0.8)' }}>{l}</div>
            <div style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 80, color: '#FEF8F5' }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 80, padding: 60, borderRadius: 32, background: 'rgba(254,248,245,0.12)', display: 'flex', gap: 40, alignItems: 'center' }}>
        <BookCover title={book.title} author={book.author} coverUrl={book.cover_url} w={140} h={210} />
        <div>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 28, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(254,248,245,0.7)' }}>Livro do mês</div>
          <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 52, color: '#FEF8F5', marginTop: 10, lineHeight: 1.1 }}>{book.title}</div>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 34, color: 'rgba(254,248,245,0.7)', marginTop: 8 }}>{book.author}</div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 90, left: '50%', transform: 'translateX(-50%)', fontFamily: 'var(--sans)', fontSize: 30, color: 'rgba(254,248,245,0.5)', letterSpacing: '0.08em' }}>zuribook.page</div>
    </div>
  )
}

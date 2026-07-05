import { useNavigate } from 'react-router-dom'
import { Icon } from '../../components/ui/Icon'
import { ZuriMark } from '../../components/ui/ZuriMark'
import { BookCover } from '../../components/ui/BookCover'
import { useCatalog } from '../../store/catalog'
import { useStatsStore } from '../../store/stats'

export function Wrapped({ onShare }: { onShare: (kind: string) => void }) {
  const navigate = useNavigate()
  const { booksRead, hoursRead, streakDays } = useStatsStore()
  const books = useCatalog((s) => s.books)

  const monthRaw = new Date().toLocaleString('pt-PT', { month: 'long' })
  const monthUpper = monthRaw.toUpperCase()
  const monthTitle = monthRaw.charAt(0).toUpperCase() + monthRaw.slice(1)

  const stats = [
    ['Livros lidos', String(booksRead)],
    ['Horas', `${hoursRead}h`],
    ['Streak máximo', `${streakDays} dias`],
  ]

  return (
    <div style={{ width: '100%', height: '100%', background: 'var(--accent)', color: '#FEF8F5', overflowY: 'auto', paddingBottom: 40 }}>
      <div style={{ padding: '60px 24px 0', display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <Icon name="chevron-left" size={24} color="#FEF8F5" strokeWidth={2} />
        </button>
        <ZuriMark size={28} color="#FEF8F5" />
        <div style={{ width: 24 }} />
      </div>

      <div style={{ padding: '40px 32px 0' }}>
        <div style={{ fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 700, letterSpacing: '0.3em' }}>{monthUpper}</div>
        <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 500, fontSize: 44, lineHeight: 1, marginTop: 8 }}>o teu mês<br/>no Zuri</div>
      </div>

      <div style={{ padding: '40px 32px 0' }}>
        {stats.map(([l, v], i) => (
          <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '14px 0', borderBottom: i < stats.length - 1 ? '1px solid rgba(254,248,245,0.25)' : 'none' }}>
            <div style={{ fontFamily: 'var(--sans)', fontSize: 14, opacity: 0.85 }}>{l}</div>
            <div style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 28 }}>{v}</div>
          </div>
        ))}
      </div>

      {books[0] && (
        <div style={{ margin: '30px 24px 0', padding: 20, borderRadius: 16, background: 'rgba(254,248,245,0.12)', display: 'flex', gap: 14, alignItems: 'center' }}>
          <BookCover title={books[0].title} author={books[0].author.split(' ').slice(-1)[0]} coverUrl={books[0].cover_url} w={60} h={90} />
          <div>
            <div style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.8 }}>Livro do mês</div>
            <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 20, fontWeight: 500, marginTop: 4 }}>{books[0].title}</div>
          </div>
        </div>
      )}

      <div style={{ padding: '32px 24px 0' }}>
        <button onClick={() => onShare('wrapped')} style={{ width: '100%', height: 52, borderRadius: 12, border: 'none', background: '#FEF8F5', color: '#C96A58', fontFamily: 'var(--sans)', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
          Partilhar o meu {monthTitle}
        </button>
      </div>
    </div>
  )
}

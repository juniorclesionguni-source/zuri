import { useNavigate } from 'react-router-dom'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { BookCard } from '../../components/ui/BookCard'
import { BookCover } from '../../components/ui/BookCover'
import { Icon } from '../../components/ui/Icon'
import { ZuriMark } from '../../components/ui/ZuriMark'
import { QUOTE } from '../../data/catalog'
import { useAuthStore } from '../../store/auth'
import { useCatalog } from '../../store/catalog'
import { useLibrary } from '../../store/library'
import { useNotifications } from '../../store/notifications'
import { useUIStore } from '../../store/ui'

export function Home({ onShare }: { onShare: (kind: string) => void }) {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const books = useCatalog((s) => s.books)
  const catalogLoading = useCatalog((s) => s.loading)
  const catalogError = useCatalog((s) => s.error)
  const retry = useCatalog((s) => s.retry)
  const progress = useLibrary((s) => s.progress)
  const unread = useNotifications((s) => s.unread)
  const dark = useUIStore((s) => s.dark)
  const toggleDark = useUIStore((s) => s.toggleDark)
  const name = user?.name?.split(' ')[0] ?? 'Leitor'
  const h = new Date().getHours()
  const greeting = h < 12 ? 'Bom dia' : h < 19 ? 'Boa tarde' : 'Boa noite'

  const month = new Date().toLocaleString('pt-PT', { month: 'long' })
  const monthLabel = month.charAt(0).toUpperCase() + month.slice(1)

  // Livro em progresso mais recente (0 < pct < 95)
  const progressBook = books
    .filter((b) => { const p = progress[b.id]; return p && p.pct > 0 && p.pct < 95 })
    .sort((a, b) => (progress[b.id]?.updatedAt ?? 0) - (progress[a.id]?.updatedAt ?? 0))[0] ?? null

  return (
    <div style={{ width: '100%', height: '100%', background: 'var(--bg)', overflowY: 'auto', paddingBottom: 96 }}>
      {/* Header */}
      <div style={{ padding: '60px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 500, fontSize: 28, color: 'var(--text)', margin: 0, lineHeight: 1.15 }}>{greeting},<br/>{name}</h1>
          <p style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--text3)', margin: '6px 0 0' }}>O que vais ler hoje?</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0, paddingTop: 6 }}>
          <div onClick={toggleDark} style={{ cursor: 'pointer' }} title={dark ? 'Modo claro' : 'Modo escuro'}>
            <Icon name={dark ? 'sun' : 'moon'} size={22} color="var(--text2)" strokeWidth={1.5} />
          </div>
          <div onClick={() => navigate('/notifications')} style={{ position: 'relative', cursor: 'pointer' }}>
            <Icon name="bell" size={22} color="var(--text2)" strokeWidth={1.5} />
            {unread > 0 && <div style={{ position: 'absolute', top: -2, right: -2, minWidth: 8, height: 8, borderRadius: 4, background: 'var(--accent)' }} />}
          </div>
        </div>
      </div>

      {/* Wrapped banner */}
      <div
        onClick={() => onShare('wrapped')}
        style={{ margin: '24px 20px 0', padding: '16px 18px', borderRadius: 16, background: 'var(--accent)', color: '#FEF8F5', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
      >
        <div style={{ position: 'absolute', right: -20, top: -20, opacity: 0.15 }}>
          <ZuriMark size={120} color="#FEF8F5" stroke={2} />
        </div>
        <div style={{ flex: 1, zIndex: 1 }}>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.8 }}>Novo</div>
          <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 500, fontSize: 18, marginTop: 4 }}>O teu {monthLabel} chegou</div>
        </div>
        <Icon name="chevron-right" size={22} strokeWidth={2} color="#FEF8F5" />
      </div>

      {/* Continua a ler */}
      {progressBook && (
      <div style={{ marginTop: 32 }}>
        <SectionHeader action="Ver tudo">Continua a ler</SectionHeader>
        <div className="hide-scrollbar" style={{ display: 'flex', gap: 14, overflowX: 'auto', padding: '0 20px' }}>
          <div
            onClick={() => navigate(`/book/${progressBook.id}`)}
            style={{ display: 'flex', gap: 14, background: 'var(--bg2)', borderRadius: 14, padding: 12, alignItems: 'center', minWidth: 300, cursor: 'pointer' }}
          >
            <BookCover title={progressBook.title} author={progressBook.author.split(' ').slice(-1)[0]} coverUrl={progressBook.cover_url} w={56} h={84} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{progressBook.title}</div>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{progressBook.author}</div>
              <div style={{ marginTop: 10 }}>
                <div style={{ height: 3, background: 'var(--border)', borderRadius: 2 }}>
                  <div style={{ width: `${progress[progressBook.id]?.pct ?? 0}%`, height: '100%', background: 'var(--accent)', borderRadius: 2 }} />
                </div>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{progress[progressBook.id]?.pct ?? 0}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Catálogo indisponível (sem rede e sem cache) */}
      {catalogError && books.length === 0 && (
        <div style={{ margin: '32px 20px 0', padding: '22px 20px', background: 'var(--bg2)', borderRadius: 16, textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--text2)', margin: '0 0 12px' }}>Não foi possível carregar o catálogo. Verifica a tua ligação.</p>
          <button onClick={() => retry()} style={{ fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 700, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>Tentar de novo</button>
        </div>
      )}

      {/* Sugestões */}
      <div style={{ marginTop: 32 }}>
        <SectionHeader action="Ver tudo">Sugestões para ti</SectionHeader>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 20, padding: '0 20px' }}>
          {catalogLoading && books.length === 0
            ? [0, 1, 2, 3].map((i) => (
                <div key={i}>
                  <div style={{ aspectRatio: '2/3', borderRadius: 10, background: 'var(--bg2)' }} />
                  <div style={{ height: 12, width: '80%', borderRadius: 4, background: 'var(--bg2)', marginTop: 10 }} />
                  <div style={{ height: 10, width: '55%', borderRadius: 4, background: 'var(--bg2)', marginTop: 6 }} />
                </div>
              ))
            : books.slice(1, 5).map((b) => (
                <BookCard key={b.id} book={b} onClick={() => navigate(`/book/${b.id}`)} fluid />
              ))}
        </div>
      </div>

      {/* Novidades */}
      <div style={{ marginTop: 32 }}>
        <SectionHeader action="Ver tudo">Novidades no Zuri</SectionHeader>
        <div className="hide-scrollbar" style={{ display: 'flex', gap: 14, overflowX: 'auto', padding: '0 20px' }}>
          {books.slice(5, 10).map((b) => (
            <div key={b.id} style={{ position: 'relative' }}>
              <BookCard book={b} onClick={() => navigate(`/book/${b.id}`)} w={120} />
              <div style={{ position: 'absolute', top: 8, left: 8, padding: '3px 7px', background: 'var(--accent)', color: '#FEF8F5', fontFamily: 'var(--sans)', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', borderRadius: 3 }}>NOVO</div>
            </div>
          ))}
        </div>
      </div>

      {/* Citação */}
      <div style={{ margin: '32px 20px 0', padding: '22px 20px', background: 'var(--bg2)', borderRadius: 20, position: 'relative' }}>
        <Icon name="quote" size={18} color="var(--accent)" strokeWidth={1} />
        <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 17, lineHeight: 1.4, color: 'var(--text)', marginTop: 10 }}>"{QUOTE.text}"</div>
        <div style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--text3)', marginTop: 10, letterSpacing: '0.08em' }}>{QUOTE.author.toUpperCase()} · {QUOTE.book}</div>
        <div
          onClick={() => onShare('quote')}
          style={{ position: 'absolute', top: 20, right: 20, cursor: 'pointer', width: 32, height: 32, borderRadius: 16, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}
        >
          <Icon name="share-2" size={14} color="var(--text2)" strokeWidth={1.8} />
        </div>
      </div>
    </div>
  )
}

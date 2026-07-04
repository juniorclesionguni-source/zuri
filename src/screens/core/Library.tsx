import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookCard } from '../../components/ui/BookCard'
import { Icon } from '../../components/ui/Icon'
import { useCatalog } from '../../store/catalog'
import { useLibrary } from '../../store/library'
import type { Book } from '../../data/catalog'

const TABS = ['A ler', 'Por ler', 'Terminados', 'Favoritos', 'Baixados']

const EMPTY: Record<string, string> = {
  'A ler':      'Ainda não começaste nenhum livro',
  'Por ler':    'Todos os livros já têm progresso',
  'Terminados': 'Ainda não terminaste nenhum livro',
  'Favoritos':  'Ainda não adicionaste favoritos',
  'Baixados':   'Ainda sem downloads',
}

export function Library() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('A ler')
  const books = useCatalog((s) => s.books)
  const progress = useLibrary((s) => s.progress)
  const favorites = useLibrary((s) => s.favorites)

  const inProgress = books.filter((b) => { const p = progress[b.id]; return p && p.pct > 0 && p.pct < 95 })
  const finished   = books.filter((b) => { const p = progress[b.id]; return p && (p.pct >= 95 || p.finished) })
  const unread     = books.filter((b) => !progress[b.id])
  const favBooks   = books.filter((b) => favorites.has(b.id))

  const ITEMS: Record<string, Book[]> = {
    'A ler':      inProgress,
    'Por ler':    unread,
    'Terminados': finished,
    'Favoritos':  favBooks,
  }

  // Livros únicos na estante (com progresso + favoritos)
  const shelfCount = new Set([...Object.keys(progress), ...Array.from(favorites)]).size

  const list = ITEMS[tab] ?? []

  return (
    <div style={{ width: '100%', height: '100%', background: 'var(--bg)', overflowY: 'auto', paddingBottom: 96 }}>
      <div style={{ padding: '60px 20px 0' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 500, fontSize: 32, color: 'var(--text)', margin: 0 }}>My Zuri</h1>
        <p style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--text3)', margin: '4px 0 0' }}>
          {tab === 'Baixados' ? 'Ainda sem downloads' : `${shelfCount} livros na tua estante`}
        </p>
      </div>

      {/* Tab strip */}
      <div className="hide-scrollbar" style={{ display: 'flex', gap: 10, padding: '24px 20px 0', overflowX: 'auto' }}>
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 16px', borderRadius: 999, border: 'none', background: tab === t ? 'var(--accent)' : 'transparent', color: tab === t ? '#FEF8F5' : 'var(--text2)', fontFamily: 'var(--sans)', fontWeight: 600, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5 }}>
            {t === 'Baixados' && <Icon name="download" size={12} color={tab === t ? '#FEF8F5' : 'var(--text2)'} strokeWidth={2} />}
            {t}
          </button>
        ))}
      </div>

      {tab !== 'Baixados' && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '18px 20px 12px' }}>
          <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--bg2)', borderRadius: 10 }}>
            <div style={{ padding: 6, borderRadius: 6, background: 'var(--bg)' }}><Icon name="grid" size={16} color="var(--text2)" strokeWidth={1.8} /></div>
            <div style={{ padding: 6 }}><Icon name="list" size={16} color="var(--text3)" strokeWidth={1.8} /></div>
          </div>
        </div>
      )}

      {tab === 'Baixados' ? (
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <Icon name="download" size={40} color="var(--text3)" strokeWidth={1} />
          <p style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--text3)', marginTop: 16 }}>Ainda sem downloads</p>
        </div>
      ) : list.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <Icon name="book-open" size={40} color="var(--text3)" strokeWidth={1} />
          <p style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--text3)', marginTop: 16 }}>{EMPTY[tab]}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, padding: '0 20px' }}>
          {list.map((b) => (
            <BookCard
              key={b.id}
              book={b}
              onClick={() => navigate(`/book/${b.id}`)}
              w={150}
              showProgress={tab === 'A ler'}
              progress={progress[b.id]?.pct ?? 0}
            />
          ))}
        </div>
      )}
    </div>
  )
}

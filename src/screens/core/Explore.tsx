import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../components/ui/Icon'
import { BookCard } from '../../components/ui/BookCard'
import { useCatalog } from '../../store/catalog'

const GENRE_ICONS: Record<string, string> = {
  Romance: 'heart', Ficção: 'book-open', História: 'landmark', Poesia: 'feather',
  Ensaio: 'file-text', Suspense: 'zap', Thriller: 'zap', Biografia: 'user',
  'Des. Pessoal': 'target', 'Auto-ajuda': 'target', Drama: 'users',
}

export function Explore() {
  const navigate = useNavigate()
  const books = useCatalog((s) => s.books)
  const [query, setQuery] = useState('')
  const [genreFilter, setGenreFilter] = useState<string | null>(null)

  // Categorias derivadas do catálogo real
  const categories = useMemo(() => {
    const counts: Record<string, number> = {}
    books.forEach((b) => { counts[b.genre] = (counts[b.genre] ?? 0) + 1 })
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count, icon: GENRE_ICONS[name] ?? 'book-open' }))
      .sort((a, b) => b.count - a.count)
  }, [books])

  // Resultados: search tem prioridade sobre genre filter
  const filtered = useMemo(() => {
    if (query.length >= 2) {
      const q = query.toLowerCase()
      return books.filter((b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q))
    }
    if (genreFilter) return books.filter((b) => b.genre === genreFilter)
    return null // null = mostra categorias
  }, [books, query, genreFilter])

  const clearFilter = () => { setQuery(''); setGenreFilter(null) }

  return (
    <div style={{ width: '100%', height: '100%', background: 'var(--bg)', overflowY: 'auto', paddingBottom: 96 }}>
      <div style={{ padding: '60px 20px 0' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 500, fontSize: 32, color: 'var(--text)', margin: '0 0 20px' }}>Explorar</h1>

        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'var(--bg2)', borderRadius: 999, marginBottom: 28 }}>
          <Icon name="search" size={18} color="var(--text3)" strokeWidth={1.8} />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setGenreFilter(null) }}
            placeholder="Procurar livros, autores…"
            style={{ flex: 1, border: 'none', background: 'transparent', fontFamily: 'var(--sans)', fontSize: 15, color: 'var(--text)', outline: 'none' }}
          />
          {(query || genreFilter) && (
            <button onClick={clearFilter} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
              <Icon name="x" size={16} color="var(--text3)" strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      {filtered !== null ? (
        /* Search / genre filter results */
        <div>
          {genreFilter && !query && (
            <div style={{ padding: '0 20px 12px', fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 700, color: 'var(--text3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              {genreFilter}
            </div>
          )}
          {filtered.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <Icon name="search" size={36} color="var(--text3)" strokeWidth={1} />
              <p style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--text3)', marginTop: 14 }}>
                Nenhum resultado para "{query || genreFilter}"
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, padding: '0 20px' }}>
              {filtered.map((b) => (
                <BookCard key={b.id} book={b} onClick={() => navigate(`/book/${b.id}`)} w={150} />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Categories grid */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 20px' }}>
          {categories.map((cat) => (
            <div
              key={cat.name}
              onClick={() => setGenreFilter(cat.name)}
              style={{ height: 120, borderRadius: 16, background: 'var(--bg2)', border: '1px solid var(--border)', padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
            >
              <Icon name={cat.icon} size={22} color="var(--accent)" strokeWidth={1.5} />
              <div>
                <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 500, fontSize: 20, color: 'var(--text)', lineHeight: 1.1 }}>{cat.name}</div>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>{cat.count} livros</div>
              </div>
            </div>
          ))}

          {/* Mais Pedidos entry */}
          <div
            onClick={() => navigate('/requests')}
            style={{ gridColumn: '1 / -1', padding: '16px 18px', borderRadius: 16, background: 'var(--bg2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="chevron-up" size={22} color="var(--accent)" strokeWidth={2} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 18, color: 'var(--text)' }}>Mais Pedidos</div>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>Vota nos livros que queres ver no Zuri</div>
            </div>
            <Icon name="chevron-right" size={18} color="var(--text3)" strokeWidth={1.8} />
          </div>
        </div>
      )}
    </div>
  )
}

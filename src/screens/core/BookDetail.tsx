import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BookCover } from '../../components/ui/BookCover'
import { Chip } from '../../components/ui/Chip'
import { BookCard } from '../../components/ui/BookCard'
import { PrimaryButton, GhostButton } from '../../components/ui/Button'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { Icon } from '../../components/ui/Icon'
import { useCatalog } from '../../store/catalog'
import { useSubStore, canReadOffline, graceEndsAt, formatExpiresAt } from '../../store/subscription'
import { useAuthStore } from '../../store/auth'
import { useLibrary } from '../../store/library'
import { content } from '../../data/services'

export function BookDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { status } = useSubStore()
  const user = useAuthStore((s) => s.user)
  const loaded = useCatalog((s) => s.loaded)
  const books = useCatalog((s) => s.books)
  const book = books.find((b) => b.id === id)
  const isFav = useLibrary((s) => s.favorites.has(id ?? ''))
  const toggleFavorite = useLibrary((s) => s.toggleFavorite)
  const downloaded = useLibrary((s) => s.downloads[id ?? ''])
  const downloadBook = useLibrary((s) => s.download)
  const removeDownload = useLibrary((s) => s.removeDownload)
  const [dlPct, setDlPct] = useState<number | null>(null)

  if (!loaded) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, borderRadius: 16, border: '2.5px solid var(--border)', borderTopColor: 'var(--accent)', animation: 'zspin 1s linear infinite' }} />
      </div>
    )
  }

  if (!book) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <p style={{ fontFamily: 'var(--sans)', color: 'var(--text2)' }}>Livro não encontrado</p>
        <button onClick={() => navigate(-1)} style={{ fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 600, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>Voltar</button>
      </div>
    )
  }

  // Amostra grátis: qualquer utilizador abre o reader; o cap do 1º capítulo é lá.
  const handleRead = () => navigate(`/reader/${book.id}`)

  const handleFav = () => {
    if (user) toggleFavorite(user.id, book.id)
  }

  const handleDownload = async () => {
    if (!book.epub_path || dlPct !== null) return
    if (status !== 'active') { navigate('/paywall'); return } // download é para subscritores
    setDlPct(0)
    try {
      // Bucket privado — pede sempre URL assinado ao book-access.
      const { url } = await content.getBookUrl(book.id)
      await downloadBook(book.id, url, (p) => setDlPct(p))
    } catch { /* falha silenciosa */ }
    finally { setDlPct(null) }
  }

  return (
    <div style={{ width: '100%', height: '100%', background: 'var(--bg)', overflowY: 'auto', paddingBottom: 40 }}>
      {/* Hero */}
      <div style={{ position: 'relative', height: 440, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 60, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, var(--bg2) 0%, var(--bg) 80%)' }} />
        <div style={{ position: 'absolute', top: 70, left: 20, right: 20, display: 'flex', justifyContent: 'space-between', zIndex: 2 }}>
          <button onClick={() => navigate(-1)} style={{ width: 40, height: 40, borderRadius: 20, background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon name="chevron-left" size={20} color="var(--text2)" strokeWidth={2} />
          </button>
        </div>
        <div style={{ position: 'relative', marginTop: 30, zIndex: 1 }}>
          <BookCover title={book.title} author={book.author.split(' ').slice(-1)[0]} coverUrl={book.cover_url} w={160} h={240} />
        </div>
        <h1 style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 500, fontSize: 26, color: 'var(--text)', margin: '22px 0 4px', textAlign: 'center', zIndex: 1, padding: '0 40px' }}>{book.title}</h1>
        <div style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--text2)', zIndex: 1 }}>{book.author}</div>
      </div>

      {/* Metadata */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 22, padding: '0 20px', marginBottom: 24 }}>
        {[
          { val: book.pages > 0 ? String(book.pages) : '—', label: 'páginas', icon: false },
          { val: book.mins >= 60 ? `${Math.round(book.mins / 60)}h` : book.mins > 0 ? `${book.mins} min` : '—', label: 'leitura', icon: false },
          ...(book.rating > 0 ? [{ val: String(book.rating), label: 'rating', icon: true }] : []),
        ].map((m, i) => (
          <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: i > 0 ? 22 : 0 }}>
            {i > 0 && <div style={{ width: 1, background: 'var(--border)', height: 32, alignSelf: 'center' }} />}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 500, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'center' }}>
                {m.val} {m.icon && <Icon name="star" size={12} color="var(--accent)" strokeWidth={2} />}
              </div>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 10, color: 'var(--text3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{m.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <PrimaryButton onClick={handleRead}>
          {status === 'active' ? 'Começar a ler'
            : downloaded && canReadOffline() ? 'Continuar a ler (offline)'
            : 'Ler o primeiro capítulo grátis'}
        </PrimaryButton>
        {status !== 'active' && downloaded && canReadOffline() && (
          <div style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--text3)', textAlign: 'center' }}>
            Subscrição expirada — leitura offline até {formatExpiresAt(graceEndsAt())}.
          </div>
        )}
        <GhostButton onClick={handleFav}>
          {isFav ? '✓ Na biblioteca' : '+ Adicionar à biblioteca'}
        </GhostButton>

        {/* Download offline */}
        {downloaded ? (
          <button onClick={() => removeDownload(book.id)} style={{ height: 44, borderRadius: 12, border: '1px solid var(--border)', background: 'transparent', fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 600, color: 'var(--text3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Icon name="check" size={16} color="var(--success)" strokeWidth={2.5} /> Baixado ({downloaded.sizeMb.toFixed(1)} MB) · remover
          </button>
        ) : dlPct !== null ? (
          <div style={{ height: 44, borderRadius: 12, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 14px', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--text2)' }}>
              <span>A baixar…</span><span>{dlPct}%</span>
            </div>
            <div style={{ height: 3, background: 'var(--border)', borderRadius: 2 }}>
              <div style={{ width: `${dlPct}%`, height: '100%', background: 'var(--accent)', borderRadius: 2, transition: 'width 0.2s' }} />
            </div>
          </div>
        ) : (
          <button onClick={handleDownload} style={{ height: 44, borderRadius: 12, border: '1px solid var(--border)', background: 'transparent', fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 600, color: 'var(--text2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Icon name="download" size={16} color="var(--text2)" strokeWidth={2} /> Baixar para ler offline
          </button>
        )}
      </div>

      {/* Sobre */}
      <div style={{ padding: '32px 20px 0' }}>
        <div style={{ fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 700, color: 'var(--text3)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Sobre este livro</div>
        <p style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--text2)', lineHeight: 1.6, margin: '12px 0 0' }}>
          {book.synopsis ?? 'Um clássico da literatura lusófona.'}
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          <Chip>{book.genre}</Chip>
        </div>
      </div>

      {/* Relacionados */}
      <div style={{ paddingTop: 32 }}>
        <SectionHeader>Leitores também leram</SectionHeader>
        <div className="hide-scrollbar" style={{ display: 'flex', gap: 14, overflowX: 'auto', padding: '0 20px' }}>
          {books.filter((b) => b.id !== book.id).slice(0, 5).map((b) => (
            <BookCard key={b.id} book={b} onClick={() => navigate(`/book/${b.id}`)} w={100} />
          ))}
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookCard } from '../../components/ui/BookCard'
import { BookCover } from '../../components/ui/BookCover'
import { Icon } from '../../components/ui/Icon'
import { BOOKS } from '../../data/catalog'

const TABS = ['A ler', 'Por ler', 'Terminados', 'Favoritos', 'Baixados']
const ITEMS: Record<string, typeof BOOKS> = {
  'A ler': BOOKS.slice(0, 4),
  'Por ler': BOOKS.slice(3, 8),
  'Terminados': BOOKS.slice(4, 9),
  'Favoritos': BOOKS.slice(0, 6),
}
const DOWNLOADS = [
  { book: BOOKS[0], size: '42 MB', status: 'done' as const },
  { book: BOOKS[1], size: '51 MB', status: 'done' as const },
  { book: BOOKS[6], size: '28 MB', status: 'done' as const },
  { book: BOOKS[3], size: '34 MB', status: 'downloading' as const, progress: 64 },
]

export function Library() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('A ler')

  return (
    <div style={{ width: '100%', height: '100%', background: 'var(--bg)', overflowY: 'auto', paddingBottom: 96 }}>
      <div style={{ padding: '60px 20px 0' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 500, fontSize: 32, color: 'var(--text)', margin: 0 }}>My Zuri</h1>
        <p style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--text3)', margin: '4px 0 0' }}>
          {tab === 'Baixados' ? '4 livros offline · 128 MB' : '23 livros na tua estante'}
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
        <>
          <div style={{ margin: '20px 20px 14px', padding: 14, background: 'var(--bg2)', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="wifi-off" size={16} color="var(--accent)" strokeWidth={2} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>Leitura offline</div>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>Estes livros estão no teu dispositivo</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--sans)', fontWeight: 700, color: 'var(--text2)', fontSize: 13 }}>128 MB</div>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--text3)' }}>de 2 GB</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 20px' }}>
            {DOWNLOADS.map(({ book, size, status, progress }) => (
              <div key={book.id} onClick={() => navigate(`/book/${book.id}`)} style={{ display: 'flex', gap: 12, padding: 10, background: 'var(--bg2)', borderRadius: 12, cursor: 'pointer', alignItems: 'center' }}>
                <BookCover title={book.title} author={book.author.split(' ').slice(-1)[0]} w={44} h={66} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.title}</div>
                  <div style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{book.author}</div>
                  {status === 'downloading' && (
                    <div style={{ height: 2, background: 'var(--border)', borderRadius: 1, marginTop: 6 }}>
                      <div style={{ width: `${progress ?? 0}%`, height: '100%', background: 'var(--accent)', borderRadius: 1 }} />
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  {status === 'done' ? (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--success)', fontWeight: 700 }}>
                        <Icon name="check" size={12} color="var(--success)" strokeWidth={2.5} /> Offline
                      </div>
                      <div style={{ fontFamily: 'var(--sans)', fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{size}</div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--accent)', fontWeight: 700 }}>A baixar…</div>
                      <div style={{ fontFamily: 'var(--sans)', fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{progress}% · {size}</div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, padding: '0 20px' }}>
          {(ITEMS[tab] ?? []).map((b) => (
            <BookCard key={b.id} book={b} onClick={() => navigate(`/book/${b.id}`)} w={150} showProgress={tab === 'A ler'} progress={Math.floor(((b.title.length * 7) % 70) + 10)} />
          ))}
        </div>
      )}
    </div>
  )
}

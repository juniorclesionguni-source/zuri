import { useNavigate } from 'react-router-dom'
import { BookCover } from '../../components/ui/BookCover'
import { Icon } from '../../components/ui/Icon'
import { QUOTE } from '../../data/catalog'
import { useStatsStore } from '../../store/stats'
import { useCatalog } from '../../store/catalog'
import { useLibrary } from '../../store/library'

export function Reading({ onShare }: { onShare: (kind: string) => void }) {
  const navigate = useNavigate()
  const { streakDays } = useStatsStore()
  const books = useCatalog((s) => s.books)
  const progress = useLibrary((s) => s.progress)

  // Todos os livros em progresso (0 < pct < 95), do mais recente para o mais antigo
  const reading = books
    .filter((b) => { const p = progress[b.id]; return p && p.pct > 0 && p.pct < 95 })
    .sort((a, b) => (progress[b.id]?.updatedAt ?? 0) - (progress[a.id]?.updatedAt ?? 0))

  return (
    <div style={{ width: '100%', height: '100%', background: 'var(--bg)', overflowY: 'auto', paddingBottom: 96 }}>
      {/* Streak hero */}
      <div style={{ padding: '60px 20px 28px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 6 }}>
          <span style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 44, color: 'var(--accent)', lineHeight: 1 }}>{streakDays}</span>
          <span style={{ fontFamily: 'var(--sans)', fontSize: 16, color: 'var(--text2)' }}>dias</span>
        </div>
        <div style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>streak ativa</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, margin: '14px 0 18px' }}>
          {Array.from({ length: Math.min(streakDays, 7) }).map((_, i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--accent)', opacity: i >= Math.min(streakDays, 7) - 3 ? 1 : 0.4, boxShadow: i >= Math.min(streakDays, 7) - 3 ? '0 0 6px var(--accent)' : 'none' }} />
          ))}
        </div>
        <button onClick={() => onShare('streak')} style={{ padding: '8px 18px', borderRadius: 999, border: '1px solid var(--border)', background: 'transparent', fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 600, color: 'var(--accent)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Icon name="share-2" size={14} color="var(--accent)" strokeWidth={2} /> Partilhar
        </button>
      </div>

      {/* Continua a ler */}
      <div>
        <div style={{ fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 700, color: 'var(--text3)', letterSpacing: '0.14em', textTransform: 'uppercase', padding: '0 20px', marginBottom: 14 }}>Continua a ler</div>
        {reading.length === 0 ? (
          <div style={{ padding: '32px 20px', textAlign: 'center' }}>
            <Icon name="book-open" size={36} color="var(--text3)" strokeWidth={1} />
            <p style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--text3)', marginTop: 14 }}>Ainda não começaste nenhum livro</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 20px' }}>
            {reading.map((b) => {
              const pct = progress[b.id]?.pct ?? 0
              const minsLeft = Math.max(1, Math.round(b.mins * (1 - pct / 100)))
              return (
                <div
                  key={b.id}
                  onClick={() => navigate(`/reader/${b.id}`)}
                  style={{ display: 'flex', gap: 14, background: 'var(--bg2)', borderRadius: 14, padding: 12, alignItems: 'center', cursor: 'pointer' }}
                >
                  <BookCover title={b.title} author={b.author.split(' ').slice(-1)[0]} coverUrl={b.cover_url} w={64} h={96} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title}</div>
                    <div style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{b.author}</div>
                    <div style={{ marginTop: 10 }}>
                      <div style={{ height: 3, background: 'var(--border)', borderRadius: 2 }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent)', borderRadius: 2 }} />
                      </div>
                      <div style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{pct}% · ~{minsLeft} min restantes</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Citação guardada */}
      <div style={{ margin: '28px 20px 0', padding: '18px 20px', borderRadius: 16, border: '1.5px dashed var(--border-strong)' }}>
        <Icon name="quote" size={16} color="var(--accent)" strokeWidth={1} />
        <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 15, lineHeight: 1.5, color: 'var(--text)', marginTop: 10 }}>"{QUOTE.text}"</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--text3)' }}>{QUOTE.author} · {QUOTE.book}</div>
          <span onClick={() => onShare('quote')} style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }}>Partilhar →</span>
        </div>
      </div>
    </div>
  )
}

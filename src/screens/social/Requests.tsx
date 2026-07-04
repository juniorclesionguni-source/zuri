import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../components/ui/Icon'
import { ZuriMark } from '../../components/ui/ZuriMark'
import { RequestFormModal } from './RequestFormModal'
import { useAuthStore } from '../../store/auth'
import type { BookRequest } from '../../data/api/requests'

const STATUS_MAP = {
  pending:   { label: 'Pendente',    color: 'var(--text3)' },
  review:    { label: 'Em análise',  color: 'var(--warn)' },
  licensing: { label: 'A licenciar', color: 'var(--accent)' },
  available: { label: 'Disponível!', color: 'var(--success)' },
} as const

export function Requests() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [filter, setFilter] = useState('Todos')
  const [reqs, setReqs] = useState<BookRequest[]>([])
  const [votes, setVotes] = useState<Record<string, { count: number; voted: boolean }>>({})
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { listRequests, myVotes } = await import('../../data/api/requests')
      const [list, voteIds] = await Promise.all([
        listRequests(),
        user?.id ? myVotes(user.id) : Promise.resolve([] as string[]),
      ])
      if (cancelled) return
      setReqs(list)
      const m: Record<string, { count: number; voted: boolean }> = {}
      list.forEach((r) => { m[r.id] = { count: r.vote_count, voted: voteIds.includes(r.id) } })
      setVotes(m)
      setLoading(false)
    }
    load().catch(() => setLoading(false))
    return () => { cancelled = true }
  }, [user?.id])

  const toggle = async (id: string) => {
    const cur = votes[id]
    if (!cur || !user?.id) return
    const newVoted = !cur.voted
    // Optimistic update
    setVotes((prev) => ({ ...prev, [id]: { count: cur.count + (newVoted ? 1 : -1), voted: newVoted } }))
    try {
      const { vote, unvote } = await import('../../data/api/requests')
      if (newVoted) await vote(id, user.id)
      else await unvote(id, user.id)
    } catch {
      // Rollback
      setVotes((prev) => ({ ...prev, [id]: cur }))
    }
  }

  let list = [...reqs]
  if (filter === 'Em curso') list = list.filter((r) => r.status === 'review' || r.status === 'licensing')
  if (filter === 'Os meus votos') list = list.filter((r) => votes[r.id]?.voted)
  list.sort((a, b) => (votes[b.id]?.count ?? 0) - (votes[a.id]?.count ?? 0))

  const alreadyAdded = reqs.filter((r) => r.status === 'available').length
  const totalVotes = Object.values(votes).reduce((s, v) => s + v.count, 0)

  return (
    <div style={{ width: '100%', height: '100%', background: 'var(--bg)', overflowY: 'auto', paddingBottom: 110 }}>
      <div style={{ padding: '58px 20px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: -6 }}>
          <Icon name="chevron-left" size={24} color="var(--text)" strokeWidth={2} />
        </button>
        <h1 style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 500, fontSize: 30, color: 'var(--text)', margin: 0 }}>Mais pedidos</h1>
      </div>
      <p style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--text3)', margin: '8px 20px 0', lineHeight: 1.5 }}>Vota nos livros que queres ver no Zuri. Os mais votados são os próximos a entrar no catálogo.</p>

      {/* Hero stat */}
      <div style={{ margin: '20px 20px 0', padding: '16px 18px', borderRadius: 16, background: 'var(--accent)', color: '#FEF8F5', display: 'flex', alignItems: 'center', gap: 14, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -16, top: -16, opacity: 0.16 }}>
          <ZuriMark size={96} color="#FEF8F5" stroke={2} />
        </div>
        <div style={{ zIndex: 1 }}>
          <div style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 30, lineHeight: 1 }}>{totalVotes.toLocaleString('pt')}</div>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', opacity: 0.85, marginTop: 2 }}>votos esta época</div>
        </div>
        <div style={{ width: 1, alignSelf: 'stretch', background: 'rgba(255,255,255,0.3)', margin: '4px 0' }} />
        <div style={{ zIndex: 1 }}>
          <div style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 30, lineHeight: 1 }}>{alreadyAdded}</div>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', opacity: 0.85, marginTop: 2 }}>já adicionados</div>
        </div>
      </div>

      {/* Filters */}
      <div className="hide-scrollbar" style={{ display: 'flex', gap: 8, padding: '20px 20px 0', overflowX: 'auto' }}>
        {['Todos', 'Em curso', 'Os meus votos'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '8px 14px', borderRadius: 999, border: `1px solid ${filter === f ? 'var(--accent)' : 'var(--border)'}`, background: filter === f ? 'var(--accent-soft)' : 'transparent', color: filter === f ? 'var(--accent)' : 'var(--text2)', fontFamily: 'var(--sans)', fontWeight: 600, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}>{f}</button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ width: 28, height: 28, borderRadius: 14, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', animation: 'zspin 1s linear infinite', margin: '0 auto' }} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '18px 20px 0' }}>
          {list.map((r, i) => {
            const v = votes[r.id] ?? { count: r.vote_count, voted: false }
            const st = STATUS_MAP[r.status]
            const rank = i + 1
            const isYours = r.created_by === user?.id
            return (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, background: 'var(--bg2)', borderRadius: 14, border: isYours ? '1px solid var(--accent)' : '1px solid transparent' }}>
                <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 20, fontWeight: 500, color: rank <= 3 ? 'var(--accent)' : 'var(--text3)', width: 24, textAlign: 'center', flexShrink: 0 }}>{rank}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</div>
                    {isYours && <span style={{ fontFamily: 'var(--sans)', fontSize: 9, fontWeight: 700, color: 'var(--accent)', background: 'var(--accent-soft)', padding: '2px 6px', borderRadius: 4, flexShrink: 0 }}>O TEU</span>}
                  </div>
                  <div style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{r.author ?? ''}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 7 }}>
                    <div style={{ width: 6, height: 6, borderRadius: 3, background: st.color }} />
                    <span style={{ fontFamily: 'var(--sans)', fontSize: 11, fontWeight: 600, color: st.color }}>{st.label}</span>
                  </div>
                </div>
                {r.status === 'available' ? (
                  <button style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, width: 56, padding: '8px 0', borderRadius: 12, border: 'none', background: 'var(--accent)', color: '#FEF8F5', cursor: 'pointer' }}>
                    <Icon name="book-open" size={16} color="#FEF8F5" strokeWidth={2} />
                    <span style={{ fontFamily: 'var(--sans)', fontSize: 9, fontWeight: 700 }}>Ler</span>
                  </button>
                ) : (
                  <button onClick={() => toggle(r.id)} style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, width: 56, padding: '8px 0', borderRadius: 12, border: `1.5px solid ${v.voted ? 'var(--accent)' : 'var(--border)'}`, background: v.voted ? 'var(--accent-soft)' : 'transparent', cursor: 'pointer', transition: 'all 0.15s' }}>
                    <Icon name={v.voted ? 'heart' : 'chevron-up'} size={16} color={v.voted ? 'var(--accent)' : 'var(--text2)'} strokeWidth={v.voted ? 0 : 2.2} />
                    <span style={{ fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 700, color: v.voted ? 'var(--accent)' : 'var(--text)' }}>{v.count}</span>
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* CTA */}
      <div style={{ margin: '24px 20px 0', padding: 18, borderRadius: 16, border: '1.5px dashed var(--border-strong)', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 17, color: 'var(--text)', marginBottom: 4 }}>Não encontras o que procuras?</div>
        <div style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--text3)', marginBottom: 14 }}>Pede um livro e ganha XP.</div>
        <button onClick={() => setShowForm(true)} style={{ width: '100%', height: 48, borderRadius: 12, border: 'none', background: 'var(--accent)', color: '#FEF8F5', fontFamily: 'var(--sans)', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Icon name="plus" size={18} color="#FEF8F5" strokeWidth={2.5} /> Pedir um livro
        </button>
      </div>

      {showForm && <RequestFormModal onClose={() => setShowForm(false)} />}
    </div>
  )
}

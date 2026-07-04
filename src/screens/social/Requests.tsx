import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../components/ui/Icon'
import { ZuriMark } from '../../components/ui/ZuriMark'
import { RequestFormModal } from './RequestFormModal'

interface Request {
  id: string
  title: string
  author: string
  votes: number
  status: 'pending' | 'review' | 'licensing' | 'available'
  voted: boolean
  you: boolean
}

const INITIAL: Request[] = [
  { id: 'r1', title: 'O Alquimista', author: 'Paulo Coelho', votes: 342, status: 'licensing', voted: true, you: false },
  { id: 'r2', title: 'Mãe, Materno Mar', author: 'Boaventura Cardoso', votes: 218, status: 'review', voted: false, you: false },
  { id: 'r3', title: 'Os Famintos', author: 'Luandino Vieira', votes: 187, status: 'pending', voted: true, you: false },
  { id: 'r4', title: 'A Varanda do Frangipani', author: 'Mia Couto', votes: 156, status: 'available', voted: false, you: false },
  { id: 'r5', title: 'O Vendedor de Passados', author: 'José Eduardo Agualusa', votes: 134, status: 'pending', voted: false, you: true },
  { id: 'r6', title: 'Terra Queimada', author: 'João Paulo Borges Coelho', votes: 98, status: 'review', voted: false, you: false },
  { id: 'r7', title: 'Caligrafias da Memória', author: 'Eduardo White', votes: 64, status: 'pending', voted: false, you: false },
  { id: 'r8', title: 'O Regresso do Morto', author: 'Suleiman Cassamo', votes: 41, status: 'pending', voted: false, you: false },
]

const STATUS_MAP = {
  pending:   { label: 'Pendente',    color: 'var(--text3)' },
  review:    { label: 'Em análise',  color: 'var(--warn)' },
  licensing: { label: 'A licenciar', color: 'var(--accent)' },
  available: { label: 'Disponível!', color: 'var(--success)' },
}

export function Requests() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('Todos')
  const [votes, setVotes] = useState(() => {
    const m: Record<string, { count: number; voted: boolean }> = {}
    INITIAL.forEach((r) => { m[r.id] = { count: r.votes, voted: r.voted } })
    return m
  })
  const [showForm, setShowForm] = useState(false)

  const toggle = (id: string) =>
    setVotes((prev) => {
      const cur = prev[id]
      return { ...prev, [id]: { count: cur.count + (cur.voted ? -1 : 1), voted: !cur.voted } }
    })

  let list = [...INITIAL]
  if (filter === 'Em curso') list = list.filter((r) => r.status === 'review' || r.status === 'licensing')
  if (filter === 'Os meus votos') list = list.filter((r) => votes[r.id].voted)
  list.sort((a, b) => votes[b.id].count - votes[a.id].count)

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
          <div style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 30, lineHeight: 1 }}>12</div>
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '18px 20px 0' }}>
        {list.map((r, i) => {
          const v = votes[r.id]
          const st = STATUS_MAP[r.status]
          const rank = i + 1
          return (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, background: 'var(--bg2)', borderRadius: 14, border: r.you ? '1px solid var(--accent)' : '1px solid transparent' }}>
              <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 20, fontWeight: 500, color: rank <= 3 ? 'var(--accent)' : 'var(--text3)', width: 24, textAlign: 'center', flexShrink: 0 }}>{rank}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</div>
                  {r.you && <span style={{ fontFamily: 'var(--sans)', fontSize: 9, fontWeight: 700, color: 'var(--accent)', background: 'var(--accent-soft)', padding: '2px 6px', borderRadius: 4, flexShrink: 0 }}>O TEU</span>}
                </div>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{r.author}</div>
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

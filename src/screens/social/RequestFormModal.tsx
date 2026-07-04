import { useState } from 'react'
import { Icon } from '../../components/ui/Icon'
import { useStatsStore } from '../../store/stats'

const SUGGESTIONS = [
  { title: 'O Alquimista', author: 'Paulo Coelho', exists: true, votes: 342 },
  { title: 'A Confissão da Leoa', author: 'Mia Couto', exists: false },
  { title: 'O Último Voo do Flamingo', author: 'Mia Couto', exists: false },
  { title: 'Jerusalém', author: 'Gonçalo M. Tavares', exists: false },
  { title: 'O Vendedor de Passados', author: 'José Eduardo Agualusa', exists: true, votes: 134 },
]

interface SuggestionItem {
  title: string
  author: string
  exists: boolean
  votes?: number
}

export function RequestFormModal({ onClose }: { onClose: () => void }) {
  const addXP = useStatsStore((s) => s.addXP)
  const [step, setStep] = useState<'form' | 'confirm'>('form')
  const [query, setQuery] = useState('')
  const [picked, setPicked] = useState<SuggestionItem | null>(null)
  const [author, setAuthor] = useState('')

  const matches = query.length >= 2
    ? SUGGESTIONS.filter((s) => s.title.toLowerCase().includes(query.toLowerCase()) || s.author.toLowerCase().includes(query.toLowerCase())).slice(0, 4)
    : []

  const dup = picked?.exists ?? false

  const submit = () => {
    addXP(50)
    setStep('confirm')
  }

  return (
    <div className="zuri-overlay" style={{ zIndex: 200 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'var(--bg)', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: '14px 22px 36px', maxHeight: '88%', overflowY: 'auto' }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 16px' }} />

        {step === 'form' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <h2 style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 500, fontSize: 24, color: 'var(--text)', margin: 0 }}>Pedir um livro</h2>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><Icon name="x" size={22} color="var(--text3)" strokeWidth={1.8} /></button>
            </div>
            <p style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--text3)', margin: '0 0 22px', lineHeight: 1.5 }}>Escreve o título. Nós procuramos e juntamos aos pedidos existentes.</p>

            <label style={{ fontFamily: 'var(--sans)', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text3)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Título do livro</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', border: '1.5px solid var(--accent)', borderRadius: 12, background: 'var(--bg)', marginBottom: matches.length ? 8 : 18 }}>
              <Icon name="search" size={18} color="var(--text3)" strokeWidth={1.8} />
              <input
                autoFocus
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPicked(null) }}
                placeholder="Ex: Terra Sonâmbula"
                style={{ flex: 1, border: 'none', background: 'transparent', fontFamily: 'var(--sans)', fontSize: 16, color: 'var(--text)', outline: 'none' }}
              />
            </div>

            {matches.length > 0 && !picked && (
              <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 18 }}>
                {matches.map((m, i) => (
                  <div key={i} onClick={() => { setPicked(m); setQuery(m.title); setAuthor(m.author) }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderTop: i > 0 ? '1px solid var(--border)' : 'none', cursor: 'pointer', background: 'var(--bg2)' }}>
                    <Icon name="book-open" size={16} color="var(--text3)" strokeWidth={1.6} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{m.title}</div>
                      <div style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--text3)' }}>{m.author}</div>
                    </div>
                    {m.exists && <span style={{ fontFamily: 'var(--sans)', fontSize: 10, fontWeight: 700, color: 'var(--accent)', background: 'var(--accent-soft)', padding: '3px 8px', borderRadius: 6 }}>já pedido</span>}
                  </div>
                ))}
              </div>
            )}

            {(picked || query.length >= 2) && (
              <>
                <label style={{ fontFamily: 'var(--sans)', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text3)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Autor <span style={{ textTransform: 'none', fontWeight: 400 }}>(opcional)</span></label>
                <div style={{ padding: '12px 14px', border: '1px solid var(--border)', borderRadius: 12, background: 'var(--bg)', marginBottom: 18 }}>
                  <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Ex: Mia Couto" style={{ width: '100%', border: 'none', background: 'transparent', fontFamily: 'var(--sans)', fontSize: 16, color: 'var(--text)', outline: 'none' }} />
                </div>
              </>
            )}

            {dup && picked && (
              <div style={{ display: 'flex', gap: 10, padding: 14, background: 'var(--accent-soft)', borderRadius: 12, marginBottom: 18 }}>
                <Icon name="info" size={18} color="var(--accent)" strokeWidth={1.8} />
                <div style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>
                  <strong>{picked.votes} pessoas</strong> já pediram este livro. O teu voto vai juntar-se a eles.
                </div>
              </div>
            )}

            <button
              onClick={submit}
              disabled={query.length < 2}
              style={{ width: '100%', height: 52, borderRadius: 12, border: 'none', background: query.length < 2 ? 'var(--bg3)' : 'var(--accent)', color: query.length < 2 ? 'var(--text3)' : '#FEF8F5', fontFamily: 'var(--sans)', fontSize: 16, fontWeight: 700, cursor: query.length < 2 ? 'not-allowed' : 'pointer' }}
            >
              {dup ? 'Juntar o meu voto' : 'Enviar pedido'}
            </button>
          </>
        )}

        {step === 'confirm' && (
          <div style={{ textAlign: 'center', padding: '20px 0 8px' }}>
            <div style={{ width: 84, height: 84, borderRadius: 42, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px', animation: 'zpop 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}>
              <Icon name="check" size={40} color="var(--accent)" strokeWidth={2.5} />
            </div>
            <h2 style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 500, fontSize: 28, color: 'var(--text)', margin: '0 0 10px' }}>
              {dup ? 'Voto registado!' : 'Pedido enviado!'}
            </h2>
            <p style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--text2)', margin: '0 auto 8px', maxWidth: 280, lineHeight: 1.5 }}>
              <strong>{query}</strong>{author ? `, de ${author}` : ''}.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 999, background: 'var(--accent-soft)', margin: '16px 0 24px' }}>
              <Icon name="zap" size={16} color="var(--accent)" strokeWidth={2} />
              <span style={{ fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>+50 XP</span>
            </div>
            <button onClick={onClose} style={{ width: '100%', height: 52, borderRadius: 12, border: 'none', background: 'var(--accent)', color: '#FEF8F5', fontFamily: 'var(--sans)', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>Ver mais pedidos</button>
          </div>
        )}
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../components/ui/Icon'
import { PrimaryButton } from '../../components/ui/Button'
import { useAuthStore } from '../../store/auth'

const GENRES = [
  { name: 'Romance', icon: 'heart' },
  { name: 'Suspense', icon: 'zap' },
  { name: 'História', icon: 'landmark' },
  { name: 'Ficção', icon: 'book-open' },
  { name: 'Ensaio', icon: 'file-text' },
  { name: 'Poesia', icon: 'feather' },
  { name: 'Biografia', icon: 'user' },
  { name: 'Des. Pessoal', icon: 'target' },
]

export function Genres() {
  const navigate = useNavigate()
  const setGenres = useAuthStore((s) => s.setGenres)
  const [selected, setSelected] = useState(new Set(['Romance', 'Ficção']))

  const toggle = (g: string) => {
    const s = new Set(selected)
    if (s.has(g)) s.delete(g); else s.add(g)
    setSelected(s)
  }

  const ok = selected.size >= 3

  const submit = () => {
    setGenres(Array.from(selected))
    navigate('/home')
  }

  return (
    <div style={{ width: '100%', height: '100%', background: 'var(--bg)', padding: '70px 24px 40px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 500, fontSize: 32, color: 'var(--text)', margin: 0, lineHeight: 1.15 }}>O que gostas<br/>de ler?</h1>
      <p style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--text3)', margin: '12px 0 28px' }}>Escolhe pelo menos 3 para personalizarmos a tua biblioteca.</p>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, alignContent: 'start' }}>
        {GENRES.map((g) => {
          const sel = selected.has(g.name)
          return (
            <button
              key={g.name}
              onClick={() => toggle(g.name)}
              style={{
                height: 72, borderRadius: 14,
                background: sel ? 'var(--accent-soft)' : 'transparent',
                border: `1.5px solid ${sel ? 'var(--accent)' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px',
                cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: 15, fontWeight: 600,
                color: sel ? 'var(--accent)' : 'var(--text)',
                transition: 'all 0.2s',
              }}
            >
              <Icon name={g.icon} size={20} color={sel ? 'var(--accent)' : 'var(--text2)'} strokeWidth={sel ? 2 : 1.5} />
              {g.name}
            </button>
          )
        })}
      </div>

      <div style={{ textAlign: 'center', fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--text3)', margin: '20px 0 12px' }}>
        {selected.size} de 3 escolhidos
      </div>
      <PrimaryButton onClick={submit} disabled={!ok}>Continuar</PrimaryButton>
    </div>
  )
}

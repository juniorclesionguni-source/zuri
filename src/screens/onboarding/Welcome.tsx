import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PrimaryButton } from '../../components/ui/Button'

const SLIDES = [
  {
    title: 'Livros que cabem no teu bolso',
    sub: 'Os teus livros, sempre contigo.',
  },
  {
    title: 'Lê, ganha XP, sobe de nível',
    sub: 'A tua jornada de leitura, recompensada.',
  },
  {
    title: 'Tudo por 45 MT/mês',
    sub: 'Paga com M-Pesa. Cancela quando quiseres.',
  },
]

export function Welcome() {
  const navigate = useNavigate()
  const [slide, setSlide] = useState(0)
  const current = SLIDES[slide]

  const next = () => navigate('/login')

  return (
    <div style={{ width: '100%', height: '100%', background: 'var(--bg)', padding: '80px 28px 40px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={next} style={{ background: 'none', border: 'none', fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--text3)', fontWeight: 600, cursor: 'pointer' }}>Saltar</button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <svg width="220" height="180" viewBox="0 0 220 180" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 40 }}>
          {slide === 0 && <>
            <path d="M50 150 Q 70 140 110 140 Q 150 140 170 150" />
            <circle cx="110" cy="70" r="26" />
            <path d="M95 70 L90 110 M125 70 L130 110" />
            <path d="M90 110 L85 140 M130 110 L135 140" />
            <rect x="96" y="88" width="28" height="22" rx="1" />
            <path d="M110 88 L110 110" />
          </>}
          {slide === 1 && <>
            <rect x="70" y="120" width="80" height="18" rx="1" />
            <rect x="78" y="100" width="64" height="20" rx="1" />
            <rect x="85" y="78" width="50" height="22" rx="1" />
            <path d="M95 65 Q 95 50 110 50 Q 125 50 125 65 L 122 75 L 98 75 Z" />
            <path d="M105 75 L 105 82 L 115 82 L 115 75" />
            <circle cx="110" cy="60" r="4" />
          </>}
          {slide === 2 && <>
            <circle cx="75" cy="90" r="32" />
            <path d="M125 70 L175 70 L175 120 L125 120 Z" />
            <path d="M125 70 L150 55 L175 70" />
            <path d="M135 85 L165 85 M135 95 L165 95 M135 105 L155 105" />
          </>}
        </svg>

        <h1 style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 500, fontSize: 30, lineHeight: 1.2, color: 'var(--text)', margin: 0, maxWidth: 300 }}>{current.title}</h1>
        <p style={{ fontFamily: 'var(--sans)', fontSize: 15, color: 'var(--text2)', marginTop: 14, maxWidth: 260, lineHeight: 1.5 }}>{current.sub}</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
        {SLIDES.map((_, i) => (
          <div key={i} style={{ width: i === slide ? 24 : 8, height: 8, borderRadius: 4, background: i === slide ? 'var(--accent)' : 'var(--border)', transition: 'all 0.3s' }} />
        ))}
      </div>

      <PrimaryButton onClick={() => slide < 2 ? setSlide(slide + 1) : next()}>
        {slide < 2 ? 'Continuar' : 'Começar'}
      </PrimaryButton>
    </div>
  )
}

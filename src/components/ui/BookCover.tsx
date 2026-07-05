import { useState } from 'react'

const GENRE_PALETTES: Record<string, [string, string, string]> = {
  'Thriller':  ['#0F1923', '#1D3550', '#7BAFC8'],
  'Romance':   ['#3D1520', '#6B2A38', '#E8A8B8'],
  'Auto-ajuda':['#0D2B25', '#1A4A40', '#8ADBC8'],
  'Drama':     ['#251830', '#40285A', '#C0A0E0'],
  'Ficção':    ['#2A1F12', '#4A3520', '#D4B080'],
  'Poesia':    ['#1A2420', '#2E4038', '#98C4A8'],
  'História':  ['#1E1A10', '#3A3018', '#C8B060'],
}

const FALLBACK_PALETTES: [string, string, string][] = [
  ['#3A2020', '#6B4A4A', '#C96A58'],
  ['#2D3A44', '#4A5F6F', '#D4A574'],
  ['#5C3A2F', '#8B5A3F', '#E8C7B4'],
  ['#1F2A1F', '#3A5A3A', '#C8B878'],
  ['#3D2A3A', '#6A4A6A', '#D8A0B4'],
]

function palette(genre: string, title: string): [string, string, string] {
  return GENRE_PALETTES[genre] ?? FALLBACK_PALETTES[title.length % FALLBACK_PALETTES.length]
}

// Deterministic decoration per book: circles, lines, dots
function Deco({ w, h, p, seed }: { w: number; h: number; p: [string, string, string]; seed: number }) {
  const s = seed % 4
  if (s === 0) return (
    <svg width={w} height={h} style={{ position: 'absolute', inset: 0 }} aria-hidden>
      <circle cx={w * 0.8} cy={h * 0.25} r={w * 0.35} fill={p[2]} fillOpacity="0.07" />
      <circle cx={w * 0.15} cy={h * 0.7} r={w * 0.2} fill={p[2]} fillOpacity="0.05" />
    </svg>
  )
  if (s === 1) return (
    <svg width={w} height={h} style={{ position: 'absolute', inset: 0 }} aria-hidden>
      <line x1={w * 0.1} y1={h * 0.12} x2={w * 0.9} y2={h * 0.12} stroke={p[2]} strokeOpacity="0.2" strokeWidth="0.5" />
      <line x1={w * 0.1} y1={h * 0.16} x2={w * 0.9} y2={h * 0.16} stroke={p[2]} strokeOpacity="0.1" strokeWidth="0.5" />
      <circle cx={w * 0.5} cy={h * 0.42} r={w * 0.22} fill="none" stroke={p[2]} strokeOpacity="0.12" strokeWidth="0.8" />
      <line x1={w * 0.1} y1={h * 0.84} x2={w * 0.9} y2={h * 0.84} stroke={p[2]} strokeOpacity="0.2" strokeWidth="0.5" />
      <line x1={w * 0.1} y1={h * 0.88} x2={w * 0.9} y2={h * 0.88} stroke={p[2]} strokeOpacity="0.1" strokeWidth="0.5" />
    </svg>
  )
  if (s === 2) return (
    <svg width={w} height={h} style={{ position: 'absolute', inset: 0 }} aria-hidden>
      <polygon points={`${w*0.5},${h*0.1} ${w*0.85},${h*0.5} ${w*0.5},${h*0.9} ${w*0.15},${h*0.5}`} fill="none" stroke={p[2]} strokeOpacity="0.1" strokeWidth="0.8" />
    </svg>
  )
  return (
    <svg width={w} height={h} style={{ position: 'absolute', inset: 0 }} aria-hidden>
      {[0.2, 0.35, 0.5, 0.65, 0.8].map((x, i) => (
        <circle key={i} cx={w * x} cy={h * 0.15} r={1.5} fill={p[2]} fillOpacity="0.3" />
      ))}
      <rect x={w*0.12} y={h*0.26} width={w*0.76} height={h*0.48} rx="2" fill="none" stroke={p[2]} strokeOpacity="0.1" strokeWidth="0.8" />
    </svg>
  )
}

interface BookCoverProps {
  title: string
  author: string
  genre?: string
  coverUrl?: string
  w?: number
  h?: number
}

export function BookCover({ title, author, genre = '', coverUrl, w = 100, h = 150 }: BookCoverProps) {
  const [imgFailed, setImgFailed] = useState(false)
  const p = palette(genre, title)
  const seed = title.charCodeAt(0) + title.length

  if (coverUrl && !imgFailed) {
    return (
      <div style={{ width: w, height: h, borderRadius: 4, overflow: 'hidden', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.22), inset -2px 0 4px rgba(0,0,0,0.18)' }}>
        <img
          src={coverUrl}
          alt={title}
          crossOrigin="anonymous"
          onError={() => setImgFailed(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>
    )
  }

  const fontSize = Math.max(9, Math.min(w * 0.12, 15))
  const authorSize = Math.max(7, fontSize * 0.58)

  return (
    <div style={{
      width: w, height: h,
      background: `linear-gradient(150deg, ${p[0]} 0%, ${p[1]} 100%)`,
      borderRadius: 4,
      position: 'relative',
      overflow: 'hidden',
      flexShrink: 0,
      boxShadow: '0 2px 8px rgba(0,0,0,0.22), inset 1px 0 0 rgba(255,255,255,0.05), inset -2px 0 4px rgba(0,0,0,0.18)',
    }}>
      {/* light gloss */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 25% 15%, rgba(255,255,255,0.07), transparent 55%)' }} />

      {/* decorative pattern */}
      <Deco w={w} h={h} p={p} seed={seed} />

      {/* spine shadow */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'linear-gradient(to right, rgba(0,0,0,0.3), transparent)' }} />

      {/* genre label */}
      {genre && (
        <div style={{
          position: 'absolute', top: h * 0.08, left: w * 0.1, right: w * 0.1,
          fontFamily: "'Nunito', sans-serif",
          fontSize: Math.max(6, authorSize * 0.82),
          fontWeight: 700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: p[2],
          opacity: 0.55,
          textAlign: 'center',
        }}>{genre}</div>
      )}

      {/* title */}
      <div style={{
        position: 'absolute',
        top: genre ? '22%' : '18%',
        left: '10%', right: '10%',
        fontFamily: "'Playfair Display', Georgia, serif",
        fontStyle: 'italic',
        fontWeight: 600,
        fontSize,
        lineHeight: 1.2,
        color: p[2],
        textAlign: 'center',
        letterSpacing: '0.01em',
      }}>{title}</div>

      {/* author */}
      <div style={{
        position: 'absolute', bottom: '12%', left: '10%', right: '10%',
        fontFamily: "'Nunito', sans-serif",
        fontSize: authorSize,
        color: p[2],
        opacity: 0.7,
        textAlign: 'center',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
      }}>{author}</div>
    </div>
  )
}

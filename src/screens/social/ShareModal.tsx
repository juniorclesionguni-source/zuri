import { useState } from 'react'
import html2canvas from 'html2canvas'
import { Icon } from '../../components/ui/Icon'
import { CardBookFinished } from './share-cards/CardBookFinished'
import { CardStreak } from './share-cards/CardStreak'
import { CardLevelUp } from './share-cards/CardLevelUp'
import { CardWrapped } from './share-cards/CardWrapped'
import { CardQuote } from './share-cards/CardQuote'
import { useUIStore } from '../../store/ui'

const CARDS: { kind: string; label: string; Component: React.ComponentType<{ dark?: boolean }> }[] = [
  { kind: 'book-finished', label: 'Livro lido', Component: CardBookFinished as any },
  { kind: 'streak',        label: 'Streak',     Component: CardStreak as any },
  { kind: 'levelup',       label: 'Nível',      Component: CardLevelUp as any },
  { kind: 'wrapped',       label: 'Wrapped',    Component: CardWrapped as any },
  { kind: 'quote',         label: 'Citação',    Component: CardQuote as any },
]

export function ShareModal({ initialKind = 'wrapped', onClose }: { initialKind?: string; onClose: () => void }) {
  const dark = useUIStore((s) => s.dark)
  const [kind, setKind] = useState(initialKind)
  const [cardDark, setCardDark] = useState(dark)
  const [saving, setSaving] = useState(false)

  const current = CARDS.find((c) => c.kind === kind) ?? CARDS[0]
  const { Component } = current

  const saveImage = async () => {
    const el = document.getElementById('zuri-share-card')
    if (!el) return
    setSaving(true)
    try {
      const canvas = await html2canvas(el, { scale: 1, useCORS: true, backgroundColor: null })
      const a = document.createElement('a')
      a.download = `zuri-${kind}.png`
      a.href = canvas.toDataURL('image/png')
      a.click()
    } finally {
      setSaving(false)
    }
  }

  const shareWhatsApp = async () => {
    const el = document.getElementById('zuri-share-card')
    if (!el) return
    setSaving(true)
    try {
      const canvas = await html2canvas(el, { scale: 1, useCORS: true })
      canvas.toBlob(async (blob) => {
        if (!blob) return
        if (navigator.share) {
          await navigator.share({ files: [new File([blob], `zuri-${kind}.png`, { type: 'image/png' })], text: 'Lê comigo no Zuri!' })
        } else {
          window.open(`https://wa.me/?text=${encodeURIComponent('Lê comigo no Zuri! zuri.app')}`, '_blank')
        }
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="zuri-overlay" style={{ zIndex: 300 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'var(--bg)', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: '14px 20px 36px', maxHeight: '92%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 18px' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 500, fontSize: 24, color: 'var(--text)', margin: 0 }}>Partilhar</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => setCardDark((d) => !d)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--text2)' }}>
              <Icon name={cardDark ? 'sun' : 'moon'} size={14} color="var(--text2)" strokeWidth={1.8} />
              {cardDark ? 'Claro' : 'Escuro'}
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><Icon name="x" size={22} color="var(--text3)" strokeWidth={1.8} /></button>
          </div>
        </div>

        {/* preview at 26% scale */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, flexShrink: 0 }}>
          <div style={{ transform: 'scale(0.26)', transformOrigin: 'top center', height: `${1920 * 0.26}px`, width: `${1080 * 0.26}px`, overflow: 'hidden', borderRadius: 12, boxShadow: '0 8px 40px rgba(0,0,0,0.3)' }}>
            <div id="zuri-share-card" data-dark={cardDark ? '' : undefined} style={{ width: 1080, height: 1920 }}>
              <Component />
            </div>
          </div>
        </div>

        {/* variant thumbnails at 8% */}
        <div className="hide-scrollbar" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 20, flexShrink: 0 }}>
          {CARDS.map((c) => (
            <div key={c.kind} onClick={() => setKind(c.kind)} style={{ flexShrink: 0, cursor: 'pointer' }}>
              <div style={{ width: `${1080 * 0.08}px`, height: `${1920 * 0.08}px`, borderRadius: 6, overflow: 'hidden', border: `2px solid ${kind === c.kind ? 'var(--accent)' : 'var(--border)'}`, position: 'relative' }}>
                <div style={{ transform: 'scale(0.08)', transformOrigin: 'top left', width: 1080, height: 1920 }}>
                  <c.Component />
                </div>
              </div>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 9, textAlign: 'center', marginTop: 4, color: kind === c.kind ? 'var(--accent)' : 'var(--text3)', fontWeight: kind === c.kind ? 700 : 400 }}>{c.label}</div>
            </div>
          ))}
        </div>

        {/* actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={shareWhatsApp} disabled={saving} style={{ flex: 1, height: 52, borderRadius: 12, border: 'none', background: '#25D366', color: '#fff', fontFamily: 'var(--sans)', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Icon name="share-2" size={18} color="#fff" strokeWidth={2} /> WhatsApp
          </button>
          <button onClick={saveImage} disabled={saving} style={{ flex: 1, height: 52, borderRadius: 12, border: '1.5px solid var(--accent)', background: 'transparent', color: 'var(--accent)', fontFamily: 'var(--sans)', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Icon name="download" size={18} color="var(--accent)" strokeWidth={2} /> {saving ? 'A guardar…' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}

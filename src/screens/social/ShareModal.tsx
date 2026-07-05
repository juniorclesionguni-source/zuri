import { useState, useRef, useLayoutEffect } from 'react'
import html2canvas from 'html2canvas'
import { Icon } from '../../components/ui/Icon'
import { CardBookFinished } from './share-cards/CardBookFinished'
import { CardStreak } from './share-cards/CardStreak'
import { CardLevelUp } from './share-cards/CardLevelUp'
import { CardWrapped } from './share-cards/CardWrapped'
import { CardQuote } from './share-cards/CardQuote'
import { useStatsStore } from '../../store/stats'
import { useCatalog } from '../../store/catalog'
import { useLibrary } from '../../store/library'
import { QUOTE } from '../../data/catalog'

const CARDS: { kind: string; label: string; Component: React.ComponentType<any> }[] = [
  { kind: 'book-finished', label: 'Livro lido', Component: CardBookFinished },
  { kind: 'streak',        label: 'Streak',     Component: CardStreak },
  { kind: 'levelup',       label: 'Nível',      Component: CardLevelUp },
  { kind: 'wrapped',       label: 'Wrapped',    Component: CardWrapped },
  { kind: 'quote',         label: 'Citação',    Component: CardQuote },
]

export function ShareModal({ initialKind = 'wrapped', onClose }: { initialKind?: string; onClose: () => void }) {
  const [kind, setKind] = useState(initialKind)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  // Preview escala ao máximo que cabe no espaço livre (mede o contentor).
  const previewRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.28)
  useLayoutEffect(() => {
    const measure = () => {
      const el = previewRef.current
      if (!el) return
      const s = Math.min(el.clientHeight / 1920, el.clientWidth / 1080)
      if (s > 0) setScale(s)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const stats = useStatsStore()
  const books = useCatalog((s) => s.books)
  const progress = useLibrary((s) => s.progress)

  // Livro em destaque: o terminado mais recente; senão o mais avançado; senão o 1º do catálogo.
  const byRecent = Object.entries(progress).sort((a, b) => b[1].updatedAt - a[1].updatedAt)
  const finishedId = byRecent.find(([, p]) => p.finished || p.pct >= 95)?.[0]
  const featured =
    books.find((b) => b.id === finishedId) ??
    books.find((b) => b.id === byRecent[0]?.[0]) ??
    books[0]
  const featBook = { title: featured?.title ?? 'Zuri', author: featured?.author ?? '', cover_url: featured?.cover_url }
  const monthPT = new Date().toLocaleString('pt-PT', { month: 'long' }).toUpperCase()

  const propsFor = (k: string): Record<string, unknown> => {
    switch (k) {
      case 'book-finished': return { book: featBook, rating: 5 }
      case 'streak':        return { days: stats.streakDays }
      case 'levelup':       return { level: stats.level }
      case 'wrapped':       return { month: monthPT, stats: { books: stats.booksRead, hours: stats.hoursRead, streak: stats.streakDays }, book: featBook }
      case 'quote':         return { quote: QUOTE.text, book: QUOTE.book, author: QUOTE.author }
      default:              return {}
    }
  }

  const current = CARDS.find((c) => c.kind === kind) ?? CARDS[0]
  const { Component } = current

  // Captura o nó offscreen em tamanho real (1080×1920) — NUNCA o preview escalado.
  const captureBlob = async (): Promise<Blob | null> => {
    const el = document.getElementById('zuri-share-card')
    if (!el) return null
    const canvas = await html2canvas(el, {
      useCORS: true, backgroundColor: null, scale: 1,
      width: 1080, height: 1920, windowWidth: 1080, windowHeight: 1920,
    })
    return await new Promise((res) => canvas.toBlob((b) => res(b), 'image/png'))
  }

  const download = (blob: Blob) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `zuri-${kind}.png`
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1500)
  }

  const onShare = async () => {
    setSaving(true); setErr('')
    try {
      const blob = await captureBlob()
      if (!blob) { setErr('Não consegui gerar a imagem.'); return }
      const file = new File([blob], `zuri-${kind}.png`, { type: 'image/png' })
      // Partilha nativa (o menu do telemóvel inclui WhatsApp, Instagram, etc.) com a imagem.
      if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text: 'Lê comigo no Zuri! https://zuribook.page' })
      } else {
        download(blob) // desktop / sem partilha de ficheiros
      }
    } catch (e) {
      // AbortError = utilizador cancelou o menu de partilha; ignora.
      if ((e as { name?: string })?.name !== 'AbortError') {
        try { const b = await captureBlob(); if (b) download(b) } catch { setErr('Falha ao partilhar.') }
      }
    } finally {
      setSaving(false)
    }
  }

  const onSave = async () => {
    setSaving(true); setErr('')
    try {
      const blob = await captureBlob()
      if (blob) download(blob); else setErr('Não consegui gerar a imagem.')
    } catch {
      setErr('Não consegui gerar a imagem.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="zuri-overlay" style={{ zIndex: 300 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)' }} />

      {/* Nó de captura, tamanho real, fora do ecrã (renderizado, não display:none) */}
      <div id="zuri-share-card" style={{ position: 'fixed', top: 0, left: -20000, width: 1080, height: 1920, pointerEvents: 'none' }}>
        <Component {...propsFor(kind)} />
      </div>

      <div style={{ position: 'absolute', top: '6%', bottom: 0, left: 0, right: 0, background: 'var(--bg)', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: '12px 20px 28px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 18px' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 500, fontSize: 24, color: 'var(--text)', margin: 0 }}>Partilhar</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><Icon name="x" size={22} color="var(--text3)" strokeWidth={1.8} /></button>
        </div>

        {/* preview: ocupa o espaço livre e escala ao máximo que cabe */}
        <div ref={previewRef} style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
          <div style={{ width: `${1080 * scale}px`, height: `${1920 * scale}px`, overflow: 'hidden', borderRadius: 14, boxShadow: '0 8px 40px rgba(0,0,0,0.3)' }}>
            <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: 1080, height: 1920 }}>
              <Component {...propsFor(kind)} />
            </div>
          </div>
        </div>

        {/* thumbnails com dados reais */}
        <div className="hide-scrollbar" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 20, flexShrink: 0 }}>
          {CARDS.map((c) => (
            <div key={c.kind} onClick={() => setKind(c.kind)} style={{ flexShrink: 0, cursor: 'pointer' }}>
              <div style={{ width: `${1080 * 0.06}px`, height: `${1920 * 0.06}px`, borderRadius: 6, overflow: 'hidden', border: `2px solid ${kind === c.kind ? 'var(--accent)' : 'var(--border)'}`, position: 'relative' }}>
                <div style={{ transform: 'scale(0.06)', transformOrigin: 'top left', width: 1080, height: 1920 }}>
                  <c.Component {...propsFor(c.kind)} />
                </div>
              </div>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 9, textAlign: 'center', marginTop: 4, color: kind === c.kind ? 'var(--accent)' : 'var(--text3)', fontWeight: kind === c.kind ? 700 : 400 }}>{c.label}</div>
            </div>
          ))}
        </div>

        {err && <div style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--error)', textAlign: 'center', marginBottom: 10 }}>{err}</div>}

        {/* actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onShare} disabled={saving} style={{ flex: 1, height: 52, borderRadius: 12, border: 'none', background: 'var(--accent)', color: '#fff', fontFamily: 'var(--sans)', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: saving ? 0.7 : 1 }}>
            <Icon name="share-2" size={18} color="#fff" strokeWidth={2} /> {saving ? 'A preparar…' : 'Partilhar'}
          </button>
          <button onClick={onSave} disabled={saving} style={{ flex: 1, height: 52, borderRadius: 12, border: '1.5px solid var(--accent)', background: 'transparent', color: 'var(--accent)', fontFamily: 'var(--sans)', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Icon name="download" size={18} color="var(--accent)" strokeWidth={2} /> Guardar
          </button>
        </div>
      </div>
    </div>
  )
}

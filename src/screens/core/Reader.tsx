import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Icon } from '../../components/ui/Icon'
import { ReaderSettings } from './ReaderSettings'
import { BOOKS } from '../../data/catalog'
import { useAuthStore } from '../../store/auth'
import { saveProgress } from '../../data/db'
import { progress as progressApi } from '../../data/services'

const THEMES: Record<string, { bg: string; text: string }> = {
  claro:  { bg: '#FEF8F5', text: '#3A2020' },
  sépia:  { bg: '#F5EDE6', text: '#3A2020' },
  escuro: { bg: '#28231C', text: '#EEE4D0' },
  oled:   { bg: '#000000', text: '#E0D5C0' },
}

const LH: Record<string, string> = { Compacto: '1.4', Normal: '1.65', Arejado: '1.9' }

export function Reader() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const book = BOOKS.find((b) => b.id === id) ?? BOOKS[0]

  const containerRef = useRef<HTMLDivElement>(null)
  const renditionRef = useRef<any>(null)
  const epubRef = useRef<any>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [prog, setProg] = useState(0)
  const [chromeVisible, setChromeVisible] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // reader settings
  const [theme, setTheme] = useState('sépia')
  const [fontSize, setFontSize] = useState(17)
  const [lineHeight, setLineHeight] = useState('Normal')
  const [fontFamily, setFontFamily] = useState('Lora')

  const applyTheme = useCallback((r: any, t: string, fs: number, lh: string, ff: string) => {
    const { bg, text } = THEMES[t] ?? THEMES['sépia']
    r.themes.override('body', {
      background: bg,
      color: text,
      fontFamily: ff === 'Nunito' ? 'Nunito, sans-serif' : ff === 'Georgia' ? 'Georgia, serif' : 'Lora, serif',
      fontSize: `${fs}px`,
      lineHeight: LH[lh] ?? '1.65',
      padding: '0 8px',
    })
  }, [])

  useEffect(() => {
    if (!containerRef.current || !book.epub_path) {
      setError('EPUB não disponível')
      setLoading(false)
      return
    }

    let destroyed = false
    let epubInstance: any
    let renditionInstance: any

    ;(async () => {
      try {
        const ePub = (await import('epubjs')).default
        epubInstance = ePub(book.epub_path!)
        epubRef.current = epubInstance

        renditionInstance = epubInstance.renderTo(containerRef.current!, {
          width: '100%',
          height: '100%',
          spread: 'none',
          flow: 'paginated',
        })
        renditionRef.current = renditionInstance

        // Zonas de toque DENTRO do iframe (cliques no iframe não sobem para o React):
        // 30% esquerda = página anterior, 30% direita = seguinte, centro = alterna o chrome.
        renditionInstance.hooks.content.register((contents: any) => {
          contents.document.addEventListener('click', (e: MouseEvent) => {
            const w = contents.window.innerWidth
            if (e.clientX < w * 0.3) renditionInstance.prev()
            else if (e.clientX > w * 0.7) renditionInstance.next()
            else setChromeVisible((v) => !v)
          })
        })
        renditionInstance.on('keyup', (e: KeyboardEvent) => {
          if (e.key === 'ArrowRight') renditionInstance.next()
          else if (e.key === 'ArrowLeft') renditionInstance.prev()
        })

        applyTheme(renditionInstance, theme, fontSize, lineHeight, fontFamily)

        await renditionInstance.display()
        if (destroyed) return
        setLoading(false)

        renditionInstance.on('relocated', (loc: any) => {
          if (!epubInstance.locations?.total) return
          const pct = Math.round(epubInstance.locations.percentageFromCfi(loc.start.cfi) * 100)
          setProg(pct)
        })

        // generate locations in background for accurate progress
        epubInstance.locations.generate(1024).catch(() => {})
      } catch (e) {
        if (!destroyed) {
          setError('Não foi possível abrir o livro.')
          setLoading(false)
        }
      }
    })()

    return () => {
      destroyed = true
      renditionInstance?.destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book.epub_path])

  // sync theme/size changes to rendition
  useEffect(() => {
    if (renditionRef.current) applyTheme(renditionRef.current, theme, fontSize, lineHeight, fontFamily)
  }, [theme, fontSize, lineHeight, fontFamily, applyTheme])

  // save progress
  useEffect(() => {
    if (!user?.id || prog === 0) return
    saveProgress(user.id, book.id, prog)
    progressApi.sync(user.id, book.id, prog).catch(() => {})
  }, [prog, book.id, user?.id])

  const { bg } = THEMES[theme] ?? THEMES['sépia']

  // Setas do teclado quando o foco está fora do iframe (desktop).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') renditionRef.current?.next()
      else if (e.key === 'ArrowLeft') renditionRef.current?.prev()
    }
    window.addEventListener('keyup', onKey)
    return () => window.removeEventListener('keyup', onKey)
  }, [])

  return (
    <div
      onClick={() => setChromeVisible((v) => !v)}
      style={{ width: '100%', height: '100%', background: bg, position: 'relative', overflow: 'hidden' }}
    >
      {/* Loading */}
      {loading && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg, zIndex: 50 }}>
          <div style={{ width: 32, height: 32, borderRadius: 16, border: '2.5px solid rgba(58,32,32,0.15)', borderTopColor: '#C96A58', animation: 'zspin 1s linear infinite' }} />
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: bg, gap: 16, padding: 32 }}>
          <Icon name="alert-circle" size={40} color="#C96A58" />
          <p style={{ fontFamily: 'var(--sans)', color: '#6B4A4A', textAlign: 'center' }}>{error}</p>
          <button onClick={() => navigate(-1)} style={{ fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 600, color: '#C96A58', background: 'none', border: 'none', cursor: 'pointer' }}>Voltar</button>
        </div>
      )}

      {/* epubjs container */}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* Top chrome */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        padding: '60px 20px 16px',
        background: `linear-gradient(180deg, ${bg} 0%, transparent 100%)`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        zIndex: 20,
        opacity: chromeVisible ? 1 : 0,
        transform: chromeVisible ? 'translateY(0)' : 'translateY(-20px)',
        transition: 'all 0.3s',
        pointerEvents: chromeVisible ? 'auto' : 'none',
      }}>
        <div onClick={(e) => { e.stopPropagation(); navigate(-1) }} style={{ cursor: 'pointer', padding: 8 }}>
          <Icon name="chevron-left" size={22} color="#3A2020" strokeWidth={2} />
        </div>
        <div style={{ fontFamily: 'var(--sans)', fontSize: 13, color: '#6B4A4A', fontWeight: 600 }}>{book.title}</div>
        <div onClick={(e) => { e.stopPropagation(); setShowSettings(true) }} style={{ cursor: 'pointer', padding: 4 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3A2020" strokeWidth="1.8" strokeLinecap="round">
            <path d="M4 7h3M10 7h10M4 12h10M17 12h3M4 17h3M10 17h10"/>
          </svg>
        </div>
      </div>

      {/* Bottom chrome */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '16px 24px 40px',
        background: `linear-gradient(0deg, ${bg} 0%, transparent 100%)`,
        zIndex: 20,
        opacity: chromeVisible ? 1 : 0,
        transform: chromeVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.3s',
        pointerEvents: chromeVisible ? 'auto' : 'none',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--sans)', fontSize: 11, color: '#9B8080', marginBottom: 8 }}>
          <span>{prog}% lido</span>
          <span>~ {Math.max(1, Math.round(book.mins * (1 - prog / 100)))} min restantes</span>
        </div>
        <div style={{ height: 3, background: 'rgba(58,32,32,0.12)', borderRadius: 2 }}>
          <div style={{ width: `${prog}%`, height: '100%', background: '#C96A58', borderRadius: 2, transition: 'width 0.5s' }} />
        </div>
      </div>

      {/* Always-on thin progress */}
      {!chromeVisible && (
        <div style={{ position: 'absolute', bottom: 30, left: 0, right: 0, height: 2, background: 'rgba(58,32,32,0.12)', zIndex: 10 }}>
          <div style={{ width: `${prog}%`, height: '100%', background: '#C96A58' }} />
        </div>
      )}

      {/* Navegação por toque/tecla é feita dentro do iframe (hooks.content) — ver efeito acima. */}

      {showSettings && (
        <ReaderSettings
          theme={theme} fontSize={fontSize} lineHeight={lineHeight} fontFamily={fontFamily}
          onTheme={setTheme} onFontSize={setFontSize} onLineHeight={setLineHeight} onFontFamily={setFontFamily}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}

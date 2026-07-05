import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useIsDesktop } from '../../hooks/useBreakpoint'
import { Icon } from '../../components/ui/Icon'
import { ReaderSettings } from './ReaderSettings'
import { useCatalog } from '../../store/catalog'
import { useAuthStore } from '../../store/auth'
import { saveProgress, getProgress, logSession, getOfflineBook } from '../../data/db'
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
  const books = useCatalog((s) => s.books)
  const loaded = useCatalog((s) => s.loaded)
  const book = books.find((b) => b.id === id)

  const containerRef = useRef<HTMLDivElement>(null)
  const renditionRef = useRef<any>(null)
  const epubRef = useRef<any>(null)
  const startedAtRef = useRef(0)   // timestamp de início da sessão
  const prevPctRef = useRef(0)     // pct anterior (para detectar cruzamento 95%)

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
    const family = ff === 'Nunito' ? 'Nunito, sans-serif' : ff === 'Georgia' ? 'Georgia, serif' : 'Lora, serif'
    const line = LH[lh] ?? '1.65'
    // themes.default(selector -> regras) é a API correta. Constranger media evita
    // o transbordo que parte o scroll contínuo em livros com imagens.
    r.themes.default({
      // NB: nada de max-width/overflow-x no body — partiria a paginação em colunas do epubjs.
      'body': {
        'background': `${bg} !important`,
        'color': `${text} !important`,
        'font-family': `${family} !important`,
        'font-size': `${fs}px !important`,
        'line-height': `${line} !important`,
        'margin': '0 !important',
      },
      'p, li, span, div': { 'line-height': `${line} !important`, 'overflow-wrap': 'break-word', 'word-break': 'break-word' },
      'img, image, svg, video, table': { 'max-width': '100% !important', 'height': 'auto !important' },
      'a': { 'color': `${text} !important` },
    })
  }, [])

  useEffect(() => {
    if (!loaded) return // aguarda catálogo
    if (!containerRef.current || !book?.epub_path) {
      setError('EPUB não disponível')
      setLoading(false)
      return
    }

    startedAtRef.current = Date.now()

    let destroyed = false
    let epubInstance: any
    let renditionInstance: any

    ;(async () => {
      try {
        const ePub = (await import('epubjs')).default
        // Se o livro foi descarregado, abre do blob local (funciona offline); senão do URL.
        const offline = id ? await getOfflineBook(id) : undefined
        epubInstance = ePub(offline?.data ?? book!.epub_path!)
        epubRef.current = epubInstance

        renditionInstance = epubInstance.renderTo(containerRef.current!, {
          width: '100%',
          height: '100%',
          flow: 'paginated',
          spread: 'none',          // uma página de cada vez (Kindle)
          minSpreadWidth: 100000,  // nunca mostrar 2 páginas lado a lado
        })
        renditionRef.current = renditionInstance

        // Tudo DENTRO do iframe (cliques do epubjs não sobem para o React):
        // SÓ o swipe vira a página; qualquer toque mostra/esconde a barra.
        renditionInstance.hooks.content.register((contents: any) => {
          const doc = contents.document
          let x0 = 0, y0 = 0, swiped = false
          doc.addEventListener('touchstart', (e: TouchEvent) => {
            x0 = e.changedTouches[0].clientX; y0 = e.changedTouches[0].clientY; swiped = false
          }, { passive: true })
          doc.addEventListener('touchend', (e: TouchEvent) => {
            const dx = e.changedTouches[0].clientX - x0
            const dy = e.changedTouches[0].clientY - y0
            if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
              swiped = true
              if (dx < 0) renditionInstance.next(); else renditionInstance.prev()
            }
          }, { passive: true })
          doc.addEventListener('click', () => {
            if (swiped) { swiped = false; return } // ignora o click que segue um swipe
            setChromeVisible((v) => !v)            // qualquer toque alterna a barra
          })
        })

        applyTheme(renditionInstance, theme, fontSize, lineHeight, fontFamily)

        // A1.6: retoma na posição guardada (Dexie)
        const saved = user?.id && id ? await getProgress(user.id, id) : null
        prevPctRef.current = saved?.progressPct ?? 0
        await renditionInstance.display(saved?.lastCfi || undefined)
        if (destroyed) return
        setLoading(false)

        renditionInstance.on('relocated', (loc: any) => {
          if (!epubInstance.locations?.total) return
          const pct = Math.round(epubInstance.locations.percentageFromCfi(loc.start.cfi) * 100)
          setProg(pct)
        })

        // Locations dão a % exacta mas é um loop pesado — adiado para não travar o scroll inicial.
        setTimeout(() => {
          if (!destroyed) epubInstance.locations.generate(1600).catch(() => {})
        }, 1500)
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
      // Regista sessão — fire-and-forget, não bloqueia o unmount
      if (user?.id && id) {
        const uid = user.id, bid = id, t0 = startedAtRef.current
        void logSession(uid, bid, t0, Date.now()).catch(() => {})
        void import('../../data/activity').then(({ updateAggregates }) =>
          updateAggregates(uid).catch(() => {})
        )
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book?.epub_path, loaded])

  // sync theme/size changes to rendition
  useEffect(() => {
    if (renditionRef.current) applyTheme(renditionRef.current, theme, fontSize, lineHeight, fontFamily)
  }, [theme, fontSize, lineHeight, fontFamily, applyTheme])

  // save progress + detecta livro terminado pela primeira vez
  useEffect(() => {
    if (!user?.id || !book?.id || prog === 0) return
    const prev = prevPctRef.current
    if (prog >= 95 && prev < 95 && prev > 0) {
      void import('../../data/activity').then(({ incrementBooksRead }) =>
        incrementBooksRead(user.id!).catch(() => {})
      )
    }
    prevPctRef.current = prog
    saveProgress(user.id, book.id, prog)
    progressApi.sync(user.id, book.id, prog).catch(() => {})
  }, [prog, book?.id, user?.id])

  const { bg } = THEMES[theme] ?? THEMES['sépia']
  const isDesktop = useIsDesktop()

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

      {/* epubjs container — largura limitada no desktop para legibilidade */}
      <div ref={containerRef} style={{ width: '100%', height: '100%', ...(isDesktop ? { maxWidth: 720, margin: '0 auto' } : {}) }} />

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
        <div style={{ fontFamily: 'var(--sans)', fontSize: 13, color: '#6B4A4A', fontWeight: 600 }}>{book?.title ?? ''}</div>
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
          <span>~ {Math.max(1, Math.round((book?.mins ?? 0) * (1 - prog / 100)))} min restantes</span>
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

import { useEffect, useState } from 'react'
import { useUIStore } from '../store/ui'
import { Icon } from './ui/Icon'
import { ZuriMark } from './ui/ZuriMark'

// O browser dispara beforeinstallprompt (Chrome/Edge/Android). Guardamos o evento
// e mostramos um banner próprio. iOS Safari não dispara este evento — fica como
// limitação conhecida (instalação via "Adicionar ao ecrã principal" do Safari).
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const { installPromptShown, setInstallPromptShown } = useUIStore()
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setEvt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!evt || installPromptShown) return null

  const install = async () => {
    await evt.prompt()
    await evt.userChoice
    setInstallPromptShown()
    setEvt(null)
  }
  const dismiss = () => {
    setInstallPromptShown()
    setEvt(null)
  }

  return (
    <div className="zuri-bottombar" style={{ bottom: 92, zIndex: 40, padding: '0 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--accent)', color: '#FEF8F5', borderRadius: 16, padding: '12px 14px', boxShadow: '0 8px 30px rgba(0,0,0,0.25)' }}>
        <ZuriMark size={28} color="#FEF8F5" stroke={2} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 14 }}>Instala o Zuri</div>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 12, opacity: 0.85 }}>Acesso rápido, mesmo offline.</div>
        </div>
        <button onClick={install} style={{ flexShrink: 0, height: 38, padding: '0 16px', borderRadius: 10, border: 'none', background: '#FEF8F5', color: 'var(--accent)', fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Instalar</button>
        <button onClick={dismiss} aria-label="Dispensar" style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', padding: 4, lineHeight: 0 }}>
          <Icon name="x" size={18} color="#FEF8F5" strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}

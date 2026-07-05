import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSubStore } from '../../store/subscription'

export function Processing() {
  const navigate = useNavigate()
  const setActive = useSubStore((s) => s.setActive)

  useEffect(() => {
    const t = setTimeout(() => {
      setActive()
      navigate('/success')
    }, 2600)
    return () => clearTimeout(t)
  }, [navigate, setActive])

  return (
    <div style={{ width: '100%', height: '100%', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <div style={{ width: 60, height: 60, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: 30, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', animation: 'zspin 1s linear infinite' }} />
      </div>
      <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 22, color: 'var(--text)', marginTop: 28 }}>A aguardar confirmação…</div>
      <div style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--text3)', marginTop: 10, textAlign: 'center', maxWidth: 260, lineHeight: 1.5 }}>Isto pode demorar até 2 minutos. Não feches a app.</div>
    </div>
  )
}

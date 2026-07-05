import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSubStore } from '../../store/subscription'
import { useAuthStore } from '../../store/auth'

export function Processing() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const setPending = useSubStore((s) => s.setPending)

  useEffect(() => {
    const t = setTimeout(() => {
      void (async () => {
        if (!user?.id) {
          setPending()
          navigate('/paywall')
          return
        }
        try {
          await useSubStore.getState().activate(user.id)
          navigate('/success')
        } catch {
          setPending()
          navigate('/paywall')
        }
      })()
    }, 2600)
    return () => clearTimeout(t)
  }, [navigate, user, setPending])

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

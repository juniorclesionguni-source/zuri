import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ZuriMark, ZuriWordmark } from '../../components/ui/ZuriMark'
import { useAuthStore } from '../../store/auth'

export function Splash() {
  const navigate = useNavigate()
  const { user, onboarded } = useAuthStore()

  useEffect(() => {
    const t = setTimeout(() => {
      if (!user) navigate('/welcome')
      else if (user.is_admin) navigate('/admin') // admin entra direto no back-office
      else if (!onboarded) navigate('/genres')
      else navigate('/home')
    }, 1800)
    return () => clearTimeout(t)
  }, [navigate, user, onboarded])

  return (
    <div style={{ width: '100%', height: '100%', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
      <ZuriMark size={72} color="var(--accent)" stroke={1.8} />
      <ZuriWordmark color="var(--accent)" size={14} />
      <div style={{ position: 'absolute', bottom: 80, fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--text3)', fontSize: 14 }}>
        Livros que cabem no teu bolso.
      </div>
    </div>
  )
}

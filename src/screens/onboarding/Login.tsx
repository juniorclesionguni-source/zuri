import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ZuriMark } from '../../components/ui/ZuriMark'
import { PrimaryButton } from '../../components/ui/Button'
import { useAuthStore } from '../../store/auth'
import { auth } from '../../data/services'

export function Login() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [email, setEmail] = useState('teresa.massingue@gmail.com')
  const [password, setPassword] = useState('••••••••')

  const [error, setError] = useState('')

  const handleLogin = async () => {
    try {
      await login(email, password)
      navigate('/genres')
    } catch {
      setError('Não foi possível entrar. Verifica o email e a password.')
    }
  }

  return (
    <div style={{ width: '100%', height: '100%', background: 'var(--bg)', padding: '70px 28px 40px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
        <ZuriMark size={40} color="var(--accent)" />
      </div>
      <h1 style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 500, fontSize: 34, color: 'var(--text)', margin: 0, textAlign: 'center' }}>Entrar</h1>
      <p style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--text3)', margin: '8px 0 36px', textAlign: 'center' }}>Bem-vindo de volta</p>

      <div style={{ marginBottom: 18 }}>
        <label style={{ fontFamily: 'var(--sans)', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text3)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', borderBottom: '1px solid var(--border-strong)', borderTop: 'none', borderLeft: 'none', borderRight: 'none', paddingBottom: 8, fontFamily: 'var(--sans)', fontSize: 16, color: 'var(--text)', background: 'transparent', outline: 'none' }}
        />
      </div>

      <div style={{ marginBottom: 28 }}>
        <label style={{ fontFamily: 'var(--sans)', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text3)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Password</label>
        <div style={{ borderBottom: '1px solid var(--border-strong)', paddingBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ border: 'none', background: 'transparent', fontFamily: 'var(--sans)', fontSize: 16, color: 'var(--text)', outline: 'none', flex: 1 }}
          />
          <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }}>Mostrar</span>
        </div>
      </div>

      <div style={{ textAlign: 'right', marginBottom: 28, fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>Esqueci a password</div>

      <PrimaryButton onClick={handleLogin}>Entrar</PrimaryButton>
      {error && <div style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--error)', textAlign: 'center', marginTop: 12 }}>{error}</div>}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '28px 0', fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--text3)' }}>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        ou continua com
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={() => auth.signInWithGoogle()} style={{ flex: 1, height: 52, borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg)', fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
          <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.64-.06-1.26-.17-1.85H9v3.5h4.84c-.21 1.12-.84 2.07-1.79 2.71v2.25h2.9c1.69-1.56 2.69-3.85 2.69-6.61z" fill="#4285F4"/><path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.25c-.8.54-1.83.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.95v2.32A9 9 0 0 0 9 18z" fill="#34A853"/><path d="M3.95 10.71A5.41 5.41 0 0 1 3.66 9c0-.59.1-1.17.29-1.71V4.96H.95A9 9 0 0 0 0 9c0 1.45.35 2.82.95 4.04l3-2.33z" fill="#FBBC05"/><path d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58A9 9 0 0 0 9 0 9 9 0 0 0 .95 4.96L3.95 7.3C4.66 5.16 6.65 3.58 9 3.58z" fill="#EA4335"/></svg>
          Google
        </button>
        <button onClick={handleLogin} style={{ flex: 1, height: 52, borderRadius: 12, border: '1px solid #000', background: '#000', fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
          <svg width="16" height="18" viewBox="0 0 16 18" fill="#fff"><path d="M13.4 14.26c-.66.97-1.34 1.93-2.42 1.95-1.06.02-1.4-.62-2.61-.62-1.21 0-1.58.6-2.58.64-1.04.04-1.83-1.04-2.5-2-1.36-1.96-2.4-5.53-1-7.94.7-1.2 1.93-1.95 3.27-1.97 1.02-.02 1.99.69 2.61.69.62 0 1.79-.85 3.02-.72.51.02 1.95.2 2.87 1.56-.07.05-1.72 1-1.7 2.99.02 2.38 2.1 3.17 2.12 3.18-.02.06-.33 1.12-1.08 2.24zM8.84 3.4c.56-.68.94-1.62.83-2.57-.82.03-1.8.54-2.39 1.22-.52.6-.98 1.56-.86 2.48.9.07 1.84-.46 2.42-1.13z"/></svg>
          Apple
        </button>
      </div>

      <div style={{ textAlign: 'center', marginTop: 32, fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--text3)' }}>
        Ainda não tens conta? <span onClick={handleLogin} style={{ color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }}>Criar conta</span>
      </div>
    </div>
  )
}

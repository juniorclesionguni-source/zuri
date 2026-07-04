import { useNavigate } from 'react-router-dom'
import { ZuriMark } from '../../components/ui/ZuriMark'
import { Icon } from '../../components/ui/Icon'
import { PrimaryButton, GhostButton } from '../../components/ui/Button'
import { useSubStore } from '../../store/subscription'

export function Success() {
  const navigate = useNavigate()
  const expiresAt = useSubStore((s) => s.expiresAt)

  return (
    <div style={{ width: '100%', height: '100%', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center' }}>
      <div style={{ position: 'relative', width: 120, height: 120, animation: 'zpop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
        <ZuriMark size={120} color="var(--accent)" stroke={2.5} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: 22, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="check" size={26} color="#FEF8F5" strokeWidth={3} />
          </div>
        </div>
      </div>
      <h1 style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 500, fontSize: 38, color: 'var(--text)', margin: '28px 0 10px' }}>Pronto.</h1>
      <p style={{ fontFamily: 'var(--sans)', fontSize: 15, color: 'var(--text2)', margin: '0 0 40px', maxWidth: 260 }}>A tua subscrição está ativa até {expiresAt ?? '19 de maio'}.</p>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <PrimaryButton onClick={() => navigate('/home')}>Começar a ler</PrimaryButton>
        <GhostButton onClick={() => navigate('/library')}>Ver a minha biblioteca</GhostButton>
      </div>
    </div>
  )
}

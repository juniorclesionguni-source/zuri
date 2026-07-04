import { useNavigate } from 'react-router-dom'
import { ZuriMark } from '../../components/ui/ZuriMark'
import { Icon } from '../../components/ui/Icon'
import { PrimaryButton } from '../../components/ui/Button'

const BENEFITS = [
  { icon: 'library', text: 'Acesso ilimitado à biblioteca' },
  { icon: 'download', text: 'Leitura offline' },
  { icon: 'zap', text: 'Sem anúncios, nunca' },
  { icon: 'check', text: 'Cancela quando quiseres' },
]

export function Paywall() {
  const navigate = useNavigate()
  return (
    <div style={{ width: '100%', height: '100%', background: 'var(--bg)', overflowY: 'auto', padding: '60px 24px 40px', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 30 }}>
        <button onClick={() => navigate(-1)} style={{ cursor: 'pointer', width: 36, height: 36, borderRadius: 18, background: 'var(--bg2)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="x" size={18} color="var(--text2)" strokeWidth={2} />
        </button>
        <ZuriMark size={34} color="var(--accent)" />
        <div style={{ width: 36 }} />
      </div>

      <h1 style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 500, fontSize: 36, color: 'var(--text)', margin: '20px 0 10px', lineHeight: 1.1 }}>Lê sem<br/>limites.</h1>
      <p style={{ fontFamily: 'var(--sans)', fontSize: 15, color: 'var(--text2)', margin: '0 0 32px' }}>Milhares de livros por 45 MT/mês.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 32 }}>
        {BENEFITS.map((b) => (
          <div key={b.text} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={b.icon} size={18} color="var(--accent)" strokeWidth={2} />
            </div>
            <span style={{ fontFamily: 'var(--sans)', fontSize: 15, color: 'var(--text)' }}>{b.text}</span>
          </div>
        ))}
      </div>

      <div style={{ padding: '24px 22px', borderRadius: 18, background: 'var(--accent-soft)', border: '1px solid var(--accent)', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 44, fontWeight: 500, color: 'var(--accent)', lineHeight: 1 }}>45</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 20, color: 'var(--accent)' }}>MT</div>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--text2)', marginLeft: 4 }}>/mês</div>
        </div>
        <div style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--text3)', marginTop: 6 }}>Pagamento via M-Pesa · Cancela a qualquer momento</div>
      </div>

      <PrimaryButton onClick={() => navigate('/checkout')}>Subscrever</PrimaryButton>
      <div style={{ textAlign: 'center', margin: '18px 0 0', fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--text3)', lineHeight: 1.5 }}>
        Ao continuar aceitas os <u>Termos</u> e <u>Política de Privacidade</u>.
      </div>
    </div>
  )
}

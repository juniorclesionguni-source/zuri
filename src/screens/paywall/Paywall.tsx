import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ZuriMark } from '../../components/ui/ZuriMark'
import { Icon } from '../../components/ui/Icon'
import { PrimaryButton } from '../../components/ui/Button'
import { PLANS, DEFAULT_PLAN, getPlan, type PlanId } from '../../data/plans'

const BENEFITS = [
  { icon: 'library', text: 'Acesso ilimitado à biblioteca' },
  { icon: 'download', text: 'Leitura offline' },
  { icon: 'zap', text: 'Sem anúncios, nunca' },
  { icon: 'check', text: 'Cancela quando quiseres' },
]

export function Paywall() {
  const navigate = useNavigate()
  const [plan, setPlan] = useState<PlanId>(DEFAULT_PLAN)
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
      <p style={{ fontFamily: 'var(--sans)', fontSize: 15, color: 'var(--text2)', margin: '0 0 32px' }}>Livros escolhidos a dedo, de autores moçambicanos e do mundo. Escolhe o teu plano.</p>

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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        {PLANS.map((p) => {
          const on = p.id === plan
          return (
            <button key={p.id} onClick={() => setPlan(p.id)} style={{ position: 'relative', textAlign: 'left', cursor: 'pointer', padding: '14px 14px', borderRadius: 14, background: on ? 'var(--accent-soft)' : 'var(--bg2)', border: on ? '1.5px solid var(--accent)' : '1.5px solid var(--border)', transition: 'background 160ms ease-out, border-color 160ms ease-out' }}>
              {p.note && <span style={{ position: 'absolute', top: -8, right: 10, fontFamily: 'var(--sans)', fontSize: 10, fontWeight: 700, color: '#fff', background: 'var(--accent)', padding: '2px 8px', borderRadius: 8 }}>{p.note}</span>}
              <div style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--text2)', marginBottom: 4 }}>{p.label}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                <span style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 500, color: on ? 'var(--accent)' : 'var(--text)', lineHeight: 1 }}>{p.price}</span>
                <span style={{ fontFamily: 'var(--serif)', fontSize: 14, color: on ? 'var(--accent)' : 'var(--text)' }}>MT</span>
                <span style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--text3)', marginLeft: 2 }}>{p.per}</span>
              </div>
              {/* Prova concreta atrás da badge de desconto — MT/dia torna "2 meses grátis" tangível. */}
              <div style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{(p.price / p.days).toFixed(2)} MT/dia</div>
            </button>
          )
        })}
      </div>
      <div style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--text3)', marginBottom: 20, textAlign: 'center' }}>Pagamento via M-Pesa · Cancela a qualquer momento</div>

      <PrimaryButton onClick={() => navigate('/checkout', { state: { plan } })}>
        Assinar por {getPlan(plan).price} MT{getPlan(plan).per}
      </PrimaryButton>
      <div style={{ textAlign: 'center', margin: '18px 0 0', fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--text3)', lineHeight: 1.5 }}>
        Ao continuar aceitas os <u>Termos</u> e <u>Política de Privacidade</u>.
      </div>
    </div>
  )
}

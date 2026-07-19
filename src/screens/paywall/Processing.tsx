import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { PrimaryButton, GhostButton } from '../../components/ui/Button'
import { useSubStore } from '../../store/subscription'
import { PAYMENT_SIMULATED } from '../../lib/paymentConfig'
import { mpesa } from '../../data/services'
import { useAuthStore } from '../../store/auth'

const POLL_MS = 3000
const TIMEOUT_MS = 90_000

export function Processing() {
  const navigate = useNavigate()
  const setActive = useSubStore((s) => s.setActive)
  const state = useLocation().state as { txId?: string; days?: number } | null
  const txId = state?.txId
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    // M-Pesa ainda não ligado (ou sem txId): confirmação simulada.
    if (PAYMENT_SIMULATED || !txId) {
      const t = setTimeout(() => {
        setActive(state?.days)
        navigate('/success')
      }, 2600)
      return () => clearTimeout(t)
    }
    // Real: poll até activar, falhar ou expirar (~90s — o prompt de PIN pode ser ignorado).
    let stopped = false
    const started = Date.now()
    const tick = async () => {
      if (stopped) return
      const status = await mpesa.poll(txId).catch(() => 'pending' as const)
      if (stopped) return
      if (status === 'active') {
        const userId = useAuthStore.getState().user?.id
        if (userId) await useSubStore.getState().hydrate(userId)
        navigate('/success')
        return
      }
      if (status === 'failed' || Date.now() - started > TIMEOUT_MS) {
        setFailed(true)
        return
      }
      setTimeout(tick, POLL_MS)
    }
    const t = setTimeout(tick, POLL_MS)
    return () => { stopped = true; clearTimeout(t) }
  }, [navigate, setActive, txId, state?.days])

  if (failed) {
    return (
      <div style={{ width: '100%', height: '100%', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 22, color: 'var(--text)' }}>Pagamento não confirmado</div>
        <div style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--text3)', margin: '10px 0 28px', textAlign: 'center', maxWidth: 280, lineHeight: 1.5 }}>
          Não recebemos a confirmação do M-Pesa. Verifica o saldo e tenta de novo.
        </div>
        <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <PrimaryButton onClick={() => navigate('/checkout', { replace: true })}>Tentar de novo</PrimaryButton>
          <GhostButton onClick={() => navigate('/home')}>Voltar</GhostButton>
        </div>
      </div>
    )
  }

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

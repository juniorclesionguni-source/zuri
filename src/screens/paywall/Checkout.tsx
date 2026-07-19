import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../components/ui/Icon'
import { PrimaryButton } from '../../components/ui/Button'
import { useSubStore } from '../../store/subscription'
import { isSupabaseConfigured } from '../../lib/supabaseConfig'
import { mpesa } from '../../data/services'

export function Checkout() {
  const navigate = useNavigate()
  const setPending = useSubStore((s) => s.setPending)
  const [num, setNum] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const pay = async () => {
    const digits = num.replace(/\D/g, '').replace(/^258/, '').replace(/^0+/, '')
    if (!/^8[45]\d{7}$/.test(digits)) {
      setError('Introduz um número M-Pesa válido (84 ou 85).')
      return
    }
    setError('')
    if (!isSupabaseConfigured) {
      // Modo mock (sem backend): fluxo simulado.
      setPending()
      navigate('/processing')
      return
    }
    setBusy(true)
    try {
      const { transactionId } = await mpesa.initiate('258' + digits)
      setPending()
      navigate('/processing', { state: { txId: transactionId } })
    } catch {
      setError('Pagamento recusado. Verifica o número e tenta de novo.')
      setBusy(false)
    }
  }

  return (
    <div style={{ width: '100%', height: '100%', background: 'var(--bg)', padding: '60px 20px 40px', overflowY: 'auto', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <Icon name="chevron-left" size={22} color="var(--text)" strokeWidth={2} />
        </button>
        <h2 style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 500, fontSize: 22, color: 'var(--text)', margin: 0 }}>Pagamento</h2>
      </div>

      {/* Summary */}
      <div style={{ background: 'var(--bg2)', borderRadius: 16, padding: 18, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--text)' }}>
          <span>Zuri · Subscrição mensal</span><span>45 MT</span>
        </div>
        <div style={{ height: 1, background: 'var(--border)', margin: '14px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--sans)', fontSize: 15, color: 'var(--text)', fontWeight: 700 }}>
          <span>Total a pagar</span><span>45 MT</span>
        </div>
      </div>

      {/* Phone field */}
      <div style={{ marginBottom: 18 }}>
        <label style={{ fontFamily: 'var(--sans)', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text3)', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>Número M-Pesa</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', border: '1.5px solid var(--accent)', borderRadius: 12, background: 'var(--bg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingRight: 10, borderRight: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', height: 18, width: 24, borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ flex: 1, background: '#009A3E' }} />
              <div style={{ flex: 1, background: '#000' }} />
              <div style={{ flex: 1, background: '#FFD100' }} />
              <div style={{ flex: 1, background: '#D21034' }} />
            </div>
            <span style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--text2)' }}>+258</span>
          </div>
          <input value={num} onChange={(e) => setNum(e.target.value)} inputMode="numeric" placeholder="84 xxx xxxx" style={{ flex: 1, border: 'none', background: 'transparent', fontFamily: 'var(--sans)', fontSize: 16, color: 'var(--text)', outline: 'none' }} />
        </div>
        {error && <div style={{ fontFamily: 'var(--sans)', fontSize: 12, color: '#C0453E', marginTop: 8 }}>{error}</div>}
      </div>

      {/* Info callout */}
      <div style={{ background: 'rgba(180,200,220,0.1)', border: '1px solid rgba(180,200,220,0.3)', padding: 14, borderRadius: 12, display: 'flex', gap: 10, marginBottom: 28 }}>
        <Icon name="info" size={18} color="#5A7A94" strokeWidth={1.8} />
        <div style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>Vais receber um pedido no teu telefone. Introduz o PIN M-Pesa para autorizar o pagamento.</div>
      </div>

      <PrimaryButton onClick={pay} disabled={busy}>{busy ? 'A iniciar…' : 'Pagar 45 MT'}</PrimaryButton>
      <div style={{ height: 10 }} />
      <button onClick={() => navigate(-1)} style={{ width: '100%', height: 52, background: 'none', border: 'none', fontFamily: 'var(--sans)', fontSize: 15, color: 'var(--text3)', cursor: 'pointer' }}>Cancelar</button>
    </div>
  )
}

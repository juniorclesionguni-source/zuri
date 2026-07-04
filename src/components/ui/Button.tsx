import { useUIStore } from '../../store/ui'

interface BtnProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  full?: boolean
  style?: React.CSSProperties
}

export function PrimaryButton({ children, onClick, disabled = false, full = true, style = {} }: BtnProps) {
  const dark = useUIStore((s) => s.dark)
  return (
    <button
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      style={{
        width: full ? '100%' : 'auto',
        height: 52, borderRadius: 12, border: 'none',
        background: disabled ? 'var(--bg3)' : 'var(--accent)',
        color: disabled ? 'var(--text3)' : (dark ? '#28231C' : '#FEF8F5'),
        fontFamily: 'var(--sans)', fontSize: 16, fontWeight: 700,
        letterSpacing: 0.2,
        cursor: disabled ? 'not-allowed' : 'pointer',
        padding: '0 20px',
        transition: 'all 0.18s ease',
        ...style,
      }}
    >{children}</button>
  )
}

interface GhostProps extends BtnProps {
  danger?: boolean
}

export function GhostButton({ children, onClick, full = true, danger = false, style = {} }: GhostProps) {
  const c = danger ? 'var(--error)' : 'var(--accent)'
  return (
    <button
      onClick={onClick}
      style={{
        width: full ? '100%' : 'auto',
        height: 52, borderRadius: 12,
        border: `1px solid ${c}`,
        background: 'transparent',
        color: c,
        fontFamily: 'var(--sans)', fontSize: 16, fontWeight: 600,
        cursor: 'pointer', padding: '0 20px',
        transition: 'all 0.18s ease',
        ...style,
      }}
    >{children}</button>
  )
}

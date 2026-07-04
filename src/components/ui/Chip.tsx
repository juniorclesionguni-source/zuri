import { Icon } from './Icon'

interface ChipProps {
  children: React.ReactNode
  selected?: boolean
  onClick?: () => void
  icon?: string
}

export function Chip({ children, selected = false, onClick, icon }: ChipProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '8px 14px', borderRadius: 999,
        background: selected ? 'var(--accent-soft)' : 'transparent',
        border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
        color: selected ? 'var(--accent)' : 'var(--text2)',
        fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 600,
        cursor: 'pointer', whiteSpace: 'nowrap',
      }}
    >
      {icon && <Icon name={icon} size={14} strokeWidth={2} />}
      {children}
    </button>
  )
}

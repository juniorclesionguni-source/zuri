interface SectionHeaderProps {
  children: React.ReactNode
  action?: string
  onAction?: () => void
}

export function SectionHeader({ children, action, onAction }: SectionHeaderProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0 20px', marginBottom: 14, gap: 12 }}>
      <h3 style={{ margin: 0, fontFamily: 'var(--sans)', fontSize: 16, fontWeight: 700, color: 'var(--text)', letterSpacing: 0.1, flex: 1, minWidth: 0, whiteSpace: 'nowrap' }}>{children}</h3>
      {action && (
        <span onClick={onAction} style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--accent)', fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>{action}</span>
      )}
    </div>
  )
}

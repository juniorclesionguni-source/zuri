interface BottomSheetProps {
  onClose: () => void
  children: React.ReactNode
  maxHeight?: string
}

export function BottomSheet({ onClose, children, maxHeight = '88%' }: BottomSheetProps) {
  return (
    <div className="zuri-overlay" style={{ zIndex: 200 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'var(--bg)',
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: '14px 22px 36px',
        maxHeight,
        overflowY: 'auto',
      }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 16px' }} />
        {children}
      </div>
    </div>
  )
}

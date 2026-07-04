interface ZuriMarkProps {
  size?: number
  color?: string
  stroke?: number
}

export function ZuriMark({ size = 32, color = '#C96A58', stroke = 1.5 }: ZuriMarkProps) {
  const r = size / 2
  const cx = r, cy = r
  const pts: [number, number][] = []
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 2
    pts.push([cx + (r - stroke) * Math.cos(a), cy + (r - stroke) * Math.sin(a)])
  }
  const d = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(2) + ' ' + p[1].toFixed(2)).join(' ') + ' Z'
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      <path d={d} fill="none" stroke={color} strokeWidth={stroke} strokeLinejoin="round" />
      <text
        x={cx} y={cy + size * 0.12}
        textAnchor="middle"
        fontFamily="'Playfair Display', Georgia, serif"
        fontSize={size * 0.55}
        fontStyle="italic"
        fontWeight="500"
        fill={color}
      >Z</text>
    </svg>
  )
}

export function ZuriWordmark({ color = '#C96A58', size = 11 }: { color?: string; size?: number }) {
  return (
    <div style={{
      fontFamily: "'Nunito', sans-serif",
      fontWeight: 300,
      letterSpacing: '0.25em',
      fontSize: size,
      color,
    }}>ZURI</div>
  )
}

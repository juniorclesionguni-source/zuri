interface IconProps {
  name: string
  size?: number
  color?: string
  strokeWidth?: number
  className?: string
}

export function Icon({ name, size = 20, color = 'currentColor', strokeWidth = 1.5, className }: IconProps) {
  const s = strokeWidth
  const p: React.SVGProps<SVGSVGElement> = {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
    stroke: color, strokeWidth: s, strokeLinecap: 'round', strokeLinejoin: 'round',
    style: { display: 'block', flexShrink: 0 },
    className,
  }
  switch (name) {
    case 'home': return <svg {...p}><path d="M3 10l9-7 9 7v11a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1V10z"/></svg>
    case 'compass': return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M16 8l-2 6-6 2 2-6 6-2z"/></svg>
    case 'book-open': return <svg {...p}><path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2V4z"/><path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7V4z"/></svg>
    case 'library': return <svg {...p}><path d="M4 3v18M9 3v18M14 6l5 14M3 21h18"/></svg>
    case 'user': return <svg {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>
    case 'search': return <svg {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
    case 'bell': return <svg {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
    case 'x': return <svg {...p}><path d="M18 6L6 18M6 6l12 12"/></svg>
    case 'chevron-left': return <svg {...p}><path d="M15 18l-6-6 6-6"/></svg>
    case 'chevron-right': return <svg {...p}><path d="M9 18l6-6-6-6"/></svg>
    case 'chevron-down': return <svg {...p}><path d="M6 9l6 6 6-6"/></svg>
    case 'chevron-up': return <svg {...p}><path d="M6 15l6-6 6 6"/></svg>
    case 'wifi-off': return <svg {...p}><path d="M1 1l22 22M16.7 11.3A6 6 0 0 1 19 13M5 13a10 10 0 0 1 5.2-2.7M2 8.8a16 16 0 0 1 4.5-2.6M9 17l3 3 3-3a4 4 0 0 0-6 0z"/></svg>
    case 'check': return <svg {...p}><path d="M20 6L9 17l-5-5"/></svg>
    case 'heart': return <svg {...p} fill={strokeWidth === 0 ? color : 'none'}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
    case 'zap': return <svg {...p}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
    case 'landmark': return <svg {...p}><path d="M3 22h18M4 10h16M5 22v-9M9 22v-9M15 22v-9M19 22v-9M12 2l9 5H3l9-5z"/></svg>
    case 'file-text': return <svg {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8M8 9h2"/></svg>
    case 'feather': return <svg {...p}><path d="M20.2 10.8a5.5 5.5 0 0 0-7.8-7.8L3 12.5V21h8.5l8.7-8.6"/><path d="M16 8L2 22M17.5 15H9"/></svg>
    case 'target': return <svg {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/></svg>
    case 'award': return <svg {...p}><circle cx="12" cy="8" r="6"/><path d="M8.2 13.3L7 22l5-3 5 3-1.2-8.7"/></svg>
    case 'crown': return <svg {...p}><path d="M2 19h20M3 7l5 5 4-7 4 7 5-5v12H3V7z"/></svg>
    case 'bar-chart': return <svg {...p}><path d="M3 22h18M6 18V10M12 18V4M18 18v-6"/></svg>
    case 'settings': return <svg {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>
    case 'help-circle': return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01"/></svg>
    case 'info': return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/></svg>
    case 'log-out': return <svg {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
    case 'share': return <svg {...p}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>
    case 'share-2': return <svg {...p}><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4M12 2v13"/></svg>
    case 'plus': return <svg {...p}><path d="M12 5v14M5 12h14"/></svg>
    case 'minus': return <svg {...p}><path d="M5 12h14"/></svg>
    case 'menu': return <svg {...p}><path d="M3 6h18M3 12h18M3 18h18"/></svg>
    case 'grid': return <svg {...p}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
    case 'list': return <svg {...p}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
    case 'more': return <svg {...p}><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
    case 'star': return <svg {...p}><path d="M12 2l3 7 7.5.7-5.7 5 1.7 7.3L12 18l-6.5 4 1.7-7.3L1.5 9.7 9 9l3-7z"/></svg>
    case 'flame': return <svg {...p}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 17a7 7 0 0 0 7-7 5 5 0 0 0-2-4c.3 1 .5 2 0 3a4 4 0 0 1-3 2c-.5-2-2-3.5-3.5-5-1 1.5-2 3-2 5a6 6 0 0 0 1 3.5z"/></svg>
    case 'book-marked': return <svg {...p}><path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
    case 'download': return <svg {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
    case 'bookmark': return <svg {...p}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
    case 'sun': return <svg {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
    case 'moon': return <svg {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
    case 'clock': return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
    case 'quote': return <svg {...p}><path d="M3 21c3 0 7-1 7-8V5H3v7h4c0 4-1 5-4 5v4zM14 21c3 0 7-1 7-8V5h-7v7h4c0 4-1 5-4 5v4z"/></svg>
    default: return <svg {...p}><circle cx="12" cy="12" r="9"/></svg>
  }
}

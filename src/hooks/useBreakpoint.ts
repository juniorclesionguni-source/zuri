import { useSyncExternalStore } from 'react'

type Breakpoint = 'mobile' | 'tablet' | 'desktop'

function classify(w: number): Breakpoint {
  if (w >= 1024) return 'desktop'
  if (w >= 768) return 'tablet'
  return 'mobile'
}

// ponytail: module-level singleton — one listener for all consumers
const _listeners = new Set<() => void>()
let _cached: Breakpoint = classify(window.innerWidth)

window.addEventListener('resize', () => {
  const next = classify(window.innerWidth)
  if (next !== _cached) {
    _cached = next
    _listeners.forEach((l) => l())
  }
})

function _subscribe(cb: () => void) {
  _listeners.add(cb)
  return () => _listeners.delete(cb)
}

export function useBreakpoint(): Breakpoint {
  return useSyncExternalStore(_subscribe, () => _cached, () => 'mobile')
}

export function useIsDesktop(): boolean {
  return useBreakpoint() !== 'mobile'
}

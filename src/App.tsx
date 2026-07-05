import { lazy, Suspense, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useUIStore } from './store/ui'
import { useAuthStore } from './store/auth'
import { useCatalog } from './store/catalog'
import { useStatsStore } from './store/stats'
import { useLibrary } from './store/library'
import { isSupabaseConfigured } from './lib/supabaseConfig'
import { auth } from './data/services'

import { Splash } from './screens/onboarding/Splash'
import { Welcome } from './screens/onboarding/Welcome'
import { Login } from './screens/onboarding/Login'
import { Genres } from './screens/onboarding/Genres'
import { Home } from './screens/core/Home'
import { Explore } from './screens/core/Explore'
import { Reading } from './screens/core/Reading'
import { Library } from './screens/core/Library'
import { BookDetail } from './screens/core/BookDetail'
import { Profile } from './screens/core/Profile'
import { Paywall } from './screens/paywall/Paywall'
import { Checkout } from './screens/paywall/Checkout'
import { Processing } from './screens/paywall/Processing'
import { Success } from './screens/paywall/Success'
import { Wrapped } from './screens/social/Wrapped'
import { Requests } from './screens/social/Requests'
import { LevelUpModal } from './screens/social/LevelUpModal'
import { TabBar } from './components/ui/TabBar'
import { InstallPrompt } from './components/InstallPrompt'

// Lazy: html2canvas (~200 KB) e os 5 share cards só carregam quando o utilizador abre partilha
const ShareModal = lazy(() => import('./screens/social/ShareModal').then((m) => ({ default: m.ShareModal })))
// Lazy: Reader é uma rota profunda, raramente a primeira; poupa ~40 KB no carregamento inicial
const Reader = lazy(() => import('./screens/core/Reader').then((m) => ({ default: m.Reader })))
// Lazy: StatsDetail é uma rota secundária, não precisa de estar no bundle inicial
const StatsDetail = lazy(() => import('./screens/core/StatsDetail').then((m) => ({ default: m.StatsDetail })))

function Spinner() {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, borderRadius: 16, border: '2.5px solid var(--border)', borderTopColor: 'var(--accent)', animation: 'zspin 1s linear infinite' }} />
    </div>
  )
}

function AppShell() {
  const [shareKind, setShareKind] = useState<string | null>(null)
  const [levelUp, setLevelUp] = useState(false)

  return (
    <>
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/genres" element={<Genres />} />

          <Route path="/home"    element={<Home onShare={setShareKind} />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/reading" element={<Reading onShare={setShareKind} />} />
          <Route path="/library" element={<Library />} />
          <Route path="/profile" element={<Profile onLevelUp={() => setLevelUp(true)} onShare={setShareKind} />} />

          <Route path="/book/:id"   element={<BookDetail />} />
          <Route path="/reader/:id" element={<Reader />} />

          <Route path="/paywall"    element={<Paywall />} />
          <Route path="/checkout"   element={<Checkout />} />
          <Route path="/processing" element={<Processing />} />
          <Route path="/success"    element={<Success />} />

          <Route path="/stats"    element={<StatsDetail />} />

          <Route path="/wrapped"  element={<Wrapped onShare={setShareKind} />} />
          <Route path="/requests" element={<Requests />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      <TabBar />
      <InstallPrompt />

      {shareKind && (
        <Suspense fallback={null}>
          <ShareModal initialKind={shareKind} onClose={() => setShareKind(null)} />
        </Suspense>
      )}
      {levelUp && (
        <LevelUpModal
          level={3}
          onClose={() => setLevelUp(false)}
          onShare={() => { setLevelUp(false); setShareKind('levelup') }}
        />
      )}
    </>
  )
}

export default function App() {
  const dark = useUIStore((s) => s.dark)
  const hydrate = useAuthStore((s) => s.hydrate)
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    const html = document.documentElement
    if (dark) html.setAttribute('data-dark', '')
    else html.removeAttribute('data-dark')
  }, [dark])

  // Hidratação de sessão: só com backend real. Servidor é a fonte de verdade.
  useEffect(() => {
    if (!isSupabaseConfigured) return
    let unsub = () => {}
    auth.subscribe(hydrate).then((fn) => { unsub = fn })
    return () => unsub()
  }, [hydrate])

  // Catálogo: leitura pública, carrega logo no arranque independente de login.
  // Downloads offline: não dependem de login (chave = bookId), carrega já.
  useEffect(() => {
    useCatalog.getState().load()
    useLibrary.getState().loadDownloads()
  }, [])

  // Stats: carrega do servidor quando o utilizador faz login.
  useEffect(() => {
    if (user?.id) useStatsStore.getState().load(user.id)
  }, [user?.id])

  // Progresso e favoritos: carrega quando o utilizador faz login.
  useEffect(() => {
    if (user?.id) {
      useLibrary.getState().loadProgress(user.id)
      useLibrary.getState().loadFavorites(user.id)
    }
  }, [user?.id])

  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}

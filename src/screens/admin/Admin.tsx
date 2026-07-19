import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PrimaryButton, GhostButton } from '../../components/ui/Button'
import { Icon } from '../../components/ui/Icon'
import { useAuthStore } from '../../store/auth'
import { isSupabaseConfigured } from '../../lib/supabaseConfig'
import type { AdminBook } from '../../data/api/admin'

const GENRES = ['Romance', 'Ficção', 'História', 'Poesia', 'Ensaio', 'Suspense', 'Biografia', 'Des. Pessoal']

const EMPTY: AdminBook = { id: '', title: '', author: '', genre: 'Ficção', synopsis: '', pages: 0, mins: 0, rating: 0, is_published: false }

function slugify(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 64)
}

const input: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '12px 14px', border: '1.5px solid var(--border)',
  borderRadius: 12, background: 'var(--bg)', fontFamily: 'var(--sans)', fontSize: 15,
  color: 'var(--text)', outline: 'none',
}
const label: React.CSSProperties = {
  fontFamily: 'var(--sans)', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
  color: 'var(--text3)', textTransform: 'uppercase', display: 'block', margin: '16px 0 8px',
}

export function Admin() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [books, setBooks] = useState<AdminBook[]>([])
  const [form, setForm] = useState<AdminBook | null>(null)
  const [epubFile, setEpubFile] = useState<File | null>(null)
  const [coverBlob, setCoverBlob] = useState<Blob | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [busy, setBusy] = useState('')
  const [msg, setMsg] = useState('')

  const loadList = async () => {
    const { fetchAllBooks } = await import('../../data/api/admin')
    setBooks(await fetchAllBooks())
  }
  useEffect(() => { if (isSupabaseConfigured && user?.is_admin) void loadList() }, [user?.is_admin])

  if (!isSupabaseConfigured || !user || !user.is_admin) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, background: 'var(--bg)' }}>
        <p style={{ fontFamily: 'var(--sans)', color: 'var(--text2)' }}>Acesso reservado.</p>
        <button onClick={() => navigate('/home')} style={{ fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 600, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>Voltar</button>
      </div>
    )
  }

  const set = (patch: Partial<AdminBook>) => setForm((f) => (f ? { ...f, ...patch } : f))

  // Largar o EPUB → auto-preencher título/autor/capa/duração a partir do próprio ficheiro.
  const onEpub = async (file: File) => {
    setEpubFile(file)
    setBusy('A ler o EPUB…')
    try {
      const ePub = (await import('epubjs')).default
      const book = ePub(await file.arrayBuffer())
      const meta = await book.loaded.metadata
      const title = meta?.title ?? ''
      const author = meta?.creator ?? ''
      // Capa embutida no OPF (se existir).
      let cover: Blob | null = null
      try {
        const coverUrl = await book.coverUrl()
        if (coverUrl) cover = await (await fetch(coverUrl)).blob()
      } catch { /* sem capa embutida */ }
      // Palavras → estimativa de tempo/páginas (~200 wpm, ~300 palavras/página).
      let words = 0
      try {
        const spine: any = book.spine
        for (const item of spine.items ?? []) {
          const doc = await item.load(book.load.bind(book))
          words += (doc?.body?.textContent ?? '').split(/\s+/).filter(Boolean).length
          item.unload()
        }
      } catch { /* estimativa falhou — campos ficam editáveis */ }
      setForm((f) => ({
        ...(f ?? EMPTY),
        id: f?.id || slugify(title || file.name.replace(/\.epub$/i, '')),
        title: f?.title || title,
        author: f?.author || author,
        mins: f?.mins || Math.round(words / 200),
        pages: f?.pages || Math.round(words / 300),
      }))
      if (cover) {
        setCoverBlob(cover)
        setCoverPreview(URL.createObjectURL(cover))
      }
    } finally { setBusy('') }
  }

  const onCover = (file: File) => {
    setCoverBlob(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  const save = async () => {
    if (!form || !SLUG_OK(form)) { setMsg('Preenche id (slug), título e autor.'); return }
    setBusy('A guardar…')
    setMsg('')
    try {
      const { signUploads, saveBook } = await import('../../data/api/admin')
      const coverExt = coverBlob?.type === 'image/png' ? 'png' : coverBlob?.type === 'image/webp' ? 'webp' : 'jpg'
      const signed = (epubFile || coverBlob)
        ? await signUploads(form.id, { epub: !!epubFile, cover: !!coverBlob, coverExt })
        : {}
      if (epubFile && signed.epubUrl) {
        setBusy('A enviar EPUB…')
        const r = await fetch(signed.epubUrl, { method: 'PUT', body: epubFile })
        if (!r.ok) throw new Error('upload do EPUB falhou')
      }
      if (coverBlob && signed.coverUrl) {
        setBusy('A enviar capa…')
        const r = await fetch(signed.coverUrl, { method: 'PUT', body: coverBlob })
        if (!r.ok) throw new Error('upload da capa falhou')
      }
      await saveBook({
        ...form,
        epub_path: signed.epubPath ?? form.epub_path,
        cover_path: signed.coverPath ?? form.cover_path,
      })
      setForm(null); setEpubFile(null); setCoverBlob(null); setCoverPreview(null)
      setMsg('Livro guardado.')
      await loadList()
    } catch (e: any) {
      setMsg(e?.message ?? 'Erro ao guardar.')
    } finally { setBusy('') }
  }

  return (
    <div style={{ width: '100%', height: '100%', background: 'var(--bg)', padding: '60px 20px 40px', overflowY: 'auto', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
        <button onClick={() => (form ? setForm(null) : navigate('/home'))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <Icon name="chevron-left" size={22} color="var(--text)" strokeWidth={2} />
        </button>
        <h2 style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 500, fontSize: 22, color: 'var(--text)', margin: 0 }}>
          {form ? (form.id && books.some((b) => b.id === form.id) ? 'Editar livro' : 'Novo livro') : 'Catálogo (admin)'}
        </h2>
      </div>

      {msg && <div style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--text2)', marginBottom: 14 }}>{msg}</div>}

      {!form ? (
        <>
          <PrimaryButton onClick={() => { setForm({ ...EMPTY }); setMsg('') }}>+ Adicionar livro</PrimaryButton>
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {books.map((b) => (
              <button key={b.id} onClick={() => { setForm(b); setEpubFile(null); setCoverBlob(null); setCoverPreview(null); setMsg('') }}
                style={{ textAlign: 'left', padding: 14, borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg2)', cursor: 'pointer' }}>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{b.title}</div>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
                  {b.author} · {b.is_published ? 'publicado' : 'rascunho'}{b.epub_path ? '' : ' · sem EPUB'}
                </div>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <label style={label}>EPUB {epubFile ? `· ${epubFile.name}` : form.epub_path ? `· ${form.epub_path}` : ''}</label>
          <input type="file" accept=".epub" onChange={(e) => e.target.files?.[0] && onEpub(e.target.files[0])} style={{ ...input, padding: 10 }} />

          <label style={label}>Capa {coverPreview ? '' : form.cover_path ? `· ${form.cover_path}` : '(extraída do EPUB se existir)'}</label>
          {coverPreview && <img src={coverPreview} alt="capa" style={{ width: 90, height: 135, objectFit: 'cover', borderRadius: 8, marginBottom: 8, display: 'block' }} />}
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => e.target.files?.[0] && onCover(e.target.files[0])} style={{ ...input, padding: 10 }} />

          <label style={label}>Título</label>
          <input value={form.title} onChange={(e) => set({ title: e.target.value, id: form.id || slugify(e.target.value) })} style={input} />
          <label style={label}>Autor</label>
          <input value={form.author} onChange={(e) => set({ author: e.target.value })} style={input} />
          <label style={label}>Id (slug)</label>
          <input value={form.id} onChange={(e) => set({ id: slugify(e.target.value) })} style={input} />
          <label style={label}>Género</label>
          <select value={form.genre} onChange={(e) => set({ genre: e.target.value })} style={input}>
            {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          <label style={label}>Sinopse</label>
          <textarea value={form.synopsis ?? ''} onChange={(e) => set({ synopsis: e.target.value })} rows={4} style={{ ...input, resize: 'vertical' }} />
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={label}>Páginas</label>
              <input type="number" value={form.pages || ''} onChange={(e) => set({ pages: Number(e.target.value) || 0 })} style={input} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={label}>Minutos</label>
              <input type="number" value={form.mins || ''} onChange={(e) => set({ mins: Number(e.target.value) || 0 })} style={input} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={label}>Rating</label>
              <input type="number" step="0.1" min="0" max="5" value={form.rating || ''} onChange={(e) => set({ rating: Number(e.target.value) || 0 })} style={input} />
            </div>
          </div>

          <label style={{ ...label, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.is_published} onChange={(e) => set({ is_published: e.target.checked })} />
            Publicado (visível no catálogo)
          </label>

          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <PrimaryButton onClick={save} disabled={!!busy}>{busy || 'Guardar'}</PrimaryButton>
            <GhostButton onClick={() => setForm(null)}>Cancelar</GhostButton>
          </div>
        </>
      )}
    </div>
  )
}

function SLUG_OK(b: AdminBook): boolean {
  return /^[a-z0-9-]{2,64}$/.test(b.id) && !!b.title.trim() && !!b.author.trim()
}

export default Admin

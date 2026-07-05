// Extrai a capa de cada EPUB de uma pasta e guarda em ./covers/<fileslug>.<ext>.
// Capa: 1) <meta name="cover"> -> manifest item; 2) properties="cover-image"; 3) maior imagem.
// Depois: redimensiona (ex.: máx 600px) e sobe para R2 (ver README abaixo), e faz
//   update books set cover_path='covers/<slug>.<ext>' where epub_path='<slug>.epub'.
// Uso: node scripts/extract-covers.cjs "C:\\caminho\\para\\epubs"
const JSZip = require('jszip')
const fs = require('fs')
const path = require('path')

const LIVROS = process.argv[2] || 'C:\\Users\\ocles\\Documents\\livros'
const OUT = path.join(process.cwd(), 'covers')
fs.mkdirSync(OUT, { recursive: true })

// Mesmo slug usado nas chaves R2 dos EPUBs (= epub_path sem .epub)
function slugify(filename) {
  const name = filename.replace(/\.epub$/i, '').replace(/ - .*$/, '')
  return name.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function resolveRel(dir, href) {
  href = href.replace(/^\.\//, '')
  const p = dir ? dir + '/' + href : href
  const parts = []
  for (const seg of p.split('/')) {
    if (seg === '..') parts.pop()
    else if (seg !== '.' && seg !== '') parts.push(seg)
  }
  return parts.join('/')
}

;(async () => {
  const files = fs.readdirSync(LIVROS).filter((f) => f.toLowerCase().endsWith('.epub'))
  const map = []
  for (const f of files) {
    const slug = slugify(f)
    try {
      const zip = await JSZip.loadAsync(fs.readFileSync(path.join(LIVROS, f)))
      const container = await zip.file('META-INF/container.xml').async('string')
      const opfPath = /full-path="([^"]+)"/.exec(container)[1]
      const opfDir = path.posix.dirname(opfPath) === '.' ? '' : path.posix.dirname(opfPath)
      const opf = await zip.file(opfPath).async('string')

      let href = null
      const meta = /<meta[^>]*name=["']cover["'][^>]*content=["']([^"']+)["']/i.exec(opf)
        || /<meta[^>]*content=["']([^"']+)["'][^>]*name=["']cover["']/i.exec(opf)
      if (meta) {
        const id = meta[1]
        const re = new RegExp(`<item[^>]*id=["']${id}["'][^>]*href=["']([^"']+)["']|<item[^>]*href=["']([^"']+)["'][^>]*id=["']${id}["']`, 'i')
        const m = re.exec(opf); if (m) href = m[1] || m[2]
      }
      if (!href) {
        const m = /<item[^>]*properties=["'][^"']*cover-image[^"']*["'][^>]*href=["']([^"']+)["']|<item[^>]*href=["']([^"']+)["'][^>]*properties=["'][^"']*cover-image[^"']*["']/i.exec(opf)
        if (m) href = m[1] || m[2]
      }
      let coverPath = href ? resolveRel(opfDir, href) : null
      if (coverPath && !zip.file(coverPath)) coverPath = null
      if (!coverPath) {
        let best = null, bestSize = -1
        zip.forEach((p, entry) => {
          if (!entry.dir && /\.(jpe?g|png)$/i.test(p)) {
            const size = entry._data && entry._data.uncompressedSize ? entry._data.uncompressedSize : 0
            if (size > bestSize) { bestSize = size; best = p }
          }
        })
        coverPath = best
      }
      if (!coverPath) { console.log('SEM CAPA:', f); map.push({ slug, ok: false }); continue }

      const ext = coverPath.split('.').pop().toLowerCase().replace('jpeg', 'jpg')
      const img = await zip.file(coverPath).async('nodebuffer')
      fs.writeFileSync(path.join(OUT, `${slug}.${ext}`), img)
      map.push({ slug, ext, src: coverPath, kb: Math.round(img.length / 1024) })
      console.log(`${slug}.${ext}  <-  ${coverPath}  (${Math.round(img.length / 1024)} KB)`)
    } catch (e) {
      console.log('ERRO', f, e.message); map.push({ slug, ok: false })
    }
  }
  fs.writeFileSync(path.join(OUT, '_map.json'), JSON.stringify(map, null, 2))
  console.log('\nTotal:', map.filter((m) => m.ext).length, '/', files.length)
})()

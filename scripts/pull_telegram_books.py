#!/usr/bin/env python3
"""
Importa livros de um canal TEU do Telegram direto para a Zuri, sem passar pelo painel:
  Telegram → baixa .epub → lê metadados → envia p/ R2 → cria linha em books (rascunho).

Usa APENAS num canal teu ou com direitos de distribuição. Só trata .epub (o reader
da Zuri é epubjs). Os livros entram como is_published=false: reveste género/capa e
publica no /admin — checkpoint de propósito, porque metadados auto-extraídos erram.

Setup (uma vez):
  pip install telethon ebooklib boto3
  # api_id/api_hash: https://my.telegram.org → API development tools

Env (o script nunca guarda segredos — passa-os no ambiente):
  TG_API_ID, TG_API_HASH, TG_CHANNEL           (Telegram; @canal, link ou id)
  R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY
  SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
  # opcionais: R2_EPUB_BUCKET=zuri-books  R2_COVER_BUCKET=zuri-epubs  TG_OUT=~/Documents/livros

Correr:
  python scripts/pull_telegram_books.py            # importa tudo
  python scripts/pull_telegram_books.py --dry-run  # só lista o que faria, sem enviar nada

Idempotente: salta EPUBs já baixados e livros cujo id já existe na base.
"""
import os
import re
import sys
import json
import asyncio
import unicodedata
import urllib.request
import urllib.error
from pathlib import Path

# Saída em UTF-8 — no Windows o default é cp1252, que rebenta ao imprimir →, —, ⚠
# (sobretudo quando a saída é redirecionada para um ficheiro/log).
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

DRY = "--dry-run" in sys.argv
ALL = "--all" in sys.argv  # ignora a curadoria e importa tudo


def load_curated() -> dict[str, str]:
    """{slug: género} a importar (scripts/curated_books.txt). Vazio = importar tudo.
    Formato de cada linha: 'slug = Género   # comentário'."""
    if ALL:
        return {}
    f = Path(__file__).resolve().parent / "curated_books.txt"
    if not f.exists():
        return {}
    out: dict[str, str] = {}
    for line in f.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        left = re.split(r"\s+#", line, maxsplit=1)[0]  # tira comentário inline
        slug, _, genre = left.partition("=")
        out[slug.strip()] = genre.strip() or "Ficção"
    return out


CURATED = load_curated()

import html
import zipfile
import posixpath
import xml.etree.ElementTree as ET

try:
    from telethon import TelegramClient
    from telethon.tl.types import DocumentAttributeFilename
    import boto3
except ImportError as e:
    sys.exit(f"Falta uma dependência ({e.name}): pip install telethon boto3")


def load_dotenv(path: Path):
    """Lê KEY=VALUE de um .env (evita depender de `source`/shell). Vars já no
    ambiente ganham (setdefault). Ignora comentários e comentários inline ` # ...`."""
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        key, sep, val = line.partition("=")
        if not sep:
            continue
        val = re.split(r"\s+#", val.strip(), maxsplit=1)[0].strip()
        if val.startswith("#"):  # linha "KEY=   # comentário" → valor vazio
            val = ""
        os.environ.setdefault(key.strip(), val)


# Carrega o .env.import (raiz do projeto), corras de onde correres.
for _p in (Path.cwd() / ".env.import", Path(__file__).resolve().parent.parent / ".env.import"):
    load_dotenv(_p)


def env(*names, required=True, default=None):
    for n in names:
        v = os.environ.get(n)
        if v:
            return v
    if required:
        sys.exit(f"Define a variável de ambiente {names[0]} (ver cabeçalho do ficheiro).")
    return default


# Telegram: sempre necessário (mesmo em --dry-run, que só descarrega e lista).
TG_API_ID = env("TG_API_ID")
TG_API_HASH = env("TG_API_HASH")
TG_CHANNEL = env("TG_CHANNEL")
OUT = Path(env("TG_OUT", required=False, default=str(Path.home() / "Documents" / "livros")))

# R2 + Supabase: só necessários para importar de verdade. Em --dry-run ficam vazios.
R2_ACCOUNT = env("R2_ACCOUNT_ID", required=not DRY)
R2_KEY = env("R2_ACCESS_KEY_ID", required=not DRY)
R2_SECRET = env("R2_SECRET_ACCESS_KEY", required=not DRY)
R2_EPUB_BUCKET = env("R2_EPUB_BUCKET", required=False, default="zuri-books")
R2_COVER_BUCKET = env("R2_COVER_BUCKET", required=False, default="zuri-epubs")
SB_URL = (env("SUPABASE_URL", required=not DRY) or "").rstrip("/")
SB_KEY = env("SUPABASE_SERVICE_ROLE_KEY", required=not DRY)


def slugify(s: str) -> str:
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn").lower()
    return re.sub(r"^-+|-+$", "", re.sub(r"[^a-z0-9]+", "-", s))[:64]


def epub_filename(msg) -> str | None:
    doc = getattr(msg, "document", None)
    if not doc:
        return None
    for attr in doc.attributes:
        if isinstance(attr, DocumentAttributeFilename) and attr.file_name.lower().endswith(".epub"):
            return attr.file_name
    if getattr(doc, "mime_type", "") == "application/epub+zip":
        return f"{msg.id}.epub"
    return None


def _local(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]  # ignora namespace


def read_metadata(path: Path):
    """(title, author, cover_bytes, cover_ext, words, excerpt) lendo o EPUB como zip.
    Não usa ebooklib de propósito — ele estoira em livros que referenciam fontes
    ausentes. Aqui, uma capa/spine em falta é ignorada, não fatal."""
    with zipfile.ZipFile(path) as z:  # BadZipFile aqui → apanhado no loop, salta
        names = set(z.namelist())
        # 1) container.xml → caminho do .opf
        container = ET.fromstring(z.read("META-INF/container.xml"))
        opf_path = next(
            e.get("full-path") for e in container.iter() if _local(e.tag) == "rootfile"
        )
        base = posixpath.dirname(opf_path)
        opf = ET.fromstring(z.read(opf_path))

        title, author, cover_id, manifest, spine = path.stem, "", None, {}, []
        for e in opf.iter():
            tag = _local(e.tag)
            if tag == "title" and e.text and title == path.stem:
                title = e.text.strip()
            elif tag == "creator" and e.text and not author:
                author = e.text.strip()
            elif tag == "meta" and e.get("name") == "cover":
                cover_id = e.get("content")
            elif tag == "item":
                manifest[e.get("id")] = (e.get("href"), e.get("properties") or "")
            elif tag == "itemref":
                spine.append(e.get("idref"))

        resolve = lambda href: posixpath.normpath(posixpath.join(base, href))

        # 2) capa: <meta name=cover> ou item com properties="cover-image"
        cover_bytes, cover_ext = None, None
        cover_href = None
        if cover_id and cover_id in manifest:
            cover_href = manifest[cover_id][0]
        else:
            for href, props in manifest.values():
                if "cover-image" in props:
                    cover_href = href
                    break
        if cover_href:
            key = resolve(cover_href)
            if key in names:
                cover_bytes = z.read(key)
                cover_ext = cover_href.rsplit(".", 1)[-1].lower()

        # 3) contagem de palavras + citação. Recolhe todos os parágrafos de prosa e
        #    escolhe um a ~1/3 do livro — aí é texto real da história, não front matter
        #    (capa, ficha catalográfica, dedicatória, prefácio ficam no início).
        words, paras = 0, []
        for idref in spine:
            item = manifest.get(idref)
            if not item:
                continue
            key = resolve(item[0])
            if key not in names:
                continue
            doc = z.read(key).decode("utf-8", "ignore")
            words += len(re.sub(r"<[^>]+>", " ", doc).split())
            for m in re.findall(r"<p[^>]*>(.*?)</p>", doc, re.S | re.I):
                p = html.unescape(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", m)).strip())
                if 120 <= len(p) <= 400:
                    paras.append(p)

        excerpt = None
        if paras:
            p = paras[len(paras) // 3]
            excerpt = p if len(p) <= 300 else p[:297].rsplit(" ", 1)[0] + "…"

    return title, author, cover_bytes, cover_ext, words, excerpt


def book_exists(book_id: str) -> bool:
    req = urllib.request.Request(
        f"{SB_URL}/rest/v1/books?id=eq.{book_id}&select=id",
        headers={"apikey": SB_KEY, "Authorization": f"Bearer {SB_KEY}"},
    )
    with urllib.request.urlopen(req) as r:
        return len(json.load(r)) > 0


def insert_book(row: dict):
    data = json.dumps(row).encode()
    req = urllib.request.Request(
        f"{SB_URL}/rest/v1/books",
        data=data,
        method="POST",
        headers={
            "apikey": SB_KEY,
            "Authorization": f"Bearer {SB_KEY}",
            "Content-Type": "application/json",
            "Prefer": "resolution=ignore-duplicates,return=minimal",
        },
    )
    try:
        urllib.request.urlopen(req).close()
    except urllib.error.HTTPError as e:  # surface o corpo (ex. constraint) em vez de "400"
        raise RuntimeError(f"Supabase {e.code}: {e.read().decode('utf-8', 'ignore')[:200]}") from None


def r2():
    return boto3.client(
        "s3",
        endpoint_url=f"https://{R2_ACCOUNT}.r2.cloudflarestorage.com",
        aws_access_key_id=R2_KEY,
        aws_secret_access_key=R2_SECRET,
        region_name="auto",
    )


async def main():
    OUT.mkdir(parents=True, exist_ok=True)
    s3 = None if DRY else r2()
    client = TelegramClient("zuri_tg", int(TG_API_ID), TG_API_HASH)
    await client.start()  # telefone+código no 1º arranque (só tu os introduzes)

    # Canal privado por id ("-100...") só resolve depois de o Telethon ver os teus diálogos.
    await client.get_dialogs()
    channel = int(TG_CHANNEL) if re.fullmatch(r"-?\d+", TG_CHANNEL.strip()) else TG_CHANNEL

    if CURATED:
        print(f"Curadoria activa: {len(CURATED)} títulos (usa --all para importar tudo).")
    imported, skipped, bad, off = 0, 0, 0, 0
    async for msg in client.iter_messages(channel):
        name = epub_filename(msg)
        if not name:
            continue
        # Um ficheiro estragado (zip inválido, sem metadados, upload falhado) não pode
        # abortar a corrida inteira — salta-se com aviso e segue-se.
        try:
            dest = OUT / name
            if not (dest.exists() and dest.stat().st_size > 0):
                print(f"↓ {name}")
                await msg.download_media(file=str(dest))

            title, author, cover, cover_ext, words, excerpt = read_metadata(dest)
            book_id = slugify(title)
            # Sem título real (hash, UUID, ou caminho de ficheiro) → não vale importar.
            junk = re.fullmatch(r"[0-9a-f]{16,}", book_id) or re.fullmatch(
                r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f-]+", book_id)
            if not book_id or junk:
                print(f"  ⚠ {name}: sem título utilizável — ignorado")
                bad += 1
                continue
            if CURATED and book_id not in CURATED:
                off += 1  # fora da curadoria — não importa (mas fica baixado)
                continue
            if not DRY and book_exists(book_id):
                skipped += 1
                continue

            epub_key = f"{book_id}.epub"
            cover_key = f"covers/{book_id}.{cover_ext or 'jpg'}" if cover else None
            print(f"  → {title} — {author or '(autor?)'}  [{book_id}]")
            if DRY:
                imported += 1
                continue

            s3.put_object(Bucket=R2_EPUB_BUCKET, Key=epub_key,
                          Body=dest.read_bytes(), ContentType="application/epub+zip")
            if cover:
                s3.put_object(Bucket=R2_COVER_BUCKET, Key=cover_key,
                              Body=cover, ContentType=f"image/{'png' if cover_ext == 'png' else 'jpeg'}")
            insert_book({
                "id": book_id, "title": title, "author": author,
                "genre": CURATED.get(book_id) or "Ficção",  # género certo da curadoria
                "excerpt": excerpt,                          # citação extraída do livro
                "epub_path": epub_key, "cover_path": cover_key,
                "pages": round(words / 300) or None, "mins": round(words / 200) or None,
                "is_published": True,  # curados entram já publicados (género/capa/citação prontos)
            })
            imported += 1
        except Exception as e:
            print(f"  ⚠ {name}: {type(e).__name__} — ignorado ({e})")
            bad += 1
            continue

    await client.disconnect()
    verb = "importaria" if DRY else "importados"
    extra = f", {off} fora da curadoria" if CURATED else ""
    print(f"\nPronto: {imported} {verb}, {skipped} já existiam, {bad} maus{extra}.")
    if imported and not DRY:
        print("Publicados com género/capa/citação. Revê no /admin se quiseres afinar.")


if __name__ == "__main__":
    asyncio.run(main())

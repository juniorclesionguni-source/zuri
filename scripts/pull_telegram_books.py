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
from pathlib import Path

DRY = "--dry-run" in sys.argv

try:
    from telethon import TelegramClient
    from telethon.tl.types import DocumentAttributeFilename
    import ebooklib
    from ebooklib import epub
    import boto3
except ImportError as e:
    sys.exit(f"Falta uma dependência ({e.name}): pip install telethon ebooklib boto3")


def env(*names, required=True, default=None):
    for n in names:
        v = os.environ.get(n)
        if v:
            return v
    if required:
        sys.exit(f"Define a variável de ambiente {names[0]} (ver cabeçalho do ficheiro).")
    return default


TG_API_ID = env("TG_API_ID")
TG_API_HASH = env("TG_API_HASH")
TG_CHANNEL = env("TG_CHANNEL")
OUT = Path(env("TG_OUT", required=False, default=str(Path.home() / "Documents" / "livros")))

R2_ACCOUNT = env("R2_ACCOUNT_ID")
R2_KEY = env("R2_ACCESS_KEY_ID")
R2_SECRET = env("R2_SECRET_ACCESS_KEY")
R2_EPUB_BUCKET = env("R2_EPUB_BUCKET", required=False, default="zuri-books")
R2_COVER_BUCKET = env("R2_COVER_BUCKET", required=False, default="zuri-epubs")
SB_URL = env("SUPABASE_URL").rstrip("/")
SB_KEY = env("SUPABASE_SERVICE_ROLE_KEY")


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


def read_metadata(path: Path):
    """(title, author, cover_bytes, cover_ext, words) a partir do EPUB."""
    book = epub.read_epub(str(path))
    dc = lambda k: (book.get_metadata("DC", k) or [("", {})])[0][0]
    title = dc("title") or path.stem
    author = dc("creator") or ""
    cover_bytes, cover_ext = None, None
    for item in book.get_items_of_type(ebooklib.ITEM_IMAGE):
        if "cover" in item.get_name().lower():
            cover_bytes = item.get_content()
            cover_ext = item.get_name().rsplit(".", 1)[-1].lower()
            break
    words = 0
    for item in book.get_items_of_type(ebooklib.ITEM_DOCUMENT):
        text = re.sub(r"<[^>]+>", " ", item.get_content().decode("utf-8", "ignore"))
        words += len(text.split())
    return title, author, cover_bytes, cover_ext, words


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
    urllib.request.urlopen(req).close()


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

    imported, skipped = 0, 0
    async for msg in client.iter_messages(TG_CHANNEL):
        name = epub_filename(msg)
        if not name:
            continue
        dest = OUT / name
        if not (dest.exists() and dest.stat().st_size > 0):
            print(f"↓ {name}")
            await msg.download_media(file=str(dest))

        title, author, cover, cover_ext, words = read_metadata(dest)
        book_id = slugify(title)
        if not book_id:
            print(f"  ⚠ sem título utilizável em {name} — ignorado")
            continue
        if not DRY and book_exists(book_id):
            skipped += 1
            continue

        epub_key = f"{book_id}.epub"
        cover_key = f"covers/{book_id}.{cover_ext or 'jpg'}" if cover else None
        print(f"  → {title} — {author or '(autor?)'}  [{book_id}]")
        if DRY:
            continue

        s3.put_object(Bucket=R2_EPUB_BUCKET, Key=epub_key,
                      Body=dest.read_bytes(), ContentType="application/epub+zip")
        if cover:
            s3.put_object(Bucket=R2_COVER_BUCKET, Key=cover_key,
                          Body=cover, ContentType=f"image/{'png' if cover_ext == 'png' else 'jpeg'}")
        insert_book({
            "id": book_id, "title": title, "author": author,
            "epub_path": epub_key, "cover_path": cover_key,
            "pages": round(words / 300) or None, "mins": round(words / 200) or None,
            "is_published": False,  # revê no /admin (género, capa) e publica
        })
        imported += 1

    await client.disconnect()
    verb = "importaria" if DRY else "importados"
    print(f"\nPronto: {imported} {verb}, {skipped} já existiam.")
    if imported and not DRY:
        print("Vai ao /admin → Catálogo: define o género e publica cada um.")


if __name__ == "__main__":
    asyncio.run(main())

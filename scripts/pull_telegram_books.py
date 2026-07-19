#!/usr/bin/env python3
"""
Puxa todos os EPUBs de um canal teu do Telegram para uma pasta local, para depois
os arrastares para o painel /admin da Zuri (que extrai título/autor/capa sozinho).

Usa APENAS num canal teu ou com direitos de distribuição — ver a conversa. O reader
da Zuri é epubjs, por isso só descarrega .epub (ignora PDF e outros).

Setup (uma vez):
  pip install telethon
  # cria uma app em https://my.telegram.org → API development tools → copia api_id e api_hash

Correr:
  TG_API_ID=123456 TG_API_HASH=abc... TG_CHANNEL=@o_teu_canal python scripts/pull_telegram_books.py
  # no 1º arranque pede o teu número e o código que o Telegram te envia (só tu o vês).

Idempotente: salta ficheiros já descarregados, dá para re-correr quando o canal cresce.
"""
import os
import sys
import asyncio
from pathlib import Path

try:
    from telethon import TelegramClient
    from telethon.tl.types import DocumentAttributeFilename
except ImportError:
    sys.exit("Falta o Telethon: pip install telethon")

API_ID = os.environ.get("TG_API_ID")
API_HASH = os.environ.get("TG_API_HASH")
CHANNEL = os.environ.get("TG_CHANNEL")  # @username, link t.me/... ou id
OUT = Path(os.environ.get("TG_OUT", Path.home() / "Documents" / "livros"))

if not (API_ID and API_HASH and CHANNEL):
    sys.exit("Define TG_API_ID, TG_API_HASH e TG_CHANNEL (ver cabeçalho do ficheiro).")


def epub_name(msg) -> str | None:
    """Nome do ficheiro se a mensagem tiver um documento .epub, senão None."""
    doc = getattr(msg, "document", None)
    if not doc:
        return None
    for attr in doc.attributes:
        if isinstance(attr, DocumentAttributeFilename) and attr.file_name.lower().endswith(".epub"):
            return attr.file_name
    # fallback: alguns clientes marcam o mime em vez do nome
    if getattr(doc, "mime_type", "") == "application/epub+zip":
        return f"{msg.id}.epub"
    return None


async def main():
    OUT.mkdir(parents=True, exist_ok=True)
    client = TelegramClient("zuri_tg", int(API_ID), API_HASH)
    await client.start()  # pede telefone+código no 1º arranque (só tu os introduzes)

    got, skipped = 0, 0
    async for msg in client.iter_messages(CHANNEL):
        name = epub_name(msg)
        if not name:
            continue
        dest = OUT / name
        if dest.exists() and dest.stat().st_size > 0:
            skipped += 1
            continue
        print(f"↓ {name}")
        await msg.download_media(file=str(dest))
        got += 1

    await client.disconnect()
    print(f"\nPronto: {got} descarregados, {skipped} já existiam → {OUT}")
    if got:
        print("Agora arrasta esses .epub para o /admin da Zuri (extrai os metadados sozinho).")


if __name__ == "__main__":
    asyncio.run(main())

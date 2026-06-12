"""Abstrakcja przechowywania plików (zdjęć).

Domyślnie zapisuje na lokalnym dysku. Cała reszta aplikacji zna tylko
interfejs ``Storage`` oraz singleton ``storage`` — podmiana na S3/R2/MinIO
sprowadza się do dostarczenia innej implementacji ``Storage``.
"""
from __future__ import annotations

import os
import re
import uuid
from pathlib import Path
from typing import Protocol

from src.backend.exceptions import ValidationError

# Dozwolone typy obrazów -> rozszerzenie pliku.
ALLOWED_IMAGE_TYPES: dict[str, str] = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}
MAX_IMAGE_BYTES = 5 * 1024 * 1024  # 5 MB

# Klucz = 32 znaki hex (uuid4) + rozszerzenie. Wymuszamy to przy odczycie,
# co eliminuje path traversal (klucz nie może zawierać "/" ani "..").
_KEY_RE = re.compile(r"^[0-9a-f]{32}\.(?:jpg|png|webp)$")


def _default_media_root() -> Path:
    root = Path(os.getenv("MEDIA_ROOT", Path(__file__).resolve().parents[2] / "media_uploads"))
    root.mkdir(parents=True, exist_ok=True)
    return root


class Storage(Protocol):
    """Minimalny kontrakt magazynu plików."""

    def save(self, data: bytes, content_type: str) -> str: ...
    def path(self, key: str) -> Path: ...
    def delete(self, key: str) -> None: ...
    def url(self, key: str) -> str: ...
    def key_from_url(self, url: str | None) -> str | None: ...


class LocalStorage:
    """Zapisuje pliki w katalogu na dysku, serwowane przez ``GET /media/{key}``."""

    def __init__(self, root: Path | None = None, base_url: str | None = None) -> None:
        self._root = root or _default_media_root()
        self._base_url = (base_url or os.getenv("MEDIA_BASE_URL", "/media")).rstrip("/")

    def save(self, data: bytes, content_type: str) -> str:
        ext = ALLOWED_IMAGE_TYPES.get(content_type)
        if ext is None:
            raise ValidationError("Unsupported image type")
        if not data:
            raise ValidationError("Empty image")
        if len(data) > MAX_IMAGE_BYTES:
            raise ValidationError("Image too large")
        key = f"{uuid.uuid4().hex}{ext}"
        (self._root / key).write_bytes(data)
        return key

    def _safe_path(self, key: str) -> Path:
        if not _KEY_RE.fullmatch(key):
            raise ValidationError("Invalid media key")
        return self._root / key

    def path(self, key: str) -> Path:
        path = self._safe_path(key)
        if not path.exists():
            raise FileNotFoundError(key)
        return path

    def delete(self, key: str) -> None:
        path = self._safe_path(key)
        if path.exists():
            path.unlink()

    def url(self, key: str) -> str:
        return f"{self._base_url}/{key}"

    def key_from_url(self, url: str | None) -> str | None:
        """Odwraca url() -> klucz; zwraca None gdy to nie jest nasza referencja."""
        if not url:
            return None
        prefix = f"{self._base_url}/"
        if not url.startswith(prefix):
            return None
        key = url[len(prefix):]
        return key if _KEY_RE.fullmatch(key) else None


# Singleton używany przez aplikację. Podmień tutaj, by zmienić backend.
storage: Storage = LocalStorage()

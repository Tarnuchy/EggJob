"""Endpointy uploadu i serwowania zdjęć.

Upload przyjmuje surowe body obrazu (nagłówek ``Content-Type`` decyduje o typie),
więc nie wymaga ``python-multipart`` i działa tak samo jak ``PUT`` do object storage.
"""
from fastapi import APIRouter, Request
from fastapi.responses import FileResponse

from src.backend.exceptions import NotFoundError, ValidationError
from src.backend.storage import ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES, storage

router = APIRouter(tags=["media"])


@router.post("/uploads", status_code=201)
async def upload_image(request: Request) -> dict[str, str]:
    content_type = (request.headers.get("content-type") or "").split(";")[0].strip()
    if content_type not in ALLOWED_IMAGE_TYPES:
        raise ValidationError("Unsupported image type")

    # Wczesne odrzucenie zbyt dużego pliku zanim wczytamy całość do pamięci.
    declared = request.headers.get("content-length")
    if declared is not None and declared.isdigit() and int(declared) > MAX_IMAGE_BYTES:
        raise ValidationError("Image too large")

    data = await request.body()
    key = storage.save(data, content_type)
    return {"key": key, "url": storage.url(key)}


@router.get("/media/{key}")
def get_image(key: str) -> FileResponse:
    # TODO: gdy pojawi się uwierzytelnianie (#1), prywatne grupy wymagają
    # kontroli dostępu — na razie ochroną jest nieodgadywalny losowy klucz.
    try:
        path = storage.path(key)
    except FileNotFoundError as exc:
        raise NotFoundError("Image not found") from exc
    return FileResponse(path)

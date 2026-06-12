"""Uwierzytelnianie JWT (HS256).

Tożsamość wołającego bierzemy z tokenu (nagłówek ``Authorization: Bearer ...``),
a NIE z parametrów ścieżki — dzięki temu ``checkPerms`` i kontrole właściciela
mają sens. Token wydajemy przy rejestracji/logowaniu.
"""
from __future__ import annotations

import os
import warnings
from datetime import datetime, timedelta, timezone
from uuid import UUID

import jwt
from fastapi import Depends, Header
from sqlalchemy.orm import Session

from src.backend.database import get_db
from src.backend.exceptions import AuthenticationError, PermissionDeniedError
from src.backend.models import User

_DEFAULT_SECRET = "dev-insecure-change-me"
JWT_SECRET = os.getenv("JWT_SECRET", _DEFAULT_SECRET)
JWT_ALGORITHM = "HS256"
# Apka mobilna — dłuższy czas życia tokenu (domyślnie 7 dni).
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", str(7 * 24 * 60)))

if JWT_SECRET == _DEFAULT_SECRET:
    warnings.warn(
        "JWT_SECRET nie jest ustawiony — używam domyślnego sekretu deweloperskiego. "
        "Ustaw JWT_SECRET w .env przed wdrożeniem.",
        stacklevel=2,
    )


def create_access_token(user_id: UUID, account_id: UUID) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "account_id": str(account_id),
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=JWT_EXPIRE_MINUTES)).timestamp()),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def _decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError as exc:
        raise AuthenticationError("Token expired") from exc
    except jwt.InvalidTokenError as exc:
        raise AuthenticationError("Invalid token") from exc


def get_current_user(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> User:
    """Zależność FastAPI zwracająca zalogowanego użytkownika z tokenu Bearer."""
    if not authorization or not authorization.lower().startswith("bearer "):
        raise AuthenticationError("Missing bearer token")
    payload = _decode_token(authorization[7:].strip())
    sub = payload.get("sub")
    if sub is None:
        raise AuthenticationError("Invalid token")
    try:
        user_id = UUID(sub)
    except (ValueError, TypeError) as exc:
        raise AuthenticationError("Invalid token") from exc
    user = db.query(User).filter_by(id=user_id).first()
    if user is None:
        raise AuthenticationError("User no longer exists")
    return user


def assert_self(path_user_id: UUID, current_user: User) -> None:
    """Pilnuje, że ścieżkowe user_id to faktycznie zalogowany użytkownik."""
    if current_user.id != path_user_id:
        raise PermissionDeniedError("Cannot act on behalf of another user")

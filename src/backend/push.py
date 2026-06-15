"""Klient Expo Push (exponent-server-sdk).

Wysyłka jest best-effort: błędy sieci/serwera są pochłaniane (nigdy nie wywracają
operacji API), a tokeny, które Expo oznaczy jako nieaktywne, zwracamy do skasowania.
"""
from __future__ import annotations

import os

try:
    from exponent_server_sdk import (
        DeviceNotRegisteredError,
        PushClient,
        PushMessage,
    )
    _PUSH_AVAILABLE = True
except Exception:  # brak biblioteki nie może wywrócić aplikacji
    _PUSH_AVAILABLE = False

# Opcjonalny token dostępu Expo (zalecany w produkcji); bez niego też działa.
EXPO_ACCESS_TOKEN = os.getenv("EXPO_ACCESS_TOKEN")
PUSH_TITLE = os.getenv("PUSH_TITLE", "Todo")


def push_enabled() -> bool:
    return _PUSH_AVAILABLE


def _build_client() -> "PushClient":
    if EXPO_ACCESS_TOKEN:
        import requests

        session = requests.Session()
        session.headers.update(
            {
                "Authorization": f"Bearer {EXPO_ACCESS_TOKEN}",
                "accept": "application/json",
                "content-type": "application/json",
            }
        )
        return PushClient(session=session)
    return PushClient()


def send_to_tokens(tokens: list[str], body: str, title: str | None = None) -> list[str]:
    """Wysyła `body` na podane tokeny Expo. Zwraca listę tokenów do usunięcia
    (urządzenie wyrejestrowane / token nieprawidłowy)."""
    dead: list[str] = []
    if not _PUSH_AVAILABLE or not tokens:
        return dead

    client = _build_client()
    for token in tokens:
        if not PushClient.is_exponent_push_token(token):
            dead.append(token)
            continue
        try:
            ticket = client.publish(
                PushMessage(to=token, title=title or PUSH_TITLE, body=body)
            )
            ticket.validate_response()
        except DeviceNotRegisteredError:
            dead.append(token)
        except Exception:
            pass  # best-effort: jeden zły token nie przerywa reszty
    return dead

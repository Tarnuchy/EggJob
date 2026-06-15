# Backend follow-up: allow clearing a profile photo

**Status:** NOT possible with the current backend. Frontend "Remove photo" button is intentionally
**not** shipped to avoid a misleading no-op in HTTP/production. This note lists the exact, minimal
backend change required. (No backend code was modified — this is a hand-off for the backend team.)

## Why it's impossible today

1. `editProfile` ignores a null photo — [src/backend/models.py](../../../src/backend/models.py) (~line 295):
   ```python
   if new_data.get("photoUrl") is not None:
       if not self.is_valid_photo_url(new_data["photoUrl"]):
           raise ValidationError("Invalid photo URL")
       self.photoUrl = new_data["photoUrl"]
   ```
   Sending `photo_url: null` is treated as "no change".
2. The URL validator rejects an empty string — `is_valid_photo_url` (~line 46) only matches
   `https?://…` or `/media/<32-hex>.(jpg|png|webp)`, so `photo_url: ""` raises `ValidationError`.
3. The request model can't distinguish "field omitted" from "explicit null" —
   [src/backend/request.py](../../../src/backend/request.py): `photo_url: str | None = None`. The route
   always forwards it, so the handler can't tell a username-only update from an intentional clear.

Good news: `User.photoUrl` is already `nullable=True`, and the SQLAlchemy `before_flush` listeners
(~models.py:1486-1526) already delete the orphaned media file when `photoUrl` changes — so once a
clear is allowed, old-file cleanup happens automatically.

## Minimal backend change

**1. Route — only forward `photo_url` when the client actually sent it** (Pydantic v2 `model_fields_set`),
in the `PATCH /users/{user_id}/profile` handler (`src/backend/main.py`):
```python
update_kwargs = {}
if "username" in payload.model_fields_set:
    update_kwargs["username"] = payload.username
if "photo_url" in payload.model_fields_set:
    update_kwargs["photoUrl"] = payload.photo_url   # may be None -> clear
user.editProfile(db_session=db, **update_kwargs)
```

**2. `editProfile` — treat an explicitly-provided null/empty as a clear** (`src/backend/models.py`):
```python
if "photoUrl" in new_data:
    value = new_data["photoUrl"]
    if value is None or value == "":
        self.photoUrl = None            # orphan-media cleanup listener handles the old file
    else:
        if not self.is_valid_photo_url(value):
            raise ValidationError("Invalid photo URL")
        self.photoUrl = value
```

This keeps every existing behaviour: omitting `photo_url` → no change; sending a valid URL → set;
sending `null` → clear. A username-only update no longer risks wiping the photo because the key is
only forwarded when present.

## Frontend follow-up (once the backend ships the above)

Small and ready to wire on request:
- Add a "Remove photo" affordance in `EditProfileScreen` (shown when a photo exists) → `setPhotoUrl('')`.
- In `useEditProfileForm`, track whether the photo field was touched and send an explicit
  `photoUrl: null` on clear (today the empty value collapses to `undefined`, which JSON.stringify drops).
- `HttpProfileService.editProfile` already sends `photo_url`; ensure it transmits an explicit `null`
  for the clear case rather than omitting it.
- Add `photo.remove` strings to `en.ts` + `pl.ts` and a unit test asserting an explicit clear empties
  the stored photoUrl.

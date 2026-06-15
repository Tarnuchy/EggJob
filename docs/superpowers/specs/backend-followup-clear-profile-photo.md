# Profile photo removal — RESOLVED

**Status:** ✅ Shipped. The backend added a dedicated endpoint
(`origin/main` commit `ef3ec78` "photo delete and pagination"), and the frontend now wires it in.

## What the backend provides

`DELETE /users/{user_id}/profile/photo` — [src/backend/main.py](../../../src/backend/main.py)
```python
@app.delete("/users/{user_id}/profile/photo", response_model=MessageResponse)
def delete_profile_photo(user_id, db, current_user):
    assert_self(user_id, current_user)
    user = _get_or_404(db, User, id=user_id)
    with transaction(db):
        user.removeAvatar(db_session=db)   # photoUrl = None; orphan media cleaned by the commit event
    return MessageResponse(message="avatar_removed")
```

This is cleaner than the PATCH-null approach originally sketched here: a dedicated verb, no ambiguity
between "field omitted" and "explicit clear", and the existing `before_flush`/`after_commit` media-cleanup
listeners delete the old `/media/<key>` file automatically.

## Frontend wiring (done on this branch)

- `IProfileService.removeProfilePhoto(userId)` → `HttpProfileService` issues the `DELETE`; `MockProfileService`
  clears its stored `photoUrl`.
- `EditProfileScreen` shows a **"Remove photo"** action when a photo is set; it calls the service immediately
  and best-effort dispatches `profile/edit` (photoUrl → empty) to keep the reducer cache in sync. The avatar
  falls back to the default person icon (`resolvePhotoUri('')` → undefined).
- EN/PL string `photo.remove`; unit test `tests/frontend/unit/profile/remove-photo.test.ts`.

## Historical note

Before `ef3ec78`, clearing was impossible: `editProfile` ignored a null `photo_url`
(`if new_data.get("photoUrl") is not None`) and `is_valid_photo_url` rejected an empty string. That gap is
now closed by the dedicated DELETE endpoint above.

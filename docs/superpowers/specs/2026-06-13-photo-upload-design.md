# Photo Upload — Design Spec

**Date:** 2026-06-13
**Branch:** `frontend/pictures` (from `origin/main`)
**Scope:** Profile photo + progress-entry photo + optional photo at registration.

## Problem

The backend now exposes image handling and asked the frontend to wire it in:

1. **Upload** — `POST /uploads` with the *raw image bytes* in the body and a `Content-Type`
   header (NOT multipart/FormData). Limit 5 MB; allowed `image/jpeg`, `image/png`,
   `image/webp` (otherwise `400`). Returns `{ key, url }` where `url` is relative
   (`/media/<key>.<ext>`).
2. **Attach to profile** — `PATCH /users/{id}/profile` with `{ photo_url }`.
3. **Attach at registration** — `POST /auth/register` accepts `photo_url`.
4. **Attach to a progress entry** — `POST /users/{id}/task-progress/{progressId}/update`
   accepts `photo_url`.
5. **Display** — `photo_url` is relative, so the UI must prefix the API base
   (`${API_BASE_URL}${photo_url}`). External `https://…` URLs are also accepted by the backend.

## Current state (what already exists)

- `PATCH /users/{id}/profile` is already implemented in `HttpProfileService.editProfile`
  and already sends `photo_url`. The `profile/edit` reducer action already carries `photoUrl`.
- `addProgress` in `HttpTaskService` already POSTs to the progress-update endpoint with
  `photo_url`, but hardcoded to `null`.
- `Avatar` renders `<Image uri={photoUrl} />` **raw** — a relative `/media/…` would not load.
- `isValidPhotoUrl` only accepts `https://…` — it would reject the backend's own `/media/…`.
- No `POST /uploads` client exists. No image picker is installed.

## What's missing (this change)

### Shared core (reused by all three consumers)

- **`utils/imageValidation.ts`** (pure, unit-tested): `ALLOWED_IMAGE_MIME_TYPES`,
  `MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024`, `validateImageAsset({ mimeType?, fileSize? })`
  → `{ code } | null`. Pure so it can be tested without importing native modules.
- **`utils/resolvePhotoUri.ts`** (unit-tested): `resolvePhotoUri(photoUrl?) => string | undefined`.
  Empty → `undefined`; `http(s)://`, `file://`, `content://`, `data:` → unchanged;
  starts with `/` → `${API_BASE_URL}${photoUrl}`. Central display resolver.
- **`utils/pickImage.ts`** (native, not unit-tested): wraps `expo-image-picker`. Requests the
  relevant permission, launches `launchImageLibraryAsync` / `launchCameraAsync` with
  `mediaTypes: ['images']`, returns `{ uri, mimeType, fileSize } | { canceled } | { error }`.
- **`services/types/IUploadService.ts`**: `uploadImage(asset) => Promise<Result<{ key, url }>>`.
- **`services/http/HttpUploadService.ts`** (native, not unit-tested): uses
  `expo-file-system/legacy` `uploadAsync(url, fileUri, { httpMethod: 'POST',
  uploadType: BINARY_CONTENT, headers })`. Headers carry the `Content-Type` (image mime) and a
  Bearer token if present. Parses `JSON.parse(result.body)` → `{ key, url }`; maps non-2xx via
  the existing `{ code }` error convention; 400 → `validation`.
- **`services/mock/MockUploadService.ts`** (unit-tested): echoes the local URI as the URL
  (`{ key, url: asset.uri }`) so the picked image previews immediately without a backend —
  consistent with the "mock has no backend, reducer is source of truth" pattern.
- **Service registry**: register `uploadService` in `ServiceContainer` + `services/index.ts`,
  export `IUploadService` from `services/types/index.ts`.
- **`hooks/usePhotoUpload.ts`** (native, not unit-tested): orchestration unit reused by the three
  screens. `pickAndUpload(source: 'library' | 'camera')` → `{ status: 'uploaded'; url } |
  { status: 'canceled' } | { status: 'error'; code }`, plus an `uploading` flag.
- **`components/common/PhotoSourceSheet.tsx`**: bottom-sheet (modeled on `ConfirmDialog`) that
  offers "Take Photo" / "Choose from Library" / "Cancel" — satisfies "camera alongside gallery".
- **`components/common/Avatar.tsx`**: route `photoUrl` through `resolvePhotoUri`.
- **`utils/validation.ts`**: `isValidPhotoUrl` was originally to be widened to accept relative
  `/…` paths, but since the picker replaced manual URL entry it lost its only caller and was
  removed as dead code (post-review). Display resolution now lives entirely in `resolvePhotoUri`.

### Consumers

- **Profile** (`EditProfileScreen` + `useEditProfileForm`): replace the photo-URL text input
  with a tappable avatar/preview + "Change photo" button → `PhotoSourceSheet` →
  `usePhotoUpload` → set `photoUrl` in form state → existing `editProfile`/`profile/edit` path.
- **Progress** (`AddProgressScreen`): add a photo button + preview; when
  `task.params.photoRequired`, a photo is mandatory (block submit with a toast). Thread `photoUrl`
  through `ITaskService.addProgress`, the `tasks/add-progress` action, the reducer
  (`ProgressEntry.photoUrl`), `MockTaskService`, and `HttpTaskService` (replace the hardcoded
  `null`).
- **Registration** (`RegisterForm` + `useRegisterForm`): optional avatar picker above the form.
  Thread optional `photoUrl` through `IAuthService.register`, `HttpAuthService` (send `photo_url`),
  `MockAuthService`, the `auth/register` action, and the reducer (store on the new `User`).

### Config / deps

- `app.json`: add the `expo-image-picker` plugin with iOS permission strings
  (photo library + camera).
- New deps (already installed via `npx expo install`): `expo-image-picker`, `expo-file-system`.
- i18n: new EN + PL keys under `profile.edit.*`, `tasks.progress.*`, `auth.*`, and a shared
  `photo.*` namespace for the source sheet + error messages (`tooLarge`, `unsupportedType`,
  `permissionDenied`, `uploadFailed`).

## Transport decision (the one real risk)

The backend wants raw bytes, not multipart. React Native's stock `fetch` does not reliably send
a binary body. `expo-file-system/legacy` `uploadAsync(..., { uploadType: BINARY_CONTENT })` is
purpose-built for exactly this: it streams the file from disk as the request body with the given
`Content-Type` header, no multipart wrapper, no loading 5 MB into JS memory. Confirmed present in
the installed SDK 54 type defs (`FileSystemUploadType.BINARY_CONTENT = 0`).

## Testing

Vitest runs in `environment: node` with no Expo mocks, so tested modules must not import native
modules. Tests:
- `MockUploadService` echoes URI.
- `resolvePhotoUri` — every branch (empty, https, relative, file://, data:).
- `validateImageAsset` — size limit, allowed/forbidden types, missing metadata.
- Reducer: `tasks/add-progress` stores `photoUrl`; `auth/register` stores `photoUrl`.
- `MockTaskService.addProgress` accepts `photoUrl` (reducer-as-source-of-truth).

Gate: `tsc --noEmit` (0 errors) + full Vitest suite green.

## Out of scope

- Rendering a progress-entry photo gallery/timeline UI beyond storing the URL in state and
  resolving it where entries are already displayed.
- Cropping/resizing beyond what the picker offers.
- Removing/replacing the old photo on the backend (handled server-side via cleanup event).

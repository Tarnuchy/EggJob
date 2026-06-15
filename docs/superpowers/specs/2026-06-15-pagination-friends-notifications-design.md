# Pagination (Friends + Notifications) — Design Spec

**Date:** 2026-06-15
**Branch:** `frontend/uifixes` (from `origin/main`)
**Scope:** Wire the backend's `limit/offset` pagination into the friends list and the
notification panel via infinite scroll. No backend changes.

## Problem

Backend commit `ef3ec78` added `limit/offset` pagination (default 20, max 100) to
`GET /users/{id}/friends` and `GET /users/{id}/notifications`. Both responses now carry
`items` **plus** `total`, `limit`, `offset` (always set). The frontend services read only
`items` and ignore the rest:

- `HttpSocialService.getFriends` / `MockSocialService.getFriends` return a flat array.
- `HttpNotificationService.getNotifications` / `MockNotificationService.getNotifications`
  return a flat array.

Result: any user with **more than 20** friends or notifications silently sees only the
first 20. `/feed` (limit-only, no offset/total) and `/tasks/{id}/progress-entries`
(no pagination) are confirmed unchanged and out of scope.

## Decisions (agreed)

1. **Infinite scroll**, 20 per page, via `FlatList onEndReached` + footer spinner.
2. **Notification badge becomes a dot**, not a count — "there is something unread",
   without a number. This sidesteps the fact that the backend has no unread-count
   endpoint: a boolean derived from loaded (newest-first) pages is reliable in practice.

## Current state

- `getFriends` returns `{ friendshipId, friendUserId }` and **drops** the payload's
  `username`/`photo_url`. `MyFriendsTab` then calls `getProfile` **once per friend**
  (N+1) to resolve display data.
- `NotificationsContext` loads notifications once and exposes `unreadCount: number`;
  `TopBar` renders it as `9+`/number, `NotificationScreen` shows the "mark all" header
  when `unreadCount > 0`.
- `HttpNotificationService.markAllAsRead` loops `getNotifications` (first page only) and
  marks each unread — already incomplete; pagination makes it more visible.

## What changes (this change)

### Shared core (pure, unit-tested)

- **`services/types/index.ts`** — add `Page<T> = { items: T[]; total: number }`.
- **`services/pagination.ts`** (pure, no RN imports): pagination math used by the hook/context.
  - `hasMorePages(offset: number, pageLength: number, total: number): boolean`
    → `offset + pageLength < total`.
  - `nextOffset(offset: number, pageLength: number): number` → `offset + pageLength`.
  - `DEFAULT_PAGE_SIZE = 20`.

### Service layer (signatures widened, Result<T> + mock/HTTP parity preserved)

- **`ISocialService.getFriends`**:
  ```ts
  getFriends(userId: string, opts?: { limit?: number; offset?: number }):
    Promise<Result<Page<{ friendshipId: string; friendUserId: string; username: string; photoUrl?: string }>>>;
  ```
  DTO enriched with `username`/`photoUrl` (removes the N+1).
  - HTTP: append `?limit=&offset=`, map `items` (incl. `username`, `photo_url`), return
    `{ items, total }`.
  - Mock: filter friendships for the user, `slice(offset, offset+limit)`, resolve
    `username`/`photoUrl` from `mockProfileService.getAllProfiles()`, `total` = count
    before slicing.
- **`INotificationService.getNotifications`**:
  ```ts
  getNotifications(userId: string, opts?: { limit?: number; offset?: number }):
    Promise<Result<Page<NotificationItem>>>;
  ```
  - HTTP: append `?limit=&offset=`, return `{ items, total }`.
  - Mock: filter for the user, sort newest-first, `slice`, `total` = count before slicing.
- **`markAllAsRead` (HTTP)** — paginate through **all** pages (`limit 100`) until
  `offset >= total`, marking each unread. Explicit user action, not a hot path, so it
  completes fully. Mock already marks all of the user's → parity holds.

### Notifications UI

- **`NotificationsContext`**: accumulate pages. Replace `unreadCount: number` with
  `hasUnread: boolean` (`items.some(active)`). Add `loadMore()`, `loadingMore: boolean`,
  `hasMore: boolean`. `refresh()` resets to page 1. Append dedupes by `notificationId`.
- **`NotificationScreen`**: `onEndReached → loadMore` (guarded by `hasMore && !loadingMore`),
  footer `ActivityIndicator` while `loadingMore`. "Mark all" header shown when `hasUnread`.
- **`TopBar`**: render a dot (no text) when `hasUnread`, with an i18n a11y label.

### Friends UI

- **`MyFriendsTab`**: drive the list with a small reusable pagination hook
  **`hooks/usePaginatedList.ts`** wrapping `fetchPage(offset, limit) → Promise<Result<Page<T>>>`
  and managing `items / loading / loadingMore / hasMore / error / loadMore / refresh`.
  FlatList `onEndReached → loadMore` + footer spinner. Display data comes straight from
  the enriched `getFriends` DTO (no `getProfile` calls). The SearchBar keeps filtering
  **loaded** pages (documented limit; no friends-search backend endpoint — global search
  lives in the "Add friend" tab).

### i18n

- Add an a11y label for the unread dot in `en.ts` + `pl.ts` (structural parity enforced
  by the `Translation` type). Loading footers use a bare spinner (no copy needed).

## Testing (TDD, `node` env, parity)

- `services/pagination.ts` — unit tests for `hasMorePages` / `nextOffset` edge cases
  (exact boundary, empty page, offset past total).
- Mock slicing — `MockSocialService.getFriends` and `MockNotificationService.getNotifications`
  with `{ limit, offset }` return the correct slice + `total` (tested with a small `limit`
  over existing seeds), and `getFriends` resolves `username`/`photoUrl`.
- HTTP services are not unit-tested (repo convention — no fetch mock).
- `usePaginatedList` / context / screens are not unit-tested (React/native, no renderer in
  the `node` test env), consistent with the rest of the suite.

## Out of scope / unchanged

- `/feed` and `/tasks/{id}/progress-entries` (confirmed non-paginated server-side).
- No backend changes.

## Known limitations (accepted)

- The unread **dot** and `markAllAsRead` operate on loaded/visible data; with newest-first
  ordering this is correct in practice. A future backend unread-count endpoint would make
  the indicator exact — not needed now.
- Friends search filters loaded pages only.

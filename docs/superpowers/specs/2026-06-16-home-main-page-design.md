# Main Page (Home dashboard) — Design Spec

- **Date:** 2026-06-16
- **Branch:** `frontend/mainpage` (based on `origin/main` @ `7492a7c`)
- **Status:** Approved design, pending spec review → implementation plan
- **Author:** brainstormed with the user; assumptions verified against the codebase by a 5-agent fan-out

## 1. Goal

Replace the placeholder `HomeScreen` with the "heart" of EggJob: a warm, social-leaning
dashboard that, for the logged-in user, surfaces (in this order):

1. A personalized **greeting**.
2. **Contextual nudges** (only when relevant).
3. A **stats snapshot**.
4. **"Jump back in"** — the user's active tasks.
5. **"Your groups"** — group & bingo highlights.
6. **"Friends' activity"** — the global friends feed (the emotional core).

Home is a **read-only dashboard**: every interactive element navigates to an existing screen
or opens a panel. No new mutations happen on Home.

### Confirmed product decisions (from brainstorming)

- Identity: **balanced, social-leaning** "heart". Feed anchored at the bottom (long-scroll payoff).
- **No streaks** anywhere (abandoned feature).
- **No standalone quick-actions row** — rely on the existing center FAB.
- Included optional blocks: **My active tasks peek, Groups & bingo highlights, Contextual nudges**.
- "Jump back in" rows **navigate to `TaskDetail`** (no inline progress mutation).

### Out of scope (YAGNI)

- Streaks; inline progress mutation on Home; infinite scroll / pagination of the feed;
  a literal "due today" widget (backend has no per-day endpoint; deadlines are sparse);
  achievements/badges; a dedicated global-feed screen with "see all".

## 2. Constraints & ground truth (verified)

| Area | Reality (file evidence) | Consequence for Home |
|---|---|---|
| Task progress | `Task.progressId → TaskProgress { value: number }` — a **single aggregate** per task, not per-user (`application/state.ts`, `application/handlers/tasks.ts`). | "My active tasks" = not-done tasks in my member groups, using the task's aggregate `value` vs `goal`. |
| Task status | **No status enum.** Derive: `value >= goal` ⇒ done; `value === 0` ⇒ todo; else in-progress. `goal` is **not** guaranteed `> 0` in state. | Add a pure `deriveTaskStatus`; **exclude `goal <= 0`** from the active peek. |
| Membership | `selectTaskGroupsByMember(state, userId)` returns `{id, group}[]` for groups where `userId ∈ memberIds` **or** `userId === ownerUserId`. `memberIds` does **not** include the owner. | Member groups already include groups I own. Member count = `memberIds.length + 1` (TasksScreen convention). |
| Recency | No `lastProgressedAt` on `Task`. Only `ProgressEntry.createdAt?` (optional) exists. | One-pass build a `taskId → latestProgressAt` map from `progressEntries`; sentinel `''` for none. |
| Feed | `socialService.getUserFeed(userId): Promise<Result<FeedItem[]>>` — **no limit param**, **no `photoUrl`**, newest-first guaranteed, mock+HTTP parity confirmed. `useFriendActivity` filters one user and **cannot** be reused. | New `useHomeFeed`; **slice to `HOME_FEED_LIMIT = 20`** client-side. No avatars in rows (ActivityItem already avatar-less). |
| Stats | `useUserStats`/`profileService.getUserStats → UserStats { activeTasks, completedTasks, friendsCount }`, mock+HTTP parity. | Reuse `ProfileStats`. Fetched inside `useHomeData` (see §5) so pull-to-refresh can refresh it. |
| Display name | `profileService.getProfile → { username, photoUrl? }`. **The display name field is `username`** (no `displayName`). | Greeting uses `username`, fallback `state.entities.users[uid]?.username`. |
| Notifications | `useNotifications()` exposes `hasUnread`, `notifications[]` (`{notificationId, message, active, date}`), `refresh()`. `hasUnread = items.some(active)`. | Notifications nudge from `hasUnread`; count = loaded unread. Open panel via `usePanelContext().setOpenPanel('notifications')`. |
| Friend requests | No dedicated hook; `socialService.getPendingInvitations(userId): Result<{invitationId, fromUserId}[]>` (inbound), same path `InvitationsTab` uses. | Friend-requests nudge count from `getPendingInvitations` inside `useHomeData`. |
| Bingo | `buildLines(size)` + `hasBingo` logic live **un-exported inside** `components/tasks/BingoGrid.tsx`. Board size = `round(sqrt(taskIds.length))`; a cell is done when `progressValue >= task.goal`. | **Extract** `buildBingoLines` + `hasBingoLine` to a pure `components/tasks/bingoDetection.ts`; `BingoGrid` imports it; the Home selector reuses it. |
| Layout | `TAB_BAR_HEIGHT = 68` from `components/layout/tabs`. Canonical scaffold: root `View` (bg) → `TopBar` → `SafeAreaView edges={['left','right','bottom']}` → `ScrollView`. `RefreshControl` is **not yet used anywhere**. | Pad `contentContainerStyle.paddingBottom = TAB_BAR_HEIGHT + spacing.lg`. Pull-to-refresh is a new (standard) pattern. |
| Routes | `TaskDetail: { groupId, taskId }`, `GroupTasks: { groupId }` (verified, `navigation/types.ts`). The Friends **Invitations sub-tab is component state, not a route**. | Feed/task/group taps use the verified routes. Add an optional `Friends` tab param for the invitations nudge (§7). |
| Mock seed | Demo groups/tasks are seeded **lazily inside `TasksScreen`'s `useEffect`**; `usr-seed-1` otherwise has feed (4 items) + 2 friendships but **no groups** until Tasks is opened. | Extract seeding to an app-bootstrap dev-seed so Home shows groups standalone in mock mode (§7). |
| i18n | `en.ts` exports `type Translation = Stringify<typeof en>`; `pl.ts` is `const pl: Translation = {…}` ⇒ **tsc enforces parity**. Top-level keys today: app, common, auth, screens, quickAction, topBar, friends, tasks, settings, relativeTime, notifications, profile, photo, reducerErrors. | Add a new top-level **`home`** namespace to both files (distinct from the existing `screens.home` string). |

## 3. Screen scaffold

```
<View root bg=colors.background>
  <TopBar />                                  // existing: "🏠 Home" + notif-dot/settings pill
  <SafeAreaView edges={['left','right','bottom']} flex:1>
    <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing onRefresh />}
        contentContainerStyle={{
          paddingHorizontal: SCREEN_PADDING_H,
          paddingTop: spacing.md,
          paddingBottom: TAB_BAR_HEIGHT + spacing.lg,   // clear the overlay tab bar
          gap: spacing.md,
        }}>
      {content}
    </ScrollView>
  </SafeAreaView>
</View>
```

`content` selection logic:

- **While first load in flight** (stats/feed/invitations not yet resolved): render greeting hero
  (it needs only the profile/clock) + lightweight skeletons for stats and feed; reducer-backed
  sections (active tasks, groups) render immediately.
- **New-user onboarding** (see §4.7): replaces sections 2–6 with a single welcome card.
- **Otherwise:** render sections 1–6 in order; each section self-hides or shows its own empty state.

## 4. Sections

Each section is a focused component under `screens/home/components/`. Visual language matches the
app: translucent cards (`colors.cardSurfaceTranslucent`, `borderRadius: 18`, border
`colors.cardBorderTranslucent`), uppercase caption section labels (`letterSpacing: 1.2`).

### 4.1 GreetingHero
- **Props:** `{ displayName: string; greetingKey: GreetingKey }`.
- Warm brown gradient hero card; time-of-day greeting + name + decorative 🍂.
- `displayName` rendered `numberOfLines={1} ellipsizeMode="tail"` (usernames can be long).
- Non-interactive.

### 4.2 HomeNudges
Renders only the nudges that apply; the whole block disappears if none. **No deduplication** —
both may show at once.
- **Unread notifications** — when `useNotifications().hasUnread`. Text:
  `home.nudges.notifications` with `count = notifications.filter(n => n.active).length`.
  `onPress → setOpenPanel('notifications')`.
- **Friend requests** — when `pendingInvitations.length > 0`. Text: `home.nudges.friendRequests`
  with `count`. `onPress → navigate('Friends', { initialTab: 'invitations' })` (see §7).

### 4.3 StatsSnapshot
- When `stats` is present: renders **`ProfileStats`** with the `UserStats` from `useHomeData`,
  passing `onFriendsPress → navigate('Friends')`.
- When loading/error (`stats === null`): renders three `StatTile`s directly with `—` (ProfileStats
  requires a non-null `UserStats`, so the wrapper owns the fallback rather than calling it).

### 4.4 ActiveTasksPeek ("Jump back in")
- Data: `selectHomeActiveTasks(state, currentUserId, 3)`.
- Row: group-color dot, task name (`numberOfLines={1}`), group name, `value / goal` pill.
- `onPress → navigate('TaskDetail', { groupId, taskId })`.
- Empty: inline hint `home.empty.noActiveTasks` (with a subtle "tap + to add" line).

### 4.5 GroupHighlights ("Your groups")
- Data: `selectHomeGroupHighlights(state, currentUserId, 6)`.
- Horizontal `ScrollView` of cards. Card: name (`numberOfLines={1}`), type pill
  (Competitive/Cooperative), `task • member` counts. **Bingo** groups additionally show a 3×N mini
  board (done cells filled) with a `doneCount/totalCount` badge, and a `home.groups.bingoWin` "🎉
  Bingo!" badge when `hasBingo`.
- `onPress → navigate('GroupTasks', { groupId })`.
- Empty: inline hint `home.empty.noGroups`.

### 4.6 FriendsActivityFeed ("Friends' activity")
- Data: `useHomeData().feed` (already newest-first), rendered with the existing **`ActivityItem`**.
- **No infinite scroll** (service returns the full list; we slice to `HOME_FEED_LIMIT = 20`).
- Row navigation (defensive against feed items pointing at since-removed entities):
  - if `taskId` and `state.entities.tasks[taskId]` exists and its group is known →
    `navigate('TaskDetail', { groupId, taskId })`;
  - else if `groupId` and `state.entities.taskGroups[groupId]` exists → `navigate('GroupTasks', { groupId })`;
  - else the row is non-interactive (no `onPress`).
- Empty: `EmptyState` `home.empty.noActivity`. Error: non-blocking inline retry row; the rest of
  the page still works.

### 4.7 HomeOnboarding (new-user state)
- **Shown only after** `useHomeData` finishes loading **without error**, when **all** of:
  `selectTaskGroupsByMember(state, uid).length === 0` **and** `stats.friendsCount === 0` **and**
  `feed.length === 0`.
- Single warm card (`EmptyState`-style): title `home.onboarding.title`, message
  `home.onboarding.message`, two CTAs: `AppButton` → `navigate('CreateGroup')`,
  `OutlineButton` → `navigate('Friends', { initialTab: 'addFriend' })`.
- If `useHomeData` errored, do **not** show onboarding — render the normal dashboard with the
  feed error row (so we never tell a real user "you're new" on a transient failure).

## 5. Data flow

### Sync (reducer = source of truth) — via `useAppState()` + `useCurrentUserId()`
- `selectHomeActiveTasks(state, uid, limit)` — active tasks peek.
- `selectHomeGroupHighlights(state, uid, limit)` — group highlights.

### Async (services) — via a new `useHomeData(userId)` hook
Aggregates the three service reads into one loading/refresh surface (so pull-to-refresh is one
call). **No new service methods** — reuses existing ones (parity already exists):
```ts
useHomeData(userId): {
  profile: { username: string } | null;       // profileService.getProfile
  stats: UserStats | null;                     // profileService.getUserStats
  feed: FeedItem[];                            // socialService.getUserFeed (sliced to 20)
  pendingInvitations: number;                  // socialService.getPendingInvitations(...).length
  loading: boolean;                            // true until first resolve of all four
  error: boolean;                              // any of the reads failed
  refreshing: boolean;
  refresh: () => Promise<void>;                // re-runs all reads
}
```
- Notifications come from the existing `useNotifications()` (its own context).
- **Pull-to-refresh** calls `useHomeData().refresh()` **and** `useNotifications().refresh()`.
- All reads use the `Result<T>` pattern; on `!ok`, set `error` for that surface — never throw,
  never swallow silently.

## 6. Pure logic to TDD (node-safe — no `expo-*` / `react-native` imports)

These hold the real logic and are unit-tested. They import only types.

### 6.1 `screens/home/logic/greeting.ts`
```ts
type GreetingKey = 'morning' | 'afternoon' | 'evening' | 'night';
getGreetingKey(hour: number): GreetingKey
// morning 5–11, afternoon 12–17, evening 18–22, night 23–4 (wraps). hour is 0–23.
```
Tests: each boundary (4→night, 5→morning, 11→morning, 12→afternoon, 17, 18→evening, 22, 23→night, 0).

### 6.2 `components/tasks/bingoDetection.ts` (extracted from `BingoGrid.tsx`)
```ts
buildBingoLines(size: number): number[][]   // rows + cols + 2 diagonals
hasBingoLine(done: boolean[], size: number): boolean
```
`BingoGrid.tsx` is refactored to import these (behavior unchanged). Tests: line counts for size
3/4/5 (`2*size + 2`), a full row/col/diagonal ⇒ true, scattered done ⇒ false, empty ⇒ false.

### 6.3 `application/selectors.ts` — `selectHomeActiveTasks(state, userId, limit)`
Returns `HomeActiveTask[]`:
```ts
interface HomeActiveTask {
  taskId: string; groupId: string; groupName: string;
  name: string; value: number; goal: number; color: string;
}
```
Algorithm:
1. One pass over `state.entities.progressEntries` → `Map<taskId, latestCreatedAt>` (`''` sentinel).
2. For each group from `selectTaskGroupsByMember(state, userId)`, each task from `selectTasksByGroup`:
   read `value = taskProgresses[task.progressId]?.value ?? 0` and `color = task.params?.color ?? colors.primary`.
3. Keep tasks where `goal > 0` **and** `value < goal` (not done; goal-0 guard).
4. Sort by `latestCreatedAt` desc (sentinel last), tie-break `name` asc (deterministic).
5. `slice(0, limit)`.
Tests: excludes done (`value>=goal`); excludes `goal<=0`; includes owner-only groups; recency
sort with + without entries; tie-break; limit; empty state.

### 6.4 `application/selectors.ts` — `selectHomeGroupHighlights(state, userId, limit)`
Returns `HomeGroupHighlight[]`:
```ts
interface HomeGroupHighlight {
  groupId: string; name: string; type: TaskGroupType;
  taskCount: number; memberCount: number;            // memberIds.length + 1
  bingo?: { size: number; doneCount: number; totalCount: number; hasBingo: boolean };
}
```
Algorithm: from `selectTaskGroupsByMember`; `bingo` populated **only** when `group.isBingo` **and**
`sqrt(taskIds.length)` is an integer in `{3,4,5}` (defensive against mid-construction groups);
`doneCount` = tasks with `value >= goal && goal > 0`; `hasBingo` via `hasBingoLine`. Sort by the
group's most-recent task progress (reuse the recency map), tie-break `name` asc; `slice(0, limit)`.
Tests: member+owner inclusion; bingo done/total/hasBingo; non-perfect-square ⇒ no `bingo`;
memberCount; sort; limit.

## 7. Supporting changes (confirmed INCLUDED at review 2026-06-16; bounded)

1. **Extract bingo detection** (`bingoDetection.ts`) — required for §6.2; `BingoGrid` refactored to
   use it. Verify `BingoGrid` tests/behavior unchanged.
2. **Friends `initialTab` param** — extend `TabParamList`:
   `Friends: { initialTab?: 'myFriends' | 'addFriend' | 'invitations' } | undefined`; `FriendsScreen`
   reads `route.params?.initialTab` to set the initial `activeTab` (defaults to current). Lets the
   friend-requests nudge and onboarding CTA land on the right sub-tab. *Fallback if deferred:* nudge
   uses plain `navigate('Friends')`.
3. **Shared dev-seed** — move the demo seeding `useEffect` out of `TasksScreen` into a single
   bootstrap (e.g. `AppStateContext`), guarded by `!USE_HTTP_SERVICES` + empty state, so Home shows
   groups in mock mode standalone. Idempotent; `TasksScreen` must stay green. *Fallback if deferred:*
   accept that mock-mode group highlights populate only after Tasks is opened once.

## 8. i18n — new top-level `home` namespace (en.ts + pl.ts, structurally identical)

```
home.greeting.{morning,afternoon,evening,night}   // "Good morning" / "Dzień dobry" ...
home.greeting.withName                              // "{{greeting}}, {{name}}"
home.sections.{activeTasks,groups,activity}         // section titles
home.nudges.{notifications,friendRequests}          // with {{count}}
home.groups.{bingoBadge,bingoWin,competitive,cooperative,taskCount,memberCount}
home.empty.{noActiveTasks,noGroups,noActivity}
home.onboarding.{title,message,ctaCreateGroup,ctaAddFriends}
home.feed.{errorTitle,retry}
```
All strings authored in EN + PL. Parity is compile-enforced by the `Translation` type.

## 9. File plan

```
src/frontend/screens/home/
  HomeScreen.tsx                 // orchestrator (moved from screens/tasks/)
  useHomeData.ts                 // async aggregate hook (§5)
  logic/greeting.ts              // pure (§6.1)
  components/
    GreetingHero.tsx
    HomeNudges.tsx
    StatsSnapshot.tsx            // thin wrapper over ProfileStats + loading/error
    ActiveTasksPeek.tsx
    GroupHighlights.tsx          // + BingoMiniGrid subcomponent
    FriendsActivityFeed.tsx
    HomeOnboarding.tsx
src/frontend/components/tasks/
  bingoDetection.ts              // extracted pure (§6.2)
src/frontend/application/
  selectors.ts                   // + selectHomeActiveTasks, selectHomeGroupHighlights
src/frontend/i18n/locales/
  en.ts, pl.ts                   // + home namespace
src/frontend/navigation/
  MainTabs.tsx                   // import path → screens/home/HomeScreen
  types.ts                       // Friends initialTab param + Main NavigatorScreenParams (§7.2)

# Tests are NOT colocated — they live under tests/frontend/unit/ (vitest include):
tests/frontend/unit/home/greeting.test.ts
tests/frontend/unit/home/home-active-tasks.test.ts
tests/frontend/unit/home/home-group-highlights.test.ts
tests/frontend/unit/tasks/bingo-detection.test.ts
```

## 10. Testing & quality gate

- After each step: `npx tsc --noEmit` (0 errors) + `npm test` (green). Baseline 152 tests; new
  tests for greeting, bingo detection, and the two home selectors add to it.
- TS strict; **no `any`**; `Result<T>` for all service interactions.
- Tested files contain **no native imports** (logic lives in the pure modules above; `.tsx`/hooks
  are not unit-tested per the env rule).
- Mock vs HTTP: no service-signature changes; Home reads through existing methods (parity holds).

## 11. Open assumptions to confirm during implementation

- Exact greeting hour ranges (above) are a proposal — easy to tweak.
- `HOME_FEED_LIMIT = 20`, active-tasks limit `3`, group-highlights limit `6` — tunable constants.
- Supporting changes §7 (2) and (3) are **confirmed included** (user review, 2026-06-16).

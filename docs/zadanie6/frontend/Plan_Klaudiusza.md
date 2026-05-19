# EggJob Frontend: State Layer + Mocked API Services

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Issues #12 (reducer logic for all 32 use cases) and #14 (mock API service layer) on a new branch from `origin/frontend/main`.

**Architecture:** The reducer is split into 6 domain handler files that `reducer.ts` dispatches to via a switch. The mock services are async wrappers with TypeScript interfaces and seeded in-memory data, living in `src/frontend/services/`.

**Tech Stack:** TypeScript strict, Vitest, React Native/Expo (no new dependencies needed)

---

## Friend's Branch Note (frontend/navigation)

The friend's branch adds: `MainTabs.tsx`, `navigation/types.ts`, 7 UI components, screen stubs, and backend test files. It **does NOT touch** `src/frontend/application/` — so no conflicts there. Likely conflicts when merging:
- `package.json` / `package-lock.json` — friend added `@react-navigation/*` packages
- `tsconfig.json` — friend may have adjusted settings
- `src/frontend/navigation/AppNavigator.tsx` — we have a stub, friend has `MainTabs.tsx` but no `AppNavigator.tsx`; resolution: update `AppNavigator.tsx` to import and use `MainTabs` from the friend's branch

---

## File Map

**Modified:**
- `src/frontend/application/reducer.ts` — becomes dispatcher switch
- `src/frontend/application/state.ts` — add `progressId: string` to `Task`, add `fromUserId?/toUserId?/groupId?` to `Invitation`

**Created:**
- `src/frontend/application/handlers/auth.ts`
- `src/frontend/application/handlers/profile.ts`
- `src/frontend/application/handlers/social.ts`
- `src/frontend/application/handlers/task-groups.ts`
- `src/frontend/application/handlers/task-group-access.ts`
- `src/frontend/application/handlers/tasks.ts`
- `src/frontend/application/handlers/notifications.ts`
- `src/frontend/services/types/IAuthService.ts`
- `src/frontend/services/types/IProfileService.ts`
- `src/frontend/services/types/ISocialService.ts`
- `src/frontend/services/types/ITaskGroupService.ts`
- `src/frontend/services/types/ITaskService.ts`
- `src/frontend/services/types/INotificationService.ts`
- `src/frontend/services/types/index.ts`
- `src/frontend/services/mock/MockAuthService.ts`
- `src/frontend/services/mock/MockProfileService.ts`
- `src/frontend/services/mock/MockSocialService.ts`
- `src/frontend/services/mock/MockTaskGroupService.ts`
- `src/frontend/services/mock/MockTaskService.ts`
- `src/frontend/services/mock/MockNotificationService.ts`
- `src/frontend/services/index.ts`

**Tests (already exist, RED → GREEN):**
- `tests/frontend/unit/auth/register-login.test.ts`
- `tests/frontend/unit/profile/profile-account.test.ts`
- `tests/frontend/unit/social/friendships.test.ts`
- `tests/frontend/unit/task-groups/task-groups.test.ts`
- `tests/frontend/unit/task-groups/group-access-invitations.test.ts`
- `tests/frontend/unit/tasks/task-progress.test.ts`
- `tests/frontend/unit/tasks/task-lifecycle-comments.test.ts`
- `tests/frontend/unit/domain-mapped/domain-methods.test.ts`

---

## Task 0: Create branch

- [ ] Create and check out new branch from `origin/frontend/main`

```bash
git fetch origin
git checkout -b frontend/state-and-services origin/frontend/main
```

- [ ] Run baseline test suite to confirm starting RED state

```bash
npm run test:frontend
```

Expected: 38 tests fail with "not-implemented"

- [ ] Commit branch creation baseline (no code change needed — the branch itself is the artifact)

---

## Task 1: Update `state.ts` + wire dispatcher in `reducer.ts`

**Files:**
- Modify: `src/frontend/application/state.ts`
- Modify: `src/frontend/application/reducer.ts`

- [ ] **Step 1: Extend `state.ts` types**

In `src/frontend/application/state.ts`, widen `Invitation` and add `progressId` to `Task`:

```typescript
type Invitation = {
  kind: string;
  fromUserId?: string;
  toUserId?: string;
  groupId?: string;
};

type Task = {
  name: string;
  goal: number;
  progressId: string;
  params: {
    photoRequired: boolean;
    color: string;
    notifications: boolean;
  };
};
```

- [ ] **Step 2: Replace `reducer.ts` with dispatcher (all handlers still return `not-implemented`)**

```typescript
import type { FrontendState } from "./state";

type Action = { type: string; [key: string]: unknown };
export type ReducerResult =
  | { ok: true; value: FrontendState }
  | { ok: false; error: { code: string; field?: string } };

const notImplemented = (): ReducerResult =>
  ({ ok: false, error: { code: "not-implemented" } });

export function reduceFrontendState(
  state: FrontendState,
  action: Action
): ReducerResult {
  switch (action.type) {
    case "auth/register":
    case "auth/login":
    case "auth/logout":
      return notImplemented();
    case "profile/edit":
    case "account/delete":
      return notImplemented();
    case "friends/invite":
    case "friends/accept-invite":
    case "friends/reject-invite":
    case "friends/remove":
      return notImplemented();
    case "task-groups/create":
    case "task-groups/edit":
    case "task-groups/delete":
    case "task-groups/add-member":
    case "task-groups/remove-member":
    case "task-groups/leave":
      return notImplemented();
    case "task-groups/invite-friend":
    case "task-groups/cancel-invitation":
    case "task-groups/accept-invitation":
    case "task-groups/request-join":
    case "task-groups/accept-request":
    case "task-groups/reject-request":
      return notImplemented();
    case "tasks/create":
    case "tasks/edit":
    case "tasks/delete":
    case "tasks/add-progress":
    case "tasks/add-comment":
    case "tasks/delete-comment":
      return notImplemented();
    case "notifications/add":
    case "notifications/read":
      return notImplemented();
    default:
      return { ok: false, error: { code: "unknown-action" } };
  }
}
```

- [ ] **Step 3: Run tests — still RED, but now type-checks cleanly**

```bash
npm run test:frontend
```

Expected: same 38 failures, no TypeScript errors

- [ ] **Step 4: Commit**

```bash
git add src/frontend/application/state.ts src/frontend/application/reducer.ts
git commit -m "feat: extend state types and wire reducer dispatcher (#12)"
```

---

## Task 2: Implement auth handlers

**Files:**
- Create: `src/frontend/application/handlers/auth.ts`
- Modify: `src/frontend/application/reducer.ts`

- [ ] **Step 1: Create `handlers/auth.ts`**

```typescript
import { isValidEmail, isValidUsername } from "../../utils/validation";
import type { FrontendState } from "../state";
import type { ReducerResult } from "../reducer";

type AuthAction = { type: string; [key: string]: unknown };

export function handleAuth(state: FrontendState, action: AuthAction): ReducerResult {
  if (action.type === "auth/register") {
    const email = action.email as string;
    const username = action.username as string;
    const accountId = action.accountId as string;
    const userId = action.userId as string;

    if (!isValidEmail(email)) {
      return { ok: false, error: { code: "validation", field: "email" } };
    }
    if (!isValidUsername(username)) {
      return { ok: false, error: { code: "validation", field: "username" } };
    }

    return {
      ok: true,
      value: {
        ...state,
        session: { currentAccountId: accountId, currentUserId: userId },
        entities: {
          ...state.entities,
          accounts: { ...state.entities.accounts, [accountId]: { email } },
          users: { ...state.entities.users, [userId]: { username } },
        },
      },
    };
  }

  if (action.type === "auth/login") {
    return {
      ok: true,
      value: {
        ...state,
        session: {
          currentAccountId: action.accountId as string,
          currentUserId: action.userId as string,
        },
      },
    };
  }

  if (action.type === "auth/logout") {
    return {
      ok: true,
      value: {
        ...state,
        session: { currentAccountId: null, currentUserId: null },
      },
    };
  }

  return { ok: false, error: { code: "unknown-action" } };
}
```

- [ ] **Step 2: Wire auth cases in `reducer.ts`**

Replace the three auth `notImplemented()` calls:
```typescript
import { handleAuth } from "./handlers/auth";
// ...
case "auth/register":
case "auth/login":
case "auth/logout":
  return handleAuth(state, action);
```

- [ ] **Step 3: Run auth tests**

```bash
npm run test:frontend -- --reporter=verbose 2>&1 | grep -A2 "Auth reducer"
```

Expected: `Auth reducer (UC-01, UC-02)` — 3 tests PASS

- [ ] **Step 4: Commit**

```bash
git add src/frontend/application/handlers/auth.ts src/frontend/application/reducer.ts
git commit -m "feat: implement auth/register, auth/login, auth/logout (#12)"
```

---

## Task 3: Implement profile/account handlers

**Files:**
- Create: `src/frontend/application/handlers/profile.ts`
- Modify: `src/frontend/application/reducer.ts`

- [ ] **Step 1: Create `handlers/profile.ts`**

```typescript
import { isValidUsername } from "../../utils/validation";
import type { FrontendState } from "../state";
import type { ReducerResult } from "../reducer";

type ProfileAction = { type: string; [key: string]: unknown };

export function handleProfile(state: FrontendState, action: ProfileAction): ReducerResult {
  if (action.type === "profile/edit") {
    const userId = action.userId as string;
    const username = action.username as string | undefined;
    const photoUrl = action.photoUrl as string | undefined;

    if (username !== undefined && !isValidUsername(username)) {
      return { ok: false, error: { code: "validation", field: "username" } };
    }

    const existing = state.entities.users[userId];
    if (!existing) return { ok: false, error: { code: "not-found" } };

    return {
      ok: true,
      value: {
        ...state,
        entities: {
          ...state.entities,
          users: {
            ...state.entities.users,
            [userId]: {
              ...existing,
              ...(username !== undefined ? { username } : {}),
              ...(photoUrl !== undefined ? { photoUrl } : {}),
            },
          },
        },
      },
    };
  }

  if (action.type === "account/delete") {
    const accountId = action.accountId as string;
    const userId = action.userId as string;

    const { [accountId]: _acc, ...remainingAccounts } = state.entities.accounts;
    const { [userId]: _usr, ...remainingUsers } = state.entities.users;

    return {
      ok: true,
      value: {
        ...state,
        session: { currentAccountId: null, currentUserId: null },
        entities: {
          ...state.entities,
          accounts: remainingAccounts,
          users: remainingUsers,
        },
      },
    };
  }

  return { ok: false, error: { code: "unknown-action" } };
}
```

- [ ] **Step 2: Wire profile cases in `reducer.ts`**

```typescript
import { handleProfile } from "./handlers/profile";
// ...
case "profile/edit":
case "account/delete":
  return handleProfile(state, action);
```

- [ ] **Step 3: Run profile tests**

```bash
npm run test:frontend -- --reporter=verbose 2>&1 | grep -A2 "Profile and account"
```

Expected: `Profile and account reducer (UC-03, UC-04)` — 3 tests PASS

- [ ] **Step 4: Commit**

```bash
git add src/frontend/application/handlers/profile.ts src/frontend/application/reducer.ts
git commit -m "feat: implement profile/edit, account/delete (#12)"
```

---

## Task 4: Implement social/friends handlers

**Files:**
- Create: `src/frontend/application/handlers/social.ts`
- Modify: `src/frontend/application/reducer.ts`

- [ ] **Step 1: Create `handlers/social.ts`**

```typescript
import type { FrontendState } from "../state";
import type { ReducerResult } from "../reducer";

type SocialAction = { type: string; [key: string]: unknown };

export function handleSocial(state: FrontendState, action: SocialAction): ReducerResult {
  if (action.type === "friends/invite") {
    const invitationId = action.invitationId as string;
    const fromUserId = action.fromUserId as string;
    const toUserId = action.toUserId as string;

    return {
      ok: true,
      value: {
        ...state,
        entities: {
          ...state.entities,
          invitations: {
            ...state.entities.invitations,
            [invitationId]: { kind: "friend", fromUserId, toUserId },
          },
        },
      },
    };
  }

  if (action.type === "friends/accept-invite") {
    const invitationId = action.invitationId as string;
    const friendshipId = action.friendshipId as string;

    const invitation = state.entities.invitations[invitationId];
    const { [invitationId]: _inv, ...remainingInvitations } = state.entities.invitations;

    return {
      ok: true,
      value: {
        ...state,
        entities: {
          ...state.entities,
          invitations: remainingInvitations,
          friendships: {
            ...state.entities.friendships,
            [friendshipId]: {
              userId: invitation?.fromUserId ?? "",
              friendUserId: invitation?.toUserId ?? "",
            },
          },
        },
      },
    };
  }

  if (action.type === "friends/reject-invite") {
    const invitationId = action.invitationId as string;
    const { [invitationId]: _inv, ...remainingInvitations } = state.entities.invitations;

    return {
      ok: true,
      value: {
        ...state,
        entities: { ...state.entities, invitations: remainingInvitations },
      },
    };
  }

  if (action.type === "friends/remove") {
    const friendshipId = action.friendshipId as string;
    const { [friendshipId]: _fr, ...remainingFriendships } = state.entities.friendships;

    return {
      ok: true,
      value: {
        ...state,
        entities: { ...state.entities, friendships: remainingFriendships },
      },
    };
  }

  return { ok: false, error: { code: "unknown-action" } };
}
```

- [ ] **Step 2: Wire social cases in `reducer.ts`**

```typescript
import { handleSocial } from "./handlers/social";
// ...
case "friends/invite":
case "friends/accept-invite":
case "friends/reject-invite":
case "friends/remove":
  return handleSocial(state, action);
```

- [ ] **Step 3: Run social tests**

```bash
npm run test:frontend -- --reporter=verbose 2>&1 | grep -A2 "Friend invitations"
```

Expected: `Friend invitations and friendships (UC-05..UC-11)` — 5 tests PASS

- [ ] **Step 4: Commit**

```bash
git add src/frontend/application/handlers/social.ts src/frontend/application/reducer.ts
git commit -m "feat: implement friends invite/accept/reject/remove (#12)"
```

---

## Task 5: Implement task-groups CRUD handlers

**Files:**
- Create: `src/frontend/application/handlers/task-groups.ts`
- Modify: `src/frontend/application/reducer.ts`

- [ ] **Step 1: Create `handlers/task-groups.ts`**

```typescript
import type { FrontendState } from "../state";
import type { ReducerResult } from "../reducer";

type TaskGroupAction = { type: string; [key: string]: unknown };

export function handleTaskGroups(state: FrontendState, action: TaskGroupAction): ReducerResult {
  if (action.type === "task-groups/create") {
    const { groupId, ownerUserId, name, privacy, inviteCode, } = action as {
      type: string; groupId: string; ownerUserId: string;
      name: string; privacy: string; inviteCode?: string;
    };

    if (!name || name.trim().length === 0) {
      return { ok: false, error: { code: "validation", field: "name" } };
    }

    return {
      ok: true,
      value: {
        ...state,
        entities: {
          ...state.entities,
          taskGroups: {
            ...state.entities.taskGroups,
            [groupId]: {
              name: name.trim(),
              ownerUserId,
              privacy,
              inviteCode: inviteCode ?? "",
              taskIds: [],
              memberIds: [],
            },
          },
        },
      },
    };
  }

  if (action.type === "task-groups/edit") {
    const groupId = action.groupId as string;
    const name = action.name as string | undefined;
    const privacy = action.privacy as string | undefined;

    if (name !== undefined && name.trim().length === 0) {
      return { ok: false, error: { code: "validation", field: "name" } };
    }

    const existing = state.entities.taskGroups[groupId];
    if (!existing) return { ok: false, error: { code: "not-found" } };

    return {
      ok: true,
      value: {
        ...state,
        entities: {
          ...state.entities,
          taskGroups: {
            ...state.entities.taskGroups,
            [groupId]: {
              ...existing,
              ...(name !== undefined ? { name: name.trim() } : {}),
              ...(privacy !== undefined ? { privacy } : {}),
            },
          },
        },
      },
    };
  }

  if (action.type === "task-groups/delete") {
    const groupId = action.groupId as string;
    const { [groupId]: _g, ...remaining } = state.entities.taskGroups;

    return {
      ok: true,
      value: {
        ...state,
        entities: { ...state.entities, taskGroups: remaining },
      },
    };
  }

  if (action.type === "task-groups/add-member") {
    const groupId = action.groupId as string;
    const userId = action.userId as string;
    const group = state.entities.taskGroups[groupId];
    if (!group) return { ok: false, error: { code: "not-found" } };

    if (group.memberIds.includes(userId)) {
      return { ok: true, value: state };
    }

    return {
      ok: true,
      value: {
        ...state,
        entities: {
          ...state.entities,
          taskGroups: {
            ...state.entities.taskGroups,
            [groupId]: { ...group, memberIds: [...group.memberIds, userId] },
          },
        },
      },
    };
  }

  if (action.type === "task-groups/remove-member" || action.type === "task-groups/leave") {
    const groupId = action.groupId as string;
    const userId = action.userId as string;
    const group = state.entities.taskGroups[groupId];
    if (!group) return { ok: false, error: { code: "not-found" } };

    return {
      ok: true,
      value: {
        ...state,
        entities: {
          ...state.entities,
          taskGroups: {
            ...state.entities.taskGroups,
            [groupId]: {
              ...group,
              memberIds: group.memberIds.filter((id) => id !== userId),
            },
          },
        },
      },
    };
  }

  return { ok: false, error: { code: "unknown-action" } };
}
```

- [ ] **Step 2: Wire task-group CRUD cases in `reducer.ts`**

```typescript
import { handleTaskGroups } from "./handlers/task-groups";
// ...
case "task-groups/create":
case "task-groups/edit":
case "task-groups/delete":
case "task-groups/add-member":
case "task-groups/remove-member":
case "task-groups/leave":
  return handleTaskGroups(state, action);
```

- [ ] **Step 3: Run task-groups tests**

```bash
npm run test:frontend -- --reporter=verbose 2>&1 | grep -A2 "Task groups reducer"
```

Expected: `Task groups reducer (UC-12, UC-14, UC-15)` — 4 tests PASS

- [ ] **Step 4: Commit**

```bash
git add src/frontend/application/handlers/task-groups.ts src/frontend/application/reducer.ts
git commit -m "feat: implement task-groups CRUD and member management (#12)"
```

---

## Task 6: Implement task-group-access handlers

**Files:**
- Create: `src/frontend/application/handlers/task-group-access.ts`
- Modify: `src/frontend/application/reducer.ts`

- [ ] **Step 1: Create `handlers/task-group-access.ts`**

```typescript
import type { FrontendState } from "../state";
import type { ReducerResult } from "../reducer";

type AccessAction = { type: string; [key: string]: unknown };

export function handleTaskGroupAccess(state: FrontendState, action: AccessAction): ReducerResult {
  if (action.type === "task-groups/invite-friend") {
    const { invitationId, groupId, fromUserId, toUserId } = action as {
      type: string; invitationId: string; groupId: string;
      fromUserId: string; toUserId: string; permissions: string;
    };

    return {
      ok: true,
      value: {
        ...state,
        entities: {
          ...state.entities,
          invitations: {
            ...state.entities.invitations,
            [invitationId]: { kind: "task-group", fromUserId, toUserId, groupId },
          },
        },
      },
    };
  }

  if (action.type === "task-groups/cancel-invitation") {
    const invitationId = action.invitationId as string;
    const { [invitationId]: _inv, ...remaining } = state.entities.invitations;

    return {
      ok: true,
      value: {
        ...state,
        entities: { ...state.entities, invitations: remaining },
      },
    };
  }

  if (action.type === "task-groups/accept-invitation") {
    const invitationId = action.invitationId as string;
    const groupId = action.groupId as string;
    const userId = action.userId as string;

    const { [invitationId]: _inv, ...remainingInvitations } = state.entities.invitations;
    const group = state.entities.taskGroups[groupId];
    if (!group) return { ok: false, error: { code: "not-found" } };

    const memberIds = group.memberIds.includes(userId)
      ? group.memberIds
      : [...group.memberIds, userId];

    return {
      ok: true,
      value: {
        ...state,
        entities: {
          ...state.entities,
          invitations: remainingInvitations,
          taskGroups: {
            ...state.entities.taskGroups,
            [groupId]: { ...group, memberIds },
          },
        },
      },
    };
  }

  if (action.type === "task-groups/request-join") {
    const { invitationId, groupId, inviteCode, fromUserId, toUserId } = action as {
      type: string; invitationId: string; groupId: string; inviteCode: string;
      fromUserId: string; toUserId: string; permissions: string;
    };

    const group = state.entities.taskGroups[groupId];
    if (!group) return { ok: false, error: { code: "not-found" } };

    if (group.inviteCode && inviteCode !== group.inviteCode) {
      return { ok: false, error: { code: "validation", field: "inviteCode" } };
    }

    return {
      ok: true,
      value: {
        ...state,
        entities: {
          ...state.entities,
          invitations: {
            ...state.entities.invitations,
            [invitationId]: { kind: "task-group-request", fromUserId, toUserId, groupId },
          },
        },
      },
    };
  }

  if (action.type === "task-groups/accept-request") {
    const invitationId = action.invitationId as string;
    const groupId = action.groupId as string;
    const userId = action.userId as string;

    const { [invitationId]: _inv, ...remainingInvitations } = state.entities.invitations;
    const group = state.entities.taskGroups[groupId];
    if (!group) return { ok: false, error: { code: "not-found" } };

    const memberIds = group.memberIds.includes(userId)
      ? group.memberIds
      : [...group.memberIds, userId];

    return {
      ok: true,
      value: {
        ...state,
        entities: {
          ...state.entities,
          invitations: remainingInvitations,
          taskGroups: {
            ...state.entities.taskGroups,
            [groupId]: { ...group, memberIds },
          },
        },
      },
    };
  }

  if (action.type === "task-groups/reject-request") {
    const invitationId = action.invitationId as string;
    const { [invitationId]: _inv, ...remaining } = state.entities.invitations;

    return {
      ok: true,
      value: {
        ...state,
        entities: { ...state.entities, invitations: remaining },
      },
    };
  }

  return { ok: false, error: { code: "unknown-action" } };
}
```

- [ ] **Step 2: Wire access cases in `reducer.ts`**

```typescript
import { handleTaskGroupAccess } from "./handlers/task-group-access";
// ...
case "task-groups/invite-friend":
case "task-groups/cancel-invitation":
case "task-groups/accept-invitation":
case "task-groups/request-join":
case "task-groups/accept-request":
case "task-groups/reject-request":
  return handleTaskGroupAccess(state, action);
```

- [ ] **Step 3: Run access tests**

```bash
npm run test:frontend -- --reporter=verbose 2>&1 | grep -A2 "Task-group access"
```

Expected: `Task-group access and invitations (UC-16..UC-27)` — 7 tests PASS

- [ ] **Step 4: Commit**

```bash
git add src/frontend/application/handlers/task-group-access.ts src/frontend/application/reducer.ts
git commit -m "feat: implement task-group invitation and request flows (#12)"
```

---

## Task 7: Implement task handlers

**Files:**
- Create: `src/frontend/application/handlers/tasks.ts`
- Modify: `src/frontend/application/reducer.ts`

- [ ] **Step 1: Create `handlers/tasks.ts`**

```typescript
import type { FrontendState } from "../state";
import type { ReducerResult } from "../reducer";

type TaskAction = { type: string; [key: string]: unknown };

export function handleTasks(state: FrontendState, action: TaskAction): ReducerResult {
  if (action.type === "tasks/create") {
    const { taskId, groupId, progressId, name, goal, params } = action as {
      type: string; taskId: string; groupId: string; progressId: string;
      name: string; goal: number; status: string; kind: string;
      params: { photoRequired: boolean; color: string; notifications: boolean };
    };

    const group = state.entities.taskGroups[groupId];
    if (!group) return { ok: false, error: { code: "not-found" } };

    return {
      ok: true,
      value: {
        ...state,
        entities: {
          ...state.entities,
          tasks: {
            ...state.entities.tasks,
            [taskId]: { name, goal, progressId, params },
          },
          taskProgresses: {
            ...state.entities.taskProgresses,
            [progressId]: { value: 0 },
          },
          taskGroups: {
            ...state.entities.taskGroups,
            [groupId]: { ...group, taskIds: [...group.taskIds, taskId] },
          },
        },
      },
    };
  }

  if (action.type === "tasks/edit") {
    const taskId = action.taskId as string;
    const name = action.name as string | undefined;
    const goal = action.goal as number | undefined;
    const params = action.params as Partial<{ photoRequired: boolean; color: string; notifications: boolean }> | undefined;

    const existing = state.entities.tasks[taskId];
    if (!existing) return { ok: false, error: { code: "not-found" } };

    return {
      ok: true,
      value: {
        ...state,
        entities: {
          ...state.entities,
          tasks: {
            ...state.entities.tasks,
            [taskId]: {
              ...existing,
              ...(name !== undefined ? { name } : {}),
              ...(goal !== undefined ? { goal } : {}),
              params: params ? { ...existing.params, ...params } : existing.params,
            },
          },
        },
      },
    };
  }

  if (action.type === "tasks/delete") {
    const taskId = action.taskId as string;
    const { [taskId]: _task, ...remainingTasks } = state.entities.tasks;

    const updatedGroups = Object.fromEntries(
      Object.entries(state.entities.taskGroups).map(([gId, group]) => [
        gId,
        { ...group, taskIds: group.taskIds.filter((id) => id !== taskId) },
      ])
    );

    return {
      ok: true,
      value: {
        ...state,
        entities: {
          ...state.entities,
          tasks: remainingTasks,
          taskGroups: updatedGroups,
        },
      },
    };
  }

  if (action.type === "tasks/add-progress") {
    const { entryId, taskId, value } = action as {
      type: string; entryId: string; taskId: string;
      authorUserId: string; value: number; note: string;
    };

    if (value < 0) {
      return { ok: false, error: { code: "validation", field: "value" } };
    }

    const task = state.entities.tasks[taskId];
    if (!task) return { ok: false, error: { code: "not-found" } };

    const progressId = task.progressId;
    const currentProgress = state.entities.taskProgresses[progressId];

    return {
      ok: true,
      value: {
        ...state,
        entities: {
          ...state.entities,
          progressEntries: {
            ...state.entities.progressEntries,
            [entryId]: { value, commentIds: [] },
          },
          taskProgresses: {
            ...state.entities.taskProgresses,
            [progressId]: { value: (currentProgress?.value ?? 0) + value },
          },
        },
      },
    };
  }

  if (action.type === "tasks/add-comment") {
    const commentId = action.commentId as string;
    const progressEntryId = action.progressEntryId as string;
    const message = action.message as string;

    const entry = state.entities.progressEntries[progressEntryId];
    if (!entry) return { ok: false, error: { code: "not-found" } };

    return {
      ok: true,
      value: {
        ...state,
        entities: {
          ...state.entities,
          comments: {
            ...state.entities.comments,
            [commentId]: { message },
          },
          progressEntries: {
            ...state.entities.progressEntries,
            [progressEntryId]: {
              ...entry,
              commentIds: [...entry.commentIds, commentId],
            },
          },
        },
      },
    };
  }

  if (action.type === "tasks/delete-comment") {
    const commentId = action.commentId as string;
    const progressEntryId = action.progressEntryId as string;

    const { [commentId]: _c, ...remainingComments } = state.entities.comments;
    const entry = state.entities.progressEntries[progressEntryId];

    return {
      ok: true,
      value: {
        ...state,
        entities: {
          ...state.entities,
          comments: remainingComments,
          progressEntries: entry
            ? {
                ...state.entities.progressEntries,
                [progressEntryId]: {
                  ...entry,
                  commentIds: entry.commentIds.filter((id) => id !== commentId),
                },
              }
            : state.entities.progressEntries,
        },
      },
    };
  }

  return { ok: false, error: { code: "unknown-action" } };
}
```

- [ ] **Step 2: Wire tasks cases in `reducer.ts`**

```typescript
import { handleTasks } from "./handlers/tasks";
// ...
case "tasks/create":
case "tasks/edit":
case "tasks/delete":
case "tasks/add-progress":
case "tasks/add-comment":
case "tasks/delete-comment":
  return handleTasks(state, action);
```

- [ ] **Step 3: Run task tests**

```bash
npm run test:frontend -- --reporter=verbose 2>&1 | grep -E "(Task and progress|Task lifecycle)"
```

Expected: `Task and progress reducer` and `Task lifecycle and comments` — all tests PASS

- [ ] **Step 4: Commit**

```bash
git add src/frontend/application/handlers/tasks.ts src/frontend/application/reducer.ts
git commit -m "feat: implement tasks create/edit/delete/progress/comments (#12)"
```

---

## Task 8: Implement notifications handlers + full test run

**Files:**
- Create: `src/frontend/application/handlers/notifications.ts`
- Modify: `src/frontend/application/reducer.ts`

- [ ] **Step 1: Create `handlers/notifications.ts`**

```typescript
import type { FrontendState } from "../state";
import type { ReducerResult } from "../reducer";

type NotificationAction = { type: string; [key: string]: unknown };

export function handleNotifications(state: FrontendState, action: NotificationAction): ReducerResult {
  if (action.type === "notifications/add") {
    const notificationId = action.notificationId as string;

    return {
      ok: true,
      value: {
        ...state,
        entities: {
          ...state.entities,
          notifications: {
            ...state.entities.notifications,
            [notificationId]: { active: true },
          },
        },
      },
    };
  }

  if (action.type === "notifications/read") {
    const notificationId = action.notificationId as string;
    const existing = state.entities.notifications[notificationId];
    if (!existing) return { ok: false, error: { code: "not-found" } };

    return {
      ok: true,
      value: {
        ...state,
        entities: {
          ...state.entities,
          notifications: {
            ...state.entities.notifications,
            [notificationId]: { ...existing, active: false },
          },
        },
      },
    };
  }

  return { ok: false, error: { code: "unknown-action" } };
}
```

- [ ] **Step 2: Wire notification cases in `reducer.ts`**

```typescript
import { handleNotifications } from "./handlers/notifications";
// ...
case "notifications/add":
case "notifications/read":
  return handleNotifications(state, action);
```

- [ ] **Step 3: Run ALL tests — target GREEN**

```bash
npm run test:frontend
```

Expected: **38 tests PASS, 0 failures**

- [ ] **Step 4: Commit**

```bash
git add src/frontend/application/handlers/notifications.ts src/frontend/application/reducer.ts
git commit -m "feat: implement notifications/add and notifications/read — Issue #12 complete"
```

---

## Task 9: Create mock API service interfaces (Issue #14)

**Files:**
- Create: `src/frontend/services/types/index.ts` (and 6 interface files)

- [ ] **Step 1: Create shared Result type and service interfaces**

Create `src/frontend/services/types/index.ts`:

```typescript
export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: { code: string; field?: string } };

export type { IAuthService } from "./IAuthService";
export type { IProfileService } from "./IProfileService";
export type { ISocialService } from "./ISocialService";
export type { ITaskGroupService } from "./ITaskGroupService";
export type { ITaskService, TaskParams } from "./ITaskService";
export type { INotificationService } from "./INotificationService";
```

- [ ] **Step 2: Create `IAuthService.ts`**

Create `src/frontend/services/types/IAuthService.ts`:

```typescript
import type { Result } from "./index";

export interface IAuthService {
  register(input: {
    email: string;
    username: string;
    password: string;
  }): Promise<Result<{ accountId: string; userId: string }>>;

  login(input: {
    email: string;
    password: string;
  }): Promise<Result<{ accountId: string; userId: string }>>;

  logout(): Promise<Result<void>>;
}
```

- [ ] **Step 3: Create `IProfileService.ts`**

Create `src/frontend/services/types/IProfileService.ts`:

```typescript
import type { Result } from "./index";

export interface IProfileService {
  editProfile(
    userId: string,
    input: { username?: string; photoUrl?: string }
  ): Promise<Result<void>>;

  deleteAccount(accountId: string, userId: string): Promise<Result<void>>;

  getProfile(userId: string): Promise<Result<{ username: string; photoUrl?: string }>>;
}
```

- [ ] **Step 4: Create `ISocialService.ts`**

Create `src/frontend/services/types/ISocialService.ts`:

```typescript
import type { Result } from "./index";

export interface ISocialService {
  inviteFriend(input: {
    invitationId: string;
    fromUserId: string;
    toUserId: string;
  }): Promise<Result<void>>;

  acceptFriendInvite(input: {
    invitationId: string;
    friendshipId: string;
  }): Promise<Result<void>>;

  rejectFriendInvite(invitationId: string): Promise<Result<void>>;

  removeFriend(friendshipId: string): Promise<Result<void>>;

  getFriends(userId: string): Promise<Result<Array<{
    friendshipId: string;
    friendUserId: string;
  }>>>;

  getPendingInvitations(userId: string): Promise<Result<Array<{
    invitationId: string;
    fromUserId: string;
  }>>>;
}
```

- [ ] **Step 5: Create `ITaskGroupService.ts`**

Create `src/frontend/services/types/ITaskGroupService.ts`:

```typescript
import type { Result } from "./index";

export interface ITaskGroupService {
  createGroup(input: {
    groupId: string;
    ownerUserId: string;
    name: string;
    privacy: string;
    inviteCode?: string;
  }): Promise<Result<void>>;

  editGroup(groupId: string, input: { name?: string; privacy?: string }): Promise<Result<void>>;

  deleteGroup(groupId: string): Promise<Result<void>>;

  inviteFriend(input: {
    invitationId: string;
    groupId: string;
    fromUserId: string;
    toUserId: string;
    permissions: string;
  }): Promise<Result<void>>;

  cancelInvitation(invitationId: string): Promise<Result<void>>;

  acceptInvitation(input: {
    invitationId: string;
    groupId: string;
    userId: string;
  }): Promise<Result<void>>;

  requestJoin(input: {
    invitationId: string;
    groupId: string;
    inviteCode: string;
    fromUserId: string;
    toUserId: string;
    permissions: string;
  }): Promise<Result<void>>;

  acceptRequest(input: {
    invitationId: string;
    groupId: string;
    userId: string;
    permissions: string;
  }): Promise<Result<void>>;

  rejectRequest(invitationId: string): Promise<Result<void>>;

  addMember(groupId: string, userId: string): Promise<Result<void>>;

  removeMember(groupId: string, userId: string): Promise<Result<void>>;

  leaveGroup(groupId: string, userId: string): Promise<Result<void>>;

  getGroup(groupId: string): Promise<Result<{
    name: string;
    privacy: string;
    inviteCode: string;
    memberIds: string[];
    taskIds: string[];
  }>>;
}
```

- [ ] **Step 6: Create `ITaskService.ts`**

Create `src/frontend/services/types/ITaskService.ts`:

```typescript
import type { Result } from "./index";

export type TaskParams = {
  photoRequired: boolean;
  color: string;
  notifications: boolean;
};

export interface ITaskService {
  createTask(input: {
    taskId: string;
    groupId: string;
    progressId: string;
    name: string;
    goal: number;
    status: string;
    kind: string;
    params: TaskParams;
  }): Promise<Result<void>>;

  editTask(
    taskId: string,
    input: { name?: string; goal?: number; status?: string; params?: Partial<TaskParams> }
  ): Promise<Result<void>>;

  deleteTask(taskId: string): Promise<Result<void>>;

  addProgress(input: {
    entryId: string;
    taskId: string;
    authorUserId: string;
    value: number;
    note: string;
  }): Promise<Result<void>>;

  addComment(input: {
    commentId: string;
    progressEntryId: string;
    authorUserId: string;
    message: string;
  }): Promise<Result<void>>;

  deleteComment(input: {
    commentId: string;
    progressEntryId: string;
  }): Promise<Result<void>>;

  getTask(taskId: string): Promise<Result<{
    name: string;
    goal: number;
    progressId: string;
    params: TaskParams;
  }>>;

  getProgressEntries(taskId: string): Promise<Result<Array<{
    entryId: string;
    value: number;
    commentIds: string[];
  }>>>;
}
```

- [ ] **Step 7: Create `INotificationService.ts`**

Create `src/frontend/services/types/INotificationService.ts`:

```typescript
import type { Result } from "./index";

export interface INotificationService {
  addNotification(input: {
    notificationId: string;
    userId: string;
    message: string;
  }): Promise<Result<void>>;

  markAsRead(notificationId: string): Promise<Result<void>>;

  getNotifications(userId: string): Promise<Result<Array<{
    notificationId: string;
    message: string;
    active: boolean;
  }>>>;
}
```

- [ ] **Step 8: Verify TypeScript compiles**

```bash
npx tsc --project tsconfig.json --noEmit
```

Expected: 0 errors

- [ ] **Step 9: Commit**

```bash
git add src/frontend/services/types/
git commit -m "feat: add mock API service interfaces (#14)"
```

---

## Task 10: Create mock service implementations

**Files:**
- Create: `src/frontend/services/mock/MockAuthService.ts` (and 5 others)
- Create: `src/frontend/services/index.ts`

- [ ] **Step 1: Create `MockAuthService.ts`**

Create `src/frontend/services/mock/MockAuthService.ts`:

```typescript
import { isValidEmail, isValidUsername } from "../../utils/validation";
import type { IAuthService } from "../types/IAuthService";
import type { Result } from "../types/index";

type SeedAccount = {
  accountId: string;
  userId: string;
  email: string;
  username: string;
  passwordHash: string;
};

class MockAuthService implements IAuthService {
  private accounts: SeedAccount[] = [
    {
      accountId: "acc-seed-1",
      userId: "usr-seed-1",
      email: "alice@example.com",
      username: "alice",
      passwordHash: "seed-hash-alice",
    },
  ];

  async register(input: {
    email: string;
    username: string;
    password: string;
  }): Promise<Result<{ accountId: string; userId: string }>> {
    if (!isValidEmail(input.email)) {
      return { ok: false, error: { code: "validation", field: "email" } };
    }
    if (!isValidUsername(input.username)) {
      return { ok: false, error: { code: "validation", field: "username" } };
    }

    const accountId = `acc-${Date.now()}`;
    const userId = `usr-${Date.now()}`;
    this.accounts.push({
      accountId,
      userId,
      email: input.email,
      username: input.username,
      passwordHash: `hash-${input.password}`,
    });

    return { ok: true, value: { accountId, userId } };
  }

  async login(input: {
    email: string;
    password: string;
  }): Promise<Result<{ accountId: string; userId: string }>> {
    const account = this.accounts.find((a) => a.email === input.email);
    if (!account) {
      return { ok: false, error: { code: "not-found" } };
    }
    return { ok: true, value: { accountId: account.accountId, userId: account.userId } };
  }

  async logout(): Promise<Result<void>> {
    return { ok: true, value: undefined };
  }
}

export const mockAuthService = new MockAuthService();
```

- [ ] **Step 2: Create `MockProfileService.ts`**

Create `src/frontend/services/mock/MockProfileService.ts`:

```typescript
import { isValidUsername } from "../../utils/validation";
import type { IProfileService } from "../types/IProfileService";
import type { Result } from "../types/index";

class MockProfileService implements IProfileService {
  private profiles: Record<string, { username: string; photoUrl?: string }> = {
    "usr-seed-1": { username: "alice", photoUrl: undefined },
  };

  async editProfile(
    userId: string,
    input: { username?: string; photoUrl?: string }
  ): Promise<Result<void>> {
    if (input.username !== undefined && !isValidUsername(input.username)) {
      return { ok: false, error: { code: "validation", field: "username" } };
    }
    const profile = this.profiles[userId] ?? { username: "unknown" };
    this.profiles[userId] = {
      ...profile,
      ...(input.username !== undefined ? { username: input.username } : {}),
      ...(input.photoUrl !== undefined ? { photoUrl: input.photoUrl } : {}),
    };
    return { ok: true, value: undefined };
  }

  async deleteAccount(accountId: string, userId: string): Promise<Result<void>> {
    delete this.profiles[userId];
    return { ok: true, value: undefined };
  }

  async getProfile(userId: string): Promise<Result<{ username: string; photoUrl?: string }>> {
    const profile = this.profiles[userId];
    if (!profile) return { ok: false, error: { code: "not-found" } };
    return { ok: true, value: profile };
  }
}

export const mockProfileService = new MockProfileService();
```

- [ ] **Step 3: Create `MockSocialService.ts`**

Create `src/frontend/services/mock/MockSocialService.ts`:

```typescript
import type { ISocialService } from "../types/ISocialService";
import type { Result } from "../types/index";

class MockSocialService implements ISocialService {
  private invitations: Record<string, { fromUserId: string; toUserId: string }> = {};
  private friendships: Record<string, { userId: string; friendUserId: string }> = {
    "fr-seed-1": { userId: "usr-seed-1", friendUserId: "usr-seed-2" },
  };

  async inviteFriend(input: {
    invitationId: string; fromUserId: string; toUserId: string;
  }): Promise<Result<void>> {
    this.invitations[input.invitationId] = {
      fromUserId: input.fromUserId,
      toUserId: input.toUserId,
    };
    return { ok: true, value: undefined };
  }

  async acceptFriendInvite(input: {
    invitationId: string; friendshipId: string;
  }): Promise<Result<void>> {
    const inv = this.invitations[input.invitationId];
    if (!inv) return { ok: false, error: { code: "not-found" } };
    delete this.invitations[input.invitationId];
    this.friendships[input.friendshipId] = {
      userId: inv.fromUserId,
      friendUserId: inv.toUserId,
    };
    return { ok: true, value: undefined };
  }

  async rejectFriendInvite(invitationId: string): Promise<Result<void>> {
    delete this.invitations[invitationId];
    return { ok: true, value: undefined };
  }

  async removeFriend(friendshipId: string): Promise<Result<void>> {
    delete this.friendships[friendshipId];
    return { ok: true, value: undefined };
  }

  async getFriends(userId: string): Promise<Result<Array<{ friendshipId: string; friendUserId: string }>>> {
    const result = Object.entries(this.friendships)
      .filter(([, f]) => f.userId === userId || f.friendUserId === userId)
      .map(([friendshipId, f]) => ({
        friendshipId,
        friendUserId: f.userId === userId ? f.friendUserId : f.userId,
      }));
    return { ok: true, value: result };
  }

  async getPendingInvitations(userId: string): Promise<Result<Array<{ invitationId: string; fromUserId: string }>>> {
    const result = Object.entries(this.invitations)
      .filter(([, inv]) => inv.toUserId === userId)
      .map(([invitationId, inv]) => ({ invitationId, fromUserId: inv.fromUserId }));
    return { ok: true, value: result };
  }
}

export const mockSocialService = new MockSocialService();
```

- [ ] **Step 4: Create `MockTaskGroupService.ts`**

Create `src/frontend/services/mock/MockTaskGroupService.ts`:

```typescript
import type { ITaskGroupService } from "../types/ITaskGroupService";
import type { Result } from "../types/index";

class MockTaskGroupService implements ITaskGroupService {
  private groups: Record<string, { name: string; privacy: string; inviteCode: string; ownerUserId: string; memberIds: string[]; taskIds: string[] }> = {
    "grp-seed-1": {
      name: "Morning Run Club",
      privacy: "friends",
      inviteCode: "MORN01",
      ownerUserId: "usr-seed-1",
      memberIds: ["usr-seed-1"],
      taskIds: ["tsk-seed-1", "tsk-seed-2"],
    },
  };
  private invitations: Record<string, { groupId: string; fromUserId: string; toUserId: string }> = {};

  async createGroup(input: { groupId: string; ownerUserId: string; name: string; privacy: string; inviteCode?: string }): Promise<Result<void>> {
    if (!input.name || input.name.trim().length === 0) {
      return { ok: false, error: { code: "validation", field: "name" } };
    }
    this.groups[input.groupId] = {
      name: input.name.trim(),
      privacy: input.privacy,
      inviteCode: input.inviteCode ?? "",
      ownerUserId: input.ownerUserId,
      memberIds: [],
      taskIds: [],
    };
    return { ok: true, value: undefined };
  }

  async editGroup(groupId: string, input: { name?: string; privacy?: string }): Promise<Result<void>> {
    const group = this.groups[groupId];
    if (!group) return { ok: false, error: { code: "not-found" } };
    if (input.name !== undefined) group.name = input.name;
    if (input.privacy !== undefined) group.privacy = input.privacy;
    return { ok: true, value: undefined };
  }

  async deleteGroup(groupId: string): Promise<Result<void>> {
    delete this.groups[groupId];
    return { ok: true, value: undefined };
  }

  async inviteFriend(input: { invitationId: string; groupId: string; fromUserId: string; toUserId: string; permissions: string }): Promise<Result<void>> {
    this.invitations[input.invitationId] = { groupId: input.groupId, fromUserId: input.fromUserId, toUserId: input.toUserId };
    return { ok: true, value: undefined };
  }

  async cancelInvitation(invitationId: string): Promise<Result<void>> {
    delete this.invitations[invitationId];
    return { ok: true, value: undefined };
  }

  async acceptInvitation(input: { invitationId: string; groupId: string; userId: string }): Promise<Result<void>> {
    delete this.invitations[input.invitationId];
    const group = this.groups[input.groupId];
    if (group && !group.memberIds.includes(input.userId)) group.memberIds.push(input.userId);
    return { ok: true, value: undefined };
  }

  async requestJoin(input: { invitationId: string; groupId: string; inviteCode: string; fromUserId: string; toUserId: string; permissions: string }): Promise<Result<void>> {
    const group = this.groups[input.groupId];
    if (!group) return { ok: false, error: { code: "not-found" } };
    if (group.inviteCode && input.inviteCode !== group.inviteCode) {
      return { ok: false, error: { code: "validation", field: "inviteCode" } };
    }
    this.invitations[input.invitationId] = { groupId: input.groupId, fromUserId: input.fromUserId, toUserId: input.toUserId };
    return { ok: true, value: undefined };
  }

  async acceptRequest(input: { invitationId: string; groupId: string; userId: string; permissions: string }): Promise<Result<void>> {
    delete this.invitations[input.invitationId];
    const group = this.groups[input.groupId];
    if (group && !group.memberIds.includes(input.userId)) group.memberIds.push(input.userId);
    return { ok: true, value: undefined };
  }

  async rejectRequest(invitationId: string): Promise<Result<void>> {
    delete this.invitations[invitationId];
    return { ok: true, value: undefined };
  }

  async addMember(groupId: string, userId: string): Promise<Result<void>> {
    const group = this.groups[groupId];
    if (!group) return { ok: false, error: { code: "not-found" } };
    if (!group.memberIds.includes(userId)) group.memberIds.push(userId);
    return { ok: true, value: undefined };
  }

  async removeMember(groupId: string, userId: string): Promise<Result<void>> {
    const group = this.groups[groupId];
    if (group) group.memberIds = group.memberIds.filter((id) => id !== userId);
    return { ok: true, value: undefined };
  }

  async leaveGroup(groupId: string, userId: string): Promise<Result<void>> {
    return this.removeMember(groupId, userId);
  }

  async getGroup(groupId: string): Promise<Result<{ name: string; privacy: string; inviteCode: string; memberIds: string[]; taskIds: string[] }>> {
    const group = this.groups[groupId];
    if (!group) return { ok: false, error: { code: "not-found" } };
    return { ok: true, value: { name: group.name, privacy: group.privacy, inviteCode: group.inviteCode, memberIds: [...group.memberIds], taskIds: [...group.taskIds] } };
  }
}

export const mockTaskGroupService = new MockTaskGroupService();
```

- [ ] **Step 5: Create `MockTaskService.ts`**

Create `src/frontend/services/mock/MockTaskService.ts`:

```typescript
import type { ITaskService, TaskParams } from "../types/ITaskService";
import type { Result } from "../types/index";

class MockTaskService implements ITaskService {
  private tasks: Record<string, { name: string; goal: number; progressId: string; params: TaskParams }> = {
    "tsk-seed-1": { name: "Run 5km", goal: 5, progressId: "prg-seed-1", params: { photoRequired: false, color: "blue", notifications: true } },
    "tsk-seed-2": { name: "Push-ups 100", goal: 100, progressId: "prg-seed-2", params: { photoRequired: false, color: "green", notifications: false } },
  };
  private progresses: Record<string, { value: number }> = {
    "prg-seed-1": { value: 3 },
    "prg-seed-2": { value: 0 },
  };
  private entries: Record<string, { taskId: string; value: number; commentIds: string[] }> = {};
  private comments: Record<string, { message: string }> = {};

  async createTask(input: { taskId: string; groupId: string; progressId: string; name: string; goal: number; status: string; kind: string; params: TaskParams }): Promise<Result<void>> {
    this.tasks[input.taskId] = { name: input.name, goal: input.goal, progressId: input.progressId, params: input.params };
    this.progresses[input.progressId] = { value: 0 };
    return { ok: true, value: undefined };
  }

  async editTask(taskId: string, input: { name?: string; goal?: number; status?: string; params?: Partial<TaskParams> }): Promise<Result<void>> {
    const task = this.tasks[taskId];
    if (!task) return { ok: false, error: { code: "not-found" } };
    if (input.name !== undefined) task.name = input.name;
    if (input.goal !== undefined) task.goal = input.goal;
    if (input.params) task.params = { ...task.params, ...input.params };
    return { ok: true, value: undefined };
  }

  async deleteTask(taskId: string): Promise<Result<void>> {
    delete this.tasks[taskId];
    return { ok: true, value: undefined };
  }

  async addProgress(input: { entryId: string; taskId: string; authorUserId: string; value: number; note: string }): Promise<Result<void>> {
    if (input.value < 0) return { ok: false, error: { code: "validation", field: "value" } };
    const task = this.tasks[input.taskId];
    if (!task) return { ok: false, error: { code: "not-found" } };
    this.entries[input.entryId] = { taskId: input.taskId, value: input.value, commentIds: [] };
    const prog = this.progresses[task.progressId];
    if (prog) prog.value += input.value;
    return { ok: true, value: undefined };
  }

  async addComment(input: { commentId: string; progressEntryId: string; authorUserId: string; message: string }): Promise<Result<void>> {
    this.comments[input.commentId] = { message: input.message };
    const entry = this.entries[input.progressEntryId];
    if (entry) entry.commentIds.push(input.commentId);
    return { ok: true, value: undefined };
  }

  async deleteComment(input: { commentId: string; progressEntryId: string }): Promise<Result<void>> {
    delete this.comments[input.commentId];
    const entry = this.entries[input.progressEntryId];
    if (entry) entry.commentIds = entry.commentIds.filter((id) => id !== input.commentId);
    return { ok: true, value: undefined };
  }

  async getTask(taskId: string): Promise<Result<{ name: string; goal: number; progressId: string; params: TaskParams }>> {
    const task = this.tasks[taskId];
    if (!task) return { ok: false, error: { code: "not-found" } };
    return { ok: true, value: { ...task } };
  }

  async getProgressEntries(taskId: string): Promise<Result<Array<{ entryId: string; value: number; commentIds: string[] }>>> {
    const result = Object.entries(this.entries)
      .filter(([, e]) => e.taskId === taskId)
      .map(([entryId, e]) => ({ entryId, value: e.value, commentIds: [...e.commentIds] }));
    return { ok: true, value: result };
  }
}

export const mockTaskService = new MockTaskService();
```

- [ ] **Step 6: Create `MockNotificationService.ts`**

Create `src/frontend/services/mock/MockNotificationService.ts`:

```typescript
import type { INotificationService } from "../types/INotificationService";
import type { Result } from "../types/index";

class MockNotificationService implements INotificationService {
  private notifications: Record<string, { userId: string; message: string; active: boolean }> = {};

  async addNotification(input: { notificationId: string; userId: string; message: string }): Promise<Result<void>> {
    this.notifications[input.notificationId] = { userId: input.userId, message: input.message, active: true };
    return { ok: true, value: undefined };
  }

  async markAsRead(notificationId: string): Promise<Result<void>> {
    const n = this.notifications[notificationId];
    if (!n) return { ok: false, error: { code: "not-found" } };
    n.active = false;
    return { ok: true, value: undefined };
  }

  async getNotifications(userId: string): Promise<Result<Array<{ notificationId: string; message: string; active: boolean }>>> {
    const result = Object.entries(this.notifications)
      .filter(([, n]) => n.userId === userId)
      .map(([notificationId, n]) => ({ notificationId, message: n.message, active: n.active }));
    return { ok: true, value: result };
  }
}

export const mockNotificationService = new MockNotificationService();
```

- [ ] **Step 7: Create `services/index.ts` barrel**

Create `src/frontend/services/index.ts`:

```typescript
export { mockAuthService as authService } from "./mock/MockAuthService";
export { mockProfileService as profileService } from "./mock/MockProfileService";
export { mockSocialService as socialService } from "./mock/MockSocialService";
export { mockTaskGroupService as taskGroupService } from "./mock/MockTaskGroupService";
export { mockTaskService as taskService } from "./mock/MockTaskService";
export { mockNotificationService as notificationService } from "./mock/MockNotificationService";

export type {
  IAuthService,
  IProfileService,
  ISocialService,
  ITaskGroupService,
  ITaskService,
  INotificationService,
  TaskParams,
  Result,
} from "./types/index";
```

- [ ] **Step 8: Final TypeScript check and tests**

```bash
npx tsc --project tsconfig.json --noEmit
npm run test:frontend
```

Expected: 0 TypeScript errors, 38 tests PASS

- [ ] **Step 9: Commit**

```bash
git add src/frontend/services/
git commit -m "feat: add mocked API service implementations with seed data (#14)"
```

---

## Verification

```bash
# All reducer tests pass
npm run test:frontend

# TypeScript clean (Expo config)
npx tsc --project tsconfig.json --noEmit

# TypeScript clean (test config)
npx tsc --project tsconfig.test.json --noEmit
```

Expected final state: **38/38 tests GREEN**, 0 TypeScript errors across both configs.

---

## Friend's Branch Merge Checklist (when the time comes)

When merging `frontend/navigation` into `frontend/main`:
1. **`package.json`** — keep both sets of deps (`@react-navigation/*` from friend + our existing deps)
2. **`tsconfig.json`** — verify settings from both branches are compatible; friend may have added `paths` or `moduleResolution` changes
3. **`src/frontend/navigation/AppNavigator.tsx`** — update stub to use friend's `MainTabs` component:
   ```typescript
   import { MainTabs } from "./MainTabs";
   export function AppNavigator() { return <MainTabs />; }
   ```
4. **`src/frontend/application/`** — friend has no changes here; no conflict

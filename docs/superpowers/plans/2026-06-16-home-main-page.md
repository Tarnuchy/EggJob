# Home (Main Page) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder `HomeScreen` with a warm, social-leaning dashboard (greeting → nudges → stats → active tasks → group highlights → friends' feed) for the logged-in user.

**Architecture:** Reducer state is the source of truth for sync sections (active tasks, group highlights) via new pure selectors; async sections (profile, stats, feed, pending invitations) come from a single `useHomeData` hook over existing services. All real logic lives in pure, node-testable modules (`greeting`, `bingoDetection`, two `selectHome*` selectors); RN components are thin and presentational. Two supporting refactors: extract bingo-line detection to a pure module, and move mock dev-seeding to the authenticated shell so Home shows data standalone.

**Tech Stack:** React Native + Expo SDK 54, React 19, TypeScript (strict), Vitest (node env), i18next (en/pl), React Navigation. Spec: `docs/superpowers/specs/2026-06-16-home-main-page-design.md`.

**Conventions (read before starting):**
- Tests live under `tests/frontend/unit/**/*.test.ts` (vitest `include`); they import source via relative paths like `../../../../src/frontend/...`. They are **node env** — never import `react-native`/`expo-*` into a tested module.
- Quality gate after every task: `npm run typecheck` (0 errors) **and** `npm test` (all green; baseline 152, grows as we add tests).
- No `any`. Services return `Result<T>` (`result.ok` / `result.value` / `result.error`).
- **Commits:** commit at the end of each task on branch `frontend/mainpage`. **Do not add a `Co-Authored-By` trailer** (user preference).

**Run commands:**
- Single test file: `npm test -- <path>` (e.g. `npm test -- tests/frontend/unit/home/greeting.test.ts`)
- All tests: `npm test`
- Types: `npm run typecheck`

---

## File Structure

**Create:**
- `src/frontend/components/tasks/bingoDetection.ts` — pure bingo-line logic (`buildBingoLines`, `hasBingoLine`).
- `src/frontend/screens/home/logic/greeting.ts` — pure `getGreetingKey`.
- `src/frontend/screens/home/useHomeData.ts` — async aggregate hook (profile/stats/feed/invitations + refresh).
- `src/frontend/screens/home/HomeScreen.tsx` — orchestrator (replaces the moved placeholder).
- `src/frontend/screens/home/components/{GreetingHero,HomeNudges,StatsSnapshot,ActiveTasksPeek,GroupHighlights,FriendsActivityFeed,HomeOnboarding}.tsx`
- `src/frontend/application/devSeed.ts` — `seedDevData(dispatch, currentUserId)` (moved from TasksScreen).
- `src/frontend/hooks/useDevSeed.ts` — guarded effect calling `seedDevData`.
- Tests: `tests/frontend/unit/tasks/bingo-detection.test.ts`, `tests/frontend/unit/home/greeting.test.ts`, `tests/frontend/unit/home/home-active-tasks.test.ts`, `tests/frontend/unit/home/home-group-highlights.test.ts`.

**Modify:**
- `src/frontend/components/tasks/BingoGrid.tsx` — use the extracted bingo module.
- `src/frontend/application/selectors.ts` — add `selectHomeActiveTasks`, `selectHomeGroupHighlights` (+ private `buildLatestProgressMap`).
- `src/frontend/i18n/locales/en.ts` + `pl.ts` — add `home` namespace.
- `src/frontend/navigation/types.ts` — `Friends` tab gains an optional `initialTab` param.
- `src/frontend/screens/social/FriendsScreen.tsx` — honor `initialTab`.
- `src/frontend/screens/tasks/TasksScreen.tsx` — remove inline seeding (moved to `devSeed`).
- `src/frontend/navigation/MainTabs.tsx` — call `useDevSeed()`, import `HomeScreen` from its new path.

**Delete:**
- `src/frontend/screens/tasks/HomeScreen.tsx` (moved to `screens/home/`).

---

## Task 1: Extract bingo-line detection to a pure module

**Files:**
- Create: `src/frontend/components/tasks/bingoDetection.ts`
- Test: `tests/frontend/unit/tasks/bingo-detection.test.ts`
- Modify: `src/frontend/components/tasks/BingoGrid.tsx:30-39,58-62`

- [ ] **Step 1: Write the failing test**

Create `tests/frontend/unit/tasks/bingo-detection.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import {
  buildBingoLines,
  hasBingoLine,
} from '../../../../src/frontend/components/tasks/bingoDetection';

describe('buildBingoLines', () => {
  it('returns 2*size + 2 lines (rows, cols, two diagonals)', () => {
    expect(buildBingoLines(3)).toHaveLength(8);
    expect(buildBingoLines(4)).toHaveLength(10);
    expect(buildBingoLines(5)).toHaveLength(12);
  });

  it('produces correct row, column and diagonal index sets for size 3', () => {
    const lines = buildBingoLines(3);
    expect(lines).toContainEqual([0, 1, 2]); // first row
    expect(lines).toContainEqual([0, 3, 6]); // first column
    expect(lines).toContainEqual([0, 4, 8]); // main diagonal
    expect(lines).toContainEqual([2, 4, 6]); // anti-diagonal
  });
});

describe('hasBingoLine', () => {
  it('is false for an empty board', () => {
    expect(hasBingoLine([], 3)).toBe(false);
  });

  it('is false when no full line exists', () => {
    const done = [true, false, true, false, true, false, true, false, false];
    expect(hasBingoLine(done, 3)).toBe(false);
  });

  it('is true for a completed row', () => {
    const done = [true, true, true, false, false, false, false, false, false];
    expect(hasBingoLine(done, 3)).toBe(true);
  });

  it('is true for a completed main diagonal', () => {
    const done = [true, false, false, false, true, false, false, false, true];
    expect(hasBingoLine(done, 3)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/frontend/unit/tasks/bingo-detection.test.ts`
Expected: FAIL — cannot find module `bingoDetection`.

- [ ] **Step 3: Create the pure module**

Create `src/frontend/components/tasks/bingoDetection.ts`:
```ts
/** All winning lines (rows, columns, both diagonals) of indices for an N×N bingo board. */
export function buildBingoLines(size: number): number[][] {
  const lines: number[][] = [];
  for (let i = 0; i < size; i++) {
    lines.push(Array.from({ length: size }, (_, j) => i * size + j));
    lines.push(Array.from({ length: size }, (_, j) => j * size + i));
  }
  lines.push(Array.from({ length: size }, (_, i) => i * size + i));
  lines.push(Array.from({ length: size }, (_, i) => i * size + (size - 1 - i)));
  return lines;
}

/** True when at least one full line of the board is done. */
export function hasBingoLine(done: boolean[], size: number): boolean {
  if (done.length === 0) return false;
  return buildBingoLines(size).some((line) => line.every((index) => done[index]));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/frontend/unit/tasks/bingo-detection.test.ts`
Expected: PASS (all cases).

- [ ] **Step 5: Refactor BingoGrid to use the module**

In `src/frontend/components/tasks/BingoGrid.tsx`:

Add to the imports (after line 8 `import { computeBingoCellSize } from './bingoLayout';`):
```ts
import { hasBingoLine } from './bingoDetection';
```

Delete the local `buildLines` function (lines 30-39).

Replace the `hasBingo` memo (lines 58-62) with:
```ts
  const hasBingo = useMemo(() => {
    if (cells.length === 0) return false;
    const done = cells.map((cell) => cell?.isDone ?? false);
    return hasBingoLine(done, size);
  }, [cells, size]);
```

- [ ] **Step 6: Verify gate**

Run: `npm run typecheck` → 0 errors.
Run: `npm test` → all green (152 + 7 new bingo-detection cases).

- [ ] **Step 7: Commit**

```bash
git add src/frontend/components/tasks/bingoDetection.ts tests/frontend/unit/tasks/bingo-detection.test.ts src/frontend/components/tasks/BingoGrid.tsx
git commit -m "refactor(tasks): extract pure bingo-line detection from BingoGrid"
```

---

## Task 2: `getGreetingKey` pure util

**Files:**
- Create: `src/frontend/screens/home/logic/greeting.ts`
- Test: `tests/frontend/unit/home/greeting.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/frontend/unit/home/greeting.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { getGreetingKey } from '../../../../src/frontend/screens/home/logic/greeting';

describe('getGreetingKey', () => {
  it('maps hours to the right part of day', () => {
    expect(getGreetingKey(4)).toBe('night');
    expect(getGreetingKey(5)).toBe('morning');
    expect(getGreetingKey(11)).toBe('morning');
    expect(getGreetingKey(12)).toBe('afternoon');
    expect(getGreetingKey(17)).toBe('afternoon');
    expect(getGreetingKey(18)).toBe('evening');
    expect(getGreetingKey(22)).toBe('evening');
    expect(getGreetingKey(23)).toBe('night');
    expect(getGreetingKey(0)).toBe('night');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/frontend/unit/home/greeting.test.ts`
Expected: FAIL — cannot find module `greeting`.

- [ ] **Step 3: Implement**

Create `src/frontend/screens/home/logic/greeting.ts`:
```ts
export type GreetingKey = 'morning' | 'afternoon' | 'evening' | 'night';

/** Maps a 0–23 hour to a time-of-day greeting bucket. */
export function getGreetingKey(hour: number): GreetingKey {
  if (hour >= 5 && hour <= 11) return 'morning';
  if (hour >= 12 && hour <= 17) return 'afternoon';
  if (hour >= 18 && hour <= 22) return 'evening';
  return 'night';
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/frontend/unit/home/greeting.test.ts`
Expected: PASS.

- [ ] **Step 5: Verify gate + commit**

Run: `npm run typecheck` → 0 errors. Run: `npm test` → green.
```bash
git add src/frontend/screens/home/logic/greeting.ts tests/frontend/unit/home/greeting.test.ts
git commit -m "feat(home): add getGreetingKey time-of-day util"
```

---

## Task 3: `selectHomeActiveTasks` selector

**Files:**
- Modify: `src/frontend/application/selectors.ts`
- Test: `tests/frontend/unit/home/home-active-tasks.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/frontend/unit/home/home-active-tasks.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { createInitialFrontendState } from '../../../../src/frontend/application/state';
import type { FrontendState, Task, TaskGroup } from '../../../../src/frontend/application/state';
import { selectHomeActiveTasks } from '../../../../src/frontend/application/selectors';

const params = { photoRequired: false, color: '#2563EB', notifications: false };

function makeGroup(over: Partial<TaskGroup>): TaskGroup {
  return {
    name: 'G', ownerUserId: 'u1', privacy: 'private', type: 'cooperative',
    isBingo: false, inviteCode: 'X', taskIds: [], memberIds: [], memberRoles: {}, ...over,
  };
}
function makeTask(over: Partial<Task>): Task {
  return { name: 'T', goal: 10, progressId: 'p', params, ...over };
}

/** State where u1 owns one group with several tasks of varied progress. */
function fixture(): FrontendState {
  const s = createInitialFrontendState();
  return {
    ...s,
    session: { currentAccountId: null, currentUserId: 'u1' },
    entities: {
      ...s.entities,
      taskGroups: {
        g1: makeGroup({ name: 'Marathon', ownerUserId: 'u1', taskIds: ['t1', 't2', 't3', 't4', 't5'] }),
        g2: makeGroup({ name: 'Other', ownerUserId: 'u2', memberIds: [], taskIds: ['t6'] }), // u1 not a member
      },
      tasks: {
        t1: makeTask({ name: 'Run', goal: 5, progressId: 'p1' }),         // value 2 -> active, has progress
        t2: makeTask({ name: 'Stretch', goal: 1, progressId: 'p2' }),     // value 1 -> done (excluded)
        t3: makeTask({ name: 'Recipes', goal: 3, progressId: 'p3' }),     // value 0 -> active, no progress
        t4: makeTask({ name: 'Broken', goal: 0, progressId: 'p4' }),      // goal 0 -> excluded
        t5: makeTask({ name: 'Bike', goal: 50, progressId: 'p5' }),       // value 30 -> active, newest progress
        t6: makeTask({ name: 'Foreign', goal: 9, progressId: 'p6' }),     // in g2, u1 not member
      },
      taskProgresses: { p1: { value: 2 }, p2: { value: 1 }, p3: { value: 0 }, p4: { value: 0 }, p5: { value: 30 }, p6: { value: 0 } },
      progressEntries: {
        e1: { taskId: 't1', value: 2, commentIds: [], createdAt: '2026-06-10T10:00:00.000Z' },
        e5: { taskId: 't5', value: 30, commentIds: [], createdAt: '2026-06-15T10:00:00.000Z' },
      },
    },
  };
}

describe('selectHomeActiveTasks', () => {
  it('excludes done tasks, goal<=0 tasks, and tasks from non-member groups', () => {
    const ids = selectHomeActiveTasks(fixture(), 'u1', 10).map((t) => t.taskId);
    expect(ids).toEqual(expect.arrayContaining(['t1', 't3', 't5']));
    expect(ids).not.toContain('t2'); // done
    expect(ids).not.toContain('t4'); // goal 0
    expect(ids).not.toContain('t6'); // not a member of g2
    expect(ids).toHaveLength(3);
  });

  it('sorts by most-recent progress desc, tasks without progress last (tie-break by name)', () => {
    const ids = selectHomeActiveTasks(fixture(), 'u1', 10).map((t) => t.taskId);
    // t5 progressed 2026-06-15 (newest), t1 2026-06-10, t3 never progressed -> last
    expect(ids).toEqual(['t5', 't1', 't3']);
  });

  it('respects the limit and carries display fields', () => {
    const top = selectHomeActiveTasks(fixture(), 'u1', 1);
    expect(top).toHaveLength(1);
    expect(top[0]).toMatchObject({ taskId: 't5', groupId: 'g1', groupName: 'Marathon', name: 'Bike', value: 30, goal: 50, color: '#2563EB' });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/frontend/unit/home/home-active-tasks.test.ts`
Expected: FAIL — `selectHomeActiveTasks` is not exported.

- [ ] **Step 3: Implement the selector**

In `src/frontend/application/selectors.ts`:

Add a `colors` import just below the existing `import type { … } from './state';` line. **Task 3 uses only `colors`** — `hasBingoLine` and `TaskGroupType` are added in Task 4, so importing them here would trip `noUnusedLocals`:
```ts
import { colors } from '../theme/colors';
```

Append at the end of the file:
```ts
/** Latest ProgressEntry.createdAt per taskId ('' when a task has no dated entries). */
function buildLatestProgressMap(state: FrontendState): Map<string, string> {
  const map = new Map<string, string>();
  for (const entry of Object.values(state.entities.progressEntries)) {
    const createdAt = entry.createdAt ?? '';
    const current = map.get(entry.taskId) ?? '';
    if (createdAt > current) map.set(entry.taskId, createdAt);
  }
  return map;
}

export interface HomeActiveTask {
  taskId: string;
  groupId: string;
  groupName: string;
  name: string;
  value: number;
  goal: number;
  color: string;
}

/** The user's not-done tasks (value < goal, goal > 0) across member/owned groups,
 *  newest-progress first; tasks without progress sort last (tie-break: name asc). */
export function selectHomeActiveTasks(
  state: FrontendState,
  userId: string,
  limit: number,
): HomeActiveTask[] {
  const latest = buildLatestProgressMap(state);
  const ranked: Array<HomeActiveTask & { recency: string }> = [];
  for (const { id: groupId, group } of selectTaskGroupsByMember(state, userId)) {
    for (const { id: taskId, task } of selectTasksByGroup(state, groupId)) {
      if (task.goal <= 0) continue;
      const value = state.entities.taskProgresses[task.progressId]?.value ?? 0;
      if (value >= task.goal) continue;
      ranked.push({
        taskId,
        groupId,
        groupName: group.name,
        name: task.name,
        value,
        goal: task.goal,
        color: task.params.color ?? colors.primary,
        recency: latest.get(taskId) ?? '',
      });
    }
  }
  ranked.sort((a, b) =>
    a.recency !== b.recency ? (a.recency < b.recency ? 1 : -1) : a.name.localeCompare(b.name),
  );
  return ranked.slice(0, limit).map(({ recency, ...rest }) => rest);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/frontend/unit/home/home-active-tasks.test.ts`
Expected: PASS.

- [ ] **Step 5: Verify gate + commit**

Run: `npm run typecheck` → 0 errors. Run: `npm test` → green.
```bash
git add src/frontend/application/selectors.ts tests/frontend/unit/home/home-active-tasks.test.ts
git commit -m "feat(home): add selectHomeActiveTasks selector"
```

---

## Task 4: `selectHomeGroupHighlights` selector

**Files:**
- Modify: `src/frontend/application/selectors.ts`
- Test: `tests/frontend/unit/home/home-group-highlights.test.ts`

> Depends on Task 1 (`hasBingoLine`, imported in Task 3) and the `buildLatestProgressMap` helper from Task 3.

- [ ] **Step 1: Write the failing test**

Create `tests/frontend/unit/home/home-group-highlights.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { createInitialFrontendState } from '../../../../src/frontend/application/state';
import type { FrontendState, Task, TaskGroup } from '../../../../src/frontend/application/state';
import { selectHomeGroupHighlights } from '../../../../src/frontend/application/selectors';

const params = { photoRequired: false, color: '#2563EB', notifications: false };
function makeGroup(over: Partial<TaskGroup>): TaskGroup {
  return {
    name: 'G', ownerUserId: 'u1', privacy: 'private', type: 'cooperative',
    isBingo: false, inviteCode: 'X', taskIds: [], memberIds: [], memberRoles: {}, ...over,
  };
}
function makeTask(over: Partial<Task>): Task {
  return { name: 'T', goal: 1, progressId: 'p', params, ...over };
}

// A 3x3 bingo whose first row (t0,t1,t2) is done -> hasBingo true, 3/9 done.
function bingoFixture(): FrontendState {
  const s = createInitialFrontendState();
  const taskIds = Array.from({ length: 9 }, (_, i) => `b${i}`);
  const tasks: Record<string, Task> = {};
  const taskProgresses: Record<string, { value: number }> = {};
  taskIds.forEach((id, i) => {
    tasks[id] = makeTask({ name: `Cell ${i}`, goal: 1, progressId: `bp${i}` });
    taskProgresses[`bp${i}`] = { value: i < 3 ? 1 : 0 };
  });
  return {
    ...s,
    entities: {
      ...s.entities,
      taskGroups: {
        bg: makeGroup({ name: 'Bingo', ownerUserId: 'u1', isBingo: true, taskIds, memberIds: ['m1'] }),
        plain: makeGroup({ name: 'Plain', ownerUserId: 'u1', type: 'competitive', taskIds: ['x1'] }),
      },
      tasks: { ...tasks, x1: makeTask({ name: 'Solo', goal: 5, progressId: 'xp1' }) },
      taskProgresses: { ...taskProgresses, xp1: { value: 2 } },
    },
  };
}

describe('selectHomeGroupHighlights', () => {
  it('returns member/owned groups with task & member counts', () => {
    const items = selectHomeGroupHighlights(bingoFixture(), 'u1', 10);
    const plain = items.find((g) => g.groupId === 'plain');
    expect(plain).toMatchObject({ name: 'Plain', type: 'competitive', taskCount: 1, memberCount: 1 });
    expect(plain?.bingo).toBeUndefined();
  });

  it('computes bingo done/total and a completed line', () => {
    const items = selectHomeGroupHighlights(bingoFixture(), 'u1', 10);
    const bingo = items.find((g) => g.groupId === 'bg');
    expect(bingo?.memberCount).toBe(2); // 1 member + owner
    expect(bingo?.bingo).toEqual({ size: 3, doneCount: 3, totalCount: 9, hasBingo: true });
  });

  it('does not attach bingo info when the task count is not a perfect 3/4/5 square', () => {
    const s = bingoFixture();
    s.entities.taskGroups.bg.taskIds = ['b0', 'b1', 'b2', 'b3']; // 4 -> size 2, out of range
    const bingo = selectHomeGroupHighlights(s, 'u1', 10).find((g) => g.groupId === 'bg');
    expect(bingo?.bingo).toBeUndefined();
  });

  it('respects the limit', () => {
    expect(selectHomeGroupHighlights(bingoFixture(), 'u1', 1)).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/frontend/unit/home/home-group-highlights.test.ts`
Expected: FAIL — `selectHomeGroupHighlights` is not exported.

- [ ] **Step 3: Implement the selector**

First add this selector's imports: add `TaskGroupType` to the existing `import type { … } from './state';` line, and add `import { hasBingoLine } from '../components/tasks/bingoDetection';` next to the `colors` import. Then append to `src/frontend/application/selectors.ts`:
```ts
export interface HomeGroupHighlight {
  groupId: string;
  name: string;
  type: TaskGroupType;
  taskCount: number;
  memberCount: number;
  bingo?: { size: number; doneCount: number; totalCount: number; hasBingo: boolean };
}

/** Member/owned groups for the dashboard, with bingo done/total when applicable,
 *  most-recently-active first (tie-break: name asc). */
export function selectHomeGroupHighlights(
  state: FrontendState,
  userId: string,
  limit: number,
): HomeGroupHighlight[] {
  const latest = buildLatestProgressMap(state);
  const ranked = selectTaskGroupsByMember(state, userId).map(({ id: groupId, group }) => {
    const tasks = selectTasksByGroup(state, groupId);
    const doneFlags = tasks.map(({ task }) => {
      const value = state.entities.taskProgresses[task.progressId]?.value ?? 0;
      return task.goal > 0 && value >= task.goal;
    });
    const totalCount = tasks.length;
    const sqrt = Math.sqrt(totalCount);
    const size = Math.round(sqrt);
    const isBingoBoard = group.isBingo && Number.isInteger(sqrt) && size >= 3 && size <= 5;
    let recency = '';
    for (const { id: taskId } of tasks) {
      const r = latest.get(taskId) ?? '';
      if (r > recency) recency = r;
    }
    const highlight: HomeGroupHighlight & { recency: string } = {
      groupId,
      name: group.name,
      type: group.type,
      taskCount: totalCount,
      memberCount: group.memberIds.length + 1,
      bingo: isBingoBoard
        ? { size, doneCount: doneFlags.filter(Boolean).length, totalCount, hasBingo: hasBingoLine(doneFlags, size) }
        : undefined,
      recency,
    };
    return highlight;
  });
  ranked.sort((a, b) =>
    a.recency !== b.recency ? (a.recency < b.recency ? 1 : -1) : a.name.localeCompare(b.name),
  );
  return ranked.slice(0, limit).map(({ recency, ...rest }) => rest);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/frontend/unit/home/home-group-highlights.test.ts`
Expected: PASS.

- [ ] **Step 5: Verify gate + commit**

Run: `npm run typecheck` → 0 errors. Run: `npm test` → green.
```bash
git add src/frontend/application/selectors.ts tests/frontend/unit/home/home-group-highlights.test.ts
git commit -m "feat(home): add selectHomeGroupHighlights selector"
```

---

## Task 5: `home` i18n namespace (en + pl)

**Files:**
- Modify: `src/frontend/i18n/locales/en.ts`, `src/frontend/i18n/locales/pl.ts`

- [ ] **Step 1: Add the `home` namespace to en.ts**

In `src/frontend/i18n/locales/en.ts`, immediately after the `reducerErrors: { … },` block (before the closing `} as const;` on line 410), insert:
```ts
  home: {
    greeting: {
      morning: 'Good morning',
      afternoon: 'Good afternoon',
      evening: 'Good evening',
      night: 'Good night',
      withName: '{{greeting}}, {{name}}',
      subtitle: "Let's make today count.",
    },
    nudges: {
      notifications: 'You have {{count}} unread notifications',
      friendRequests: '{{count}} friend requests waiting',
      tapToOpen: 'Tap to open',
    },
    sections: {
      activeTasks: 'Jump back in',
      groups: 'Your groups',
      activity: "Friends' activity",
    },
    groups: {
      competitive: 'Competitive',
      cooperative: 'Cooperative',
      bingoBadge: 'Bingo',
      bingoWin: '🎉 Bingo!',
      taskCount: '{{count}} tasks',
      memberCount: '{{count}} members',
    },
    empty: {
      noActiveTasks: 'No active tasks — tap + to add one.',
      noGroups: 'No groups yet — join or create one to play with friends.',
      noActivity: 'No activity yet',
      noActivityHint: 'Add friends to see their progress here.',
    },
    onboarding: {
      title: 'Welcome to EggJob',
      message: 'Create a group or add friends to start tracking progress together.',
      ctaCreateGroup: 'Create a group',
      ctaAddFriends: 'Add friends',
    },
    feed: {
      errorTitle: "Couldn't load activity",
      retry: 'Retry',
    },
  },
```

- [ ] **Step 2: Add the identical structure to pl.ts**

In `src/frontend/i18n/locales/pl.ts`, after the `reducerErrors: { … },` block (before the closing `};` on line 412), insert:
```ts
  home: {
    greeting: {
      morning: 'Dzień dobry',
      afternoon: 'Dzień dobry',
      evening: 'Dobry wieczór',
      night: 'Dobranoc',
      withName: '{{greeting}}, {{name}}',
      subtitle: 'Zróbmy dziś coś dobrego.',
    },
    nudges: {
      notifications: 'Masz {{count}} nieprzeczytanych powiadomień',
      friendRequests: '{{count}} zaproszenia do znajomych czekają',
      tapToOpen: 'Dotknij, aby otworzyć',
    },
    sections: {
      activeTasks: 'Wróć do pracy',
      groups: 'Twoje grupy',
      activity: 'Aktywność znajomych',
    },
    groups: {
      competitive: 'Rywalizacja',
      cooperative: 'Współpraca',
      bingoBadge: 'Bingo',
      bingoWin: '🎉 Bingo!',
      taskCount: 'Zadania: {{count}}',
      memberCount: 'Członkowie: {{count}}',
    },
    empty: {
      noActiveTasks: 'Brak aktywnych zadań — dotknij +, aby dodać.',
      noGroups: 'Brak grup — dołącz lub utwórz, aby grać ze znajomymi.',
      noActivity: 'Brak aktywności',
      noActivityHint: 'Dodaj znajomych, aby zobaczyć ich postępy.',
    },
    onboarding: {
      title: 'Witaj w EggJob',
      message: 'Utwórz grupę lub dodaj znajomych, aby wspólnie śledzić postępy.',
      ctaCreateGroup: 'Utwórz grupę',
      ctaAddFriends: 'Dodaj znajomych',
    },
    feed: {
      errorTitle: 'Nie udało się wczytać aktywności',
      retry: 'Ponów',
    },
  },
```

- [ ] **Step 3: Verify parity via the compiler**

Run: `npm run typecheck`
Expected: 0 errors. (If a key is missing or renamed in `pl.ts`, `const pl: Translation` fails here — fix until it compiles.)
Run: `npm test` → green.

- [ ] **Step 4: Commit**

```bash
git add src/frontend/i18n/locales/en.ts src/frontend/i18n/locales/pl.ts
git commit -m "feat(i18n): add home dashboard namespace (en, pl)"
```

---

## Task 6: Friends `initialTab` param (supporting change)

**Files:**
- Modify: `src/frontend/navigation/types.ts:16-21`
- Modify: `src/frontend/screens/social/FriendsScreen.tsx:17-19`

> Done before the nudge/onboarding components so their `navigate('Friends', { initialTab })` calls typecheck.

- [ ] **Step 1: Extend the param lists**

In `src/frontend/navigation/types.ts`:

Add the import at the very top of the file:
```ts
import type { NavigatorScreenParams } from '@react-navigation/native';
```

Change the `Main` line in `RootStackParamList` from `Main: undefined;` to (so we can deep-link to a tab):
```ts
  Main: NavigatorScreenParams<TabParamList> | undefined;
```

Replace the `TabParamList` block (lines 16-21) with:
```ts
export type FriendsTabName = 'myFriends' | 'addFriend' | 'invitations';

export type TabParamList = {
  Home: undefined;
  Tasks: undefined;
  Friends: { initialTab?: FriendsTabName } | undefined;
  Profile: undefined;
};
```
(`RootStackParamList` references `TabParamList` declared below it — fine, TS hoists type declarations within a module.)

- [ ] **Step 2: Honor `initialTab` in FriendsScreen**

In `src/frontend/screens/social/FriendsScreen.tsx`:

Add to imports:
```ts
import { useRoute, type RouteProp } from '@react-navigation/native';
import type { TabParamList } from '../../navigation/types';
```

Replace the `activeTab` state line (line 19) with:
```ts
  const route = useRoute<RouteProp<TabParamList, 'Friends'>>();
  const [activeTab, setActiveTab] = useState<FriendsTab>(route.params?.initialTab ?? 'myFriends');
```
(`FriendsTab` is already imported from `./friends/types` and is the same union; if its declaration differs, keep using `FriendsTab` — the values match `FriendsTabName`.)

- [ ] **Step 3: Verify gate + commit**

Run: `npm run typecheck` → 0 errors. Run: `npm test` → green.
```bash
git add src/frontend/navigation/types.ts src/frontend/screens/social/FriendsScreen.tsx
git commit -m "feat(friends): support deep-linking to a Friends sub-tab via initialTab"
```

---

## Task 7: Extract mock dev-seed to the authenticated shell (supporting change)

**Files:**
- Create: `src/frontend/application/devSeed.ts`
- Create: `src/frontend/hooks/useDevSeed.ts`
- Modify: `src/frontend/navigation/MainTabs.tsx`
- Modify: `src/frontend/screens/tasks/TasksScreen.tsx:57-156` (remove the seeding effect)

> Goal: Home shows real groups in mock mode without needing to open Tasks first. The seed block is **moved verbatim** — no behavior change, just relocation + a single trigger point.

- [ ] **Step 1: Create `devSeed.ts` with the moved seed body**

Create `src/frontend/application/devSeed.ts`:
```ts
import type { AppAction } from './actions';
import type { ReducerResult } from './reducer';
import { TASK_COLORS } from '../screens/tasks/taskColors';

type Dispatch = (action: AppAction) => ReducerResult;

/** Seeds demonstration groups/tasks for the dev mock user. Idempotent at the call site
 *  (only invoked when there are no groups yet). Moved verbatim from TasksScreen. */
export function seedDevData(dispatch: Dispatch, currentUserId: string): void {
  // <<< PASTE HERE, VERBATIM, the seeding body currently in
  //     src/frontend/screens/tasks/TasksScreen.tsx lines 64-155
  //     (from `const marathonId = 'grp-marathon';` through the final
  //      `dispatch({ type: 'task-groups/invite-friend', ... })`).
  //     `seedBingoBoard` becomes a nested function here; it already closes over
  //     `dispatch` and `currentUserId`, which are now this function's parameters. >>>
}
```
Copy the exact lines `64-155` from `TasksScreen.tsx` (the `const marathonId …` block down to and including the `task-groups/invite-friend` dispatch) into the marked region. Do not modify them.

- [ ] **Step 2: Create the guarded hook**

Create `src/frontend/hooks/useDevSeed.ts`:
```ts
import { useEffect } from 'react';
import { useAppState } from '../application/AppStateContext';
import { selectAllTaskGroups } from '../application/selectors';
import { seedDevData } from '../application/devSeed';
import { useCurrentUserId } from './useCurrentUserId';
import { USE_HTTP_SERVICES } from '../services/http/config';

/** In mock mode, seeds demo data once for the signed-in dev user so every tab
 *  (Home included) has content. No-op in HTTP mode (state comes from the backend). */
export function useDevSeed(): void {
  const { state, dispatch } = useAppState();
  const currentUserId = useCurrentUserId();

  useEffect(() => {
    if (USE_HTTP_SERVICES) return;
    if (selectAllTaskGroups(state).length > 0) return;
    seedDevData(dispatch, currentUserId);
  }, [state, dispatch, currentUserId]);
}
```

- [ ] **Step 3: Trigger it from the authenticated shell**

In `src/frontend/navigation/MainTabs.tsx`, add the import:
```ts
import { useDevSeed } from '../hooks/useDevSeed';
```
and call it as the first line inside the `MainTabs` component body (just after `const { t } = useTranslation();`):
```ts
  useDevSeed();
```

- [ ] **Step 4: Remove the seeding effect from TasksScreen**

In `src/frontend/screens/tasks/TasksScreen.tsx`, delete the entire seeding `useEffect` (lines 57-156, the block starting `useEffect(() => {` with the comment `// w trybie HTTP stan pochodzi z backendu …` and ending at its `}, [allGroups.length, currentUserId, dispatch]);`). Then remove now-unused imports if the compiler flags them (likely `USE_HTTP_SERVICES` stays — it's still used in `handleJoinGroup`; `TASK_COLORS` import becomes unused → delete the `import { TASK_COLORS } from './taskColors';` line). Leave the rest of TasksScreen unchanged.

- [ ] **Step 5: Verify gate**

Run: `npm run typecheck` → 0 errors (fix any unused-import errors surfaced by the removal).
Run: `npm test` → green.

- [ ] **Step 6: Manual smoke (mock mode)**

Confirm `EXPO_PUBLIC_USE_HTTP_SERVICES` is unset/false. Reasoning check: `MainTabs` now seeds on mount, so opening **Home first** will have groups available to `selectHomeGroupHighlights`. (Full visual check happens in Task 15.)

- [ ] **Step 7: Commit**

```bash
git add src/frontend/application/devSeed.ts src/frontend/hooks/useDevSeed.ts src/frontend/navigation/MainTabs.tsx src/frontend/screens/tasks/TasksScreen.tsx
git commit -m "refactor(state): seed mock demo data at the shell so all tabs have content"
```

---

## Task 8: `useHomeData` hook

**Files:**
- Create: `src/frontend/screens/home/useHomeData.ts`

> Not unit-tested (depends on services + React, which the node test env doesn't host). Verified by the compiler and by the smoke test in Task 15.

- [ ] **Step 1: Implement the hook**

Create `src/frontend/screens/home/useHomeData.ts`:
```ts
import { useCallback, useEffect, useState } from 'react';
import { profileService, socialService } from '../../services';
import type { FeedItem, UserStats } from '../../services';

export const HOME_FEED_LIMIT = 20;

export interface HomeData {
  username: string | null;
  stats: UserStats | null;
  feed: FeedItem[];
  pendingInvitations: number;
  loading: boolean;
  error: boolean;
  refreshing: boolean;
  refresh: () => Promise<void>;
}

/** Aggregates the async parts of Home (profile, stats, feed, pending friend invitations)
 *  into one loading/refresh surface. Reuses existing services — no new endpoints. */
export function useHomeData(userId: string): HomeData {
  const [username, setUsername] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [profileRes, statsRes, feedRes, invitesRes] = await Promise.all([
      profileService.getProfile(userId),
      profileService.getUserStats(userId),
      socialService.getUserFeed(userId),
      socialService.getPendingInvitations(userId),
    ]);
    let failed = false;
    if (profileRes.ok) setUsername(profileRes.value.username);
    else failed = true;
    if (statsRes.ok) setStats(statsRes.value);
    else { setStats(null); failed = true; }
    if (feedRes.ok) setFeed(feedRes.value.slice(0, HOME_FEED_LIMIT));
    else { setFeed([]); failed = true; }
    if (invitesRes.ok) setPendingInvitations(invitesRes.value.length);
    else { setPendingInvitations(0); failed = true; }
    setError(failed);
  }, [userId]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    void (async () => {
      await load();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return { username, stats, feed, pendingInvitations, loading, error, refreshing, refresh };
}
```

- [ ] **Step 2: Verify gate + commit**

Run: `npm run typecheck` → 0 errors (confirms `socialService.getPendingInvitations`, `getUserFeed`, `profileService.getProfile/getUserStats`, and the `FeedItem`/`UserStats` re-exports exist as used). Run: `npm test` → green.
```bash
git add src/frontend/screens/home/useHomeData.ts
git commit -m "feat(home): add useHomeData aggregate hook"
```

---

## Task 9: `GreetingHero` component

**Files:**
- Create: `src/frontend/screens/home/components/GreetingHero.tsx`

- [ ] **Step 1: Implement**

Create `src/frontend/screens/home/components/GreetingHero.tsx`:
```tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { AppText } from '../../../components/common/AppText';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import type { GreetingKey } from '../logic/greeting';

interface Props {
  displayName: string;
  greetingKey: GreetingKey;
}

export const GreetingHero = ({ displayName, greetingKey }: Props) => {
  const { t } = useTranslation();
  const greeting = t(`home.greeting.${greetingKey}`);

  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryPressed]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.hero}
    >
      <AppText variant="h1" color="textOnPrimary" numberOfLines={1}>
        {t('home.greeting.withName', { greeting, name: displayName })}
      </AppText>
      <AppText variant="body" color="textOnPrimary" style={styles.subtitle}>
        {t('home.greeting.subtitle')} 🍂
      </AppText>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  hero: {
    borderRadius: 22,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  subtitle: {
    opacity: 0.85,
  },
});
```

- [ ] **Step 2: Verify gate + commit**

Run: `npm run typecheck` → 0 errors. Run: `npm test` → green.
```bash
git add src/frontend/screens/home/components/GreetingHero.tsx
git commit -m "feat(home): add GreetingHero component"
```

---

## Task 10: `HomeNudges` component

**Files:**
- Create: `src/frontend/screens/home/components/HomeNudges.tsx`

- [ ] **Step 1: Implement**

Create `src/frontend/screens/home/components/HomeNudges.tsx`:
```tsx
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '../../../components/common/AppText';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { useNotifications } from '../../../application/NotificationsContext';
import { usePanelContext } from '../../../navigation/PanelContext';
import { useAppNavigation } from '../../../hooks/useAppNavigation';

interface Props {
  pendingInvitations: number;
}

interface NudgeRowProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  text: string;
  onPress: () => void;
  accessibilityLabel: string;
}

const NudgeRow = ({ icon, text, onPress, accessibilityLabel }: NudgeRowProps) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    style={({ pressed }) => [styles.nudge, pressed && styles.nudgePressed]}
  >
    <View style={styles.iconWrap}>
      <Ionicons name={icon} size={18} color={colors.primary} />
    </View>
    <AppText variant="label" color="textPrimary" style={styles.text} numberOfLines={2}>
      {text}
    </AppText>
    <Ionicons name="chevron-forward" size={18} color={colors.muted} />
  </Pressable>
);

export const HomeNudges = ({ pendingInvitations }: Props) => {
  const { t } = useTranslation();
  const { hasUnread, notifications } = useNotifications();
  const { setOpenPanel } = usePanelContext();
  const navigation = useAppNavigation();

  const unreadCount = notifications.filter((n) => n.active).length;

  if (!hasUnread && pendingInvitations <= 0) return null;

  return (
    <View style={styles.container}>
      {hasUnread ? (
        <NudgeRow
          icon="notifications-outline"
          text={t('home.nudges.notifications', { count: unreadCount })}
          accessibilityLabel={t('home.nudges.notifications', { count: unreadCount })}
          onPress={() => setOpenPanel('notifications')}
        />
      ) : null}
      {pendingInvitations > 0 ? (
        <NudgeRow
          icon="person-add-outline"
          text={t('home.nudges.friendRequests', { count: pendingInvitations })}
          accessibilityLabel={t('home.nudges.friendRequests', { count: pendingInvitations })}
          onPress={() => navigation.navigate('Main', { screen: 'Friends', params: { initialTab: 'invitations' } })}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  nudge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.cardSurfaceTranslucent,
    borderWidth: 1,
    borderColor: colors.cardBorderTranslucent,
  },
  nudgePressed: { opacity: 0.85 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(107, 63, 34, 0.12)',
  },
  text: { flex: 1 },
});
```

> The Friends tab lives under the `Main` stack route (`PanelHost` renders `MainTabs`), so we jump to it via nested navigation: `navigate('Main', { screen: 'Friends', params: {…} })` — enabled by the `Main: NavigatorScreenParams<TabParamList>` change in Task 6. This is type-correct from the stack-typed `useAppNavigation`.

- [ ] **Step 2: Verify gate + commit**

Run: `npm run typecheck` → 0 errors. Run: `npm test` → green.
```bash
git add src/frontend/screens/home/components/HomeNudges.tsx
git commit -m "feat(home): add HomeNudges (notifications + friend requests)"
```

---

## Task 11: `StatsSnapshot` component

**Files:**
- Create: `src/frontend/screens/home/components/StatsSnapshot.tsx`

- [ ] **Step 1: Implement**

Create `src/frontend/screens/home/components/StatsSnapshot.tsx`:
```tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ProfileStats } from '../../../components/common/ProfileStats';
import { StatTile } from '../../../components/common/StatTile';
import { spacing } from '../../../theme/spacing';
import type { UserStats } from '../../../services';

interface Props {
  stats: UserStats | null;
  onFriendsPress: () => void;
}

export const StatsSnapshot = ({ stats, onFriendsPress }: Props) => {
  const { t } = useTranslation();

  if (stats) {
    return <ProfileStats stats={stats} onFriendsPress={onFriendsPress} />;
  }

  // loading / error fallback: ProfileStats requires a non-null UserStats
  return (
    <View style={styles.row}>
      <StatTile value="—" label={t('profile.stats.activeTasks')} />
      <StatTile value="—" label={t('profile.stats.completedTasks')} />
      <StatTile value="—" label={t('profile.stats.friends')} />
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
});
```

> `profile.stats.activeTasks/completedTasks/friends` already exist (used by `ProfileStats`). No new i18n keys.

- [ ] **Step 2: Verify gate + commit**

Run: `npm run typecheck` → 0 errors. Run: `npm test` → green.
```bash
git add src/frontend/screens/home/components/StatsSnapshot.tsx
git commit -m "feat(home): add StatsSnapshot (ProfileStats + loading fallback)"
```

---

## Task 12: `ActiveTasksPeek` component

**Files:**
- Create: `src/frontend/screens/home/components/ActiveTasksPeek.tsx`

- [ ] **Step 1: Implement**

Create `src/frontend/screens/home/components/ActiveTasksPeek.tsx`:
```tsx
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '../../../components/common/AppText';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { useAppNavigation } from '../../../hooks/useAppNavigation';
import type { HomeActiveTask } from '../../../application/selectors';

interface Props {
  items: HomeActiveTask[];
}

export const ActiveTasksPeek = ({ items }: Props) => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();

  return (
    <View style={styles.section}>
      <AppText variant="caption" color="muted" style={styles.sectionTitle}>
        {t('home.sections.activeTasks')}
      </AppText>
      {items.length === 0 ? (
        <View style={styles.card}>
          <AppText variant="body" color="textSecondary">
            {t('home.empty.noActiveTasks')}
          </AppText>
        </View>
      ) : (
        items.map((item) => (
          <Pressable
            key={item.taskId}
            accessibilityRole="button"
            accessibilityLabel={item.name}
            onPress={() => navigation.navigate('TaskDetail', { groupId: item.groupId, taskId: item.taskId })}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          >
            <View style={[styles.dot, { backgroundColor: item.color }]} />
            <View style={styles.body}>
              <AppText variant="label" color="textPrimary" numberOfLines={1}>
                {item.name}
              </AppText>
              <AppText variant="caption" color="muted" numberOfLines={1}>
                {item.groupName}
              </AppText>
            </View>
            <View style={styles.progressPill}>
              <AppText variant="caption" color="primary">{`${item.value} / ${item.goal}`}</AppText>
            </View>
          </Pressable>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  sectionTitle: { letterSpacing: 1.2, textTransform: 'uppercase' },
  card: {
    padding: spacing.md,
    borderRadius: 14,
    backgroundColor: colors.cardSurfaceTranslucent,
    borderWidth: 1,
    borderColor: colors.cardBorderTranslucent,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 14,
    backgroundColor: colors.cardSurfaceTranslucent,
    borderWidth: 1,
    borderColor: colors.cardBorderTranslucent,
  },
  rowPressed: { transform: [{ scale: 0.99 }] },
  dot: { width: 12, height: 12, borderRadius: 6 },
  body: { flex: 1, minWidth: 0 },
  progressPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(107, 63, 34, 0.10)',
  },
});
```

- [ ] **Step 2: Verify gate + commit**

Run: `npm run typecheck` → 0 errors. Run: `npm test` → green.
```bash
git add src/frontend/screens/home/components/ActiveTasksPeek.tsx
git commit -m "feat(home): add ActiveTasksPeek section"
```

---

## Task 13: `GroupHighlights` component

**Files:**
- Create: `src/frontend/screens/home/components/GroupHighlights.tsx`

- [ ] **Step 1: Implement**

Create `src/frontend/screens/home/components/GroupHighlights.tsx`:
```tsx
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '../../../components/common/AppText';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { useAppNavigation } from '../../../hooks/useAppNavigation';
import type { HomeGroupHighlight } from '../../../application/selectors';

interface Props {
  items: HomeGroupHighlight[];
}

const BingoMiniGrid = ({ size, doneCount, totalCount }: { size: number; doneCount: number; totalCount: number }) => {
  const cells = Array.from({ length: totalCount }, (_, i) => i < doneCount);
  return (
    <View style={[styles.miniGrid, { width: size * 16 }]}>
      {cells.map((on, i) => (
        <View key={i} style={[styles.miniCell, on ? styles.miniCellOn : styles.miniCellOff]} />
      ))}
    </View>
  );
};

export const GroupHighlights = ({ items }: Props) => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();

  return (
    <View style={styles.section}>
      <AppText variant="caption" color="muted" style={styles.sectionTitle}>
        {t('home.sections.groups')}
      </AppText>
      {items.length === 0 ? (
        <View style={styles.emptyCard}>
          <AppText variant="body" color="textSecondary">{t('home.empty.noGroups')}</AppText>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hScroll}
        >
          {items.map((g) => (
            <Pressable
              key={g.groupId}
              accessibilityRole="button"
              accessibilityLabel={g.name}
              onPress={() => navigation.navigate('GroupTasks', { groupId: g.groupId })}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            >
              <View style={styles.cardTop}>
                <AppText variant="label" color="textPrimary" numberOfLines={1} style={styles.cardName}>
                  {g.name}
                </AppText>
                <View style={styles.pill}>
                  <AppText variant="caption" color="textPrimary">
                    {g.bingo ? t('home.groups.bingoBadge') : t(`home.groups.${g.type}`)}
                  </AppText>
                </View>
              </View>
              {g.bingo ? (
                <>
                  <BingoMiniGrid size={g.bingo.size} doneCount={g.bingo.doneCount} totalCount={g.bingo.totalCount} />
                  <AppText variant="caption" color={g.bingo.hasBingo ? 'primary' : 'muted'}>
                    {g.bingo.hasBingo ? t('home.groups.bingoWin') : `${g.bingo.doneCount} / ${g.bingo.totalCount}`}
                  </AppText>
                </>
              ) : (
                <AppText variant="caption" color="muted">
                  {`${t('home.groups.taskCount', { count: g.taskCount })} · ${t('home.groups.memberCount', { count: g.memberCount })}`}
                </AppText>
              )}
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  sectionTitle: { letterSpacing: 1.2, textTransform: 'uppercase' },
  hScroll: { gap: spacing.md, paddingRight: spacing.md },
  emptyCard: {
    padding: spacing.md,
    borderRadius: 14,
    backgroundColor: colors.cardSurfaceTranslucent,
    borderWidth: 1,
    borderColor: colors.cardBorderTranslucent,
  },
  card: {
    width: 200,
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 18,
    backgroundColor: colors.cardSurfaceTranslucent,
    borderWidth: 1,
    borderColor: colors.cardBorderTranslucent,
  },
  cardPressed: { transform: [{ scale: 0.99 }] },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm },
  cardName: { flex: 1 },
  pill: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: 999, backgroundColor: colors.surfaceAlt },
  miniGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 2 },
  miniCell: { width: 14, height: 14, borderRadius: 3 },
  miniCellOn: { backgroundColor: colors.primary },
  miniCellOff: { backgroundColor: 'rgba(67, 38, 23, 0.18)' },
});
```

- [ ] **Step 2: Verify gate + commit**

Run: `npm run typecheck` → 0 errors. Run: `npm test` → green.
```bash
git add src/frontend/screens/home/components/GroupHighlights.tsx
git commit -m "feat(home): add GroupHighlights with bingo mini-grid"
```

---

## Task 14: `FriendsActivityFeed` component

**Files:**
- Create: `src/frontend/screens/home/components/FriendsActivityFeed.tsx`

- [ ] **Step 1: Implement**

Create `src/frontend/screens/home/components/FriendsActivityFeed.tsx`:
```tsx
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '../../../components/common/AppText';
import { EmptyState } from '../../../components/common/EmptyState';
import { ActivityItem } from '../../social/components/ActivityItem';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { useAppState } from '../../../application/AppStateContext';
import { useAppNavigation } from '../../../hooks/useAppNavigation';
import type { FeedItem } from '../../../services';

interface Props {
  feed: FeedItem[];
  loading: boolean;
  error: boolean;
  onRetry: () => void;
}

export const FriendsActivityFeed = ({ feed, loading, error, onRetry }: Props) => {
  const { t } = useTranslation();
  const { state } = useAppState();
  const navigation = useAppNavigation();

  const onPressFor = (item: FeedItem): (() => void) | undefined => {
    if (item.taskId && item.groupId && state.entities.tasks[item.taskId] && state.entities.taskGroups[item.groupId]) {
      const groupId = item.groupId;
      const taskId = item.taskId;
      return () => navigation.navigate('TaskDetail', { groupId, taskId });
    }
    if (item.groupId && state.entities.taskGroups[item.groupId]) {
      const groupId = item.groupId;
      return () => navigation.navigate('GroupTasks', { groupId });
    }
    return undefined;
  };

  return (
    <View style={styles.section}>
      <AppText variant="caption" color="muted" style={styles.sectionTitle}>
        {t('home.sections.activity')}
      </AppText>

      {error ? (
        <Pressable onPress={onRetry} accessibilityRole="button" style={styles.errorRow}>
          <AppText variant="label" color="textPrimary">{t('home.feed.errorTitle')}</AppText>
          <AppText variant="caption" color="primary">{t('home.feed.retry')}</AppText>
        </Pressable>
      ) : loading && feed.length === 0 ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : feed.length === 0 ? (
        <EmptyState icon="people-outline" title={t('home.empty.noActivity')} message={t('home.empty.noActivityHint')} />
      ) : (
        <View>
          {feed.map((item, index) => {
            const onPress = onPressFor(item);
            const key = `${item.type}-${item.createdAt}-${index}`;
            return onPress ? (
              <Pressable key={key} onPress={onPress} style={({ pressed }) => [pressed && styles.rowPressed]}>
                <ActivityItem item={item} />
              </Pressable>
            ) : (
              <ActivityItem key={key} item={item} />
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  sectionTitle: { letterSpacing: 1.2, textTransform: 'uppercase' },
  rowPressed: { opacity: 0.7 },
  loadingWrap: { paddingVertical: spacing.lg, alignItems: 'center' },
  errorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 14,
    backgroundColor: colors.cardSurfaceTranslucent,
    borderWidth: 1,
    borderColor: colors.cardBorderTranslucent,
  },
});
```

- [ ] **Step 2: Verify gate + commit**

Run: `npm run typecheck` → 0 errors. Run: `npm test` → green.
```bash
git add src/frontend/screens/home/components/FriendsActivityFeed.tsx
git commit -m "feat(home): add FriendsActivityFeed with safe row navigation"
```

---

## Task 15: `HomeScreen` orchestrator (move + compose) and wire navigation

**Files:**
- Create: `src/frontend/screens/home/HomeScreen.tsx`
- Delete: `src/frontend/screens/tasks/HomeScreen.tsx`
- Modify: `src/frontend/navigation/MainTabs.tsx:5`

- [ ] **Step 1: Create the orchestrator**

Create `src/frontend/screens/home/HomeScreen.tsx`:
```tsx
import React, { useMemo } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '../../components/layout/TopBar';
import { TAB_BAR_HEIGHT } from '../../components/layout/tabs';
import { colors } from '../../theme/colors';
import { spacing, SCREEN_PADDING_H } from '../../theme/spacing';
import { useAppState } from '../../application/AppStateContext';
import { useCurrentUserId } from '../../hooks/useCurrentUserId';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { useNotifications } from '../../application/NotificationsContext';
import { selectHomeActiveTasks, selectHomeGroupHighlights } from '../../application/selectors';
import { getGreetingKey } from './logic/greeting';
import { useHomeData } from './useHomeData';
import { GreetingHero } from './components/GreetingHero';
import { HomeNudges } from './components/HomeNudges';
import { StatsSnapshot } from './components/StatsSnapshot';
import { ActiveTasksPeek } from './components/ActiveTasksPeek';
import { GroupHighlights } from './components/GroupHighlights';
import { FriendsActivityFeed } from './components/FriendsActivityFeed';
import { HomeOnboarding } from './components/HomeOnboarding';

export const HomeScreen = () => {
  const { state } = useAppState();
  const currentUserId = useCurrentUserId();
  const navigation = useAppNavigation();
  const home = useHomeData(currentUserId);
  const notifications = useNotifications();

  const activeTasks = useMemo(
    () => selectHomeActiveTasks(state, currentUserId, 3),
    [state, currentUserId],
  );
  const groupHighlights = useMemo(
    () => selectHomeGroupHighlights(state, currentUserId, 6),
    [state, currentUserId],
  );

  const displayName = home.username ?? state.entities.users[currentUserId]?.username ?? '';
  const greetingKey = getGreetingKey(new Date().getHours());

  const isNewUser =
    !home.loading &&
    !home.error &&
    groupHighlights.length === 0 &&
    home.stats?.friendsCount === 0 &&
    home.feed.length === 0;

  const onRefresh = () => {
    void home.refresh();
    void notifications.refresh();
  };

  return (
    <View style={styles.root}>
      <TopBar />
      <SafeAreaView style={styles.body} edges={['left', 'right', 'bottom']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={home.refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        >
          <GreetingHero displayName={displayName} greetingKey={greetingKey} />

          {isNewUser ? (
            <HomeOnboarding />
          ) : (
            <>
              <HomeNudges pendingInvitations={home.pendingInvitations} />
              <StatsSnapshot stats={home.stats} onFriendsPress={() => navigation.navigate('Main', { screen: 'Friends' })} />
              <ActiveTasksPeek items={activeTasks} />
              <GroupHighlights items={groupHighlights} />
              <FriendsActivityFeed feed={home.feed} loading={home.loading} error={home.error} onRetry={onRefresh} />
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1 },
  content: {
    paddingHorizontal: SCREEN_PADDING_H,
    paddingTop: spacing.md,
    paddingBottom: TAB_BAR_HEIGHT + spacing.lg,
    gap: spacing.md,
  },
});
```

> Friends navigation uses the nested `Main`→`Friends` form (consistent with Tasks 6 and 10).

- [ ] **Step 2: Update the MainTabs import**

In `src/frontend/navigation/MainTabs.tsx`, change line 5 from:
```ts
import { HomeScreen } from '../screens/tasks/HomeScreen';
```
to:
```ts
import { HomeScreen } from '../screens/home/HomeScreen';
```

- [ ] **Step 3: Delete the old placeholder**

```bash
git rm src/frontend/screens/tasks/HomeScreen.tsx
```

- [ ] **Step 4: Verify gate**

Run: `npm run typecheck` → 0 errors.
Run: `npm test` → all green (152 + greeting + bingo-detection + 2 selectors = baseline + new).

- [ ] **Step 5: Manual smoke test (mock mode)**

Start the app (`npm start`) with `EXPO_PUBLIC_USE_HTTP_SERVICES` unset. On the **Home** tab, verify:
- Greeting hero shows the time-appropriate greeting + the dev username.
- Stats snapshot shows numbers (not `—`).
- "Jump back in" lists active tasks (e.g. *Weekly long run*, *Run 5 km*); tapping opens TaskDetail.
- "Your groups" scrolls horizontally; a bingo group shows the mini-grid and *Champion Bingo* shows the 🎉 win badge; tapping opens GroupTasks.
- "Friends' activity" shows seed feed items.
- The last item clears the floating tab bar (scroll to bottom).
- Pull-to-refresh works without error.

- [ ] **Step 6: Commit**

```bash
git add src/frontend/screens/home/HomeScreen.tsx src/frontend/navigation/MainTabs.tsx
git commit -m "feat(home): compose Home dashboard and move screen to screens/home"
```

---

## Task 16: `HomeOnboarding` component

**Files:**
- Create: `src/frontend/screens/home/components/HomeOnboarding.tsx`

> Referenced by `HomeScreen` (Task 15). Implement it **before** running Task 15's typecheck — i.e. do this task first if executing strictly top-to-bottom, or treat Tasks 15 and 16 as one unit. (Listed last because it's the simplest leaf.)

- [ ] **Step 1: Implement**

Create `src/frontend/screens/home/components/HomeOnboarding.tsx`:
```tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '../../../components/common/AppText';
import { AppButton } from '../../../components/common/AppButton';
import { OutlineButton } from '../../../components/common/OutlineButton';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { useAppNavigation } from '../../../hooks/useAppNavigation';

export const HomeOnboarding = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();

  return (
    <View style={styles.card}>
      <Ionicons name="sparkles-outline" size={48} color={colors.primary} />
      <AppText variant="h2" color="textPrimary" style={styles.center}>
        {t('home.onboarding.title')}
      </AppText>
      <AppText variant="body" color="textSecondary" style={styles.center}>
        {t('home.onboarding.message')}
      </AppText>
      <View style={styles.actions}>
        <AppButton title={t('home.onboarding.ctaCreateGroup')} onPress={() => navigation.navigate('CreateGroup')} />
        <OutlineButton
          title={t('home.onboarding.ctaAddFriends')}
          onPress={() => navigation.navigate('Main', { screen: 'Friends', params: { initialTab: 'addFriend' } })}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: 18,
    backgroundColor: colors.cardSurfaceTranslucent,
    borderWidth: 1,
    borderColor: colors.cardBorderTranslucent,
  },
  center: { textAlign: 'center' },
  actions: { alignSelf: 'stretch', gap: spacing.sm, marginTop: spacing.sm },
});
```

> `sparkles-outline` is a valid Ionicons name (same family used by `EmptyState` callers).

- [ ] **Step 2: Verify gate + commit**

Run: `npm run typecheck` → 0 errors. Run: `npm test` → green.
```bash
git add src/frontend/screens/home/components/HomeOnboarding.tsx
git commit -m "feat(home): add HomeOnboarding empty-state for new users"
```

---

## Task 17: Final verification

- [ ] **Step 1: Full gate**

Run: `npm run typecheck` → 0 errors.
Run: `npm test` → all green. Note the new total (baseline 152 + greeting (1) + bingo-detection (7) + home-active-tasks (3) + home-group-highlights (4)).

- [ ] **Step 2: Spec cross-check**

Re-read `docs/superpowers/specs/2026-06-16-home-main-page-design.md` §4 and confirm each section (4.1–4.7), the pull-to-refresh, and the supporting changes (§7) are implemented.

- [ ] **Step 3: Manual smoke (both empty and populated)**

- Populated dev user (mock): all sections render; nudges appear when there are unread notifications / pending invitations; deep links work.
- New-user path: temporarily point at a user with no groups/friends/feed (or stub) and confirm the consolidated onboarding card replaces sections 2–6 while the greeting still shows.

- [ ] **Step 4: Branch is ready to push**

Confirm `git status` is clean and all commits are on `frontend/mainpage`. (Pushing + PR is the user's action.)

---

## Notes on TDD scope

The pure logic (`bingoDetection`, `greeting`, `selectHomeActiveTasks`, `selectHomeGroupHighlights`) is developed test-first with node tests — that is where the real behavior lives. RN components and the `useHomeData` hook import native/Expo modules and therefore **cannot** run in the node test env (project rule: tested files contain no native imports); they are verified by `npm run typecheck` and the manual smoke tests in Tasks 15 and 17. Keep any future testable logic in the pure modules above.

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
        g2: makeGroup({ name: 'Other', ownerUserId: 'u2', memberIds: [], taskIds: ['t6'] }),
      },
      tasks: {
        t1: makeTask({ name: 'Run', goal: 5, progressId: 'p1' }),
        t2: makeTask({ name: 'Stretch', goal: 1, progressId: 'p2' }),
        t3: makeTask({ name: 'Recipes', goal: 3, progressId: 'p3' }),
        t4: makeTask({ name: 'Broken', goal: 0, progressId: 'p4' }),
        t5: makeTask({ name: 'Bike', goal: 50, progressId: 'p5' }),
        t6: makeTask({ name: 'Foreign', goal: 9, progressId: 'p6' }),
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
    expect(ids).not.toContain('t2');
    expect(ids).not.toContain('t4');
    expect(ids).not.toContain('t6');
    expect(ids).toHaveLength(3);
  });

  it('sorts by most-recent progress desc, tasks without progress last (tie-break by name)', () => {
    const ids = selectHomeActiveTasks(fixture(), 'u1', 10).map((t) => t.taskId);
    expect(ids).toEqual(['t5', 't1', 't3']);
  });

  it('respects the limit and carries display fields', () => {
    const top = selectHomeActiveTasks(fixture(), 'u1', 1);
    expect(top).toHaveLength(1);
    expect(top[0]).toMatchObject({ taskId: 't5', groupId: 'g1', groupName: 'Marathon', name: 'Bike', value: 30, goal: 50, color: '#2563EB' });
  });

  it('uses the latest progress entry when a task has several', () => {
    const params = { photoRequired: false, color: '#2563EB', notifications: false };
    const base = createInitialFrontendState();
    const state: FrontendState = {
      ...base,
      entities: {
        ...base.entities,
        taskGroups: {
          g: { name: 'G', ownerUserId: 'u1', privacy: 'private', type: 'cooperative', isBingo: false, inviteCode: 'X', taskIds: ['a', 'b'], memberIds: [], memberRoles: {} },
        },
        tasks: {
          a: { name: 'Alpha', goal: 10, progressId: 'pa', params },
          b: { name: 'Beta', goal: 10, progressId: 'pb', params },
        },
        taskProgresses: { pa: { value: 1 }, pb: { value: 1 } },
        progressEntries: {
          // task a's most recent entry (2026-06-20) is newer than task b's only entry (2026-06-18),
          // even though task a also has an older entry (2026-06-01).
          a1: { taskId: 'a', value: 1, commentIds: [], createdAt: '2026-06-01T00:00:00.000Z' },
          a2: { taskId: 'a', value: 1, commentIds: [], createdAt: '2026-06-20T00:00:00.000Z' },
          b1: { taskId: 'b', value: 1, commentIds: [], createdAt: '2026-06-18T00:00:00.000Z' },
        },
      },
    };
    const ids = selectHomeActiveTasks(state, 'u1', 10).map((t) => t.taskId);
    expect(ids).toEqual(['a', 'b']); // a wins because its latest entry (06-20) > b's (06-18)
  });
});

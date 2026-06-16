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

// A 3x3 bingo whose first row (b0,b1,b2) is done -> hasBingo true, 3/9 done.
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

  it('reports hasBingo false when no line is complete', () => {
    const s = bingoFixture();
    // bingoFixture marks b0,b1,b2 done (first row). Break the row so no line is complete:
    s.entities.taskProgresses.bp1 = { value: 0 };
    s.entities.taskProgresses.bp2 = { value: 0 };
    s.entities.taskProgresses.bp4 = { value: 1 }; // now only b0 and b4 are done -> no full line
    const bingo = selectHomeGroupHighlights(s, 'u1', 10).find((g) => g.groupId === 'bg');
    expect(bingo?.bingo).toEqual({ size: 3, doneCount: 2, totalCount: 9, hasBingo: false });
  });

  it('sorts groups by most-recent task progress (newest first)', () => {
    const base = createInitialFrontendState();
    const state: FrontendState = {
      ...base,
      entities: {
        ...base.entities,
        taskGroups: {
          older: makeGroup({ name: 'Older', ownerUserId: 'u1', inviteCode: 'X', taskIds: ['o1'] }),
          newer: makeGroup({ name: 'Newer', ownerUserId: 'u1', inviteCode: 'Y', taskIds: ['n1'] }),
        },
        tasks: {
          o1: makeTask({ name: 'O', goal: 10, progressId: 'op' }),
          n1: makeTask({ name: 'N', goal: 10, progressId: 'np' }),
        },
        taskProgresses: { op: { value: 1 }, np: { value: 1 } },
        progressEntries: {
          oe: { taskId: 'o1', value: 1, commentIds: [], createdAt: '2026-06-01T00:00:00.000Z' },
          ne: { taskId: 'n1', value: 1, commentIds: [], createdAt: '2026-06-20T00:00:00.000Z' },
        },
      },
    };
    const ids = selectHomeGroupHighlights(state, 'u1', 10).map((g) => g.groupId);
    expect(ids).toEqual(['newer', 'older']); // newer's entry (06-20) is more recent than older's (06-01)
  });
});

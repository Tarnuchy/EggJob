import { reduceFrontendState } from '../../../../src/frontend/application/reducer';
import { createInitialFrontendState } from '../../../../src/frontend/application/state';

const setup = () => {
  let state = createInitialFrontendState();
  const reg = reduceFrontendState(state, {
    type: 'auth/register',
    accountId: 'acc-1',
    userId: 'usr-1',
    email: 'runner@example.com',
    username: 'runner_1',
  });
  if (!reg.ok) throw new Error('register');
  state = reg.value;

  const grp = reduceFrontendState(state, {
    type: 'task-groups/create',
    groupId: 'grp-1',
    ownerUserId: 'usr-1',
    name: 'G',
    privacy: 'friends',
  });
  if (!grp.ok) throw new Error('group');
  state = grp.value;

  const tsk = reduceFrontendState(state, {
    type: 'tasks/create',
    taskId: 'tsk-1',
    groupId: 'grp-1',
    progressId: 'prg-1',
    name: 'Goal task',
    goal: 5,
    status: 'active',
    params: { photoRequired: false, color: 'blue', notifications: false },
  });
  if (!tsk.ok) throw new Error('task');
  state = tsk.value;

  const p1 = reduceFrontendState(state, {
    type: 'tasks/add-progress',
    entryId: 'e1',
    taskId: 'tsk-1',
    authorUserId: 'usr-1',
    value: 3,
    note: 'first',
  });
  if (!p1.ok) throw new Error('p1');
  state = p1.value;

  const p2 = reduceFrontendState(state, {
    type: 'tasks/add-progress',
    entryId: 'e2',
    taskId: 'tsk-1',
    authorUserId: 'usr-1',
    value: 2,
    note: 'second',
  });
  if (!p2.ok) throw new Error('p2');
  return p2.value; // taskProgresses prg-1 === 5
};

describe('Delete progress entry reducer', () => {
  it('removes the entry and decrements the aggregate by its value', () => {
    const state = setup();
    expect(state.entities.taskProgresses['prg-1']?.value).toBe(5);

    const result = reduceFrontendState(state, {
      type: 'tasks/delete-progress-entry',
      entryId: 'e2',
      taskId: 'tsk-1',
      value: 2,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.entities.progressEntries['e2']).toBeUndefined();
    expect(result.value.entities.progressEntries['e1']).toBeDefined();
    expect(result.value.entities.taskProgresses['prg-1']?.value).toBe(3);
  });

  it('clamps the aggregate at zero when the value exceeds current progress', () => {
    const state = setup();
    const result = reduceFrontendState(state, {
      type: 'tasks/delete-progress-entry',
      entryId: 'e1',
      taskId: 'tsk-1',
      value: 99,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.entities.taskProgresses['prg-1']?.value).toBe(0);
  });

  it('is a no-op-safe success when the entry is absent from state (HTTP-sourced timeline)', () => {
    const state = setup();
    const result = reduceFrontendState(state, {
      type: 'tasks/delete-progress-entry',
      entryId: 'not-in-state',
      taskId: 'tsk-1',
      value: 0,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.entities.taskProgresses['prg-1']?.value).toBe(5);
  });
});

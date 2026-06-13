import { reduceFrontendState } from '../../../../src/frontend/application/reducer';
import { createInitialFrontendState } from '../../../../src/frontend/application/state';

const prepareGroup = () => {
  const empty = createInitialFrontendState();
  const registered = reduceFrontendState(empty, {
    type: 'auth/register',
    accountId: 'acc-1',
    userId: 'usr-1',
    email: 'runner@example.com',
    username: 'runner_1',
    passwordHash: 'hash-1',
    registrationDate: new Date('2026-04-03T12:00:00.000Z'),
  });

  if (!registered.ok) {
    throw new Error('Expected precondition to register user');
  }

  const groupCreated = reduceFrontendState(registered.value, {
    type: 'task-groups/create',
    groupId: 'grp-1',
    ownerUserId: 'usr-1',
    name: 'Grupa treningowa',
    privacy: 'friends',
    createdAt: new Date('2026-04-03T12:01:00.000Z'),
  });

  if (!groupCreated.ok) {
    throw new Error('Expected precondition to create group');
  }

  return groupCreated.value;
};

describe('Task and progress reducer (UC-28, UC-32)', () => {
  it('creates task with default progress entity', () => {
    const state = prepareGroup();

    const result = reduceFrontendState(state, {
      type: 'tasks/create',
      taskId: 'tsk-1',
      groupId: 'grp-1',
      progressId: 'prg-1',
      name: '10 km biegu',
      goal: 10,
      status: 'active',
      kind: 'one-time',
      params: {
        photoRequired: false,
        color: 'blue',
        notifications: true,
      },
      createdAt: new Date('2026-04-03T12:02:00.000Z'),
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.entities.tasks['tsk-1']?.name).toBe('10 km biegu');
    expect(result.value.entities.taskProgresses['prg-1']?.value).toBe(0);
    expect(result.value.entities.taskGroups['grp-1']?.taskIds).toContain('tsk-1');
  });

  it('adds progress entry and updates current progress value', () => {
    const state = prepareGroup();
    const taskCreated = reduceFrontendState(state, {
      type: 'tasks/create',
      taskId: 'tsk-1',
      groupId: 'grp-1',
      progressId: 'prg-1',
      name: '10 km biegu',
      goal: 10,
      status: 'active',
      kind: 'one-time',
      params: {
        photoRequired: false,
        color: 'blue',
        notifications: true,
      },
      createdAt: new Date('2026-04-03T12:02:00.000Z'),
    });

    expect(taskCreated.ok).toBe(true);
    if (!taskCreated.ok) return;

    const progressAdded = reduceFrontendState(taskCreated.value, {
      type: 'tasks/add-progress',
      entryId: 'ent-1',
      taskId: 'tsk-1',
      authorUserId: 'usr-1',
      value: 4,
      note: 'Pierwszy trening',
      createdAt: new Date('2026-04-03T18:00:00.000Z'),
    });

    expect(progressAdded.ok).toBe(true);
    if (!progressAdded.ok) return;

    expect(progressAdded.value.entities.progressEntries['ent-1']?.value).toBe(4);
    expect(progressAdded.value.entities.taskProgresses['prg-1']?.value).toBe(4);
  });

  it('rejects negative progress value', () => {
    const state = prepareGroup();
    const taskCreated = reduceFrontendState(state, {
      type: 'tasks/create',
      taskId: 'tsk-1',
      groupId: 'grp-1',
      progressId: 'prg-1',
      name: '10 km biegu',
      goal: 10,
      status: 'active',
      kind: 'one-time',
      params: {
        photoRequired: false,
        color: 'blue',
        notifications: true,
      },
      createdAt: new Date('2026-04-03T12:02:00.000Z'),
    });

    expect(taskCreated.ok).toBe(true);
    if (!taskCreated.ok) return;

    const progressAdded = reduceFrontendState(taskCreated.value, {
      type: 'tasks/add-progress',
      entryId: 'ent-1',
      taskId: 'tsk-1',
      authorUserId: 'usr-1',
      value: -1,
      note: 'Błędny wpis',
      createdAt: new Date('2026-04-03T18:00:00.000Z'),
    });

    expect(progressAdded.ok).toBe(false);
    if (progressAdded.ok) return;

    expect(progressAdded.error.code).toBe('validation');
    expect(progressAdded.error.field).toBe('value');
  });

  it('sets absolute progress value and can toggle it back to zero (bingo toggle)', () => {
    const state = prepareGroup();
    const taskCreated = reduceFrontendState(state, {
      type: 'tasks/create',
      taskId: 'tsk-1',
      groupId: 'grp-1',
      progressId: 'prg-1',
      name: 'Komórka bingo',
      goal: 1,
      status: 'active',
      kind: 'one_time',
      params: { photoRequired: false, color: 'blue', notifications: false },
    });
    if (!taskCreated.ok) throw new Error('Expected precondition to create task');

    const marked = reduceFrontendState(taskCreated.value, {
      type: 'tasks/set-progress',
      taskId: 'tsk-1',
      value: 1,
    });
    expect(marked.ok).toBe(true);
    if (!marked.ok) return;
    expect(marked.value.entities.taskProgresses['prg-1']?.value).toBe(1);

    const unmarked = reduceFrontendState(marked.value, {
      type: 'tasks/set-progress',
      taskId: 'tsk-1',
      value: 0,
    });
    expect(unmarked.ok).toBe(true);
    if (!unmarked.ok) return;
    expect(unmarked.value.entities.taskProgresses['prg-1']?.value).toBe(0);
  });

  it('rejects negative set-progress value', () => {
    const state = prepareGroup();
    const taskCreated = reduceFrontendState(state, {
      type: 'tasks/create',
      taskId: 'tsk-1',
      groupId: 'grp-1',
      progressId: 'prg-1',
      name: 'Komórka bingo',
      goal: 1,
      status: 'active',
      kind: 'one_time',
      params: { photoRequired: false, color: 'blue', notifications: false },
    });
    if (!taskCreated.ok) throw new Error('Expected precondition to create task');

    const result = reduceFrontendState(taskCreated.value, {
      type: 'tasks/set-progress',
      taskId: 'tsk-1',
      value: -1,
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe('validation');
    expect(result.error.field).toBe('value');
  });
});

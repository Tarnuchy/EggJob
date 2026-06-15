import { reduceFrontendState } from '../../../../src/frontend/application/reducer';
import { createInitialFrontendState } from '../../../../src/frontend/application/state';

const prepareTask = () => {
  let state = createInitialFrontendState();

  const registered = reduceFrontendState(state, {
    type: 'auth/register',
    accountId: 'acc-1',
    userId: 'usr-1',
    email: 'runner@example.com',
    username: 'runner_1',
    passwordHash: 'hash-1',
  });
  if (!registered.ok) throw new Error('Expected precondition to register user');
  state = registered.value;

  const groupCreated = reduceFrontendState(state, {
    type: 'task-groups/create',
    groupId: 'grp-1',
    ownerUserId: 'usr-1',
    name: 'Grupa',
    privacy: 'friends',
  });
  if (!groupCreated.ok) throw new Error('Expected precondition to create group');
  state = groupCreated.value;

  const taskCreated = reduceFrontendState(state, {
    type: 'tasks/create',
    taskId: 'tsk-1',
    groupId: 'grp-1',
    progressId: 'prg-1',
    name: 'Zadanie ze zdjęciem',
    goal: 10,
    status: 'active',
    params: { photoRequired: true, color: 'blue', notifications: false },
  });
  if (!taskCreated.ok) throw new Error('Expected precondition to create task');
  return taskCreated.value;
};

describe('Progress entry photo', () => {
  it('stores the photo URL on the progress entry when provided', () => {
    const state = prepareTask();

    const result = reduceFrontendState(state, {
      type: 'tasks/add-progress',
      entryId: 'ent-1',
      taskId: 'tsk-1',
      authorUserId: 'usr-1',
      value: 2,
      note: 'Z dowodem',
      photoUrl: '/media/proof-1.png',
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.entities.progressEntries['ent-1']?.photoUrl).toBe('/media/proof-1.png');
  });

  it('leaves the photo URL undefined when none is provided', () => {
    const state = prepareTask();

    const result = reduceFrontendState(state, {
      type: 'tasks/add-progress',
      entryId: 'ent-1',
      taskId: 'tsk-1',
      authorUserId: 'usr-1',
      value: 2,
      note: '',
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.entities.progressEntries['ent-1']?.photoUrl).toBeUndefined();
  });
});

import { mockTaskService } from '../../../../src/frontend/services/mock/MockTaskService';

describe('MockTaskService progress history (getProgressEntries)', () => {
  it('returns the stored photoUrl, message and createdAt for an entry', async () => {
    await mockTaskService.addProgress({
      entryId: 'e-hist-1',
      taskId: 'tsk-hist',
      authorUserId: 'usr-seed-1',
      value: 2,
      note: 'with proof',
      photoUrl: '/media/abc.png',
    });

    const res = await mockTaskService.getProgressEntries('tsk-hist');
    expect(res.ok).toBe(true);
    if (!res.ok) return;

    const entry = res.value.find((e) => e.entryId === 'e-hist-1');
    expect(entry).toBeDefined();
    expect(entry?.photoUrl).toBe('/media/abc.png');
    expect(entry?.message).toBe('with proof');
    expect(typeof entry?.createdAt).toBe('string');
  });

  it('records an entry even when the task is absent from the local mock store', async () => {
    await mockTaskService.addProgress({
      entryId: 'e-hist-2',
      taskId: 'tsk-not-local',
      authorUserId: 'usr-seed-1',
      value: 1,
      note: '',
    });

    const res = await mockTaskService.getProgressEntries('tsk-not-local');
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.value.some((e) => e.entryId === 'e-hist-2')).toBe(true);
  });
});

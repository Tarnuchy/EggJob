import { mockTaskService } from '../../../../src/frontend/services/mock/MockTaskService';
import { mockTaskGroupService } from '../../../../src/frontend/services/mock/MockTaskGroupService';

// W trybie mock źródłem prawdy klienta jest reducer (AppState). Mock-serwisy nie mogą
// odrzucać mutacji tylko dlatego, że dany byt nie istnieje w ich lokalnym (niepełnym) store —
// inaczej edycja zaseedowanych przez reducer tasków/grup cicho się nie powodzi.
describe('Mock service mutations on reducer-seeded (non-local) entities', () => {
  it('editTask succeeds for a task id absent from the mock store', async () => {
    const result = await mockTaskService.editTask('tsk-not-in-mock-store', {
      params: { photoRequired: false },
    });
    expect(result.ok).toBe(true);
  });

  it('addProgress succeeds for a task id absent from the mock store', async () => {
    const result = await mockTaskService.addProgress({
      entryId: 'entry-not-in-mock-store',
      taskId: 'tsk-not-in-mock-store',
      authorUserId: 'usr-seed-1',
      value: 3,
      note: '',
    });
    expect(result.ok).toBe(true);
  });

  it('addProgress still rejects negative values (genuine validation preserved)', async () => {
    const result = await mockTaskService.addProgress({
      entryId: 'entry-negative',
      taskId: 'tsk-not-in-mock-store',
      authorUserId: 'usr-seed-1',
      value: -1,
      note: '',
    });
    expect(result.ok).toBe(false);
  });

  it('setProgress succeeds for a task id absent from the mock store', async () => {
    const result = await mockTaskService.setProgress({
      taskId: 'tsk-not-in-mock-store',
      authorUserId: 'usr-seed-1',
      value: 1,
    });
    expect(result.ok).toBe(true);
  });

  it('setProgress rejects negative values', async () => {
    const result = await mockTaskService.setProgress({
      taskId: 'tsk-not-in-mock-store',
      authorUserId: 'usr-seed-1',
      value: -1,
    });
    expect(result.ok).toBe(false);
  });

  it('editGroup succeeds for a group id absent from the mock store', async () => {
    const result = await mockTaskGroupService.editGroup('grp-not-in-mock-store', {
      name: 'Renamed group',
    });
    expect(result.ok).toBe(true);
  });

  it('changeRole succeeds for a group/member absent from the mock store', async () => {
    const result = await mockTaskGroupService.changeRole('grp-not-in-mock-store', 'usr-seed-3', 'admin');
    expect(result.ok).toBe(true);
  });

  it('changeRole still rejects promotion to owner (genuine validation preserved)', async () => {
    const result = await mockTaskGroupService.changeRole('grp-not-in-mock-store', 'usr-seed-3', 'owner');
    expect(result.ok).toBe(false);
  });
});

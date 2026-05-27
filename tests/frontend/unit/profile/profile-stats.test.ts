import { MockProfileService } from '../../../../src/frontend/services/mock/MockProfileService';

describe('MockProfileService.getUserStats', () => {
  it('returns seeded stats for a known user', async () => {
    const service = new MockProfileService();
    const result = await service.getUserStats('usr-seed-1');

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toEqual({
      activeTasks: 4,
      completedTasks: 12,
      friendsCount: 2,
      bestStreak: 7,
    });
  });

  it('fails for an unknown user', async () => {
    const service = new MockProfileService();
    const result = await service.getUserStats('usr-does-not-exist');
    expect(result.ok).toBe(false);
  });
});

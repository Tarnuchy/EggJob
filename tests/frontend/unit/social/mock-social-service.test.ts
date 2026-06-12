import { MockSocialService } from '../../../../src/frontend/services/mock/MockSocialService';

describe('MockSocialService friend-graph extensions', () => {
  it('lists invitations the user has sent', async () => {
    const service = new MockSocialService();
    const result = await service.getSentInvitations('usr-seed-1');

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toContainEqual({ invitationId: 'inv-seed-3', toUserId: 'usr-seed-6' });
  });

  it('cancels a sent invitation', async () => {
    const service = new MockSocialService();
    const cancelled = await service.cancelInvitation('inv-seed-3');
    expect(cancelled.ok).toBe(true);

    const result = await service.getSentInvitations('usr-seed-1');
    if (!result.ok) return;
    expect(result.value).toHaveLength(0);
  });

  it('fails to cancel an unknown invitation', async () => {
    const service = new MockSocialService();
    const result = await service.cancelInvitation('inv-does-not-exist');
    expect(result.ok).toBe(false);
  });

  it('returns friend activity newest-first', async () => {
    const service = new MockSocialService();
    const result = await service.getUserFeed('usr-seed-1');

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.length).toBeGreaterThan(0);
    const dates = result.value.map((item) => item.createdAt);
    expect(dates).toEqual([...dates].sort((a, b) => b.localeCompare(a)));
  });
});

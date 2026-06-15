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

describe('MockSocialService.getFriends pagination', () => {
  it('returns the first page with total and display data resolved from profiles', async () => {
    const service = new MockSocialService();
    const result = await service.getFriends('usr-seed-1', { limit: 1, offset: 0 });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.total).toBe(2);
    expect(result.value.items).toHaveLength(1);
    // friends ordered by username asc (parity with backend) → bob before erin
    expect(result.value.items[0].friendUserId).toBe('usr-seed-2');
    expect(result.value.items[0].username).toBe('bob');
  });

  it('returns the second page at the given offset', async () => {
    const service = new MockSocialService();
    const result = await service.getFriends('usr-seed-1', { limit: 1, offset: 1 });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.total).toBe(2);
    expect(result.value.items).toHaveLength(1);
    expect(result.value.items[0].friendUserId).toBe('usr-seed-5');
    expect(result.value.items[0].username).toBe('erin');
  });

  it('returns the whole first page when no options are given', async () => {
    const service = new MockSocialService();
    const result = await service.getFriends('usr-seed-1');

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.total).toBe(2);
    expect(result.value.items).toHaveLength(2);
  });
});

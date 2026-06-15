import { MockNotificationService } from '../../../../src/frontend/services/mock/MockNotificationService';

describe('MockNotificationService', () => {
  it('returns the seeded notifications newest-first with a total', async () => {
    const service = new MockNotificationService();
    const result = await service.getNotifications('usr-seed-1');

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.total).toBe(4);
    expect(result.value.items.length).toBe(4);
    const dates = result.value.items.map((item) => item.date);
    expect(dates).toEqual([...dates].sort((a, b) => b.localeCompare(a)));
  });

  it('paginates with limit/offset while reporting the full total', async () => {
    const service = new MockNotificationService();

    const firstPage = await service.getNotifications('usr-seed-1', { limit: 2, offset: 0 });
    expect(firstPage.ok).toBe(true);
    if (!firstPage.ok) return;
    expect(firstPage.value.total).toBe(4);
    expect(firstPage.value.items).toHaveLength(2);

    const secondPage = await service.getNotifications('usr-seed-1', { limit: 2, offset: 2 });
    if (!secondPage.ok) return;
    expect(secondPage.value.total).toBe(4);
    expect(secondPage.value.items).toHaveLength(2);

    // pages must not overlap
    const firstIds = firstPage.value.items.map((item) => item.notificationId);
    const secondIds = secondPage.value.items.map((item) => item.notificationId);
    expect(firstIds.some((id) => secondIds.includes(id))).toBe(false);
  });

  it('marks a single notification as read', async () => {
    const service = new MockNotificationService();
    const before = await service.getNotifications('usr-seed-1');
    if (!before.ok) throw new Error('expected seeded notifications');

    const unread = before.value.items.find((item) => item.active);
    expect(unread).toBeDefined();
    if (!unread) return;

    const marked = await service.markAsRead(unread.notificationId);
    expect(marked.ok).toBe(true);

    const after = await service.getNotifications('usr-seed-1');
    if (!after.ok) return;
    expect(
      after.value.items.find((item) => item.notificationId === unread.notificationId)?.active,
    ).toBe(false);
  });

  it('marks every notification for the user as read', async () => {
    const service = new MockNotificationService();
    await service.markAllAsRead('usr-seed-1');

    const result = await service.getNotifications('usr-seed-1');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.items.every((item) => !item.active)).toBe(true);
  });

  it('fails to mark an unknown notification as read', async () => {
    const service = new MockNotificationService();
    const result = await service.markAsRead('ntf-does-not-exist');
    expect(result.ok).toBe(false);
  });
});

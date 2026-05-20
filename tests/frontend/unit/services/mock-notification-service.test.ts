import { MockNotificationService } from '../../../../src/frontend/services/mock/MockNotificationService';

describe('MockNotificationService', () => {
  it('returns the seeded notifications newest-first', async () => {
    const service = new MockNotificationService();
    const result = await service.getNotifications('usr-seed-1');

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.length).toBeGreaterThan(0);
    const dates = result.value.map((item) => item.date);
    expect(dates).toEqual([...dates].sort((a, b) => b.localeCompare(a)));
  });

  it('marks a single notification as read', async () => {
    const service = new MockNotificationService();
    const before = await service.getNotifications('usr-seed-1');
    if (!before.ok) throw new Error('expected seeded notifications');

    const unread = before.value.find((item) => item.active);
    expect(unread).toBeDefined();
    if (!unread) return;

    const marked = await service.markAsRead(unread.notificationId);
    expect(marked.ok).toBe(true);

    const after = await service.getNotifications('usr-seed-1');
    if (!after.ok) return;
    expect(
      after.value.find((item) => item.notificationId === unread.notificationId)?.active,
    ).toBe(false);
  });

  it('marks every notification for the user as read', async () => {
    const service = new MockNotificationService();
    await service.markAllAsRead('usr-seed-1');

    const result = await service.getNotifications('usr-seed-1');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.every((item) => !item.active)).toBe(true);
  });

  it('fails to mark an unknown notification as read', async () => {
    const service = new MockNotificationService();
    const result = await service.markAsRead('ntf-does-not-exist');
    expect(result.ok).toBe(false);
  });
});

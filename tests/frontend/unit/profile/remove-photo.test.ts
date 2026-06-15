import { MockProfileService } from '../../../../src/frontend/services/mock/MockProfileService';

describe('MockProfileService.removeProfilePhoto', () => {
  it('clears a previously set profile photo', async () => {
    const svc = new MockProfileService();

    await svc.editProfile('usr-seed-1', { photoUrl: '/media/abc.png' });
    const before = await svc.getProfile('usr-seed-1');
    expect(before.ok && before.value.photoUrl).toBe('/media/abc.png');

    const removed = await svc.removeProfilePhoto('usr-seed-1');
    expect(removed.ok).toBe(true);

    const after = await svc.getProfile('usr-seed-1');
    expect(after.ok).toBe(true);
    if (!after.ok) return;
    expect(after.value.photoUrl).toBeUndefined();
  });

  it('is a safe no-op for an unknown user', async () => {
    const svc = new MockProfileService();
    const removed = await svc.removeProfilePhoto('usr-does-not-exist');
    expect(removed.ok).toBe(true);
  });
});

import { reduceFrontendState } from '../../../../src/frontend/application/reducer';
import { createInitialFrontendState } from '../../../../src/frontend/application/state';

describe('Registration with photo', () => {
  it('stores the photo URL on the created user when provided', () => {
    const state = createInitialFrontendState();

    const result = reduceFrontendState(state, {
      type: 'auth/register',
      accountId: 'acc-1',
      userId: 'usr-1',
      email: 'anna@example.com',
      username: 'anna_fit',
      photoUrl: '/media/anna.png',
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.entities.users['usr-1']?.photoUrl).toBe('/media/anna.png');
  });

  it('omits the photo URL when none is provided', () => {
    const state = createInitialFrontendState();

    const result = reduceFrontendState(state, {
      type: 'auth/register',
      accountId: 'acc-1',
      userId: 'usr-1',
      email: 'anna@example.com',
      username: 'anna_fit',
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.entities.users['usr-1']?.photoUrl).toBeUndefined();
  });
});

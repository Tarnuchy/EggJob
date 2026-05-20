import { deriveFriendRelationship } from '../../../../src/frontend/utils/friendRelationship';

const base = {
  currentUserId: 'me',
  friends: [] as Array<{ friendshipId: string; friendUserId: string }>,
  sentInvitations: [] as Array<{ invitationId: string; toUserId: string }>,
  receivedInvitations: [] as Array<{ invitationId: string; fromUserId: string }>,
};

describe('deriveFriendRelationship', () => {
  it('detects the current user viewing their own profile', () => {
    expect(deriveFriendRelationship({ ...base, targetUserId: 'me' })).toEqual({ status: 'self' });
  });

  it('detects the absence of any relationship', () => {
    expect(deriveFriendRelationship({ ...base, targetUserId: 'x' })).toEqual({ status: 'none' });
  });

  it('detects an existing friendship', () => {
    expect(
      deriveFriendRelationship({
        ...base,
        targetUserId: 'x',
        friends: [{ friendshipId: 'fr1', friendUserId: 'x' }],
      }),
    ).toEqual({ status: 'friend', friendshipId: 'fr1' });
  });

  it('detects a sent invitation', () => {
    expect(
      deriveFriendRelationship({
        ...base,
        targetUserId: 'x',
        sentInvitations: [{ invitationId: 'inv1', toUserId: 'x' }],
      }),
    ).toEqual({ status: 'invite-sent', invitationId: 'inv1' });
  });

  it('detects a received invitation', () => {
    expect(
      deriveFriendRelationship({
        ...base,
        targetUserId: 'x',
        receivedInvitations: [{ invitationId: 'inv2', fromUserId: 'x' }],
      }),
    ).toEqual({ status: 'invite-received', invitationId: 'inv2' });
  });

  it('prefers an existing friendship over pending invitations', () => {
    expect(
      deriveFriendRelationship({
        ...base,
        targetUserId: 'x',
        friends: [{ friendshipId: 'fr1', friendUserId: 'x' }],
        receivedInvitations: [{ invitationId: 'inv2', fromUserId: 'x' }],
      }),
    ).toEqual({ status: 'friend', friendshipId: 'fr1' });
  });

  it('prefers a received invitation over a sent one', () => {
    expect(
      deriveFriendRelationship({
        ...base,
        targetUserId: 'x',
        sentInvitations: [{ invitationId: 'inv1', toUserId: 'x' }],
        receivedInvitations: [{ invitationId: 'inv2', fromUserId: 'x' }],
      }),
    ).toEqual({ status: 'invite-received', invitationId: 'inv2' });
  });
});

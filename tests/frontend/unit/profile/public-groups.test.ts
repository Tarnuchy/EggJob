import { describe, expect, it } from 'vitest';
import { createInitialFrontendState } from '../../../../src/frontend/application/state';
import type { FrontendState, TaskGroup } from '../../../../src/frontend/application/state';
import { selectPublicTaskGroupsByMember } from '../../../../src/frontend/application/selectors';

function makeGroup(over: Partial<TaskGroup>): TaskGroup {
  return {
    name: 'G', ownerUserId: 'u1', privacy: 'private', type: 'cooperative',
    isBingo: false, inviteCode: 'X', taskIds: [], memberIds: [], memberRoles: {}, ...over,
  };
}

function fixture(): FrontendState {
  const s = createInitialFrontendState();
  return {
    ...s,
    entities: {
      ...s.entities,
      taskGroups: {
        pubOwned: makeGroup({ name: 'Public Owned', ownerUserId: 'u1', privacy: 'public' }),
        pubMember: makeGroup({ name: 'Public Member', ownerUserId: 'u2', privacy: 'public', memberIds: ['u1'] }),
        privOwned: makeGroup({ name: 'Private Owned', ownerUserId: 'u1', privacy: 'private' }),
        friendsOwned: makeGroup({ name: 'Friends Only', ownerUserId: 'u1', privacy: 'friends' }),
        foreign: makeGroup({ name: 'Foreign Public', ownerUserId: 'u2', privacy: 'public', memberIds: ['u3'] }),
      },
    },
  };
}

describe('selectPublicTaskGroupsByMember', () => {
  it('returns only public groups the user owns or belongs to', () => {
    const ids = selectPublicTaskGroupsByMember(fixture(), 'u1').map((g) => g.id);
    expect(ids).toEqual(expect.arrayContaining(['pubOwned', 'pubMember']));
    expect(ids).toHaveLength(2);
  });

  it('hides private and friends-only groups', () => {
    const ids = selectPublicTaskGroupsByMember(fixture(), 'u1').map((g) => g.id);
    expect(ids).not.toContain('privOwned');
    expect(ids).not.toContain('friendsOwned');
  });

  it('excludes public groups the user is not part of', () => {
    const ids = selectPublicTaskGroupsByMember(fixture(), 'u1').map((g) => g.id);
    expect(ids).not.toContain('foreign');
  });

  it('returns empty for a user with no public groups', () => {
    expect(selectPublicTaskGroupsByMember(fixture(), 'u3').map((g) => g.id)).toEqual(['foreign']);
    expect(selectPublicTaskGroupsByMember(fixture(), 'nobody')).toEqual([]);
  });
});

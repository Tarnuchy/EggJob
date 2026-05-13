import { isValidUsername } from '../../utils/validation';
import type { ActionOf } from '../actions';
import type { ReducerResult } from '../reducer';
import type { FrontendState } from '../state';

type ProfileAction = ActionOf<'profile/edit' | 'account/delete'>;

export function handleProfile(state: FrontendState, action: ProfileAction): ReducerResult {
  if (action.type === 'profile/edit') {
    const { userId, username, photoUrl } = action;

    if (username !== undefined && !isValidUsername(username)) {
      return { ok: false, error: { code: 'validation', field: 'username' } };
    }

    const existing = state.entities.users[userId];
    if (!existing) {
      return { ok: false, error: { code: 'not-found' } };
    }

    return {
      ok: true,
      value: {
        ...state,
        entities: {
          ...state.entities,
          users: {
            ...state.entities.users,
            [userId]: {
              ...existing,
              ...(username !== undefined ? { username } : {}),
              ...(photoUrl !== undefined ? { photoUrl } : {}),
            },
          },
        },
      },
    };
  }

  const { accountId, userId } = action;
  const { [accountId]: _acc, ...remainingAccounts } = state.entities.accounts;
  const { [userId]: _usr, ...remainingUsers } = state.entities.users;

  return {
    ok: true,
    value: {
      ...state,
      session: { currentAccountId: null, currentUserId: null },
      entities: {
        ...state.entities,
        accounts: remainingAccounts,
        users: remainingUsers,
      },
    },
  };
}

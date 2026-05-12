import { isValidEmail, isValidUsername } from '../../utils/validation';
import type { ActionOf } from '../actions';
import type { ReducerResult } from '../reducer';
import type { FrontendState } from '../state';

type AuthAction = ActionOf<'auth/register' | 'auth/login' | 'auth/logout'>;

export function handleAuth(state: FrontendState, action: AuthAction): ReducerResult {
  if (action.type === 'auth/register') {
    const { email, username, accountId, userId } = action;

    if (!isValidEmail(email)) {
      return { ok: false, error: { code: 'validation', field: 'email' } };
    }
    if (!isValidUsername(username)) {
      return { ok: false, error: { code: 'validation', field: 'username' } };
    }

    return {
      ok: true,
      value: {
        ...state,
        session: { currentAccountId: accountId, currentUserId: userId },
        entities: {
          ...state.entities,
          accounts: { ...state.entities.accounts, [accountId]: { email } },
          users: { ...state.entities.users, [userId]: { username } },
        },
      },
    };
  }

  if (action.type === 'auth/login') {
    return {
      ok: true,
      value: {
        ...state,
        session: {
          currentAccountId: action.accountId,
          currentUserId: action.userId,
        },
      },
    };
  }

  return {
    ok: true,
    value: {
      ...state,
      session: { currentAccountId: null, currentUserId: null },
    },
  };
}

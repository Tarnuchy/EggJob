import { isValidEmail, isValidUsername } from "../../utils/validation";
import type { ReducerResult } from "../reducer";
import type { FrontendState } from "../state";

type AuthAction = { type: string; [key: string]: unknown };

export function handleAuth(
  state: FrontendState,
  action: AuthAction
): ReducerResult {
  if (action.type === "auth/register") {
    const email = action.email as string;
    const username = action.username as string;
    const accountId = action.accountId as string;
    const userId = action.userId as string;

    if (!isValidEmail(email)) {
      return { ok: false, error: { code: "validation", field: "email" } };
    }
    if (!isValidUsername(username)) {
      return { ok: false, error: { code: "validation", field: "username" } };
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

  if (action.type === "auth/login") {
    return {
      ok: true,
      value: {
        ...state,
        session: {
          currentAccountId: action.accountId as string,
          currentUserId: action.userId as string,
        },
      },
    };
  }

  if (action.type === "auth/logout") {
    return {
      ok: true,
      value: {
        ...state,
        session: { currentAccountId: null, currentUserId: null },
      },
    };
  }

  return { ok: false, error: { code: "unknown-action" } };
}
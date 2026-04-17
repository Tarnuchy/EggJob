import { isValidUsername } from "../../utils/validation";
import type { ReducerResult } from "../reducer";
import type { FrontendState } from "../state";

type ProfileAction = { type: string; [key: string]: unknown };

export function handleProfile(
  state: FrontendState,
  action: ProfileAction
): ReducerResult {
  if (action.type === "profile/edit") {
    const userId = action.userId as string;
    const username = action.username as string | undefined;
    const photoUrl = action.photoUrl as string | undefined;

    if (username !== undefined && !isValidUsername(username)) {
      return { ok: false, error: { code: "validation", field: "username" } };
    }

    const existing = state.entities.users[userId];
    if (!existing) {
      return { ok: false, error: { code: "not-found" } };
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

  if (action.type === "account/delete") {
    const accountId = action.accountId as string;
    const userId = action.userId as string;

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

  return { ok: false, error: { code: "unknown-action" } };
}
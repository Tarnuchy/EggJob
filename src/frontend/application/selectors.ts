import type { FrontendState } from "./state";

export function selectCurrentUserId(state: FrontendState): string | null {
  return state.session.currentUserId;
}

export function selectCurrentAccountId(state: FrontendState): string | null {
  return state.session.currentAccountId;
}

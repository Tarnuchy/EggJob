import type { FrontendState } from "./state";

type Action = { type: string; [key: string]: unknown };
type ReducerResult =
  | { ok: true; value: FrontendState }
  | { ok: false; error: { code: string; field?: string } };

export function reduceFrontendState(
  state: FrontendState,
  action: Action
): ReducerResult {
  return { ok: false, error: { code: "not-implemented" } };
}

import type { ActionOf } from '../actions';
import type { ReducerResult } from '../reducer';
import type { FrontendState } from '../state';

export function handleHydration(
  state: FrontendState,
  action: ActionOf<'hydrate/task-data'>,
): ReducerResult {
  return {
    ok: true,
    value: {
      ...state,
      entities: {
        ...state.entities,
        taskGroups: action.taskGroups,
        tasks: action.tasks,
        taskProgresses: action.taskProgresses,
        users: { ...state.entities.users, ...action.users },
      },
    },
  };
}

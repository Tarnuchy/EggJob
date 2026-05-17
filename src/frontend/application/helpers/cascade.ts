import type { FrontendState } from '../state';

export function cascadeDeleteTask(state: FrontendState, taskId: string): FrontendState {
  const task = state.entities.tasks[taskId];
  const { [taskId]: _task, ...remainingTasks } = state.entities.tasks;

  const updatedGroups = Object.fromEntries(
    Object.entries(state.entities.taskGroups).map(([groupId, group]) => [
      groupId,
      { ...group, taskIds: group.taskIds.filter((id) => id !== taskId) },
    ]),
  );

  if (!task) {
    return {
      ...state,
      entities: {
        ...state.entities,
        tasks: remainingTasks,
        taskGroups: updatedGroups,
      },
    };
  }

  const { [task.progressId]: _progress, ...remainingTaskProgresses } =
    state.entities.taskProgresses;

  const entryIdsToDelete = new Set(
    Object.entries(state.entities.progressEntries)
      .filter(([, entry]) => entry.taskId === taskId)
      .map(([entryId]) => entryId),
  );

  const commentIdsToDelete = collectCommentIds(state, entryIdsToDelete);

  const remainingProgressEntries = Object.fromEntries(
    Object.entries(state.entities.progressEntries).filter(
      ([entryId]) => !entryIdsToDelete.has(entryId),
    ),
  );

  const remainingComments = Object.fromEntries(
    Object.entries(state.entities.comments).filter(
      ([commentId]) => !commentIdsToDelete.has(commentId),
    ),
  );

  return {
    ...state,
    entities: {
      ...state.entities,
      tasks: remainingTasks,
      taskGroups: updatedGroups,
      taskProgresses: remainingTaskProgresses,
      progressEntries: remainingProgressEntries,
      comments: remainingComments,
    },
  };
}

export function cascadeDeleteGroup(state: FrontendState, groupId: string): FrontendState {
  const group = state.entities.taskGroups[groupId];
  const { [groupId]: _g, ...remainingTaskGroups } = state.entities.taskGroups;

  if (!group) {
    return {
      ...state,
      entities: { ...state.entities, taskGroups: remainingTaskGroups },
    };
  }

  const taskIdsToDelete = new Set(group.taskIds);

  const remainingTasks = Object.fromEntries(
    Object.entries(state.entities.tasks).filter(([taskId]) => !taskIdsToDelete.has(taskId)),
  );

  const progressIdsToDelete = new Set(
    group.taskIds
      .map((taskId) => state.entities.tasks[taskId]?.progressId)
      .filter((progressId): progressId is string => Boolean(progressId)),
  );

  const remainingTaskProgresses = Object.fromEntries(
    Object.entries(state.entities.taskProgresses).filter(
      ([progressId]) => !progressIdsToDelete.has(progressId),
    ),
  );

  const entryIdsToDelete = new Set(
    Object.entries(state.entities.progressEntries)
      .filter(([, entry]) => taskIdsToDelete.has(entry.taskId))
      .map(([entryId]) => entryId),
  );

  const commentIdsToDelete = collectCommentIds(state, entryIdsToDelete);

  const remainingProgressEntries = Object.fromEntries(
    Object.entries(state.entities.progressEntries).filter(
      ([entryId]) => !entryIdsToDelete.has(entryId),
    ),
  );

  const remainingComments = Object.fromEntries(
    Object.entries(state.entities.comments).filter(
      ([commentId]) => !commentIdsToDelete.has(commentId),
    ),
  );

  return {
    ...state,
    entities: {
      ...state.entities,
      taskGroups: remainingTaskGroups,
      tasks: remainingTasks,
      taskProgresses: remainingTaskProgresses,
      progressEntries: remainingProgressEntries,
      comments: remainingComments,
    },
  };
}

function collectCommentIds(state: FrontendState, entryIds: Set<string>): Set<string> {
  const commentIds = new Set<string>();
  for (const entryId of entryIds) {
    const entry = state.entities.progressEntries[entryId];
    if (!entry) continue;
    for (const commentId of entry.commentIds) {
      commentIds.add(commentId);
    }
  }
  return commentIds;
}

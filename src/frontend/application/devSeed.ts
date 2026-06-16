import type { AppAction } from './actions';
import type { ReducerResult } from './reducer';
import { TASK_COLORS } from '../screens/tasks/taskColors';

type Dispatch = (action: AppAction) => ReducerResult;

/**
 * Seeds demonstration groups/tasks for the dev mock user so every tab (Home included) has
 * content. Moved verbatim from TasksScreen; invoked once from the authenticated shell
 * (see useDevSeed) only in mock mode when there are no groups yet.
 *
 * Seedy demonstracyjne (nazwy w EN) pokrywają pełną domenę: typy grup, prywatność,
 * bingo 3×3 / 4×4 / 5×5, role, progres częściowy/pełny/zerowy, komentarz i zaproszenie.
 */
export function seedDevData(dispatch: Dispatch, currentUserId: string): void {
  const marathonId = 'grp-marathon';
  const cookingId = 'grp-cooking';
  const bingo3Id = 'grp-bingo3';
  const bingo4Id = 'grp-bingo4';
  const bingo5Id = 'grp-bingo5';
  const cyclingId = 'grp-cycling';

  // pomocnik: grupa bingo trzyma dokładnie size² tasków; doneIndices oznacza ukończone komórki
  const seedBingoBoard = (
    groupId: string,
    size: number,
    label: (index: number) => string,
    doneIndices: number[],
  ) => {
    for (let i = 0; i < size * size; i++) {
      const taskId = `tsk-${groupId}-${i}`;
      dispatch({
        type: 'tasks/create',
        taskId,
        groupId,
        progressId: `prg-${groupId}-${i}`,
        name: label(i),
        goal: 1,
        kind: 'one_time',
        params: {
          color: TASK_COLORS[i % TASK_COLORS.length].value,
          photoRequired: false,
          notifications: false,
        },
      });
      if (doneIndices.includes(i)) {
        dispatch({
          type: 'tasks/add-progress',
          entryId: `entry-${groupId}-${i}`,
          taskId,
          authorUserId: currentUserId,
          value: 1,
        });
      }
    }
  };

  // ── Grupa 1: kompetytywna, prywatna, własna; różne typy tasków, role admina ──
  dispatch({ type: 'task-groups/create', groupId: marathonId, ownerUserId: currentUserId, name: 'Road to Marathon', privacy: 'private', groupType: 'competitive', isBingo: false, inviteCode: 'RUN2026' });
  dispatch({ type: 'task-groups/add-member', groupId: marathonId, userId: 'usr-seed-3' });
  dispatch({ type: 'task-groups/add-member', groupId: marathonId, userId: 'usr-seed-4' });
  dispatch({ type: 'task-groups/change-role', groupId: marathonId, userId: 'usr-seed-3', role: 'admin' });

  dispatch({ type: 'tasks/create', taskId: 'tsk-marathon-run', groupId: marathonId, progressId: 'prg-marathon-run', name: 'Run 5 km', goal: 5, kind: 'endless', params: { color: '#2563EB', notifications: true, photoRequired: false } });
  dispatch({ type: 'tasks/add-progress', entryId: 'entry-marathon-run', taskId: 'tsk-marathon-run', authorUserId: currentUserId, value: 2, note: 'Warm-up run' });
  dispatch({ type: 'tasks/add-comment', commentId: 'cmt-marathon-run', progressEntryId: 'entry-marathon-run', message: 'Felt strong today!', authorUserId: currentUserId });

  dispatch({ type: 'tasks/create', taskId: 'tsk-marathon-long', groupId: marathonId, progressId: 'prg-marathon-long', name: 'Weekly long run', goal: 20, kind: 'endless', params: { color: '#16A34A', notifications: true, photoRequired: false } });
  dispatch({ type: 'tasks/add-progress', entryId: 'entry-marathon-long', taskId: 'tsk-marathon-long', authorUserId: currentUserId, value: 12 });

  dispatch({ type: 'tasks/create', taskId: 'tsk-marathon-stretch', groupId: marathonId, progressId: 'prg-marathon-stretch', name: 'Stretch daily', goal: 1, kind: 'one_time', params: { color: '#EA580C', notifications: false, photoRequired: false } });
  dispatch({ type: 'tasks/add-progress', entryId: 'entry-marathon-stretch', taskId: 'tsk-marathon-stretch', authorUserId: currentUserId, value: 1 });

  // ── Grupa 2: kooperacyjna, prywatna, własna, solo; photoRequired + progres zerowy ──
  dispatch({ type: 'task-groups/create', groupId: cookingId, ownerUserId: currentUserId, name: 'Weekend Cooking', privacy: 'private', groupType: 'cooperative', isBingo: false, inviteCode: 'COOK42' });
  dispatch({ type: 'tasks/create', taskId: 'tsk-cooking-bread', groupId: cookingId, progressId: 'prg-cooking-bread', name: 'Bake sourdough', goal: 1, kind: 'one_time', params: { color: '#7C3AED', notifications: false, photoRequired: true } });
  dispatch({ type: 'tasks/create', taskId: 'tsk-cooking-recipes', groupId: cookingId, progressId: 'prg-cooking-recipes', name: 'Try 3 new recipes', goal: 3, kind: 'endless', params: { color: '#0D9488', notifications: true, photoRequired: false } });
  dispatch({ type: 'tasks/add-progress', entryId: 'entry-cooking-recipes', taskId: 'tsk-cooking-recipes', authorUserId: currentUserId, value: 1 });

  // ── Grupa 3: publiczna bingo 3×3, cudza (NIE jesteśmy członkiem) → grupa dołączalna kodem ──
  const bingo3Labels = ['Push-ups', 'Plank 1 min', 'Drink water', '10k steps', 'Yoga flow', 'No sugar', 'Read 20 min', 'Sleep 8h', 'Meditate'];
  dispatch({ type: 'task-groups/create', groupId: bingo3Id, ownerUserId: 'usr-seed-2', name: 'Open Bingo Crew', privacy: 'public', groupType: 'cooperative', isBingo: true, inviteCode: 'BINGO1' });
  dispatch({ type: 'task-groups/add-member', groupId: bingo3Id, userId: 'usr-seed-1' });
  seedBingoBoard(bingo3Id, 3, (i) => bingo3Labels[i], [0, 1, 5]); // 3 ukończone, brak pełnej linii

  // ── Grupa 4: bingo 4×4, prywatność 'friends', cudza — jesteśmy członkiem (nie-owner) ──
  dispatch({ type: 'task-groups/create', groupId: bingo4Id, ownerUserId: 'usr-seed-3', name: 'Habit Bingo', privacy: 'friends', groupType: 'cooperative', isBingo: true, inviteCode: 'HABIT4' });
  dispatch({ type: 'task-groups/add-member', groupId: bingo4Id, userId: currentUserId });
  dispatch({ type: 'task-groups/add-member', groupId: bingo4Id, userId: 'usr-seed-4' });
  seedBingoBoard(bingo4Id, 4, (i) => `Habit ${i + 1}`, [0, 2, 5, 9]); // częściowo, brak pełnej linii

  // ── Grupa 5: bingo 5×5, własna; pierwszy rząd ukończony → stan wygranej (banner „Bingo!") ──
  dispatch({ type: 'task-groups/create', groupId: bingo5Id, ownerUserId: currentUserId, name: 'Champion Bingo', privacy: 'public', groupType: 'cooperative', isBingo: true, inviteCode: 'CHAMP5' });
  dispatch({ type: 'task-groups/add-member', groupId: bingo5Id, userId: 'usr-seed-5' });
  seedBingoBoard(bingo5Id, 5, (i) => `Challenge ${i + 1}`, [0, 1, 2, 3, 4]); // pełny pierwszy rząd → bingo

  // ── Grupa 6: kompetytywna, prywatność 'friends', cudza — jesteśmy członkiem ──
  dispatch({ type: 'task-groups/create', groupId: cyclingId, ownerUserId: 'usr-seed-5', name: 'Cycling Buddies', privacy: 'friends', groupType: 'competitive', isBingo: false, inviteCode: 'RIDE99' });
  dispatch({ type: 'task-groups/add-member', groupId: cyclingId, userId: currentUserId });
  dispatch({ type: 'task-groups/add-member', groupId: cyclingId, userId: 'usr-seed-6' });
  dispatch({ type: 'tasks/create', taskId: 'tsk-cycling-ride', groupId: cyclingId, progressId: 'prg-cycling-ride', name: 'Ride 50 km', goal: 50, kind: 'endless', params: { color: '#DC2626', notifications: true, photoRequired: false } });
  dispatch({ type: 'tasks/add-progress', entryId: 'entry-cycling-ride', taskId: 'tsk-cycling-ride', authorUserId: currentUserId, value: 30 });
  dispatch({ type: 'tasks/create', taskId: 'tsk-cycling-hill', groupId: cyclingId, progressId: 'prg-cycling-hill', name: 'Climb a hill', goal: 1, kind: 'one_time', params: { color: '#CA8A04', notifications: false, photoRequired: false } });
  dispatch({ type: 'tasks/add-progress', entryId: 'entry-cycling-hill', taskId: 'tsk-cycling-hill', authorUserId: currentUserId, value: 1 });

  // ── Oczekujące zaproszenie do grupy, której nie jesteśmy członkiem (Open Bingo Crew) ──
  dispatch({ type: 'task-groups/invite-friend', invitationId: 'inv-bingo3', groupId: bingo3Id, fromUserId: 'usr-seed-2', toUserId: currentUserId });
}

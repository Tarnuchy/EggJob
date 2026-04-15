import { reduceFrontendState } from "../../../../src/frontend/application/reducer";
import { createInitialFrontendState } from "../../../../src/frontend/application/state";

const dispatch = (state: unknown, action: unknown) =>
	reduceFrontendState(state as never, action as never);

const seedTask = () => {
	const initial = createInitialFrontendState();
	const registered = dispatch(initial, {
		type: "auth/register",
		accountId: "acc-1",
		userId: "usr-1",
		email: "task@example.com",
		username: "task_user",
		passwordHash: "hash-1",
		registrationDate: new Date("2026-04-03T08:00:00.000Z"),
	});
	if (!registered.ok) throw new Error("Precondition register failed");

	const group = dispatch(registered.value, {
		type: "task-groups/create",
		groupId: "grp-1",
		ownerUserId: "usr-1",
		name: "Grupa zadaniowa",
		privacy: "friends",
		createdAt: new Date("2026-04-03T08:01:00.000Z"),
	});
	if (!group.ok) throw new Error("Precondition group failed");

	const task = dispatch(group.value, {
		type: "tasks/create",
		taskId: "tsk-1",
		groupId: "grp-1",
		progressId: "prg-1",
		name: "Task bazowy",
		description: "Opis bazowy",
		goal: 5,
		status: "active",
		kind: "one-time",
		params: {
			photoRequired: false,
			color: "green",
			notifications: true,
		},
		createdAt: new Date("2026-04-03T08:02:00.000Z"),
	});

	if (!task.ok) throw new Error("Precondition task failed");
	return task.value;
};

describe("Task lifecycle and comments (UC-29..UC-31 + Comment)", () => {
	it("contains task in group for display scenario (UC-29)", () => {
		const state = seedTask();
		expect(state.entities.taskGroups["grp-1"]?.taskIds).toContain("tsk-1");
		expect(state.entities.tasks["tsk-1"]?.name).toBe("Task bazowy");
	});

	it("edits task data (UC-30)", () => {
		const state = seedTask();

		const edited = dispatch(state, {
			type: "tasks/edit",
			taskId: "tsk-1",
			name: "Task po edycji",
			description: "Nowy opis",
			goal: 7,
			status: "active",
			params: {
				color: "purple",
			},
		});

		expect(edited.ok).toBe(true);
		if (!edited.ok) return;

		expect(edited.value.entities.tasks["tsk-1"]?.name).toBe("Task po edycji");
		expect(edited.value.entities.tasks["tsk-1"]?.goal).toBe(7);
		expect(edited.value.entities.tasks["tsk-1"]?.params.color).toBe("purple");
	});

	it("deletes task and removes it from group (UC-31)", () => {
		const state = seedTask();

		const deleted = dispatch(state, {
			type: "tasks/delete",
			taskId: "tsk-1",
		});

		expect(deleted.ok).toBe(true);
		if (!deleted.ok) return;

		expect(deleted.value.entities.tasks["tsk-1"]).toBeUndefined();
		expect(deleted.value.entities.taskGroups["grp-1"]?.taskIds).not.toContain(
			"tsk-1",
		);
	});

	it("adds comment to progress entry timeline", () => {
		const state = seedTask();
		const progress = dispatch(state, {
			type: "tasks/add-progress",
			entryId: "ent-1",
			taskId: "tsk-1",
			authorUserId: "usr-1",
			value: 2,
			note: "Start",
			createdAt: new Date("2026-04-03T08:20:00.000Z"),
		});

		expect(progress.ok).toBe(true);
		if (!progress.ok) return;

		const commented = dispatch(progress.value, {
			type: "tasks/add-comment",
			commentId: "com-1",
			progressEntryId: "ent-1",
			authorUserId: "usr-1",
			message: "Dobra robota",
			date: new Date("2026-04-03T08:21:00.000Z"),
		});

		expect(commented.ok).toBe(true);
		if (!commented.ok) return;

		expect(commented.value.entities.comments["com-1"]?.message).toBe(
			"Dobra robota",
		);
		expect(
			commented.value.entities.progressEntries["ent-1"]?.commentIds,
		).toContain("com-1");
	});
});

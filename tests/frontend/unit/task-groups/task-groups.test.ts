import { reduceFrontendState } from "../../../../src/frontend/application/reducer";
import { createInitialFrontendState } from "../../../../src/frontend/application/state";

const registerOwner = () => {
	const state = createInitialFrontendState();
	const registered = reduceFrontendState(state, {
		type: "auth/register",
		accountId: "acc-owner",
		userId: "usr-owner",
		email: "owner@example.com",
		username: "owner_name",
		passwordHash: "hash-owner",
		registrationDate: new Date("2026-04-03T12:00:00.000Z"),
	});

	if (!registered.ok) {
		throw new Error("Expected precondition to register owner");
	}

	return registered.value;
};

describe("Task groups reducer (UC-12, UC-14, UC-15)", () => {
	it("creates a task group with valid name", () => {
		const state = registerOwner();

		const result = reduceFrontendState(state, {
			type: "task-groups/create",
			groupId: "grp-1",
			ownerUserId: "usr-owner",
			name: "Wyzwanie biegowe",
			privacy: "friends",
			createdAt: new Date("2026-04-03T12:00:00.000Z"),
		});

		expect(result.ok).toBe(true);
		if (!result.ok) return;

		expect(result.value.entities.taskGroups["grp-1"]?.name).toBe(
			"Wyzwanie biegowe",
		);
		expect(result.value.entities.taskGroups["grp-1"]?.ownerUserId).toBe(
			"usr-owner",
		);
	});

	it("rejects creating group with empty name", () => {
		const state = registerOwner();

		const result = reduceFrontendState(state, {
			type: "task-groups/create",
			groupId: "grp-1",
			ownerUserId: "usr-owner",
			name: "   ",
			privacy: "friends",
			createdAt: new Date("2026-04-03T12:00:00.000Z"),
		});

		expect(result.ok).toBe(false);
		if (result.ok) return;

		expect(result.error.code).toBe("validation");
		expect(result.error.field).toBe("name");
	});

	it("edits task group name and privacy", () => {
		const state = registerOwner();
		const created = reduceFrontendState(state, {
			type: "task-groups/create",
			groupId: "grp-1",
			ownerUserId: "usr-owner",
			name: "Stara nazwa",
			privacy: "friends",
			createdAt: new Date("2026-04-03T12:00:00.000Z"),
		});

		expect(created.ok).toBe(true);
		if (!created.ok) return;

		const edited = reduceFrontendState(created.value, {
			type: "task-groups/edit",
			groupId: "grp-1",
			name: "Nowa nazwa",
			privacy: "private",
		});

		expect(edited.ok).toBe(true);
		if (!edited.ok) return;

		expect(edited.value.entities.taskGroups["grp-1"]?.name).toBe("Nowa nazwa");
		expect(edited.value.entities.taskGroups["grp-1"]?.privacy).toBe("private");
	});

	it("deletes task group", () => {
		const state = registerOwner();
		const created = reduceFrontendState(state, {
			type: "task-groups/create",
			groupId: "grp-1",
			ownerUserId: "usr-owner",
			name: "Do usunięcia",
			privacy: "friends",
			createdAt: new Date("2026-04-03T12:00:00.000Z"),
		});

		expect(created.ok).toBe(true);
		if (!created.ok) return;

		const deleted = reduceFrontendState(created.value, {
			type: "task-groups/delete",
			groupId: "grp-1",
		});

		expect(deleted.ok).toBe(true);
		if (!deleted.ok) return;

		expect(deleted.value.entities.taskGroups["grp-1"]).toBeUndefined();
	});

	it("deletes group with tasks assigned to it", () => {
		const state = registerOwner();
		const created = reduceFrontendState(state, {
			type: "task-groups/create",
			groupId: "grp-1",
			ownerUserId: "usr-owner",
			name: "Grupa z taskami",
			privacy: "friends",
			createdAt: new Date("2026-04-03T12:00:00.000Z"),
		});

		expect(created.ok).toBe(true);
		if (!created.ok) return;

		const taskCreated = reduceFrontendState(created.value, {
			type: "tasks/create",
			taskId: "tsk-1",
			groupId: "grp-1",
			progressId: "prg-1",
			name: "Task usuwany razem z grupa",
			goal: 5,
			status: "active",
			kind: "one-time",
			params: {
				photoRequired: false,
				color: "blue",
				notifications: true,
			},
			createdAt: new Date("2026-04-03T12:02:00.000Z"),
		});

		expect(taskCreated.ok).toBe(true);
		if (!taskCreated.ok) return;

		const deleted = reduceFrontendState(taskCreated.value, {
			type: "task-groups/delete",
			groupId: "grp-1",
		});

		expect(deleted.ok).toBe(true);
		if (!deleted.ok) return;

		expect(deleted.value.entities.taskGroups["grp-1"]).toBeUndefined();
		expect(deleted.value.entities.tasks["tsk-1"]).toBeUndefined();
		expect(deleted.value.entities.taskProgresses["prg-1"]).toBeUndefined();
	});
});

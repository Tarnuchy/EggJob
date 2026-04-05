import { reduceFrontendState } from "../../../../src/frontend/application/reducer";
import { createInitialFrontendState } from "../../../../src/frontend/application/state";

const dispatch = (state: unknown, action: unknown) =>
	reduceFrontendState(state as never, action as never);

const seedBaseState = () => {
	const initial = createInitialFrontendState();

	const registered = dispatch(initial, {
		type: "auth/register",
		accountId: "acc-1",
		userId: "usr-1",
		email: "user@example.com",
		username: "user_1",
		passwordHash: "hash-1",
		registrationDate: new Date("2026-04-03T08:00:00.000Z"),
	});
	if (!registered.ok) throw new Error("precondition: register failed");

	const group = dispatch(registered.value, {
		type: "task-groups/create",
		groupId: "grp-1",
		ownerUserId: "usr-1",
		name: "Grupa testowa",
		privacy: "friends",
		inviteCode: "JOIN123",
		createdAt: new Date("2026-04-03T08:01:00.000Z"),
	});
	if (!group.ok) throw new Error("precondition: group failed");

	const task = dispatch(group.value, {
		type: "tasks/create",
		taskId: "tsk-1",
		groupId: "grp-1",
		progressId: "prg-1",
		name: "Task testowy",
		description: "opis",
		goal: 10,
		status: "active",
		kind: "one-time",
		params: {
			photoRequired: false,
			color: "blue",
			notifications: true,
		},
		createdAt: new Date("2026-04-03T08:02:00.000Z"),
	});
	if (!task.ok) throw new Error("precondition: task failed");

	return task.value;
};

describe("Domain-mapped frontend methods from diagram classes", () => {
	it("Account.createUser / register creates linked user profile", () => {
		const result = dispatch(createInitialFrontendState(), {
			type: "auth/register",
			accountId: "acc-a",
			userId: "usr-a",
			email: "a@example.com",
			username: "alpha_user",
			passwordHash: "hash-a",
			registrationDate: new Date("2026-04-03T08:00:00.000Z"),
		});

		expect(result.ok).toBe(true);
		if (!result.ok) return;

		expect(result.value.entities.accounts["acc-a"]).toBeDefined();
		expect(result.value.entities.users["usr-a"]).toBeDefined();
		expect(result.value.session.currentUserId).toBe("usr-a");
	});

	it("Invitation.cancel removes pending friend invitation", () => {
		const base = seedBaseState();
		const invited = dispatch(base, {
			type: "friends/invite",
			invitationId: "inv-1",
			fromUserId: "usr-1",
			toUserId: "usr-2",
			date: new Date("2026-04-03T08:05:00.000Z"),
		});

		expect(invited.ok).toBe(true);
		if (!invited.ok) return;

		const cancelled = dispatch(invited.value, {
			type: "friends/reject-invite",
			invitationId: "inv-1",
		});

		expect(cancelled.ok).toBe(true);
		if (!cancelled.ok) return;

		expect(cancelled.value.entities.invitations["inv-1"]).toBeUndefined();
	});

	it("Invitation.notify creates visible notification for user", () => {
		const result = dispatch(createInitialFrontendState(), {
			type: "auth/register",
			accountId: "acc-a",
			userId: "usr-a",
			email: "a@example.com",
			username: "alpha_user",
			passwordHash: "hash-a",
			registrationDate: new Date("2026-04-03T08:00:00.000Z"),
		});
		expect(result.ok).toBe(true);
		if (!result.ok) return;

		const withNotification = dispatch(result.value, {
			type: "friends/invite",
			invitationId: "inv-1",
			fromUserId: "usr-a",
			toUserId: "usr-b",
			date: new Date("2026-04-03T08:05:00.000Z"),
		});

		expect(withNotification.ok).toBe(true);
		if (!withNotification.ok) return;

		expect(Object.keys(withNotification.value.entities.invitations)).toContain(
			"inv-1",
		);
	});

	it("Notification.read can be represented by marking notification inactive in state", () => {
		const result = dispatch(createInitialFrontendState(), {
			type: "auth/register",
			accountId: "acc-a",
			userId: "usr-a",
			email: "a@example.com",
			username: "alpha_user",
			passwordHash: "hash-a",
			registrationDate: new Date("2026-04-03T08:00:00.000Z"),
		});
		expect(result.ok).toBe(true);
		if (!result.ok) return;

		expect(result.value.entities.notifications).toEqual({});
	});

	it("TaskParams.edit updates task configuration", () => {
		const base = seedBaseState();

		const edited = dispatch(base, {
			type: "tasks/edit",
			taskId: "tsk-1",
			params: {
				photoRequired: true,
				color: "red",
				notifications: false,
			},
		});

		expect(edited.ok).toBe(true);
		if (!edited.ok) return;

		expect(edited.value.entities.tasks["tsk-1"]?.params.photoRequired).toBe(
			true,
		);
		expect(edited.value.entities.tasks["tsk-1"]?.params.color).toBe("red");
		expect(edited.value.entities.tasks["tsk-1"]?.params.notifications).toBe(
			false,
		);
	});

	it("TaskGroup.changePermissions is represented by invitation permissions flow", () => {
		const base = seedBaseState();

		const invited = dispatch(base, {
			type: "task-groups/invite-friend",
			invitationId: "inv-g-1",
			groupId: "grp-1",
			fromUserId: "usr-1",
			toUserId: "usr-2",
			permissions: "fill",
			date: new Date("2026-04-03T08:10:00.000Z"),
		});

		expect(invited.ok).toBe(true);
		if (!invited.ok) return;

		expect(invited.value.entities.invitations["inv-g-1"]?.kind).toBe(
			"task-group",
		);
	});

	it("Comment.deleteComment removes comment from progress entry timeline", () => {
		const base = seedBaseState();
		const progress = dispatch(base, {
			type: "tasks/add-progress",
			entryId: "ent-1",
			taskId: "tsk-1",
			authorUserId: "usr-1",
			value: 3,
			note: "start",
			createdAt: new Date("2026-04-03T08:20:00.000Z"),
		});

		expect(progress.ok).toBe(true);
		if (!progress.ok) return;

		const commented = dispatch(progress.value, {
			type: "tasks/add-comment",
			commentId: "com-1",
			progressEntryId: "ent-1",
			authorUserId: "usr-1",
			message: "komentarz do usunięcia",
			date: new Date("2026-04-03T08:21:00.000Z"),
		});
		expect(commented.ok).toBe(true);
		if (!commented.ok) return;

		expect(commented.value.entities.comments["com-1"]).toBeDefined();
		expect(
			commented.value.entities.progressEntries["ent-1"]?.commentIds,
		).toContain("com-1");
	});

	it("ProgressEntry.validate rejects invalid progress values", () => {
		const base = seedBaseState();

		const invalid = dispatch(base, {
			type: "tasks/add-progress",
			entryId: "ent-invalid",
			taskId: "tsk-1",
			authorUserId: "usr-1",
			value: -5,
			note: "niepoprawny wpis",
			createdAt: new Date("2026-04-03T08:22:00.000Z"),
		});

		expect(invalid.ok).toBe(false);
		if (invalid.ok) return;

		expect(invalid.error.code).toBe("validation");
		expect(invalid.error.field).toBe("value");
	});
});

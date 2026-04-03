import { reduceFrontendState } from "../../../../src/frontend/application/reducer";
import { createInitialFrontendState } from "../../../../src/frontend/application/state";

const dispatch = (state: unknown, action: unknown) =>
	reduceFrontendState(state as never, action as never);

const prepareGroupWithOwnerAndFriend = () => {
	const initial = createInitialFrontendState();

	const owner = dispatch(initial, {
		type: "auth/register",
		accountId: "acc-owner",
		userId: "usr-owner",
		email: "owner@example.com",
		username: "owner_name",
		passwordHash: "hash-owner",
		registrationDate: new Date("2026-04-03T09:00:00.000Z"),
	});
	if (!owner.ok) throw new Error("Owner setup failed");

	const friend = dispatch(owner.value, {
		type: "auth/register",
		accountId: "acc-friend",
		userId: "usr-friend",
		email: "friend@example.com",
		username: "friend_name",
		passwordHash: "hash-friend",
		registrationDate: new Date("2026-04-03T09:01:00.000Z"),
	});
	if (!friend.ok) throw new Error("Friend setup failed");

	const group = dispatch(friend.value, {
		type: "task-groups/create",
		groupId: "grp-1",
		ownerUserId: "usr-owner",
		name: "Grupa główna",
		privacy: "friends",
		inviteCode: "JOIN123",
		createdAt: new Date("2026-04-03T09:02:00.000Z"),
	});

	if (!group.ok) throw new Error("Group setup failed");
	return group.value;
};

describe("Task-group access and invitations (UC-16..UC-27)", () => {
	it("invites friend directly to group with permissions (UC-22)", () => {
		const state = prepareGroupWithOwnerAndFriend();

		const invited = dispatch(state, {
			type: "task-groups/invite-friend",
			invitationId: "inv-g-1",
			groupId: "grp-1",
			fromUserId: "usr-owner",
			toUserId: "usr-friend",
			permissions: "fill",
			date: new Date("2026-04-03T10:00:00.000Z"),
		});

		expect(invited.ok).toBe(true);
		if (!invited.ok) return;

		expect(invited.value.entities.invitations["inv-g-1"]).toBeDefined();
		expect(invited.value.entities.invitations["inv-g-1"]?.kind).toBe(
			"task-group",
		);
	});

	it("withdraws or rejects group invitation (UC-23, UC-25)", () => {
		const state = prepareGroupWithOwnerAndFriend();
		const invited = dispatch(state, {
			type: "task-groups/invite-friend",
			invitationId: "inv-g-1",
			groupId: "grp-1",
			fromUserId: "usr-owner",
			toUserId: "usr-friend",
			permissions: "fill",
			date: new Date("2026-04-03T10:00:00.000Z"),
		});

		expect(invited.ok).toBe(true);
		if (!invited.ok) return;

		const cancelled = dispatch(invited.value, {
			type: "task-groups/cancel-invitation",
			invitationId: "inv-g-1",
		});

		expect(cancelled.ok).toBe(true);
		if (!cancelled.ok) return;

		expect(cancelled.value.entities.invitations["inv-g-1"]).toBeUndefined();
	});

	it("accepts group invitation and adds member (UC-24)", () => {
		const state = prepareGroupWithOwnerAndFriend();
		const invited = dispatch(state, {
			type: "task-groups/invite-friend",
			invitationId: "inv-g-1",
			groupId: "grp-1",
			fromUserId: "usr-owner",
			toUserId: "usr-friend",
			permissions: "fill",
			date: new Date("2026-04-03T10:00:00.000Z"),
		});

		expect(invited.ok).toBe(true);
		if (!invited.ok) return;

		const accepted = dispatch(invited.value, {
			type: "task-groups/accept-invitation",
			invitationId: "inv-g-1",
			groupId: "grp-1",
			userId: "usr-friend",
		});

		expect(accepted.ok).toBe(true);
		if (!accepted.ok) return;

		expect(accepted.value.entities.taskGroups["grp-1"]?.memberIds).toContain(
			"usr-friend",
		);
	});

	it("sends join request via invite code and owner accepts it (UC-18, UC-20)", () => {
		const state = prepareGroupWithOwnerAndFriend();

		const requested = dispatch(state, {
			type: "task-groups/request-join",
			invitationId: "req-1",
			groupId: "grp-1",
			inviteCode: "JOIN123",
			fromUserId: "usr-friend",
			toUserId: "usr-owner",
			permissions: "view",
			date: new Date("2026-04-03T10:10:00.000Z"),
		});

		expect(requested.ok).toBe(true);
		if (!requested.ok) return;

		const accepted = dispatch(requested.value, {
			type: "task-groups/accept-request",
			invitationId: "req-1",
			groupId: "grp-1",
			userId: "usr-friend",
			permissions: "view",
		});

		expect(accepted.ok).toBe(true);
		if (!accepted.ok) return;

		expect(accepted.value.entities.taskGroups["grp-1"]?.memberIds).toContain(
			"usr-friend",
		);
	});

	it("withdraws or rejects join request (UC-19, UC-21)", () => {
		const state = prepareGroupWithOwnerAndFriend();

		const requested = dispatch(state, {
			type: "task-groups/request-join",
			invitationId: "req-1",
			groupId: "grp-1",
			inviteCode: "JOIN123",
			fromUserId: "usr-friend",
			toUserId: "usr-owner",
			permissions: "view",
			date: new Date("2026-04-03T10:10:00.000Z"),
		});

		expect(requested.ok).toBe(true);
		if (!requested.ok) return;

		const rejected = dispatch(requested.value, {
			type: "task-groups/reject-request",
			invitationId: "req-1",
		});

		expect(rejected.ok).toBe(true);
		if (!rejected.ok) return;

		expect(rejected.value.entities.invitations["req-1"]).toBeUndefined();
	});

	it("adds member directly and removes member (UC-26)", () => {
		const state = prepareGroupWithOwnerAndFriend();

		const added = dispatch(state, {
			type: "task-groups/add-member",
			groupId: "grp-1",
			userId: "usr-friend",
		});

		expect(added.ok).toBe(true);
		if (!added.ok) return;

		const removed = dispatch(added.value, {
			type: "task-groups/remove-member",
			groupId: "grp-1",
			userId: "usr-friend",
		});

		expect(removed.ok).toBe(true);
		if (!removed.ok) return;

		expect(removed.value.entities.taskGroups["grp-1"]?.memberIds).not.toContain(
			"usr-friend",
		);
	});

	it("member can leave group (UC-27)", () => {
		const state = prepareGroupWithOwnerAndFriend();
		const added = dispatch(state, {
			type: "task-groups/add-member",
			groupId: "grp-1",
			userId: "usr-friend",
		});

		expect(added.ok).toBe(true);
		if (!added.ok) return;

		const left = dispatch(added.value, {
			type: "task-groups/leave",
			groupId: "grp-1",
			userId: "usr-friend",
		});

		expect(left.ok).toBe(true);
		if (!left.ok) return;

		expect(left.value.entities.taskGroups["grp-1"]?.memberIds).not.toContain(
			"usr-friend",
		);
	});

	it("exposes invitation code for sharing (UC-17)", () => {
		const state = prepareGroupWithOwnerAndFriend();
		expect(state.entities.taskGroups["grp-1"]?.inviteCode).toBe("JOIN123");
	});
});

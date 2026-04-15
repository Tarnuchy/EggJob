import { reduceFrontendState } from "../../../../src/frontend/application/reducer";
import { createInitialFrontendState } from "../../../../src/frontend/application/state";

const dispatch = (state: unknown, action: unknown) =>
	reduceFrontendState(state as never, action as never);

const seedTwoUsers = () => {
	const initial = createInitialFrontendState();

	const first = dispatch(initial, {
		type: "auth/register",
		accountId: "acc-a",
		userId: "usr-a",
		email: "a@example.com",
		username: "user_a",
		passwordHash: "hash-a",
		registrationDate: new Date("2026-04-03T10:00:00.000Z"),
	});
	if (!first.ok) throw new Error("Precondition A failed");

	const second = dispatch(first.value, {
		type: "auth/register",
		accountId: "acc-b",
		userId: "usr-b",
		email: "b@example.com",
		username: "user_b",
		passwordHash: "hash-b",
		registrationDate: new Date("2026-04-03T10:01:00.000Z"),
	});
	if (!second.ok) throw new Error("Precondition B failed");

	return second.value;
};

describe("Friend invitations and friendships (UC-05..UC-11)", () => {
	it("creates friend invitation (UC-06)", () => {
		const state = seedTwoUsers();

		const invited = dispatch(state, {
			type: "friends/invite",
			invitationId: "inv-f-1",
			fromUserId: "usr-a",
			toUserId: "usr-b",
			date: new Date("2026-04-03T11:00:00.000Z"),
		});

		expect(invited.ok).toBe(true);
		if (!invited.ok) return;

		expect(invited.value.entities.invitations["inv-f-1"]).toBeDefined();
	});

	it("withdraws/rejects invitation (UC-07, UC-09)", () => {
		const state = seedTwoUsers();
		const invited = dispatch(state, {
			type: "friends/invite",
			invitationId: "inv-f-1",
			fromUserId: "usr-a",
			toUserId: "usr-b",
			date: new Date("2026-04-03T11:00:00.000Z"),
		});
		expect(invited.ok).toBe(true);
		if (!invited.ok) return;

		const removed = dispatch(invited.value, {
			type: "friends/reject-invite",
			invitationId: "inv-f-1",
		});

		expect(removed.ok).toBe(true);
		if (!removed.ok) return;

		expect(removed.value.entities.invitations["inv-f-1"]).toBeUndefined();
	});

	it("accepts invitation and creates friendship (UC-08)", () => {
		const state = seedTwoUsers();
		const invited = dispatch(state, {
			type: "friends/invite",
			invitationId: "inv-f-1",
			fromUserId: "usr-a",
			toUserId: "usr-b",
			date: new Date("2026-04-03T11:00:00.000Z"),
		});
		expect(invited.ok).toBe(true);
		if (!invited.ok) return;

		const accepted = dispatch(invited.value, {
			type: "friends/accept-invite",
			invitationId: "inv-f-1",
			friendshipId: "fr-1",
			date: new Date("2026-04-03T11:05:00.000Z"),
		});

		expect(accepted.ok).toBe(true);
		if (!accepted.ok) return;

		expect(accepted.value.entities.friendships["fr-1"]).toBeDefined();
		expect(accepted.value.entities.invitations["inv-f-1"]).toBeUndefined();
	});

	it("removes friend (UC-11)", () => {
		const state = seedTwoUsers();
		const invited = dispatch(state, {
			type: "friends/invite",
			invitationId: "inv-f-1",
			fromUserId: "usr-a",
			toUserId: "usr-b",
			date: new Date("2026-04-03T11:00:00.000Z"),
		});
		expect(invited.ok).toBe(true);
		if (!invited.ok) return;

		const accepted = dispatch(invited.value, {
			type: "friends/accept-invite",
			invitationId: "inv-f-1",
			friendshipId: "fr-1",
			date: new Date("2026-04-03T11:05:00.000Z"),
		});
		expect(accepted.ok).toBe(true);
		if (!accepted.ok) return;

		const removed = dispatch(accepted.value, {
			type: "friends/remove",
			friendshipId: "fr-1",
		});

		expect(removed.ok).toBe(true);
		if (!removed.ok) return;

		expect(removed.value.entities.friendships["fr-1"]).toBeUndefined();
	});

	it("keeps friendship available for profile viewing behavior (UC-10)", () => {
		const state = seedTwoUsers();
		const invited = dispatch(state, {
			type: "friends/invite",
			invitationId: "inv-f-1",
			fromUserId: "usr-a",
			toUserId: "usr-b",
			date: new Date("2026-04-03T11:00:00.000Z"),
		});
		expect(invited.ok).toBe(true);
		if (!invited.ok) return;

		const accepted = dispatch(invited.value, {
			type: "friends/accept-invite",
			invitationId: "inv-f-1",
			friendshipId: "fr-1",
			date: new Date("2026-04-03T11:05:00.000Z"),
		});

		expect(accepted.ok).toBe(true);
		if (!accepted.ok) return;

		expect(accepted.value.entities.friendships["fr-1"]?.userId).toBeDefined();
		expect(
			accepted.value.entities.friendships["fr-1"]?.friendUserId,
		).toBeDefined();
	});
});

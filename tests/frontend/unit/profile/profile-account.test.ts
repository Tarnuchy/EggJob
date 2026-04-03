import { reduceFrontendState } from "../../../../src/frontend/application/reducer";
import { createInitialFrontendState } from "../../../../src/frontend/application/state";

const dispatch = (state: unknown, action: unknown) =>
	reduceFrontendState(state as never, action as never);

const prepareUser = () => {
	const initial = createInitialFrontendState();
	const registered = dispatch(initial, {
		type: "auth/register",
		accountId: "acc-1",
		userId: "usr-1",
		email: "profil@example.com",
		username: "profil_user",
		passwordHash: "hash-1",
		registrationDate: new Date("2026-04-03T12:00:00.000Z"),
	});

	if (!registered.ok) {
		throw new Error("Expected precondition to register user");
	}

	return registered.value;
};

describe("Profile and account reducer (UC-03, UC-04)", () => {
	it("updates username and photo in profile edit", () => {
		const state = prepareUser();

		const edited = dispatch(state, {
			type: "profile/edit",
			userId: "usr-1",
			username: "nowy_profil",
			photoUrl: "https://img.example.com/avatar.png",
		});

		expect(edited.ok).toBe(true);
		if (!edited.ok) return;

		expect(edited.value.entities.users["usr-1"]?.username).toBe("nowy_profil");
		expect(edited.value.entities.users["usr-1"]?.photoUrl).toBe(
			"https://img.example.com/avatar.png",
		);
	});

	it("rejects invalid username on profile edit", () => {
		const state = prepareUser();

		const edited = dispatch(state, {
			type: "profile/edit",
			userId: "usr-1",
			username: "x",
		});

		expect(edited.ok).toBe(false);
		if (edited.ok) return;

		expect(edited.error.code).toBe("validation");
		expect(edited.error.field).toBe("username");
	});

	it("deletes account and linked profile", () => {
		const state = prepareUser();

		const deleted = dispatch(state, {
			type: "account/delete",
			accountId: "acc-1",
			userId: "usr-1",
		});

		expect(deleted.ok).toBe(true);
		if (!deleted.ok) return;

		expect(deleted.value.entities.accounts["acc-1"]).toBeUndefined();
		expect(deleted.value.entities.users["usr-1"]).toBeUndefined();
		expect(deleted.value.session.currentAccountId).toBeNull();
		expect(deleted.value.session.currentUserId).toBeNull();
	});
});

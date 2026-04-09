import { reduceFrontendState } from "../../../../src/frontend/application/reducer";
import { createInitialFrontendState } from "../../../../src/frontend/application/state";

describe("Auth reducer (UC-01, UC-02)", () => {
	it("registers account and user, then logs session in", () => {
		const state = createInitialFrontendState();

		const result = reduceFrontendState(state, {
			type: "auth/register",
			accountId: "acc-1",
			userId: "usr-1",
			email: "anna@example.com",
			username: "anna_fit",
			passwordHash: "hash-1",
			registrationDate: new Date("2026-04-03T12:00:00.000Z"),
		});

		expect(result.ok).toBe(true);
		if (!result.ok) return;

		expect(result.value.session.currentAccountId).toBe("acc-1");
		expect(result.value.session.currentUserId).toBe("usr-1");
		expect(result.value.entities.accounts["acc-1"]?.email).toBe("anna@example.com",);
		expect(result.value.entities.users["usr-1"]?.username).toBe("anna_fit");
	});

	it("rejects invalid email during registration", () => {
		const state = createInitialFrontendState();

		const result = reduceFrontendState(state, {
			type: "auth/register",
			accountId: "acc-1",
			userId: "usr-1",
			email: "not-an-email",
			username: "anna_fit",
			passwordHash: "hash-1",
			registrationDate: new Date("2026-04-03T12:00:00.000Z"),
		});

		expect(result.ok).toBe(false);
		if (result.ok) return;

		expect(result.error.code).toBe("validation");
		expect(result.error.field).toBe("email");
	});

	it("logs in existing account and user", () => {
		const initial = createInitialFrontendState();

		const registered = reduceFrontendState(initial, {
			type: "auth/register",
			accountId: "acc-1",
			userId: "usr-1",
			email: "anna@example.com",
			username: "anna_fit",
			passwordHash: "hash-1",
			registrationDate: new Date("2026-04-03T12:00:00.000Z"),
		});

		expect(registered.ok).toBe(true);
		if (!registered.ok) return;

		const loggedOut = reduceFrontendState(registered.value, {
			type: "auth/logout",
		});
		expect(loggedOut.ok).toBe(true);
		if (!loggedOut.ok) return;

		const loggedIn = reduceFrontendState(loggedOut.value, {
			type: "auth/login",
			accountId: "acc-1",
			userId: "usr-1",
		});

		expect(loggedIn.ok).toBe(true);
		if (!loggedIn.ok) return;

		expect(loggedIn.value.session.currentAccountId).toBe("acc-1");
		expect(loggedIn.value.session.currentUserId).toBe("usr-1");
	});
});

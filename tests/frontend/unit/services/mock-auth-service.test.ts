import { authService } from "../../../../src/frontend/services";

describe("Mock auth service contract", () => {
	it("rejects login with invalid password", async () => {
		const result = await authService.login({
			email: "alice@example.com",
			password: "wrong-password",
		});

		expect(result.ok).toBe(false);
		if (result.ok) return;

		expect(result.error.code).toBe("unauthorized");
	});
});
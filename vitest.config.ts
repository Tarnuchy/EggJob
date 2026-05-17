import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["tests/frontend/unit/**/*.test.ts"],
		globals: true,
		environment: "node",
		clearMocks: true,
		restoreMocks: true,
		typecheck: {
			tsconfig: "./tsconfig.test.json",
		},
	},
});

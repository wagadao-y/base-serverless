import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      all: true,
      include: ["backend/src/**/*.ts", "frontend/src/**/*.ts"],
      exclude: ["**/__test__/**"],
    },
  },
});

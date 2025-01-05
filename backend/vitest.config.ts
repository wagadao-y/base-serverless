import { defineProject } from "vitest/config";
import * as path from "path";

export default defineProject({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@test": path.resolve(__dirname, "./test"),
    },
  },
  test: {
    setupFiles: ["./test/setup.ts"],
    // coverage: {
    //   include: ["src/**/*.ts"],
    // },
  },
});

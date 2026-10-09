import path from "node:path";
import { defineConfig } from "vitest/config";

const alias = {
  "@": path.resolve(import.meta.dirname, "."),
};

const sharedExclude = ["**/node_modules/**", "**/.next/**", "**/e2e/**"];

export default defineConfig({
  resolve: { alias },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "node",
          include: ["**/*.{test,spec}.ts"],
          exclude: [
            ...sharedExclude,
            "hooks/use-editor-record.test.ts",
            "lib/admin/staff-shortcuts.test.ts",
          ],
        },
      },
      {
        extends: true,
        test: {
          name: "dom",
          environment: "jsdom",
          setupFiles: ["./vitest.setup.ts"],
          include: [
            "**/*.test.tsx",
            "hooks/use-editor-record.test.ts",
            "lib/admin/staff-shortcuts.test.ts",
          ],
          exclude: sharedExclude,
        },
      },
    ],
  },
});

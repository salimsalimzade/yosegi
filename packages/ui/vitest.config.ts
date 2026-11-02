import { defineConfig } from "vitest/config";

// Unit tests for the pure logic: table queries, dates, numbers and options. They run in Node and
// sit next to the file they test, as `table-model.test.ts`. Components are tested in Storybook.
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});

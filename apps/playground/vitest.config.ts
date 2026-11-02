import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

// Every story is a test, run in a real Chromium: it must render without errors, it's checked for
// accessibility (reported, not failing, while a11y.test is "todo" in preview.tsx), and a story's
// play function tests what people do with it. The stories compile through
// Storybook's own Vite setup, whose Solid plugin is `vite-plugin-solid`, aliased in package.json to
// @solidjs/vite-plugin, so this config adds no plugin of its own.
export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        // Relative to this folder, where `pnpm test` runs.
        plugins: [storybookTest({ configDir: ".storybook" })],
        // Bundled before the run starts: found mid-run, it makes Vite reload the tests.
        optimizeDeps: { include: ["@floating-ui/dom"] },
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});

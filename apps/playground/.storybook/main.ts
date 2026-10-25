import remarkGfm from "remark-gfm";
import type { StorybookConfig } from "storybook-solidjs-vite";
import { unwrapSnippets } from "./snippets";

// Storybook builds with this app's vite.config.ts and its @solidjs/vite-plugin, and the stories
// compile yosegi from source.
export default {
  framework: "storybook-solidjs-vite",
  // Stories before pages, so a page that joins a component, like Adding an icon, comes after its stories.
  stories: ["../src/stories/**/*.stories.tsx", "../src/stories/**/*.mdx"],
  addons: [
    // remark-gfm gives the MDX pages GitHub's tables.
    {
      name: "@storybook/addon-docs",
      options: { mdxPluginOptions: { mdxCompileOptions: { remarkPlugins: [remarkGfm] } } },
    },
    "@storybook/addon-a11y",
  ],
  staticDirs: ["../public"],
  core: { disableTelemetry: true },
  // A preset hook StorybookConfig doesn't list yet: it rewrites each story's "Show code".
  experimental_enrichCsf: unwrapSnippets,
} satisfies StorybookConfig & { experimental_enrichCsf: typeof unwrapSnippets };

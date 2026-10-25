import solid from "@solidjs/vite-plugin";
import { defineConfig } from "vite";

// Storybook builds the stories with this config.
export default defineConfig({
  plugins: [solid()],
});

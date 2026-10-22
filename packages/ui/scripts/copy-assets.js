// tsc only emits JavaScript, so copy the CSS (global styles and component
// CSS modules), the font files and their licence next to it in dist/source,
// keeping the same paths so the CSS url()s still resolve.
import { cpSync, statSync } from "node:fs";

const assets = [".css", ".woff2", ".txt"];

cpSync("src", "dist/source", {
  recursive: true,
  filter: (path) => statSync(path).isDirectory() || assets.some((ext) => path.endsWith(ext)),
});

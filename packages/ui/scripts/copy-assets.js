// tsc only emits JavaScript, so copy the styles (global CSS, component SCSS
// modules and the Sass toolkit), the font files and their licence next to it
// in dist/source, keeping the same paths so imports and url()s still resolve.
import { cpSync, statSync } from "node:fs";

const assets = [".css", ".scss", ".woff2", ".txt"];

cpSync("src", "dist/source", {
  recursive: true,
  filter: (path) => statSync(path).isDirectory() || assets.some((ext) => path.endsWith(ext)),
});

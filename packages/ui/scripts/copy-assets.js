// tsc only emits JavaScript, so put the styles next to it in dist/source,
// keeping the same paths so imports and url()s still resolve. The global CSS,
// the font files and their licence are copied as they are. The component SCSS
// modules are compiled to CSS modules, and the emitted imports point at them,
// so apps build Yosegi from source without installing Sass.
import { cpSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { initCompiler } from "sass-embedded";

const assets = [".css", ".woff2", ".txt"];

cpSync("src", "dist/source", {
  recursive: true,
  filter: (path) => statSync(path).isDirectory() || assets.some((ext) => path.endsWith(ext)),
});

const files = (dir) => readdirSync(dir, { recursive: true }).map((path) => `${dir}/${path}`);

const sass = initCompiler();
try {
  for (const path of files("src").filter((path) => path.endsWith(".module.scss"))) {
    const { css } = sass.compile(path);
    writeFileSync(path.replace(/^src\//, "dist/source/").replace(/\.scss$/, ".css"), `${css}\n`);
  }
} finally {
  sass.dispose();
}

for (const path of files("dist/source").filter((path) => path.endsWith(".jsx") || path.endsWith(".js"))) {
  const code = readFileSync(path, "utf8");
  const fixed = code.replace(/(\.module)\.scss(["'])/g, "$1.css$2");
  if (fixed !== code) writeFileSync(path, fixed);
}

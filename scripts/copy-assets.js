import { copyFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const dist = join(root, "dist");

const files = [
  "manifest.json",
  "popup.html",
  "options.html",
  "popup.css",
  "options.css",
];
for (const f of files) {
  const src = join(root, f);
  const dest = join(dist, f);
  if (existsSync(src)) {
    copyFileSync(src, dest);
    console.log("Copied", f);
  }
}
const iconsDir = join(dist, "icons");
if (!existsSync(iconsDir)) mkdirSync(iconsDir, { recursive: true });
for (const size of [16, 48, 128]) {
  const src = join(root, "icons", `icon${size}.png`);
  const dest = join(iconsDir, `icon${size}.png`);
  if (existsSync(src)) {
    copyFileSync(src, dest);
    console.log("Copied icons/icon" + size + ".png");
  }
}
// Move content.css from src to dist (it's not in root)
const contentCssSrc = join(root, "src", "content.css");
const contentCssDest = join(dist, "content.css");
if (existsSync(contentCssSrc)) {
  copyFileSync(contentCssSrc, contentCssDest);
  console.log("Copied content.css");
}

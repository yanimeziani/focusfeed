import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, "..", "icons");
if (!existsSync(iconsDir)) mkdirSync(iconsDir, { recursive: true });

// Minimal 1x1 teal PNG (Chrome scales to 16, 48, 128)
const base64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
const buf = Buffer.from(base64, "base64");
for (const size of [16, 48, 128]) {
  const path = join(iconsDir, `icon${size}.png`);
  writeFileSync(path, buf);
  console.log("Wrote", path);
}

import { createWriteStream, readdirSync, statSync, unlinkSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import archiver from "archiver";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const dist = join(root, "dist");
const outZip = join(root, "focusfeed-chrome.zip");

function addDir(archive, dir, base = "") {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = join(dir, e.name);
    const name = base ? `${base}/${e.name}` : e.name;
    if (e.isDirectory()) {
      addDir(archive, full, name);
    } else {
      archive.file(full, { name });
    }
  }
}

if (existsSync(outZip)) unlinkSync(outZip);

const archive = archiver("zip", { zlib: { level: 9 } });
const out = createWriteStream(outZip);
archive.pipe(out);
addDir(archive, dist);
await archive.finalize();
await new Promise((res, rej) => {
  out.on("finish", res);
  archive.on("error", rej);
});

console.log("Created", outZip);

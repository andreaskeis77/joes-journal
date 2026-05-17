import { rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

const targets = ["data", "uploads"];

for (const target of targets) {
  const fullPath = resolve(root, target);
  try {
    await rm(fullPath, { recursive: true, force: true });
    console.log(`[reset] removed ${fullPath}`);
  } catch (error) {
    console.error(`[reset] failed to remove ${fullPath}:`, error);
    process.exitCode = 1;
  }
}

console.log("[reset] done. run `pnpm bootstrap` to re-init.");

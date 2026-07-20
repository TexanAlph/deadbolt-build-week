import { cp, mkdir, rm } from "node:fs/promises";
import { join, resolve } from "node:path";

const sourceRoot = resolve(process.cwd(), "samples/invoice-pilot");
const outputRoot = resolve(process.cwd(), "work/invoice-pilot-live-input");

// Keep answer-bearing sample material out of a fair live-model intake. This
// list intentionally excludes README.md, VULNERABILITY_MANIFEST.json, scripts,
// package-lock.json, and public assets.
const allowedPaths = [
  "eslint.config.mjs",
  "next.config.ts",
  "package.json",
  "postcss.config.mjs",
  "src",
  "supabase",
  "tsconfig.json",
  "vercel.json",
];

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });

for (const path of allowedPaths) {
  await cp(join(sourceRoot, path), join(outputRoot, path), {
    recursive: true,
  });
}

console.log("Prepared blind InvoicePilot live-engine input:");
console.log(outputRoot);
console.log(
  "Excluded answer-bearing docs, manifests, seed scripts, lockfiles, and public assets.",
);

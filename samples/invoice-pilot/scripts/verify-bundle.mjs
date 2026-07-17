import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const staticDirectory = join(process.cwd(), ".next", "static");
const plantedKey = "sk_live_demo_invoicepilot_NOT_A_REAL_SECRET_7H4M2Q9X";

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const paths = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? listFiles(path) : path;
    }),
  );

  return paths.flat();
}

const files = await listFiles(staticDirectory);
const clientChunks = files.filter((file) => file.endsWith(".js"));
let exposedChunk;

for (const chunk of clientChunks) {
  const contents = await readFile(chunk, "utf8");
  if (contents.includes(plantedKey)) {
    exposedChunk = chunk;
    break;
  }
}

if (!exposedChunk) {
  throw new Error("Expected the synthetic API key in a built client chunk.");
}

console.log(
  `✓ Verified synthetic API key exposure in ${exposedChunk.replace(`${process.cwd()}/`, "")}`,
);

import { execFile } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const DATA_PATH = new URL("../data/publications.json", import.meta.url);
const current = JSON.parse(await readFile(DATA_PATH, "utf8"));
const { stdout } = await execFileAsync("git", ["show", "HEAD:data/publications.json"], { maxBuffer: 100 * 1024 * 1024 });
const baseline = JSON.parse(stdout);
const baselineById = new Map(baseline.publications.map((publication) => [publication.id, publication]));
let repaired = 0;

function repair(value, reference) {
  if (typeof value === "string") {
    if (value.includes("�") && typeof reference === "string" && !reference.includes("�")) {
      repaired += 1;
      return reference;
    }
    return value;
  }
  if (Array.isArray(value)) return value.map((entry, index) => repair(entry, Array.isArray(reference) ? reference[index] : undefined));
  if (value && typeof value === "object") {
    for (const key of Object.keys(value)) value[key] = repair(value[key], reference?.[key]);
  }
  return value;
}

for (const publication of current.publications) repair(publication, baselineById.get(publication.id));
await writeFile(DATA_PATH, `${JSON.stringify(current, null, 2)}\n`);
process.stdout.write(`${JSON.stringify({ repaired }, null, 2)}\n`);

import { copyFile, mkdir } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const serverDirectory = new URL("dist/server/", root);
await mkdir(serverDirectory, { recursive: true });
await copyFile(new URL("src/worker.js", root), new URL("index.js", serverDirectory));

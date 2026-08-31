import { mkdir, readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const publicAssets = new URL("public/assets/", root);
const sourceAssets = new URL("assets/social/", root);
const temporary = new URL(".tmp/", root);
const [base, logo] = await Promise.all([
  readFile(new URL("datai-og-base.png", sourceAssets)),
  readFile(new URL("datai-logo.svg", publicAssets)),
]);

const baseData = `data:image/png;base64,${base.toString("base64")}`;
const logoData = `data:image/svg+xml;base64,${logo.toString("base64")}`;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <title>DatAI — Data for Artificial Intelligence</title>
  <image href="${baseData}" width="1200" height="630" />
  <rect x="0" y="0" width="570" height="630" fill="#0A1B12" fill-opacity="0.96" />
  <image href="${logoData}" x="64" y="130" width="224" height="58" />
  <rect x="64" y="318" width="176" height="5" fill="#8BCF00" />
  <text x="64" y="391" fill="#F2F3E8" font-family="Arial, Helvetica, sans-serif" font-size="46" font-weight="700" letter-spacing="-1.2">Data for Artificial</text>
  <text x="64" y="444" fill="#F2F3E8" font-family="Arial, Helvetica, sans-serif" font-size="46" font-weight="700" letter-spacing="-1.2">Intelligence</text>
  <text x="64" y="517" fill="#B8ED51" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700">DISCo · University of Milano-Bicocca</text>
</svg>`;

await mkdir(temporary, { recursive: true });
await writeFile(new URL("og-card-embedded.svg", temporary), svg);

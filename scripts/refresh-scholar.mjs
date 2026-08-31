import { mkdir, readFile, writeFile } from "node:fs/promises";

const DATA_PATH = new URL("../data/publications.json", import.meta.url);
const OUTPUT_PATH = new URL("../.tmp/publications/scholar-snapshot.json", import.meta.url);
const USER_AGENT = "DatAI-publications-audit/1.0";

function decodeHtml(value = "") {
  return value
    .replace(/<[^>]+>/g, "")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&#x27;", "'")
    .replaceAll("&apos;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&nbsp;", " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeTitle(value = "") {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function parseRows(html, affiliate, profile) {
  const rows = html.match(/<tr class="gsc_a_tr">[\s\S]*?<\/tr>/g) || [];
  return rows.map((row) => {
    const titleMatch = row.match(/<a([^>]*)class="gsc_a_at"([^>]*)>([\s\S]*?)<\/a>/);
    const titleAttributes = `${titleMatch?.[1] || ""} ${titleMatch?.[2] || ""}`;
    const hrefMatch = titleAttributes.match(/href="([^"]+)"/);
    const gray = [...row.matchAll(/<div class="gs_gray">([\s\S]*?)<\/div>/g)].map((match) => decodeHtml(match[1]));
    const yearMatch = row.match(/<span class="gsc_a_h[^>]*>(\d{4})<\/span>/);
    const citationMatch = row.match(/class="gsc_a_ac[^>]*>(\d+)<\/a>/);
    const href = hrefMatch?.[1]?.replaceAll("&amp;", "&") || "";
    const citationForView = new URL(href, "https://scholar.google.com").searchParams.get("citation_for_view");

    return {
      title: decodeHtml(titleMatch?.[3] || ""),
      authors: gray[0] || null,
      publication: gray[1] || null,
      year: yearMatch ? Number(yearMatch[1]) : null,
      citations: citationMatch ? Number(citationMatch[1]) : 0,
      affiliate_id: affiliate.id,
      profile_user_id: profile.user_id,
      citation_for_view: citationForView,
      citation_url: href ? new URL(href, "https://scholar.google.com").href : null,
    };
  }).filter((row) => row.title);
}

async function fetchProfile(affiliate, profile) {
  const collected = [];
  for (let start = 0; ; start += 100) {
    const url = new URL("https://scholar.google.com/citations");
    url.searchParams.set("hl", "en");
    url.searchParams.set("user", profile.user_id);
    url.searchParams.set("view_op", "list_works");
    url.searchParams.set("sortby", "pubdate");
    url.searchParams.set("pagesize", "100");
    url.searchParams.set("cstart", String(start));

    const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    const bytes = await response.arrayBuffer();
    const declared = response.headers.get("content-type")?.match(/charset=([^;]+)/i)?.[1]?.trim() || "utf-8";
    let html = new TextDecoder(declared).decode(bytes);
    if (html.includes("�")) html = new TextDecoder("windows-1252").decode(bytes);
    if (!response.ok || !html.includes("gsc_a_tr")) {
      throw new Error(`Scholar returned ${response.status} for ${affiliate.name} at row ${start}`);
    }

    const rows = parseRows(html, affiliate, profile);
    collected.push(...rows);
    if (rows.length < 100) break;
    await new Promise((resolve) => setTimeout(resolve, 350));
  }
  return collected;
}

const data = JSON.parse(await readFile(DATA_PATH, "utf8"));
const profiles = [];
for (const affiliate of data.affiliates) {
  for (const profile of affiliate.scholar_profiles) {
    const rows = await fetchProfile(affiliate, profile);
    profiles.push({
      affiliate_id: affiliate.id,
      affiliate_name: affiliate.name,
      profile_user_id: profile.user_id,
      profile_url: profile.profile_url,
      previous_row_count: profile.publication_count,
      current_row_count: rows.length,
      rows,
    });
    process.stdout.write(`${affiliate.name} (${profile.user_id}): ${rows.length} rows\n`);
    await new Promise((resolve) => setTimeout(resolve, 450));
  }
}

const existingByCitation = new Map();
const existingByTitle = new Map();
for (const publication of data.publications) {
  for (const source of publication.scholar_sources || []) {
    const id = new URL(source.citation_url).searchParams.get("citation_for_view");
    if (id) existingByCitation.set(id, publication.id);
  }
  const key = normalizeTitle(publication.title);
  const values = existingByTitle.get(key) || [];
  values.push(publication.id);
  existingByTitle.set(key, values);
}

const allRows = profiles.flatMap((profile) => profile.rows);
const newRows = allRows.filter((row) => !existingByCitation.has(row.citation_for_view));
const missingRows = [];
const freshCitationIds = new Set(allRows.map((row) => row.citation_for_view));
for (const publication of data.publications) {
  for (const source of publication.scholar_sources || []) {
    const citationId = new URL(source.citation_url).searchParams.get("citation_for_view");
    if (citationId && !freshCitationIds.has(citationId)) {
      missingRows.push({ publication_id: publication.id, title: publication.title, citation_id: citationId });
    }
  }
}

const snapshot = {
  generated_at: new Date().toISOString(),
  source: "Google Scholar public author profiles",
  profile_count: profiles.length,
  source_row_count: allRows.length,
  profiles,
  audit: {
    new_source_rows: newRows.map((row) => ({
      ...row,
      possible_existing_publication_ids: existingByTitle.get(normalizeTitle(row.title)) || [],
    })),
    missing_source_rows: missingRows,
  },
};

await mkdir(new URL("../.tmp/publications/", import.meta.url), { recursive: true });
await writeFile(OUTPUT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`);
process.stdout.write(`Total rows: ${allRows.length}\nNew Scholar rows: ${newRows.length}\nMissing Scholar rows: ${missingRows.length}\n`);

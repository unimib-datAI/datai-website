import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const DATA_PATH = new URL("../data/publications.json", import.meta.url);
const CACHE_DIR = new URL("../.tmp/publications/scholar-details/", import.meta.url);
const USER_AGENT = "DatAI-publications-audit/1.0";

function decodeHtml(value = "") {
  return String(value)
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

function cachePath(url) {
  const digest = createHash("sha256").update(url).digest("hex").slice(0, 24);
  return new URL(`${digest}.html`, CACHE_DIR);
}

async function fetchDetail(url) {
  const path = cachePath(url);
  try {
    return await readFile(path, "utf8");
  } catch {}
  if (process.env.SCHOLAR_DETAILS_NETWORK !== "1") return null;

  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(20_000) });
      const bytes = await response.arrayBuffer();
      const declared = response.headers.get("content-type")?.match(/charset=([^;]+)/i)?.[1]?.trim() || "utf-8";
      let html = new TextDecoder(declared).decode(bytes);
      if (html.includes("�")) html = new TextDecoder("windows-1252").decode(bytes);
      if (response.ok && html.includes("gsc_oci_field")) {
        await writeFile(path, html);
        return html;
      }
      if (![429, 500, 502, 503, 504].includes(response.status)) return null;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 900 * (2 ** attempt)));
  }
  return null;
}

function parseDetail(html) {
  const fields = {};
  const pattern = /<div class="gs_scl"><div class="gsc_oci_field">([\s\S]*?)<\/div><div class="gsc_oci_value"[^>]*>([\s\S]*?)<\/div><\/div>/g;
  for (const match of html.matchAll(pattern)) {
    const name = decodeHtml(match[1]).toLowerCase();
    const value = decodeHtml(match[2]);
    if (name && value) fields[name] = value;
  }
  return fields;
}

function parseAuthors(value) {
  if (!value) return null;
  const names = value.split(/\s*,\s*/).map((name) => name.trim()).filter(Boolean);
  if (!names.length) return null;
  return names.map((name) => {
    const parts = name.split(/\s+/);
    return {
      given: parts.length > 1 ? parts.slice(0, -1).join(" ") : null,
      family: parts.at(-1) || null,
      name,
      orcid: null,
    };
  });
}

function inferredType(fields, currentType) {
  if (currentType && currentType !== "other" && currentType !== "conferencepaper") return currentType;
  if (fields.journal) return "journal-article";
  if (fields.conference) return "conference-paper";
  if (fields.book) return "book-chapter";
  if (fields.institution && /thesis|tesi|dissertation/i.test(fields.institution)) return "thesis";
  return currentType === "conferencepaper" ? "conference-paper" : currentType || "other";
}

function normalizeText(value = "") {
  return String(value).normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

const AFFILIATE_AUTHOR_ALIASES = {
  "flavio-maria-de-paoli": ["de paoli", "paoli"],
  "andrea-maurino": ["maurino"],
  "michele-ciavotta": ["ciavotta"],
  "matteo-luigi-palmonari": ["palmonari"],
  "blerina-spahiu": ["spahiu"],
  "abubakari-alidu": ["abubakari", "alidu"],
  "emanuele-petriglia": ["petriglia"],
  "federica-filippini": ["filippini"],
  "marco-cremaschi": ["cremaschi"],
  "riccardo-pozzi": ["pozzi"],
  "renzo-arturo-alva-principe": ["alva", "principe"],
  "carlo-batini": ["batini"],
};

function hasAffiliateAuthorship(publication) {
  if (!publication.author_list?.length) return true;
  return publication.affiliate_ids.some((affiliateId) => publication.author_list.some((author) => (
    (AFFILIATE_AUTHOR_ALIASES[affiliateId] || []).some((alias) => normalizeText(author.name || "").includes(alias))
  )));
}

function isNonAuthoredArtifact(publication) {
  const title = normalizeText(publication.title);
  return /(^| )(external reviewers|additional reviewers|reviewers|program committee|organizing committee|workshop committee|conference organization)( |$)/.test(title)
    || /^\d{4} index /.test(title)
    || /^access to the document$/.test(title)
    || /^preface of /.test(title)
    || /^program committees$/.test(title)
    || /^journal homepage /.test(title)
    || / selected publications /.test(` ${title} `)
    || /^heinonen henri tapani /.test(title)
    || (/^20\d{2} .*conference/.test(title) && /978 1 /.test(title))
    || /^sig$/.test(title)
    || /^ldk \d{4}$/.test(title)
    || ["michael l brodie", "visual information systems", "modern information retrieval title"].includes(title)
    || title.startsWith("nell ambito di questo studio e stata dedicata grande attenzione");
}

function recalculateSummary(data) {
  const publications = data.publications;
  return {
    ...data.verification_summary,
    unique_publication_count: publications.length,
    included_record_count: publications.filter((publication) => publication.record_status === "included").length,
    excluded_artifact_count: publications.filter((publication) => publication.record_status !== "included").length,
    doi_count: publications.filter((publication) => publication.doi).length,
    included_doi_count: publications.filter((publication) => publication.record_status === "included" && publication.doi).length,
    no_doi_found_count: publications.filter((publication) => !publication.doi).length,
    multiple_source_verified_count: publications.filter((publication) => publication.verification.status === "verified_multiple_sources").length,
    primary_registry_verified_count: publications.filter((publication) => publication.verification.status === "verified_primary_registry").length,
    scholar_only_count: publications.filter((publication) => publication.verification.status === "scholar_only").length,
    complete_year_count: publications.filter((publication) => publication.year).length,
    complete_venue_count: publications.filter((publication) => publication.venue).length,
    complete_author_count: publications.filter((publication) => publication.authors).length,
    structured_author_list_count: publications.filter((publication) => publication.author_list?.length).length,
    excluded_non_affiliate_authorship_count: publications.filter((publication) => publication.record_status === "excluded_non_affiliate_authorship").length,
    included_complete_year_count: publications.filter((publication) => publication.record_status === "included" && publication.year).length,
    included_complete_venue_count: publications.filter((publication) => publication.record_status === "included" && publication.venue).length,
    complete_core_metadata_count: publications.filter((publication) => publication.metadata_completeness.status === "complete_core").length,
    included_complete_core_metadata_count: publications.filter((publication) => publication.record_status === "included" && publication.metadata_completeness.status === "complete_core").length,
  };
}

await mkdir(CACHE_DIR, { recursive: true });
const data = JSON.parse(await readFile(DATA_PATH, "utf8"));
const targets = data.publications.filter((publication) => !publication.author_list?.length || !publication.year || !publication.venue);
let fetched = 0;
let unavailable = 0;

process.stdout.write(`Google Scholar detail pages: checking ${targets.length} records with incomplete structured metadata\n`);
for (const publication of targets) {
  const url = publication.scholar_sources?.[0]?.citation_url;
  if (!url) {
    unavailable += 1;
    continue;
  }
  const html = await fetchDetail(url);
  if (!html) {
    unavailable += 1;
    continue;
  }
  fetched += 1;
  const fields = parseDetail(html);
  const authorList = parseAuthors(fields.authors);
  const dateValue = fields["publication date"] || fields.year || "";
  const year = Number(String(dateValue).match(/(?:19|20)\d{2}/)?.[0]) || null;
  const venue = fields.journal || fields.conference || fields.book || null;
  const source = publication.web_sources?.find((entry) => entry.name === "Google Scholar");
  if (source) source.detail_checked = true;
  publication.scholar_details = {
    checked: true,
    source_url: url,
    fields,
  };
  if (!publication.author_list?.length && authorList?.length) {
    publication.author_list = authorList;
    publication.authors = authorList.map((author) => author.name).join(", ");
  }
  if (!publication.year && year) publication.year = year;
  if (!publication.publication_date && dateValue) publication.publication_date = dateValue;
  if ((!publication.venue || publication.verification.status === "scholar_only") && venue) publication.venue = venue;
  if (!publication.publisher && fields.publisher) publication.publisher = fields.publisher;
  if (!publication.volume && fields.volume) publication.volume = fields.volume;
  if (!publication.issue && fields.issue) publication.issue = fields.issue;
  if (!publication.pages && fields.pages) publication.pages = fields.pages;
  publication.type = inferredType(fields, publication.type);

  if (fetched % 50 === 0) process.stdout.write(`Google Scholar details: ${fetched}/${targets.length}\n`);
  await new Promise((resolve) => setTimeout(resolve, 450));
}

for (const publication of data.publications) {
  publication.duplicate_record_ids ||= [];
  if (publication.type === "conferencepaper") publication.type = "conference-paper";
  if (isNonAuthoredArtifact(publication)) publication.record_status = "excluded_non_authored_artifact";
  else if (!hasAffiliateAuthorship(publication)) publication.record_status = "excluded_non_affiliate_authorship";
  if (publication.record_status !== "included") publication.verification.status = "excluded";
  publication.metadata_completeness = {
    status: publication.authors && publication.year && publication.venue && publication.type !== "other" ? "complete_core" : "partial_source_metadata",
    missing_core_fields: [
      !publication.authors ? "authors" : null,
      !publication.year ? "year" : null,
      !publication.venue ? "venue" : null,
      publication.type === "other" ? "type" : null,
    ].filter(Boolean),
  };
}
data.verification_summary = recalculateSummary(data);
await writeFile(DATA_PATH, `${JSON.stringify(data, null, 2)}\n`);
process.stdout.write(`${JSON.stringify({ fetched, unavailable, summary: data.verification_summary }, null, 2)}\n`);

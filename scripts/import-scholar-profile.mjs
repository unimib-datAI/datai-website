import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const DATA_PATH = new URL("../data/publications.json", import.meta.url);
const SNAPSHOT_PATH = new URL("../.tmp/publications/scholar-snapshot.json", import.meta.url);
const PROFILE_PATH = new URL("../.tmp/publications/carlo-scholar-browser.json", import.meta.url);
const AFFILIATE_ID = "carlo-batini";

function normalizeText(value = "") {
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function skeleton(row) {
  const digest = createHash("sha256").update(row.citation_for_view).digest("hex").slice(0, 16);
  return {
    id: `gs-${digest}`,
    title: row.title,
    authors: row.authors,
    publication: row.publication,
    year: row.year,
    citations: row.citations || 0,
    affiliate_ids: [AFFILIATE_ID],
    scholar_sources: [],
    author_list: null,
    scholar_authors: row.authors,
    venue: row.publication,
    publisher: null,
    published_print_year: null,
    published_online_year: null,
    publication_date: null,
    type: "other",
    volume: null,
    issue: null,
    pages: null,
    article_number: null,
    doi: null,
    doi_url: null,
    doi_status: "not_found",
    record_status: "included",
    identifiers: {
      crossref_doi: null,
      openalex_id: null,
      dblp_key: null,
      datacite_doi: null,
      isbn: [],
      issn: [],
    },
    web_sources: [],
    verification: {
      status: "scholar_only",
      checked_at: null,
      matched_sources: ["google_scholar"],
      confidence: 0,
      crossref_score: null,
      openalex_score: null,
      dblp_score: null,
      datacite_score: null,
    },
    duplicate_record_ids: [],
    scholar_details: null,
    metadata_completeness: {
      status: row.authors && row.year && row.publication ? "complete_core" : "partial_source_metadata",
      missing_core_fields: [!row.authors ? "authors" : null, !row.year ? "year" : null, !row.publication ? "venue" : null, "type"].filter(Boolean),
    },
  };
}

const data = JSON.parse(await readFile(DATA_PATH, "utf8"));
const snapshot = JSON.parse(await readFile(SNAPSHOT_PATH, "utf8"));
const extracted = JSON.parse(await readFile(PROFILE_PATH, "utf8"));
const affiliate = data.affiliates.find((entry) => entry.id === AFFILIATE_ID);
if (!affiliate) throw new Error(`Missing affiliate ${AFFILIATE_ID}`);
const profile = affiliate.scholar_profiles.find((entry) => entry.user_id === extracted.profile_user_id);
if (!profile) throw new Error(`Missing Scholar profile ${extracted.profile_user_id}`);
if (extracted.rows.length !== extracted.row_count) throw new Error("Extracted Scholar row count is inconsistent");
if (new Set(extracted.rows.map((row) => row.citation_for_view)).size !== extracted.rows.length) throw new Error("Duplicate Scholar citation IDs in extracted profile");

const snapshotProfile = {
  affiliate_id: affiliate.id,
  affiliate_name: affiliate.name,
  profile_user_id: profile.user_id,
  profile_url: profile.profile_url,
  previous_row_count: profile.publication_count,
  current_row_count: extracted.rows.length,
  rows: extracted.rows.map((row) => ({
    ...row,
    affiliate_id: affiliate.id,
    profile_user_id: profile.user_id,
  })),
};
snapshot.profiles = snapshot.profiles.filter((entry) => entry.profile_user_id !== profile.user_id);
snapshot.profiles.push(snapshotProfile);
snapshot.generated_at = extracted.generated_at;
snapshot.profile_count = snapshot.profiles.length;
snapshot.source_row_count = snapshot.profiles.reduce((sum, entry) => sum + entry.rows.length, 0);
snapshot.audit = {
  ...(snapshot.audit || {}),
  note: "Carlo Batini profile rows were extracted from the public Google Scholar author page in the in-app browser.",
};

const byCitation = new Map();
const byTitle = new Map();
for (const publication of data.publications) {
  for (const source of publication.scholar_sources || []) {
    const id = new URL(source.citation_url).searchParams.get("citation_for_view");
    if (id) byCitation.set(id, publication);
  }
  const key = normalizeText(publication.title);
  const values = byTitle.get(key) || [];
  values.push(publication);
  byTitle.set(key, values);
}

let added = 0;
let matched = 0;
for (const row of snapshotProfile.rows) {
  let publication = byCitation.get(row.citation_for_view);
  if (!publication) {
    const titleMatches = (byTitle.get(normalizeText(row.title)) || []).filter((candidate) => (
      !candidate.year || !row.year || Math.abs(candidate.year - row.year) <= 1
    ));
    if (titleMatches.length === 1) publication = titleMatches[0];
  }
  if (!publication) {
    publication = skeleton(row);
    data.publications.push(publication);
    const key = normalizeText(publication.title);
    byTitle.set(key, [...(byTitle.get(key) || []), publication]);
    added += 1;
  } else {
    matched += 1;
  }
  publication.affiliate_ids = unique([...(publication.affiliate_ids || []), affiliate.id]);
  publication.citations = Math.max(publication.citations || 0, row.citations || 0);
  publication.scholar_sources ||= [];
  if (!publication.scholar_sources.some((source) => source.citation_url === row.citation_url)) {
    publication.scholar_sources.push({
      affiliate_id: affiliate.id,
      profile_user_id: profile.user_id,
      citation_url: row.citation_url,
    });
  }
  byCitation.set(row.citation_for_view, publication);
}

profile.publication_count = extracted.rows.length;
affiliate.publication_ids = unique(data.publications.filter((publication) => publication.affiliate_ids.includes(affiliate.id)).map((publication) => publication.id));
data.scope.source_row_count = snapshot.source_row_count;
data.scope.unique_publication_count = data.publications.length;
data.scope.description = "Publications associated with the twelve confirmed DatAI members. Google Scholar public author profiles provide the source inventory; registry and bibliographic services are used to verify metadata and identifiers.";

await writeFile(SNAPSHOT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`);
await writeFile(DATA_PATH, `${JSON.stringify(data, null, 2)}\n`);
process.stdout.write(`${JSON.stringify({ extracted: extracted.rows.length, matched_existing: matched, added, snapshot_source_rows: snapshot.source_row_count }, null, 2)}\n`);

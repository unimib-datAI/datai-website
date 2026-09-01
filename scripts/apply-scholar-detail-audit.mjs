import { readFile, writeFile } from "node:fs/promises";

const DATA_PATH = new URL("../data/publications.json", import.meta.url);
const DETAILS_PATH = new URL("../.tmp/publications/carlo-scholar-questionable-details.json", import.meta.url);
const CHECKED_AT = new Date().toISOString().slice(0, 10);

function normalizeText(value = "") {
  return String(value).normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function parseAuthors(value) {
  return String(value || "").split(/\s*,\s*/).map((name) => name.trim()).filter(Boolean).map((name) => {
    const parts = name.split(/\s+/);
    return { given: parts.length > 1 ? parts.slice(0, -1).join(" ") : null, family: parts.at(-1) || null, name, orcid: null };
  });
}

function isArtifact(title) {
  const value = normalizeText(title);
  return [
    "michael l brodie",
    "visual information systems",
    "modern information retrieval title",
  ].includes(value) || value.startsWith("nell ambito di questo studio e stata dedicata grande attenzione");
}

function summary(publications, previous) {
  const included = publications.filter((publication) => publication.record_status === "included");
  return {
    ...previous,
    unique_publication_count: publications.length,
    included_record_count: included.length,
    excluded_artifact_count: publications.filter((publication) => publication.record_status === "excluded_non_authored_artifact").length,
    doi_count: publications.filter((publication) => publication.doi).length,
    included_doi_count: included.filter((publication) => publication.doi).length,
    no_doi_found_count: publications.filter((publication) => !publication.doi).length,
    multiple_source_verified_count: publications.filter((publication) => publication.verification.status === "verified_multiple_sources").length,
    primary_registry_verified_count: publications.filter((publication) => publication.verification.status === "verified_primary_registry").length,
    scholar_only_count: publications.filter((publication) => publication.verification.status === "scholar_only").length,
    complete_year_count: publications.filter((publication) => publication.year).length,
    complete_venue_count: publications.filter((publication) => publication.venue).length,
    complete_author_count: publications.filter((publication) => publication.authors).length,
    structured_author_list_count: publications.filter((publication) => publication.author_list?.length).length,
    excluded_non_affiliate_authorship_count: publications.filter((publication) => publication.record_status === "excluded_non_affiliate_authorship").length,
    included_complete_year_count: included.filter((publication) => publication.year).length,
    included_complete_venue_count: included.filter((publication) => publication.venue).length,
    complete_core_metadata_count: publications.filter((publication) => publication.metadata_completeness.status === "complete_core").length,
    included_complete_core_metadata_count: included.filter((publication) => publication.metadata_completeness.status === "complete_core").length,
  };
}

const data = JSON.parse(await readFile(DATA_PATH, "utf8"));
const details = JSON.parse(await readFile(DETAILS_PATH, "utf8"));
const byId = new Map(data.publications.map((publication) => [publication.id, publication]));

for (const detail of details) {
  const publication = byId.get(detail.id);
  if (!publication) throw new Error(`Unknown publication ${detail.id}`);
  const fields = detail.fields || {};
  const authorList = parseAuthors(fields.authors);
  const dateValue = fields["publication date"] || "";
  const year = Number(dateValue.match(/(?:19|20)\d{2}/)?.[0]) || null;
  const venue = fields.journal || fields.conference || fields.book || publication.venue;
  publication.scholar_details = { checked: true, source_url: detail.url, fields };
  publication.verification.checked_at = CHECKED_AT;
  if (authorList.length) {
    publication.author_list = authorList;
    publication.authors = authorList.map((author) => author.name).join(", ");
  }
  if (!publication.year && year) publication.year = year;
  if (!publication.publication_date && dateValue) publication.publication_date = dateValue;
  if (venue) publication.venue = venue;
  if (fields.publisher) publication.publisher = fields.publisher;
  if (fields.volume) publication.volume = fields.volume;
  if (fields.issue) publication.issue = fields.issue;
  if (fields.pages) publication.pages = fields.pages;
  if (fields.journal) publication.type = "journal-article";
  else if (fields.conference) publication.type = "conference-paper";
  else if (fields.book) publication.type = "book-chapter";

  const hasBatini = authorList.some((author) => normalizeText(author.name).includes("batini") || normalizeText(author.name).includes("cario batini"));
  if (isArtifact(publication.title)) publication.record_status = "excluded_non_authored_artifact";
  else if (authorList.length && !hasBatini) publication.record_status = "excluded_non_affiliate_authorship";
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

data.verification_summary = summary(data.publications, data.verification_summary);
data.scope.included_record_count = data.verification_summary.included_record_count;
await writeFile(DATA_PATH, `${JSON.stringify(data, null, 2)}\n`);
process.stdout.write(`${JSON.stringify({ updated: details.length, summary: data.verification_summary }, null, 2)}\n`);

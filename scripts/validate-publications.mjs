import { readFile } from "node:fs/promises";

const data = JSON.parse(await readFile(new URL("../data/publications.json", import.meta.url), "utf8"));
const errors = [];
const publications = data.publications;
const included = publications.filter((publication) => publication.record_status === "included");
const sourceUrls = publications.flatMap((publication) => publication.scholar_sources?.map((source) => source.citation_url) || []);
const dois = publications.map((publication) => publication.doi).filter(Boolean);
const ids = publications.map((publication) => publication.id);
const publicationIds = new Set(ids);

function assert(condition, message) {
  if (!condition) errors.push(message);
}

assert(data.schema_version === "2.0.0", `Unexpected schema version: ${data.schema_version}`);
assert(data.scope.affiliate_count === data.affiliates.length, "Affiliate count does not match affiliates array");
assert(data.scope.google_scholar_profile_count === data.affiliates.flatMap((affiliate) => affiliate.scholar_profiles).length, "Scholar profile count does not match profile arrays");
assert(data.verification_summary.unique_publication_count === publications.length, "Unique publication summary is stale");
assert(data.verification_summary.included_record_count === included.length, "Included publication summary is stale");
assert(data.verification_summary.source_row_count === sourceUrls.length, "Scholar source-row summary is stale");
assert(sourceUrls.length === new Set(sourceUrls).size, "Duplicate Scholar source URLs remain after deduplication");
assert(ids.length === new Set(ids).size, "Duplicate publication IDs found");
assert(dois.length === new Set(dois).size, "Duplicate DOI values found");
assert(!JSON.stringify(data).includes("�"), "Unicode replacement characters remain in the dataset");

for (const publication of publications) {
  assert(Boolean(publication.title), `${publication.id}: missing title`);
  assert(Boolean(publication.authors), `${publication.id}: missing author display string`);
  assert(Array.isArray(publication.affiliate_ids) && publication.affiliate_ids.length > 0, `${publication.id}: missing affiliate IDs`);
  assert(Array.isArray(publication.scholar_sources) && publication.scholar_sources.length > 0, `${publication.id}: missing Scholar provenance`);
  assert(["included", "excluded_non_authored_artifact", "excluded_non_affiliate_authorship"].includes(publication.record_status), `${publication.id}: invalid record status`);
  assert(["verified", "not_found"].includes(publication.doi_status), `${publication.id}: invalid DOI status`);
  assert(publication.metadata_completeness?.missing_core_fields instanceof Array, `${publication.id}: missing metadata completeness status`);
  if (publication.doi) {
    assert(/^10\.\d{4,9}\/\S+$/i.test(publication.doi), `${publication.id}: malformed DOI ${publication.doi}`);
    assert(publication.doi_url === `https://doi.org/${publication.doi}`, `${publication.id}: DOI URL mismatch`);
    assert(publication.doi_status === "verified", `${publication.id}: DOI is present but not marked verified`);
  } else {
    assert(publication.doi_url === null, `${publication.id}: DOI URL must be null when DOI is absent`);
    assert(publication.doi_status === "not_found", `${publication.id}: missing DOI must be marked not_found`);
  }
  if (publication.year) assert(publication.year >= 1900 && publication.year <= 2027, `${publication.id}: implausible year ${publication.year}`);
}

for (const affiliate of data.affiliates) {
  assert(affiliate.publication_ids.every((id) => publicationIds.has(id)), `${affiliate.id}: publication_ids contains a missing record`);
  assert(affiliate.publication_ids.length === new Set(affiliate.publication_ids).size, `${affiliate.id}: duplicate publication_ids`);
}

if (errors.length) {
  process.stderr.write(`${errors.map((error) => `- ${error}`).join("\n")}\n`);
  process.exit(1);
}

process.stdout.write(`${JSON.stringify({
  scholar_source_rows: sourceUrls.length,
  unique_records: publications.length,
  included_authored_outputs: included.length,
  excluded_non_authored_artifacts: data.verification_summary.excluded_artifact_count,
  excluded_non_affiliate_authorship: data.verification_summary.excluded_non_affiliate_authorship_count,
  verified_dois_included: data.verification_summary.included_doi_count,
  no_doi_found: included.filter((publication) => !publication.doi).length,
  complete_core_metadata: data.verification_summary.included_complete_core_metadata_count,
}, null, 2)}\n`);

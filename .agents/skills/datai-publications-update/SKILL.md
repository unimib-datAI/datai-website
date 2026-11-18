---
name: datai-publications-update
description: Update the DatAI publication dataset. Use for Scholar refreshes, bibliographic corrections, DOI verification, duplicate records, or archive counts and member attribution driven by publication data.
---

# Update the DatAI publication archive

Follow the [repository instructions](../../../AGENTS.md). The archive, totals, and filters are generated from `data/publications.json` by `vite.config.js`. The build lists records with `record_status: included` and keeps the excluded records in the dataset for auditability.

## Choose the update scope

- For targeted corrections, verify the work against its Scholar source and relevant publisher or registry records. Check the title, author overlap, year and venue together before accepting a match or DOI. Update affected record metadata, provenance, affiliate links and derived counts in `data/publications.json`. Keep stable IDs and preserve source URLs when merging duplicates. Under the current schema, each record needs at least one Scholar source and one affiliate ID.
- For a full refresh, run `node scripts/refresh-scholar.mjs` first. Review `.tmp/publications/scholar-snapshot.json` for covered profiles and its audit of new and missing rows. A missing row can reflect a partial fetch or a change to a source profile. Resolve that before removing a previously verified record. With a usable snapshot, run `node scripts/enrich-publications.mjs` and `node scripts/enrich-scholar-details.mjs` in that order. These steps update the tracked dataset. Review `.tmp/publications/enrichment-report.json` and the diff for unexpected changes in counts, attribution and verification status.
- Keep unsupported DOI values empty with `doi_status: not_found` and use the existing verification statuses. Preserve the distinction between a registry-verified record and a Scholar-only record. Use the date of the actual archive snapshot for its citation figures.

## Validate and build

- Run `npm run validate:publications` to check identifiers, provenance, duplicate IDs and DOIs, and summary consistency. Review additions, exclusions and merges against source evidence before treating them as archive changes.
- Run `npm run build:pages`. Confirm the included-record total agrees across `/publications/` and the full Home. Check the affected year and member filters and DOI or Scholar links in the built archive. For filter-related changes, also check a direct `/publications/?member={id}#archive` link and the archive with JavaScript disabled.

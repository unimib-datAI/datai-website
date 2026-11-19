---
name: datai-people-update
description: Update the DatAI People roster or a member's public profile. Use for membership, roles, bios, institutional links, selected research outputs, or member portraits and their generated pages.
---

# Update the DatAI roster and profiles

Follow the [repository instructions](../../../AGENTS.md). Use institutional profiles or evidence approved by the lab to verify the changed facts. Keep current DatAI membership distinct from historical affiliation and preserve the spelling, accents, and stable `id` used for links to a member.

## Update the canonical record

- Edit `data/people.json` and set `reviewed_at` to the date of the actual review. Follow existing record fields and keep the primary institutional or scholarly link first. The first link supplies the main external profile action.
- If the roster changes, check the manually maintained Home portraits and roster count in `index.html` and the count and review text in `people/index.html`. Vite replaces the marked People roster block from `data/people.json`. Check Research and archive links to any profile whose route changes. Keep historical publication attribution based on its own evidence.
- For portrait changes, use the [portrait and provenance rules](../../../DESIGN.md#people-and-portrait-policy) and consult [the photo source notes](../../../research/people-photos.md). Match the 4:5 series and update `data/people-photos.json` when source or rights metadata changes. Record source, transformation and rights in `public/assets/provenance.json` for the shipping asset.

## Regenerate and inspect

- Run `npm run generate:people`. The generator writes `people/{id}/index.html` and `public/sitemap.xml`. It leaves old profile files on disk when an ID leaves the roster. If a route is intentionally removed, account for the stale generated file and inbound links.
- Run `npm run build:pages`. Compare the roster and generated changes with the requested update. Verify affected profile URLs and canonicals, the directory and neighbor links, and `/publications/?member={id}#archive` when that member is in the archive. Check the Home links and sitemap when membership changes.

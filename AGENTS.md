# DatAI website maintenance

Read the visual system and the editorial rules before editing the site. Check the surface brief when one exists. [Design](DESIGN.md) · [Product](PRODUCT.md) · [Surface briefs](.impeccable/surfaces)

## DatAI skills

- Use [datai-ui-update](.agents/skills/datai-ui-update/SKILL.md) for layout, typography, shared components, responsive interaction, accessibility, and Impeccable findings.
- Use [datai-people-update](.agents/skills/datai-people-update/SKILL.md) for roster changes, member roles and bios, profile links, selected research outputs, and portraits.
- Use [datai-publications-update](.agents/skills/datai-publications-update/SKILL.md) for Scholar refreshes, bibliographic corrections, DOI checks, deduplication, and archive totals or author attribution driven by the dataset.

## Design and content

- Write public content in English. Use the established palette and typography from the `@theme` block in `src/styles.css` and reuse the shared navigation, evidence rows, links and focus styles.
- Keep facts traceable to institutional records, publications or verified project sources. Date roster reviews and publication snapshots. For image changes, update `public/assets/provenance.json` with the source, transformation and rights status.
- Keep essential content and navigation available without JavaScript. Preserve keyboard access, visible focus, reduced-motion behavior, section IDs and existing deep links.

## Routes and build sources

- Edit the Home at `/` in `index.html`. Keep `/home/` (`home/index.html`) as a redirect for existing links. The shared logo, mobile Home link, sitemap homepage entry, manifest start URL and canonical metadata use `/`.
- Edit the shared header, footer and Umami integration in `src/site-shell.js`. Keep tracking cookie-free and limited to `datai.disco.unimib.it`. Respect Do Not Track, exclude query strings and fragments from tracked page URLs, and keep the footer disclosure in sync with the implementation.
- Edit people in `data/people.json` and the profile template and rendering in `people/profile.html` and `scripts/generate-people-pages.mjs`. Run `npm run generate:people` to regenerate the tracked profile pages and `public/sitemap.xml`. When the roster changes, review the full Home mosaic and roster copy as well.
- Edit the Tools catalog in `data/tools.json` and its rendering in `src/tools-directory.js`. Preserve category and tool IDs used by Research links. The publication archive uses `data/publications.json` and the build transform in `vite.config.js`.
- The institutional site uses `https://datai.disco.unimib.it` and GitHub Pages. Keep absolute metadata, profile generation, `public/robots.txt` and the generated sitemap on that origin. Add new page entries to `vite.config.js` and update the sitemap generator when the set of indexable routes changes.

## Verify changes

- Run `npm ci` when setting up dependencies. Run `npm run build:pages` to reproduce the GitHub Pages build with Node.js 22. `npm run preview` serves the built output. Run `npm run validate:publications` when changing publication data.
- For UI changes, check the affected routes at 320, 768, 1024 and 1280 px and exercise keyboard navigation, reduced motion and the JavaScript-disabled fallback. For route or metadata changes, check the built HTML, internal links, canonicals and sitemap together.
- Review the generated files in the diff. `.github/workflows/pages.yml` builds and deploys `dist/` on pushes to `main`.

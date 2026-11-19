---
name: DatAI — Data for Artificial Intelligence
description: An evidence-led academic interface where every research claim connects to people and inspectable artifacts.
colors:
  petrol-950: "#0a1b12"
  petrol-900: "#1b3b2c"
  petrol-800: "#27513c"
  acid-500: "#8bcf00"
  acid-300: "#b8ed51"
  paper-50: "#f2f3e8"
  paper-100: "#e6e8da"
  ink-950: "#132019"
  ink-700: "#425449"
typography:
  sans: "Manrope Variable, ui-sans-serif, system-ui, sans-serif"
  serif: "Newsreader Variable, ui-serif, Georgia, serif"
direction:
  name: Evidence Slide Tray
  number: 6
  seed: "57e260a9"
verdict: PASS
---

# DatAI design system

## Creative north star

DatAI presents research as labeled, connected specimens rather than a conventional institutional card grid. Every meaningful claim should lead through a visible chain of research question, people, project or resource, and publication.

The visual world combines CRT-black forest fields, the official DatAI green, cool backlit paper, etched dividers, compact metadata, and geometry derived from the official wordmark. It should feel academically authoritative, computational, and inspectable. Avoid generic university templates, decorative neon-AI imagery, wet-lab metaphors, glass effects, and ornamental technology graphics.

### Principles

- **Evidence before claims.** Pair claims with inspectable public sources.
- **Visible causality.** Connect questions explicitly to people and outputs.
- **Dependency honesty.** Label unknown, dated, or permission-dependent content.
- **Identity cohesion.** CRT black, forest green, acid green, paper, serif inquiry, and specimen notation form one world.
- **Progressive enhancement.** Essential research and publication content remains available without JavaScript.
- **Flat, precise utility.** Structure comes from type, rules, contrast, and spacing—not decorative elevation.

## Page architecture

1. **Home (`/`).** State the laboratory thesis, show three linked questions in the signature tray, make the group visible, and route visitors to Research, Tools, People, Publications, and Contact.
2. **Research.** Expand four areas into question → methods → evidence chains, followed by a dated project ledger and selected results. Link reusable software and resources to their Tools entries.
3. **Tools.** Group verified reusable resources by research area. Use ruled rows with a Newsreader title, compact resource type, a short description and direct links. Stack the fields in reading order on mobile and align them in three columns from `768px`. Give each tool a stable anchor and use the paper-100 field to highlight the direct-link target.
4. **People.** Identify the current group through portrait-led evidence records with roles, affiliations, and authoritative links. Link each member to a stable profile generated from the same canonical people data.
5. **Publications.** Expose the complete deduplicated archive with dated source context and progressively enhanced search and filters.
6. **Contact.** Offer verified collaboration and student routes, physical laboratory spaces, institutional identity, and historical naming.

On full content pages, use the shared fixed header and footer. Keep Tools immediately after Research in desktop and mobile navigation. Preserve the skip link, current-page indicator, editorial responsibility, and privacy and accessibility disclosures.

## Color system

| Token | Value | Use |
|---|---:|---|
| `petrol-950` | `#0a1b12` | CRT-black header, hero, people, footer, dark actions |
| `petrol-900` | `#1b3b2c` | Forest research panels, specimens, dark hover states |
| `petrol-800` | `#27513c` | Tonal separation inside dark compositions |
| `acid-500` | `#8bcf00` | Primary actions, selected states, focus, evidence accents |
| `acid-300` | `#b8ed51` | Dark-surface links, labels, highlighted text |
| `paper-50` | `#f2f3e8` | Default page field, dark-surface foreground, input fill |
| `paper-100` | `#e6e8da` | Evidence and publication section alternation |
| `ink-950` | `#132019` | Primary text on paper |
| `ink-700` | `#425449` | Body and secondary copy |
| `acid-700` | `#527900` | CRT phosphor text and beam details on paper |
| `copy-deep` | `#354a3d` | Publication author text |
| `copy-strong` | `#4a5d51` | Publication venue text |
| `copy-muted` | `#526459` | Publication years, metadata, chart axes, search placeholder and unavailable DOI message |
| metadata | `#596b60` | Indices and compact labels |
| metadata warm | `#586a5f` | Route and artifact indices |
| rule connector | `#849c8b` | Evidence-chain lines |
| research link | `#16522f` | DOI, Scholar and member links on paper |
| institutional field | `#ffffff` | Protected white support behind the UniMiB mark |

Acid green identifies brand, state, evidence, or action. It is not a general decoration. `#8bcf00` remains the exact green of the authoritative Figma wordmark and reaches a 9.35:1 contrast ratio on `#0a1b12`; it must not be shifted to compensate for the new dark field. Major sections use either CRT-black forest or paper as a coherent field. Small paper text on dark fields must use at least 55% opacity.

## Typography

- **Manrope Variable** carries display typography, body copy, navigation, controls, labels, and metadata.
- **Newsreader Variable** voices questions, section headings, named artifacts, publication titles, and typographic person marks.

### Hierarchy

- Hero: Manrope ExtraBold, `clamp(3.4rem, 9.6vw, 8.8rem)` in the stacked layout and `clamp(6rem, 8vw, 8.8rem)` in the split layout, line-height `0.82`, tracking `-0.04em`, maximum `10ch`.
- Hero editorial turn: Newsreader italic, weight `430`, tracking `-0.025em`; reserve for one meaningful word.
- Section heading: Newsreader, `3rem` mobile / `4.5rem` from `768px`, line-height `0.94–0.95`, tracking `-0.035em`.
- Research heading: Newsreader, `2.25rem` mobile / `3.75rem` from `768px`, line-height `1`.
- Specimen title: Newsreader, `2rem`, line-height `0.98`, approximately `11ch`.
- Publication title: Newsreader weight `590`, `clamp(1.15rem, 1.7vw, 1.45rem)`, line-height `1.18`.
- Body: Manrope, `1rem`, line-height `1.625`; introductory copy may rise to `1.125–1.25rem`.
- Labels: Manrope, `0.65–0.72rem`, weight `700–800`, uppercase, tracking `0.10–0.16em`.
- Use `0.75rem` for the shared header affiliation, evidence and archive labels, room ribbons, and Home and Contact route indices. Use `0.875rem` for profile affiliations, profile evidence notes, and publication venues.
- Use tabular numerals for indices, years, and citations.

## Layout and rhythm

- Fixed header: `4.75rem`; `4rem` below `768px`.
- Hero container: maximum `96rem`.
- Section containers: maximum `90rem`.
- Horizontal padding: `1.25rem`; `2rem` from `768px`; `3rem` from `1280px`.
- Vertical section padding: `6rem`; `8rem` from `768px`.
- Core spacing: `0.25`, `0.5`, `0.75`, `1`, `1.25`, `1.5`, `2`, and `3rem`.
- Body copy generally stops around `29–43rem`.
- Use one-pixel rules and aligned metadata columns instead of independent cards.
- Buttons, fields, panels, and archive rows are square. Circles are reserved for identity, sequence, and selection.
- There is no shadow vocabulary. Depth comes from field changes, translucent fills, rules, clipped geometry, and restrained overlap.

### Responsive rules

- **320–767px:** single column; native `<details>` mobile navigation; rows collapse to two columns and secondary fields move below the main content.
- **768px:** desktop navigation, three-column tray, larger section spacing, two-column introductions, and three-column evidence chains.
- **1024px:** split research (`20rem / 1fr`). The Home thesis still sits above the three-column tray.
- **1280px:** outer padding increases to `3rem`. The Home hero splits (`0.92fr / 1.08fr`).

The hero tray is staggered only from `768px`; mobile uses a flat vertical stack with a `17rem` minimum specimen height.

## Signature pattern: Evidence Slide Tray

Each specimen represents a real research question and connects to evidence.

- Minimum height: `20.5rem` desktop, `17rem` mobile.
- Padding: `1.25rem` in the stacked hero and `1rem` in the split hero.
- Header: tabular specimen index plus domain label.
- Question: Newsreader `2rem`, approximately `11ch`.
- Geometry: a `9rem` circular rule clipped `2.5rem` beyond the lower-right edge.
- Desktop vertical offsets: `0`, `1.75rem`, and `3.5rem`.
- Hover or focus-within: translate `-0.4rem`, acid border, opaque forest fill.

Do not reuse this as a generic marketing card pattern.

## Interaction rules

### Research

On `/research/`, JavaScript upgrades four stacked panels into an ARIA tab interface. Controls maintain `aria-selected`, use roving `tabindex`, support click, `ArrowUp`, `ArrowDown`, `Home`, and `End`, and honor deep links for each research area. Arrow navigation wraps and moves focus.

Without JavaScript, the tablist is hidden and every panel remains visible in document order. Consecutive panels use a `5rem` gap, `3rem` top padding, and a translucent separating rule.

### Publications

On `/publications/`, the archive is generated at build time from `data/publications.json`. Publication count, year options, snapshot date, and every list item come from the same source. Home may show the same generated count, but the full record ships only on the Publications page.

With JavaScript:

- show 24 records initially;
- search normalized publication metadata, including title, authors, venue details, and DOI where present;
- filter by exact year and member;
- preserve `q`, `year`, and `member` in the URL when filters are active. Member profiles link to `?member={person-id}#archive`;
- reset the limit when filters change;
- load 24 more at a time;
- clear all filters and return focus to search;
- announce counts through the polite live region.

Without JavaScript, the complete chronological archive remains visible. Citation counts are always labeled as a dated snapshot, never live metrics.

### Motion

- **Focal moment.** The first page with the shared header in a browser session begins with a `1650ms` phosphor boot. The literal `dat.ai` uses the final wordmark’s optical footprint, holds long enough to read, compresses into a horizontal beam, then reveals the official Figma vector. Later page loads show the official mark immediately. On the Home, `work` plays the coordinated CRT-to-final handoff when that session intro runs. The evidence scan reveals the thesis, draws the rule left to right, and develops the three specimens in order. These movements play once.
- **Continuity:** Research panel changes use a `380ms` top-to-bottom clip transition; the specimen metadata resolves from a brief phosphor beam during the same interval so the selected control and its evidence record read as one state change.
- **Data chronology:** The total publication count performs a compact `980ms` CRT-to-serif handoff once on entry. Publication bars grow from the baseline over `560ms`; their `12ms` sibling stagger is capped at `360ms` across the full archive range.
- **Feedback:** Button, border and text-decoration changes use `140–220ms`. Header navigation and the selected research marker retain a bounded `420ms` phosphor afterglow; the publication search uses an acid caret and a single `300ms` retrace across the live result status after filters settle. Specimen lift uses the shared exponential arrival curve `cubic-bezier(0.16, 1, 0.3, 1)`.
- Smooth anchor scrolling remains the default. There is no autoplay, parallax, ambient animation or added motion dependency.
- `prefers-reduced-motion: reduce` shows the official logo, final serif `work` and final publication total immediately, and removes the authored spatial sequence, research beam and panel wipe, publication retrace, histogram growth, phosphor persistence and specimen lift while preserving short color and border feedback.

## People and portrait policy

People remain border-separated records rather than a conventional portrait grid. A controlled 4:5 studio series makes the group visible while preserving the evidence-led roster structure.

Personal profiles use stable `/people/{person-id}/` addresses. `data/people.json` is the canonical source for the directory and generated profiles. Keep IDs stable and update profile content at its source.

The profile form is the **Evidence Profile Dossier**. Its content order is fixed: a dark identity hero with breadcrumb, portrait, name, current role, affiliation, concise research statement, and two authoritative actions; a warm-paper research profile with biography, profile records, and research-focus terms; a selected-evidence ledger containing projects or programmes when available, research outputs, review date, and the pointer to the complete record; then an acid continuation field linking back to all people and to the previous and next members. It is a concise, sourced research profile rather than an exhaustive CV.

At `768px` and above, the hero, reading section, research focus, evidence groups, and adjacent-member navigation use paired columns. Below `768px`, each becomes a single sequence: the portrait reduces to a compact 4:5 lead image, focus terms and evidence groups stack, and previous/next links become vertically divided rows. Evidence rows use record language rather than promotional copy: compact uppercase type or period metadata, a linked serif title, a year or relationship line, and an explicit `Open project record` or `Open source` action. On narrow screens the action moves beneath the title in the content column.

On 31 August 2026 the user directed every sourced portrait to be regenerated through identity-preserving image editing. The final series uses the same deep-petroleum cyclorama, straight-on eye line, head scale, level shoulder line, mid-chest crop, soft studio lighting and plain black crew-neck T-shirt. Face shape, skin tone, age, expression, gaze, hairstyle, facial hair, eyewear and distinctive piercings remain source invariants.

Every final WebP records its source set, generation method, prompt intent, date, transform, checksum and rights status in `public/assets/provenance.json`. Full source images, prior web crops and generated masters remain outside the public asset directory. Public institutional launch is gated on confirming each portrait source and recording subject permission; generated portraits are presentation assets and never documentary research evidence.

The full Home uses a gallery of AI-assisted workspace illustrations based on sourced lab photographs. Treat the illustrations as editorial and describe their AI-assisted treatment in the alternative text. Use original INSID&S archive photographs as historical documentation with their confirmed context and date. Identify pictured people only when a verified caption is available.

## Institutional endorsement

On full content pages, make the University of Milano-Bicocca relationship explicit in the first viewport. The masthead carries the affiliation even at widths where the shared header’s affiliation label is hidden. The University mark appears once in the shared footer as an independent endorsement. Its official positive black-and-grey artwork remains unmodified and sits on an independent white field inside the CRT-black footer. The field padding preserves the Brand Book 2025 clear area, while the department relationship is written outside that protected area.

## Accessibility

- Preserve semantic sections, headings, lists, buttons, links, labels, `<details>`, and ARIA tab relationships.
- Keep the skip link and visible keyboard focus.
- Default focus on paper: `3px` forest `#27513c` outline with `4px` offset (`8.06:1`).
- Focus on CRT-black and forest fields uses a `3px` acid `#8bcf00` outline with `4px` offset; this explicitly includes every interactive element in the dark profile hero. On the acid contact field it changes to CRT black.
- Maintain WCAG 2.2 AA contrast; publication venue text uses `#4a5d51` on paper (`6.28:1`).
- Acid focus on CRT black and CRT-black focus on acid both exceed AA (`9.35:1`).
- Selection uses marker fill, border, text, and `aria-selected`, not color alone.
- Prominent targets are at least `3rem` high.

## SEO and evidence rules

- Keep the site English-only, multipage, semantic, and addressable through clean trailing-slash URLs and stable section IDs.
- Give each content route, including Tools and individual profiles, route-appropriate titles, descriptions, canonical URLs, Open Graph/Twitter metadata, and structured data.
- Preserve the favicon, manifest, sitemap and robots file. The Home uses `/` as its canonical and Open Graph URL and keeps its stable `ResearchOrganization` identity at `https://datai.disco.unimib.it/#organization`. `/home/` redirects to `/`.
- Use INSID&S Lab only as a historical and alternate name.
- Link institutional facts to DISCo or UniMiB, projects to public DatAI repositories, and publications to research records.
- Date roster reviews, publication snapshots, and citation counts.
- Never add people, roles, metrics, projects, partners, claims, awards, or quotations without a verifiable source.
- Do not turn repository descriptions or Scholar counts into promotional claims.

## Asset provenance

- Update `public/assets/provenance.json` whenever a raster is generated, derived, replaced, or begins shipping.
- Official assets record type, authoritative source, URL, and retrieval date.
- Generated rasters record generator, prompt summary, date, SHA-256, source path, and shipping status.
- Composites list every item in `derived_from`, plus purpose and date.
- `datai-logo.svg` is the transparent vector layer `7:188` extracted from the authoritative Figma logo frame `7:187`; never reintroduce the frame background into the asset.
- Keep original INSID&S archive photographs with source IDs, dates, dimensions, checksums and historical context in provenance. Record source, room, modifications and disclosure for every AI-assisted derivative.
- `unimib-institutional-logo.png` remains the official positive mark served by `unimib.it`; its white support, proportions and clear area follow the University Brand Book 2025.
- Never use an AI-generated visual as documentary research evidence.

## Maintenance

- Keep palette and font primitives in the `@theme` block in `src/styles.css`. Reuse the configured daisyUI `hero` and `link` components where appropriate and apply the DatAI tokens.
- Preserve `data-*` hooks, ARIA relationships, section IDs, and build placeholders.
- Keep content entities linked rather than copying facts into divergent lists.
- Review external links, member status, repositories, publication data, canonical domain, and structured data together.
- Test at the base width, `768px`, `1024px`, and `1280px`, with keyboard-only navigation, JavaScript disabled, and reduced motion enabled.

## Finish verdict

**Original visual direction review: PASS.** The original Evidence Slide Tray implementation passed independent finish review. Use the checks above for subsequent changes.

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

1. **Home:** State the laboratory thesis, show three linked questions in the signature tray, make the group visible, and route visitors to the four task pages.
2. **Research:** Expand four areas into question → people → evidence chains, followed by selected systems, datasets, methods, languages, and public repositories.
3. **People:** Identify the current group through portrait-led evidence records with roles, affiliations, and authoritative profiles.
4. **Publications:** Expose the complete deduplicated archive with dated source context and progressive search/filter controls.
5. **Contact:** Offer verified collaboration and student routes, all four physical laboratory spaces, institutional identity, and historical naming.
6. **Shared shell:** Keep the fixed navigation, active-page state, editorial responsibility, privacy, accessibility, and source notes consistent across every route.

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
| metadata | `#596b60` | Indices and compact labels |
| rule connector | `#849c8b` | Evidence-chain lines |

Acid green identifies brand, state, evidence, or action. It is not a general decoration. `#8bcf00` remains the exact green of the authoritative Figma wordmark and reaches a 9.35:1 contrast ratio on `#0a1b12`; it must not be shifted to compensate for the new dark field. Major sections use either CRT-black forest or paper as a coherent field. Small paper text on dark fields must use at least 55% opacity.

## Typography

- **Manrope Variable** carries display typography, body copy, navigation, controls, labels, and metadata.
- **Newsreader Variable** voices questions, section headings, named artifacts, publication titles, and typographic person marks.

### Hierarchy

- Hero: Manrope ExtraBold, `clamp(3.4rem, 9.6vw, 8.8rem)`, line-height `0.82`, tracking `-0.04em`, maximum `10ch`.
- Hero editorial turn: Newsreader italic, weight `430`, tracking `-0.025em`; reserve for one meaningful word.
- Section heading: Newsreader, `3rem` mobile / `4.5rem` from `768px`, line-height `0.94–0.95`, tracking `-0.035em`.
- Research heading: Newsreader, `2.25rem` mobile / `3.75rem` from `768px`, line-height `1`.
- Specimen title: Newsreader, `2rem`, line-height `0.98`, approximately `11ch`.
- Publication title: Newsreader weight `590`, `clamp(1.15rem, 1.7vw, 1.45rem)`, line-height `1.18`.
- Body: Manrope, `1rem`, line-height `1.625`; introductory copy may rise to `1.125–1.25rem`.
- Labels: Manrope, `0.65–0.72rem`, weight `700–800`, uppercase, tracking `0.10–0.16em`.
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
- **1024px:** split hero (`0.92fr / 1.08fr`) and split research (`20rem / 1fr`).
- **1280px:** outer padding increases to `3rem`.

The hero tray is staggered only from `768px`; mobile uses a flat vertical stack with a `17rem` minimum specimen height.

## Signature pattern: Evidence Slide Tray

Each specimen represents a real research question and connects to evidence.

- Minimum height: `20.5rem` desktop, `17rem` mobile.
- Padding: `1.25rem`.
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
- search normalized title, author, and venue text;
- filter by exact year;
- reset the limit when filters change;
- load 24 more at a time;
- clear both controls and return focus to search;
- announce counts through the polite live region.

Without JavaScript, the complete chronological archive remains visible. Citation counts are always labeled as a dated snapshot, never live metrics.

### Motion

- **Focal moment:** Site entry begins with a `1650ms` phosphor boot in the shared header: the literal `dat.ai` is written as CRT text, held long enough to read, compressed into a horizontal beam, and replaced from that same beam by the untouched official Figma vector. On Home, `work` performs the same CRT-to-final handoff into its Newsreader italic form while the coordinated evidence scan reveals the thesis, draws the rule left-to-right, and develops the three specimens in order. None of these movements loop.
- **Continuity:** Research panel changes use a `380ms` top-to-bottom clip transition so the selected control and its evidence record read as one state change.
- **Data chronology:** Publication bars grow from the baseline over `560ms`; their `12ms` sibling stagger is capped at `360ms` across the full archive range.
- **Feedback:** Button, navigation, marker, border and text-decoration changes use `140–220ms`; specimen lift uses the shared exponential arrival curve `cubic-bezier(0.16, 1, 0.3, 1)`.
- Smooth anchor scrolling remains the default. There is no autoplay, parallax, ambient animation or added motion dependency.
- `prefers-reduced-motion: reduce` shows the official logo and final serif `work` immediately, and removes the authored spatial sequence, panel wipe, histogram growth and specimen lift while preserving short color and border feedback.

## People and portrait policy

People remain border-separated records rather than a conventional portrait grid. A controlled 4:5 studio series makes the group visible while preserving the evidence-led roster structure.

On 31 August 2026 the user directed every sourced portrait to be regenerated through identity-preserving image editing. The final series uses the same deep-petroleum cyclorama, straight-on eye line, head scale, level shoulder line, mid-chest crop, soft studio lighting and plain black crew-neck T-shirt. Face shape, skin tone, age, expression, gaze, hairstyle, facial hair, eyewear and distinctive piercings remain source invariants.

Every final WebP records its source set, generation method, prompt intent, date, transform, checksum and rights status in `public/assets/provenance.json`. Full source images, prior web crops and generated masters remain outside the public asset directory. Source and subject permissions remain mandatory editorial follow-ups before a public institutional launch; generated portraits are presentation assets and never documentary research evidence.

Archival laboratory photography is treated as documentary evidence, not as a current-team portrait source. The Home gallery uses an asymmetric lead-and-supporting-image composition, labels the INSID&S context and Drive file date, and never identifies pictured people unless a verified caption is available.

## Institutional endorsement

The University of Milano-Bicocca relationship must be explicit in the first viewport of every route. The shared header identifies DatAI as a University research laboratory, and each masthead names the University in visible text. The University mark appears once in the shared footer as an institutional endorsement, not as part of the DatAI wordmark. Its official positive black-and-grey artwork remains unmodified and sits on an independent white field inside the CRT-black footer. The field padding preserves the Brand Book 2025 clear area, while the department relationship is written outside that protected area. Do not recolor, distort, crop, merge, or visually compete with the mark.

## Accessibility

- Preserve semantic sections, headings, lists, buttons, links, labels, `<details>`, and ARIA tab relationships.
- Keep the skip link and visible keyboard focus.
- Default focus on paper: `3px` forest `#27513c` outline with `4px` offset (`8.06:1`).
- Focus on CRT-black and forest fields uses acid `#8bcf00`; on the acid contact field it changes to CRT black.
- Maintain WCAG 2.2 AA contrast; publication venue text uses `#4a5d51` on paper (`6.28:1`).
- Acid focus on CRT black and CRT-black focus on acid both exceed AA (`9.35:1`).
- Selection uses marker fill, border, text, and `aria-selected`, not color alone.
- Prominent targets are at least `3rem` high.

## SEO and evidence rules

- Keep the site English-only, multipage, semantic, and addressable through clean trailing-slash URLs and stable section IDs.
- Give Home, Research, People, Publications, and Contact unique titles, descriptions, canonical URLs, Open Graph/Twitter metadata, and page-specific structured data.
- Preserve the favicon, manifest, sitemap, robots file, and the Home page’s canonical `ResearchOrganization` JSON-LD.
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
- Lab photographs remain exact user-owned Google Drive JPEGs from the INSID&S archive; keep their source IDs, dates, dimensions, checksums and historical-context label in provenance.
- `unimib-institutional-logo.png` remains the official positive mark served by `unimib.it`; its white support, proportions and clear area follow the University Brand Book 2025.
- Never use an AI-generated visual as documentary research evidence.

## Maintenance

- Keep palette and font primitives in the CSS theme block.
- Preserve `data-*` hooks, ARIA relationships, section IDs, and build placeholders.
- Keep content entities linked rather than copying facts into divergent lists.
- Review external links, member status, repositories, publication data, canonical domain, and structured data together.
- Test at the base width, `768px`, `1024px`, and `1280px`, with keyboard-only navigation, JavaScript disabled, and reduced motion enabled.

## Finish verdict

**Visual direction review: PASS.** The original Evidence Slide Tray implementation passed independent finish review. The multipage extension preserves that approved world and has passed build, HTML, route, metadata, progressive-enhancement and mechanical design checks across all five outputs.

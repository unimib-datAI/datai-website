---
name: datai-ui-update
description: Update or repair the DatAI website interface. Use for layout, responsive behavior, typography, shared components, interaction, accessibility, or Impeccable findings on a DatAI page.
---

# Update the DatAI interface

Read the [repository instructions](../../../AGENTS.md), the [DatAI design system](../../../DESIGN.md), and the affected page's [surface brief](../../../.impeccable/surfaces) when available. Resolve the requested URL to its source before editing. Edit the Home at `/` in `index.html`. The `/home/` route redirects to `/`.

## Edit the source that owns the change

- Keep the established visual system. Reuse the Tailwind theme tokens in `src/styles.css` and existing components. Check other routes that use a shared component before changing its defaults.
- The Vite build injects the shared header and footer from `src/site-shell.js`. Edit generated profile layouts in `people/profile.html` or `scripts/generate-people-pages.mjs`. Preserve the `<!-- SITE_HEADER:… -->` and `<!-- SITE_FOOTER -->` markers, data hooks and fragment IDs used by `src/script.js` and existing links.
- Inspect the affected route in the current build before changing layout or addressing detector findings. Use the rendered page to distinguish clipping, unreadable text or insufficient contrast from source-only detections that miss Tailwind utilities. Check an animated state separately when it is part of the finding. The phosphor intro is documented DatAI motion.

## Verify the change

- Run `npm run build:pages` and inspect the built routes with `npm run preview`. Use the viewport sizes and accessibility checks in `AGENTS.md`. Include other affected routes for shared changes. Check actual text colors over their backgrounds, focus visibility, and horizontal overflow where relevant.
- When working from Impeccable findings, rerun the detector on the changed surface if available. Record the checks that confirmed each fix or intentional design choice. If a scoped detector exception is appropriate, record the evidence for that rule and surface so the result can be reviewed later.

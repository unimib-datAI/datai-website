# DatAI lab photo transformation model

This model standardises future workspace photographs without changing the identity of the photographed room. It is an editorial visualisation workflow, not documentary retouching: every public use must state that the scene was AI-assisted and that any people shown are generated.

## Target result

- Photorealistic, calm academic workspace photography in 16:9.
- The original room remains immediately recognisable.
- Natural daylight, neutral exposure and genuine material texture.
- Desks look actively used but ordered, never empty or staged like a showroom.
- Visual accents follow the DatAI system: deep petroleum, black, off-white and sparse acid green.

## Invariants

Always preserve camera position, crop, lens perspective, structural geometry, room layout, floor, ceiling, walls, wall panels, windows, blinds, columns, doors, radiators, safety fixtures, fixed electrical points, permanent furniture and essential computer equipment. Never invent a room number, institutional sign, logo or architectural feature.

## Allowed changes

1. Remove transient clutter: loose paper piles, bags, food packaging, disposable containers, bottles, random personal objects, untidy stacks and excess cable tangles.
2. Keep monitors, computers, keyboards, mice, power equipment, chairs and plausible cable connections.
3. Remove recognisable source people and replace them with entirely synthetic, non-identifiable adults. Use a plausible number for the room, varied appearances, candid working poses, faces small in frame or partly turned away, and natural body proportions.
4. Use unbranded academic-casual clothing in black, off-white, deep petroleum and muted grey.
5. Add at most two acid-green desk accents, one petroleum organiser, and a restrained abstract node-link pattern on a whiteboard or screen. Do not add readable text.
6. Correct exposure and colour gently. Do not introduce cinematic lighting, excessive plants, decorative clutter or luxury-office styling.

## Reusable ImageGen prompt

```text
Use case: precise-object-edit.

Input image role: this is the sole edit target, a real photograph of DatAI [ROOM_ID] at the University of Milano-Bicocca.

Create a photorealistic editorial visualisation of the SAME room. Preserve exactly the architecture, camera position, 16:9 framing, lens perspective, floor plan, ceiling, windows, wall panels, radiators, doors, desks, essential computer equipment, chairs, daylight direction and recognisable room identity.

Remove transient clutter and excess cable tangles while keeping the necessary equipment and physically plausible connections. Remove/replace all recognisable source people. Add [PEOPLE_COUNT] entirely synthetic, non-identifiable adult university researchers at the existing desks, working naturally and not posing for the camera. They must not resemble DatAI members, public figures or real individuals. Use varied appearances, natural proportions, faces small in frame or partly turned away, and unbranded academic-casual clothing in black, off-white, deep petroleum teal and muted grey.

Introduce only restrained DatAI accents: one or two acid-green notebooks or cable markers, a dark-petroleum desk organiser, and a clean abstract data/network node pattern on a whiteboard or one monitor. Add no wordmark, Bicocca logo, invented signage or readable text.

Balance the exposure while retaining realistic window detail, daylight and material texture. Do not redesign the space or make it look like a luxury/startup office. Do not alter structural geometry, crop, perspective, fixed furniture, safety elements or permanent fixtures. Avoid malformed anatomy, duplicated limbs, floating objects, impossible reflections, pseudo-text, excessive decoration and artificial showroom styling.
```

## Production settings

- Generate one edit per source photograph with the built-in image generation tool.
- For the first room, use only the source as the edit target. For later rooms, the first completed image may be supplied as a style-only reference; explicitly identify which image is the target.
- Output master: 16:9 PNG at the generator's native size.
- Website derivative: 1672 × 941 WebP, quality 86, with intrinsic dimensions declared in HTML.
- Alt text must say “AI-assisted view” and describe generated people rather than naming real members.
- Visible disclosure: “AI-assisted editorial visualisation based on an on-site photograph. The people shown are generated and do not depict DatAI members.”

## Acceptance checklist

- Room identity and perspective match the source.
- No fixed or safety-critical element disappeared.
- No recognisable source person remains.
- Synthetic people have plausible anatomy, scale, lighting and desk contact.
- Workstations remain functional and cables plausible.
- Accents are sparse and match the DatAI palette.
- No invented text or logo appears.
- The public caption includes the AI disclosure.

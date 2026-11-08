# Birthday Website Frontend Design

## Intent
Polish the existing birthday microsite into a cohesive, premium, cinematic experience while preserving every existing visible message, image, video, music asset, and user-facing action. The tree animation remains the emotional centerpiece; the gift controls, photo slideshow, video player, love letter, and closing screen remain in the same experience.

## Goals
- Replace the inconsistent bright-pink/black styling with a deliberate midnight-rose palette: warm aubergine, deep burgundy, champagne, soft petal pink, and readable warm ivory.
- Establish consistent typography, spacing, surfaces, borders, shadows, button states, and modal behavior.
- Make the main scene and all overlays usable on desktop, tablet, and mobile.
- Add restrained motion: scene entrance, ambient particles, gift float, reveal transitions, image transitions, and modal transitions.
- Respect `prefers-reduced-motion`, keyboard operation, visible focus, and dialog semantics.
- Fix frontend reliability issues without changing business logic or user-visible copy: canvas coordinate scaling, asset discovery timing, modal scroll locking, and background-audio state around video playback.

## Non-goals / Anti-goals
- Do not rewrite, remove, reorder, or paraphrase any birthday message, letter paragraph, heading, or existing button label.
- Do not replace the app with React, a component library, a CMS, or a new backend.
- Do not alter the tree drawing itself, relationship narrative, media files, or media order.
- Do not add new marketing copy, sections, or interactions unrelated to the existing experience.
- Avoid excessive motion, continuous large glows, and animation that competes with the tree or photographs.

## Constraints
- Keep the current static HTML/CSS/vanilla-JavaScript stack and local assets.
- Keep `file/love.js` and third-party bundled libraries unchanged unless verification proves a frontend integration defect requires otherwise.
- The canvas has a fixed logical drawing space of 1100 × 680; CSS may scale its presentation but must not change its logical coordinate system.
- Preserve the current image and video assets and their numeric filename discovery convention.

## Approaches
1. Rebuild the app with a frontend framework and component system. Rejected because it adds dependencies and migration risk without improving this small static microsite.
2. Replace existing styles wholesale and restructure every script. Rejected because it creates unnecessary risk to the tree animation and established interactions.
3. Add a coherent, last-loaded visual layer and make minimal targeted HTML/JS adjustments. **Selected.** This protects the original content and tree engine while allowing every screen and modal to be restyled consistently; isolated loader and modal fixes address verified defects.

## Design Direction
A cinematic "Midnight Rose" visual system: near-black aubergine and burgundy backgrounds, champagne-gold accents, soft petal highlights, warm ivory typography, restrained glass surfaces, fine borders, and soft radial lighting. Playfair Display remains the expressive display face and Inter the UI face, with robust system fallbacks. Controls use consistent rounded geometry, clear hover/active/focus states, and generous touch targets.

## Screen Treatment
- Main scene: responsive framed stage, proportionally scaled 1100 × 680 tree canvas, legible message panel, and subtle ambient background motion.
- Gift section: centered glass panel with a clear gift illustration and consistent primary actions.
- Photo slideshow: focused lightbox with contained imagery, stable side navigation, counter, and compact footer controls.
- Video player: responsive 16:9 media frame with compact playback navigation and actions.
- Love letter: readable paper-like surface with a measured line length, comfortable paragraph rhythm, scroll containment, and clear close control.
- Closing screen: quiet, high-contrast ceremonial panel with the existing message and actions.

## Implementation Decisions
- Keep original copy and asset paths unchanged.
- Add `file/polish.css` after existing stylesheets so the new tokens and component styles override legacy presentation without rewriting the historical stylesheet.
- Correct the tree's coordinate system by using the canvas intrinsic dimensions and converting pointer coordinates from CSS pixels to logical canvas units.
- Replace fixed-delay gallery discovery with completion-based asynchronous checks; retain the existing numbered file naming convention and supported extensions.
- Centralize modal scroll-lock state and remember whether background audio was playing before a video is opened.
- Add dialog roles/labels, focus restoration, and responsive/reduced-motion styling without introducing dependencies.

## Acceptance Criteria
- Every existing visible string and all media file bytes remain unchanged.
- The tree, three gift actions, photo navigation/download, video playback/navigation/download, letter close/open, closing modal, restart, Escape, arrow keys, and backdrop-close behavior continue to work.
- Images/videos are discovered only after checks finish; counters match the discovered assets.
- The canvas remains geometrically correct at desktop, tablet, and mobile widths; the page has no horizontal overflow at 360 px.
- Modals remain scroll-locked while any overlay is open; closing one overlay does not unlock a still-open overlay.
- Keyboard focus remains visible and reduced-motion users do not receive continuous decorative motion.

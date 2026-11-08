# Birthday Website Frontend Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a polished, responsive, animated birthday microsite while preserving all existing user-facing content and assets.

**Architecture:** Keep the current static vanilla stack. Add one final-loaded CSS layer containing design tokens and responsive component styles, then make targeted fixes to the tree boot code and existing gallery controller/asset loader. Do not replace the canvas tree engine or add dependencies.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript, existing jQuery/Jscex/canvas engine, local image/video/audio assets.

**Spec:** `docs/superpowers/specs/2026-11-08-birthday-frontend-design.md`

## Global Constraints
- Preserve every existing visible text string, paragraph, heading, label, and button label.
- Preserve all existing media assets and their order.
- Keep the vanilla HTML/CSS/JavaScript architecture and add no package dependencies.
- Keep the canvas logical coordinate space at 1100 × 680.
- Respect `prefers-reduced-motion` and keyboard accessibility.

## Review Focus
- Narrow viewport canvas geometry and pointer hit testing — verify tree canvas remains 1100 × 680 logically while its CSS box shrinks.
- Slow image/video metadata loading — verify the asset list completes from load/error events, not a fixed timer.
- Multiple or nested modal states — verify scroll lock stays active until every visible modal closes.
- Background audio playback — verify video close resumes music only if it was playing before opening the player.
- Long letter and short viewport — verify the letter scrolls internally with usable close controls and no horizontal page overflow.

---

### Task 1: Add the Midnight Rose visual system

**Files:**
- Create: `file/polish.css`
- Modify: `index.html` (load `file/polish.css` after the three existing stylesheets)

**Interfaces:**
- Consumes: existing DOM IDs and classes in `index.html`.
- Produces: CSS tokens and complete overrides for the stage, gift section, buttons, gallery modal, video modal, letter modal, closing modal, and responsive/reduced-motion states.

- [x] Add design tokens for background, surface, rose, champagne, ivory, borders, shadows, radii, spacing, and timing.
- [x] Style the desktop scene and gift section with consistent hierarchy, depth, and restrained animated details.
- [x] Restyle photo/video/letter/closing overlays and all interactive states.
- [x] Add tablet/mobile layouts, minimum touch sizes, visible focus, and reduced-motion rules.
- [x] Verify stylesheet parses and all targeted selectors match existing markup.

### Task 2: Stabilize the tree canvas across responsive sizes

**Files:**
- Modify: `index.html` (tree initialization and pointer coordinate conversion)

**Interfaces:**
- Consumes: intrinsic canvas width/height attributes (1100 × 680).
- Produces: scaled visual presentation while all tree geometry remains in logical canvas coordinates.

- [x] Read `canvas[0].width` and `canvas[0].height` for tree construction instead of jQuery's CSS dimensions.
- [x] Convert click/mouse coordinates using the canvas bounding rectangle and intrinsic-to-rendered scale factors.
- [x] Keep the existing tree animation data and message sequence unchanged.
- [ ] Verify the pointer seed hit area works at desktop and narrow viewport widths.

### Task 3: Make media discovery deterministic

**Files:**
- Modify: `index.html` (image and video discovery helpers)

**Interfaces:**
- Consumes: numeric asset naming, image extensions `jpg/jpeg/png/webp`, video extensions `mp4/webm/mov`.
- Produces: `window.setAllImages(paths)` and `window.setAllVideos(paths)` after discovery has actually completed.

- [x] Replace fixed 2-second timeouts with promises resolved by image `load/error` events.
- [x] Ensure only one matching image per numeric index is retained, using the existing extension priority.
- [x] Probe videos with metadata preload and resolve on `loadedmetadata/error`; clean up probe media elements after each result.
- [x] Keep ordering numeric and update the existing counters from the completed asset arrays.
- [x] Keep the existing empty-state messages and labels unchanged.

### Task 4: Harden gallery and modal interactions

**Files:**
- Modify: `file/gallery.js`
- Modify: `index.html` (dialog roles, labels, and button accessibility attributes only)

**Interfaces:**
- `allImages: string[]`, `allVideos: string[]` remain the gallery data stores.
- Existing global functions and button IDs remain unchanged.
- Add private helpers for modal visibility, body scroll locking, and focus restoration.

- [x] Make empty media states openable so their existing guidance can be seen.
- [x] Keep body scrolling disabled while any modal remains visible.
- [x] Track pre-video audio playback and resume only when it was previously active.
- [x] Add accessible dialog metadata and restore focus to the invoking control after close.
- [x] Keep Escape, arrows, backdrop click, next/previous, and download behavior intact.
- [x] Add touch swipe navigation for the photo slideshow without changing its content.

### Task 5: Verify visual quality and functional preservation

**Files:**
- Inspect: `index.html`, `file/polish.css`, `file/gallery.js`
- Inspect: all local media assets

- [x] Run HTML/CSS/JavaScript syntax checks.
- [ ] Inspect browser console output (blocked because Chromium navigation is restricted in this runtime).
- [ ] Verify desktop, tablet, and 360/390 px mobile layouts for overflow and legibility.
- [ ] Exercise every modal, close path, keyboard shortcut, gallery counter, video navigation, and download link.
- [x] Compare the pre-change and post-change visible text and media hashes; confirm no content/media changes.
- [x] Package the polished project as a ZIP and provide the available desktop preview screenshot.


## Verification Note

- The preservation/regression suite passes **17/17** tests.
- Node syntax checks pass for **10 linked JavaScript files and 3 inline scripts**.
- All **4 stylesheets** parse without CSS syntax errors; all 32 HTML IDs are unique and static local asset references resolve.
- The original archive comparison confirms only `index.html`, `file/function.js`, and `file/gallery.js` were modified among original files. The 20 media assets and all other original files remain byte-for-byte unchanged. `file/polish.css`, the regression tests, and these design/plan notes are additions.
- Live browser viewport and interaction checks could not be completed in this runtime: Chromium navigation returned `ERR_BLOCKED_BY_ADMINISTRATOR`. The available desktop preview is provided separately; no live-browser result is claimed.

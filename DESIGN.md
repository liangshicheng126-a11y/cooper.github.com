---
name: "Cooper Nocturnal Screening Room"
description: "A four-language portfolio staged as a restrained nocturnal screening room for work, capability, and contact."
colors:
  graphite-black: "#050506"
  deep-ink: "#09090b"
  cold-white: "#f4f4f5"
  pure-white: "#ffffff"
  muted-cold-white: "rgba(244, 244, 245, 0.68)"
  soft-cold-white: "rgba(244, 244, 245, 0.82)"
  floating-obsidian: "rgba(7, 7, 9, 0.70)"
  obsidian: "rgba(12, 12, 15, 0.72)"
  obsidian-strong: "rgba(15, 15, 19, 0.90)"
  field-obsidian: "rgba(255, 255, 255, 0.045)"
  zinc-hairline: "rgba(255, 255, 255, 0.12)"
  zinc-hairline-strong: "rgba(255, 255, 255, 0.22)"
  indigo-signal: "#a5b4fc"
  indigo-core: "#818cf8"
  indigo-soft: "#c7d2fe"
  indigo-action: "#4f46e5"
  indigo-action-hover: "#4338ca"
  floating-line-magenta: "#E945F5"
  floating-line-blue: "#2F4BC0"
typography:
  display:
    fontFamily: "var(--font-archivo), var(--font-script), sans-serif"
    fontSize: "clamp(2.75rem, 8.2vw, 6rem)"
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: "-0.04em"
  title:
    fontFamily: "var(--font-archivo), var(--font-script), sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.333
  body:
    fontFamily: "var(--font-archivo), var(--font-script), sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "var(--font-archivo), var(--font-script), sans-serif"
    fontSize: "0.78rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "0.11em"
rounded:
  nav: "10px"
  compact: "11px"
  control: "12px"
  chrome: "14px"
  surface: "16px"
  pill: "999px"
spacing:
  tight: "0.5rem"
  compact: "0.65rem"
  control: "0.75rem"
  content: "1rem"
  block: "1.25rem"
  section: "2rem"
  footer-separation: "clamp(2.5rem, 5vw, 4.5rem)"
components:
  button-primary:
    backgroundColor: "{colors.cold-white}"
    textColor: "{colors.deep-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.surface}"
    padding: "1rem 2rem"
  button-primary-hover:
    backgroundColor: "#d4d4d8"
    textColor: "{colors.deep-ink}"
    rounded: "{rounded.surface}"
  button-secondary:
    backgroundColor: "rgba(255, 255, 255, 0.04)"
    textColor: "{colors.cold-white}"
    typography: "{typography.body}"
    rounded: "{rounded.surface}"
    padding: "1rem 2rem"
  nav-link:
    backgroundColor: "transparent"
    textColor: "rgba(244, 244, 245, 0.62)"
    typography: "{typography.label}"
    rounded: "{rounded.nav}"
    padding: "0.7rem 0.78rem"
  nav-link-active:
    backgroundColor: "rgba(255, 255, 255, 0.065)"
    textColor: "{colors.pure-white}"
    typography: "{typography.label}"
    rounded: "{rounded.nav}"
  floating-header:
    backgroundColor: "{colors.floating-obsidian}"
    textColor: "{colors.cold-white}"
    rounded: "{rounded.chrome}"
    padding: "0.5rem 0.6rem 0.5rem 1rem"
    height: "3.75rem"
    width: "min(88rem, 100%)"
  panel:
    backgroundColor: "{colors.obsidian}"
    textColor: "{colors.cold-white}"
    rounded: "{rounded.surface}"
    padding: "2rem"
  input:
    backgroundColor: "{colors.field-obsidian}"
    textColor: "{colors.cold-white}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0.75rem 1rem"
---

# Design System: Cooper Nocturnal Screening Room

## Overview

**Creative North Star: "The Nocturnal Screening Room"**

Cooper's work is presented as a private screening room after dark: graphite black holds the frame, cold white type behaves like projected light, zinc hairlines order the programme, translucent obsidian provides just enough material separation, and indigo appears only as a controlled UI signal. Behind that quiet chrome, a deliberately low-opacity magenta/blue FloatingLines field supplies the projected atmosphere. The interface is cinematic without becoming theatrical. Work, words, and actions remain legible before atmosphere.

This world deliberately rejects the generic portfolio-template split sidebar and decorative blob scaffold. The site is a centered, full-width composition with compact floating chrome, oversized display typography, editorial chapters, and a full-screen animated line field disciplined by a dark vignette. Its story is fixed: identify Cooper, understand his capabilities, inspect real work, then choose direct contact or Xiaocoo without losing context.

Form direction 4, seed `94f35f2e`, is the shipped authority. The finish-review disposition is **SHIP — no remaining fixes**. The approved implementation and this synchronized record supersede earlier capture details where the hero or backdrop differs.

**Key Characteristics:**

- Graphite-black canvas with cold white, zinc, and rare indigo signals.
- Centered full-width screening-room composition, never a split portfolio sidebar.
- Across all four languages, the visible home title, description, and two actions form one centered group; short screens or long copy extend the hero naturally without clipping or overlapping the fixed header.
- A session-gated screening-room opening resolves the COOPER. wordmark, reveals the real FloatingLines field from left to right, clears the wordmark, and only then brings in navigation and homepage detail.
- Pointer-responsive DepthText gives the home statement restrained dimensional weight; the footer closes with one compact MetallicPaint wordmark.
- Low-opacity React Bits FloatingLines atmosphere with a readability vignette and bounded GPU cost.
- Display-led hierarchy paired with editorial hairlines and asymmetric chapter grids.
- Translucent obsidian surfaces with restrained blur and shallow ambient depth.
- Real project work and preserved bilingual content remain the evidence and the story.

**The Work-Is-The-Projection Rule.** Atmosphere frames the work; it never competes with, recolors, or substitutes for actual project media.

## Colors

The UI palette is near-monochrome and nocturnal. Indigo is a navigational and interactive signal; the magenta/blue field is a separate, user-directed environmental layer.

### Primary

- **Indigo Signal** (`indigo-signal`): labels, small icons, bullets, and interaction cues that need attention without becoming a second visual field.
- **Indigo Core** (`indigo-core`): luminous point accents and restrained radial-light energy.
- **Indigo Action** (`indigo-action`): solid action fills inherited by functional controls; its darker hover partner is `indigo-action-hover`.

### Secondary

- **Floating-Line Magenta** (`floating-line-magenta`): the first and final stop in the approved environmental line gradient.
- **Floating-Line Blue** (`floating-line-blue`): the center stop in the approved environmental line gradient.
- The exact backdrop sequence is `#E945F5 / #2F4BC0 / #E945F5`. These colors belong to the low-opacity WebGL field only; they are not additional UI accent families.

### Neutral

- **Graphite Black** (`graphite-black`): the page canvas and terminal vignette color.
- **Deep Ink** (`deep-ink`): dark text on cold-white primary actions, selection foregrounds, and scrollbar tracks.
- **Cold White** (`cold-white`): primary copy and projected display type.
- **Muted Cold White** (`muted-cold-white`): supporting copy and secondary metadata. Use `soft-cold-white` where supporting text must read more strongly.
- **Floating Obsidian** (`floating-obsidian`): the fixed top-bar material.
- **Obsidian / Strong Obsidian** (`obsidian`, `obsidian-strong`): translucent content and overlay surfaces.
- **Zinc Hairline** (`zinc-hairline`): the default one-pixel divider; reserve `zinc-hairline-strong` for chapter boundaries that need a firmer start.

**The Restrained-Indigo Rule.** Indigo in UI chrome marks state, action, or structure and remains restrained. The approved low-opacity `#E945F5 / #2F4BC0 / #E945F5` FloatingLines field is the explicit environmental exception; do not reuse its magenta/blue gradient in controls, cards, or content decoration.

**The Cold-White Ladder Rule.** Use primary, soft, muted, and faint white levels to express hierarchy; do not introduce arbitrary gray families screen by screen.

## Typography

**Latin Font:** Archivo (with sans-serif fallback)

**Chinese Font:** Noto Sans SC (with Microsoft YaHei and sans-serif fallback)

**Japanese / Korean Fonts:** Noto Sans JP / Noto Sans KR, selected through `--font-script` and the document language. All CJK families are self-hosted by Next's font build with `display: swap` and no eager preload; the browser requests the relevant glyph ranges. Native language names in the menu carry their own `lang` attributes.

**Character:** Archivo (`--font-archivo`) carries Latin text with calm technical clarity. Noto Sans SC (`--font-noto-sans-sc`) carries Chinese across display, chapter, body, label, and operational roles with high legibility and complete weight support. Hierarchy comes from scale, spacing, and real `400–800` weights rather than a decorative single-weight face.

### Hierarchy

- **Display** (`typography.display`): hero titles only. The DepthText face uses `clamp(2.75rem, 8.2vw, 6rem)`, remains centered and tightly tracked, and allows balanced wrapping so longer English copy stays inside the mobile stage.
- **Title** (`typography.title`): section and chapter titles. Use weight `700` so Chinese and Latin titles share a clear, consistent emphasis.
- **Body** (`typography.body`): paragraphs, project analysis, form copy, and descriptive content. Long-form analysis should stay near `72ch`; compact service descriptions stay near `48ch`.
- **Label** (`typography.label`): navigation, counters, and small metadata. Use compact sizes, firm weight, and controlled tracking; uppercase is appropriate only for terse utility text.

**The Script-Aware Sans Rule.** Archivo shapes Latin; the Noto Sans SC, JP, and KR variants shape their respective scripts across every role. The four-language expansion adds script coverage, not a new expressive style; hierarchy still comes from weight and scale.

**The Oversized-Once Rule.** The largest scale belongs to the first-view title. Subsequent headings step down decisively so the page reads as chapters, not repeated hero cards.

## Layout

The page shell is centered at a maximum width of `88rem` and isolated over a fixed backdrop. Main content begins below the floating chrome with `8.5rem` top padding on wider screens. The home hero offsets that shell padding and keeps a minimum height of `100svh`. Across Chinese, English, Japanese, and Korean, the visible title, supporting description, and two actions form one horizontally and vertically centered group.

The first viewport has a fixed hierarchy: compact floating top bar, then one centered group containing the oversized title, supporting statement, and two actions in reading order. The hero section is a flex column with `justify-content: center`, a `100svh` minimum height, and symmetric `7rem` top/bottom clearance. The title retains its `1.25rem` vertical inset; the support area uses `clamp(0.5rem, 2svh, 1.25rem)` above and `1.25rem` below, balancing the visible group's outer insets. Normal flow accommodates font loading, translated wrapping, and viewport changes without title-specific measurement. When the combined content exceeds the available height, the section grows naturally and remains scrollable, preserving navigation clearance rather than clipping content. Existing title, text-reveal, and action motion remain unchanged. Do not insert promotional modules, scroll prompts, carousels, counters, or extra proof above the professional-services section.

Professional services use three equal desktop columns in one row. Every service receives the same dimensions, padding, icon treatment, and typographic weight; none is promoted above the others. At `900px` and below, the grid becomes a natural-height single column. Stats use three equal columns. Workflow rows divide number, title, and description into three editorial columns. P2 analysis uses a `0.58fr / 1.42fr` chapter grid with text constrained to readable measure. Hairlines, not card gutters, carry most of the information architecture.

### Responsive rules

- The supported viewport floor is `320px`.
- At `1024px`, the full desktop navigation yields to the menu control and modal navigation panel.
- At `900px` and below, professional services and analysis become natural-height single columns; the footer keeps its centered single-column close and uses the same fluid `2.5rem–4.5rem` separation from preceding content as every other route.
- At `640px` and below, header insets contract to `0.75rem`, main padding becomes `7.5rem 0.85rem 1rem`, footer contacts use a two-column grid with full-width email and location rows and a shared phone/WeChat row, workflow becomes a two-column number/content structure, and analysis point grids become single-column.
- The hero has a `100svh` minimum and centers the visible title, description, and actions as one group whenever the content fits, including at `1440px`, `390px`, and `320px` widths. Mobile actions remain full-width and stacked; long translations or very short screens extend the whole section naturally without clipping, preserving symmetric `7rem` top/bottom clearance and keeping the content below the fixed navigation.
- At `640px` and below, the FloatingLines layer drops from `0.58` to `0.44` opacity, reduces saturation/brightness, and caps renderer device pixel ratio at `1.25` instead of the wider-screen cap of `2`.

### Accessibility rules

- Keep semantic headings, landmarks, link destinations, and button roles intact.
- Preserve keyboard-operable navigation, dialogs, forms, lightboxes, and all visible `:focus-visible` outlines. The shipped focus ring is a two-pixel indigo-white line offset by three pixels.
- Maintain readable contrast across translucent surfaces. Supporting copy must not fall below the established muted-white level when it carries required information.
- Preserve bilingual layout resilience: labels may grow or wrap, but navigation meaning and destination parity must remain intact.
- Use `100dvh` / `100svh` behavior where present; do not regress mobile chrome handling to brittle fixed viewport heights.

**The Centered-Stage Rule.** New surfaces join the `88rem` centered shell and chapter rhythm. They do not introduce a permanent sidebar, detached canvas, or unrelated dashboard grid.

## Elevation & Depth

Depth is mostly tonal: graphite canvas, translucent obsidian, zinc boundaries, subtle internal highlights, and a low-opacity field of flowing magenta/blue lines. Shadows are ambient and rare. They clarify floating chrome, primary action priority, overlays, and media cards; they do not make every section look lifted.

The shipping night background is the React Bits FloatingLines effect adapted in `src/components/ui/FloatingLines.tsx` and mounted exactly once through `NightBackdrop`. It is a fixed, full-screen, pointer-inert WebGL canvas under all routes, with a CSS radial/vertical vignette above it to protect title and body readability. `NightBackdrop` loads the client component without SSR and supplies the exact contract: `linesGradient=["#E945F5", "#2F4BC0", "#E945F5"]`, `animationSpeed=1`, `interactive=false`, `bendRadius=5`, `bendStrength=-0.5`, `mouseDamping=0.05`, `parallax=true`, and `parallaxStrength=0.2`.

The renderer caps device pixel ratio at `2` on wider screens and `1.25` at `640px` and below. The line layer renders at `0.58` opacity with restrained saturation/brightness on desktop and `0.44` opacity with further attenuation on mobile. Rendering is skipped while the page is hidden. Reduced motion disables parallax and time progression, renders one static frame, and does not schedule the animation loop. If WebGL construction fails, the container records a fallback state and the graphite canvas/vignette remain. Cleanup must cancel animation frames, disconnect resize observation, remove listeners, dispose geometry/material/renderer, force context loss, and remove the canvas.

### Shadow vocabulary

- **Floating Chrome** (`0 18px 48px rgba(0, 0, 0, 0.34)`): separates the fixed top bar from the horizon.
- **Primary Action** (`0 12px 34px rgba(0, 0, 0, 0.30)`): gives the cold-white hero action one quiet lift.
- **Overlay** (`0 24px 70px rgba(0, 0, 0, 0.56)`): reserved for the mobile menu panel over its dimmed modal field.
- **Project Media** (`0 18px 52px rgba(0, 0, 0, 0.25)`): frames project imagery without turning chapters into floating cards.
- **Surface Sheen** (`inset 0 1px 0 rgba(255, 255, 255, 0.03–0.035)`): a one-line material cue on glass, panels, and fields.

### Motion rules

- State transitions use `180–300ms` easing for color, fill, border, scale, and small icon movement.
- Entrances use opacity, a short `8–20px` translation, and optional blur with the `cubic-bezier(0.16, 1, 0.3, 1)` finish. They should feel like light resolving, not objects flying in.
- The homepage opening is one authored `~3s` focal sequence with an explicit hierarchy: COOPER. resolves first; the real magenta/blue FloatingLines field and paired graphite shutters then wipe from left to right behind the unboxed white wordmark; the wordmark clears; only then may navigation, title, supporting copy, and actions enter. It plays once per browser session, accepts Esc as its unobtrusive emergency exit, never plays on non-home routes, and is bypassed entirely for `prefers-reduced-motion`. A seven-second CSS safety release prevents a failed client bundle from hiding either backdrop or detail. `NEXT_PUBLIC_INTRO_ENABLED=false` disables it without removing code; `?intro=1` forces a QA replay.
- Hero actions may lift up to `4px`, scale only to `1.02`, and move the arrow `3px`. Active controls compress to `0.98`.
- Continuous movement is limited to the approved FloatingLines field, the home title's slow pointer/orbit response, the footer wordmark's localized metallic flow, and the currently active home workflow marquee. Every continuous region pauses outside the viewport or while the page is hidden; none becomes another full-screen ambient layer.
- Full motion is the default on every viewport and input type. Do not downgrade motion merely because a device is narrow, touch-first, or reports reduced data. The explicit operating-system `prefers-reduced-motion` request remains authoritative: it freezes ambient loops and replaces nonessential spatial movement with immediate or gentle state feedback while leaving every word, route, control, and project visible.
- The portfolio focus rail may transition its active track over `520ms` with the same resolve curve. It changes emphasis only: all four projects remain keyboard reachable, and reduced motion resolves the layout immediately.

**The Depth-Is-Atmosphere Rule.** Use blur, gradient falloff, and one-pixel highlights to suggest space; reserve large shadows for elements that truly float or overlay.

## Shapes

The form language is compact, softened, and architectural. Small controls and navigation use `10–14px` corners, floating chrome uses `14px`, and content panels resolve to a shared `16px` radius in the shipped nocturnal layer. Pills are reserved for dots, tiny badges, or truly pill-shaped controls.

Hairlines are essential geometry. One-pixel zinc rules organize capabilities, stats, workflows, analysis chapters, and the footer. Larger legacy radii may still exist in source classes, but the shipping CSS resolves shared glass, panel, section, and project-card surfaces to `16px`; that resolved value is authoritative.

**The Hairline-Before-Card Rule.** When grouping related information, first try spacing and a zinc divider. Add a filled container only when the content needs a distinct material layer.

**The Radius-Hierarchy Rule.** Controls stay tighter than panels; pills remain exceptional. Do not mix arbitrary `20–40px` rounded containers into new screening-room surfaces.

## Components

### FloatingLines backdrop

- **Mounting:** one `FloatingLines` instance lives inside the single global `NightBackdrop`; never mount it per page or section.
- **Visual contract:** exact `#E945F5 / #2F4BC0 / #E945F5` line gradient, graphite base, screen-blended low opacity, and a full-screen readability vignette.
- **Behavior:** `animationSpeed=1`, `interactive=false`, `bendRadius=5`, `bendStrength=-0.5`, `mouseDamping=0.05`, `parallax=true`, and `parallaxStrength=0.2`.
- **Resilience:** preserve mobile DPR/opacity limits, page-hidden render pause, reduced-motion static frame, resize handling, WebGL fallback, and complete GPU/context cleanup.

### DepthText home statement

- **Role:** replaces the former proximity/blur title treatment as the single authored interaction in the first viewport while preserving the exact translated heading.
- **Material:** 28 restrained cold-white-to-deep-indigo layers, shallow `1.55px` depth, six-degree maximum tilt, and a slow `0.12` orbit within the existing `6rem` display ceiling.
- **Behavior:** pointer tracking is available only on fine-pointer full-motion devices. Intersection and page-visibility state pause its animation loop; reduced and minimal tiers hold an intentional static perspective.
- **Accessibility:** only the front face is exposed to assistive technology; extrusion copies are decorative and hidden.
- **Placement:** the title leads one centered flex-column group with the description and two actions in all four languages. Its `1.25rem` top inset is balanced by the support area's `1.25rem` bottom inset; the section's symmetric `7rem` clearance protects the fixed navigation, and short screens or long copy extend the section naturally without clipping or changing the title's motion.

### MetallicPaint footer signature

- **Role:** the existing `COOPER.` wordmark becomes a small liquid-metal closing signature without changing footer copy or contact structure.
- **Material:** a padded black wordmark mask drives a cold-white, black, and indigo-signal WebGL2 treatment within a fixed bounded footer region.
- **Behavior:** render resolution follows the element size with DPR capped at `1.5` on desktop and `1` on mobile. Animation runs only while the footer is near the viewport and the page is visible.
- **Resilience:** reduced motion renders a static time-zero frame; image, shader, or WebGL failure leaves the original accessible cold-white wordmark visible. Cleanup releases textures, buffers, shaders, programs, animation frames, observers, and the context.
- **Fallback handoff:** the readable wordmark is visible only while the WebGL mask is loading or after a render failure. Once the paint texture is ready, hide the fallback completely so translucent metallic regions never reveal a duplicate white base layer.

### Floating site header

- **Character:** compact screening-room chrome that remains present without becoming a sidebar.
- **Shape and material:** centered `88rem` maximum, `3.75rem` minimum height, `14px` radius, one-pixel translucent border, floating-obsidian fill, `22px` blur, and the Floating Chrome shadow.
- **Wordmark:** cold white, heavy Archivo, tracked lettering, preceded by one indigo signal dot.
- **Navigation:** small rounded links; default labels are muted, hover and active states become white. One shared translucent active surface and its one-pixel indigo-white underline travel between route positions with a tightly damped spring, preserving spatial continuity across navigation. Explicit reduced motion resolves the shared surface immediately.
- **Mobile:** preserve the language control, menu toggle, body scroll lock, backdrop close target, `aria-expanded`, `aria-controls`, modal semantics, and current-route state.
- **Locale readiness:** keep the header visually hidden, inert, and hidden from assistive technology until the initial language is resolved; do not briefly expose labels from the default language.

### Four-language selector

- **Placement:** replaces the former English toggle in the existing header action slot. One globe/current-language/plus trigger opens a compact right-aligned panel below the header; no second language control or full-screen language dialog is introduced.
- **Options:** fixed order 中文, English, 한국어, 日本語. Native names remain readable in every locale, with an explicit checkmark and `menuitemradio` state identifying the selection. Switching preserves the current URL and existing content/media.
- **Motion:** adapted from the user's React Bits StaggeredMenu. Two indigo/graphite underlays slide in before the dark panel, then labels enter in a short stagger. The plus rotates into a close mark. The same timeline reverses for dismissal and remains interruptible; explicit reduced motion resolves it immediately.
- **Input:** 44px trigger, full-row option targets, visible focus, Arrow Up/Down, Home/End, Escape, outside-click and focus-leave dismissal. Escape or choosing an option returns focus to the trigger; the closed panel is inert. Language and mobile navigation panels do not stay open together.
- **Initial language:** a valid saved manual choice wins. Otherwise, inspect browser language preferences in their listed order and use the first supported Chinese, English, Japanese, or Korean language; every Chinese region or script variant resolves to Simplified Chinese. If no supported preference is found, use English. Automatic selection does not write to `localStorage`.
- **Persistence:** only manual selections save the validated `zh`, `en`, `ja`, or `ko` preference, which survives refresh and synchronizes between tabs. Blocked storage does not prevent detection or in-memory switching. The document language, title, media labels, dates, footer feedback, and subsequent XiaoCoo replies follow the selection; existing chat history and original artwork pixels are not rewritten. The personal-website case instead selects its corresponding real localized screenshots.

### Hero actions

- **Character:** one decisive invitation and one quiet alternative.
- **Primary:** cold-white surface, deep-ink text, `16px` corner, firm label, and ambient action shadow.
- **Secondary:** transparent obsidian with a zinc border and cold-white text; it must not visually rival the primary action.
- **State:** hover changes material value; full motion may add the bounded lift, scale, and arrow translation described above. Keyboard focus always remains visible.
- **Responsive:** actions sit inline on wider screens and become full-width stacked controls on mobile.

### Professional services

- **Desktop structure:** three equal columns in one row; every item has identical padding, minimum height, icon treatment, and information hierarchy.
- **Mobile structure:** one natural-height column at `900px` and below.
- **Material:** a shared parent frame and zinc hairlines organize the services. Each item uses a subject-matched, full-bleed nocturnal photograph with lifted detail (`brightness(1.2)`, `1.3` on hover/focus) beneath a graphite readability wash that fades toward the image subject, then centers an indigo icon tile with its preserved title and description; do not nest three unrelated floating cards. Images stay text-free, use the graphite/cold-white/indigo palette, and crop responsively while the text-side wash and existing text shadow protect readability.
- **Behavior:** each complete service surface is a semantic link to its matching project in the portfolio focus rail. Brand Design targets `p1`, UI/UX targets `p2`, and Video/Photography targets the user-specified `p3`; arrival activates that rail and centers it in the viewport without bypassing keyboard focus or reduced-motion preferences.

### Portfolio focus rail

- **Structure:** the four preserved projects share one `16px` obsidian frame. Desktop uses a `5fr / 1fr / 1fr / 1fr` active track; mobile rotates the same relationship into vertical rows.
- **State:** hover, focus, click, Arrow keys, Home, and End may change the active project. The entire active project surface is a semantic link, while the visible project action remains its explicit affordance; collapsed rails keep an unambiguous title. On touch layouts, the first tap expands a collapsed project and the next tap follows its link.
- **Deep links:** stable `portfolio-project-p1` through `portfolio-project-p4` anchors may open the portfolio route, activate the matching rail, and center it beneath the floating header. Hash-driven positioning uses immediate movement when reduced motion is requested.
- **Media:** use each project's real image as the full panel field with a dark readability wash. Do not replace, recolor, or fabricate media.
- **Motion:** grid-track and content emphasis may resolve over `520ms` with the approved curve; `prefers-reduced-motion` makes the transition effectively immediate.

### Personal website case study

**The Localized Case Evidence Rule.** The personal-website case uses eight actual website screenshots per language under public/photos/portfolio/p2/localized/{zh,en,ja,ko}/, captured by scripts/capture-p2-design.mjs. The pages group contains home-hero, portfolio-grid, about-page, and contact-page; the components group contains home-services, p2-detail, language-menu, and xiaocoo-page, all WebP. The current language selects the full set; only a missing image may fall back to its Chinese counterpart. Changing language resets the gallery and closes the old lightbox so no previous-language image remains. The language-menu image replaces the removed Task Brief capture.

**The Concept-Cover Boundary Rule.** public/photos/portfolio/p2/covers/personal-website-studio.webp is a text-free studio concept background for the P2 personal-website card, not an actual website screenshot. A bottom readability mask protects its title and action; the case gallery supplies the real screen evidence.

### About photo stack

- **Role:** the existing About avatar region becomes a tactile personal gallery without changing biography copy or the experience badge.
- **Media:** use only Cooper's supplied or already-published personal imagery. The desktop gallery contains five outdoor and activity photographs after the formal studio portrait was removed at the user's direction; the mobile gallery contains four. Prepare consistent `4:5`, `1200 × 1500` WebP crops with the person or activity kept inside the central reading area; exclude captions and screenshots from the crop.
- **Initial card and responsive selection:** Stack paints its final item on top. Desktop therefore places `/photos/about-stack/snow-journey.webp` last to open with the snow selfie, preserving the other photographs' relative browsing order. The query `(max-width: 767px), (hover: none) and (pointer: coarse)` filters out only that photo on narrow screens or coarse no-hover devices, including phone landscape; the remaining four cards open with `meadow-rest.webp`. Listen for query changes so viewport and input changes update the selection. Keep the snow-journey source file rather than deleting it.
- **Behavior:** the top image can be dragged beyond a bounded threshold, clicked, or advanced with Enter/Space to move it behind the stack. Lower cards retain restrained rotation and depth so the available gallery is obvious.
- **Resilience:** the experience badge remains above the cards and does not intercept input. Explicit reduced motion disables free dragging and uses immediate click/keyboard advancement.

### About capability and interest tiles

- **Role:** the five professional capabilities and four personal interests keep their existing bilingual labels and two-column cadence, while each tile gains one dedicated environmental image that makes the subject legible at a glance.
- **Media:** use nine page-exclusive, text-free nocturnal images: brand-system materials, interface prototyping, motion editing, photographic storytelling, team coordination, alpine exploration, court sports, piano/photography, and Go strategy. These assets live only under `/photos/about-modules/` and must not be reused on the home, portfolio, contact, or Xiaocoo routes.
- **Readability:** keep photographic detail visibly bright toward the right edge (`brightness(1.2)`), with a graphite wash concentrated behind the left-side copy and reduced toward the image subject. White text, secondary copy, indigo/purple signal dots, and the existing hover spotlight remain above that wash at all breakpoints.
- **Behavior:** preserve the current GSAP tile response; only the image may receive the bounded image-scale/parallax treatment. The background is decorative, has an empty alternative, and never replaces the visible label.

### Flowing workflow menu

- **Role:** the four preserved home workflow steps remain an ordered editorial sequence, but the active row resolves into a continuous image-and-text strip that makes each stage tangible.
- **Media:** each stage uses one dedicated, text-free nocturnal studio photograph with a central subject and edge-safe `3:2` crop. The four images share graphite, cold-white, and restrained indigo lighting.
- **Behavior:** one completed tap or click selects the target row directly and idempotently; activating the same row again keeps it selected. Real mouse hover without pressed buttons and keyboard-visible focus also select a row, while touch-generated hover/focus does not select it a second time. Touch layouts keep one row active. The active cold-white marquee surface must be fully opaque so the base row title and description cannot bleed through at rest; draw its indigo keyboard focus indicator above that surface. Preserve the existing GSAP edge reveal and marquee effects; only the active, visible row's marquee runs.
- **Resilience:** `prefers-reduced-motion` keeps the selected row visible but freezes the horizontal loop. Static row text remains the semantic source, so the entire sequence is readable without GSAP.

### Nocturnal operate surfaces

- **Xiaocoo:** keep one stable sequence—intro, transcript, suggestion rail, composer—inside the same obsidian and indigo vocabulary as the rest of the site. New messages may use a small opacity and `8px` resolve, never a springy card entrance.
- **Public navigation:** the former Task Brief route and its navigation entry are intentionally absent. Language switching belongs exclusively to the global top navigation.
- **Operational consistency:** inputs, buttons, pending states, errors, focus rings, and mobile behavior reuse the shared field and control rules instead of introducing a second light interface.

### Panels and editorial chapters

- **Panels:** shared `16px` corners, zinc border, dark translucent gradient, shallow internal sheen, and restrained blur.
- **Capability and stat modules:** professional services and stats use equal columns inside a common frame. Rely on hairlines between entries.
- **Workflow and P2 analysis:** the home workflow uses the single Flowing workflow frame and four ruled rows; P2 analysis keeps open top/bottom-ruled chapters. Keep analysis prose near `72ch` and points in a two-column ruled list until the mobile breakpoint.
- **Project media:** retain real imagery, existing aspect behavior, lightboxes, and category identity. The nocturnal system frames media; it does not replace or recolor it.

### Inputs and fields

- **Style:** cold-white text on a low-alpha field-obsidian fill with a one-pixel translucent border and subtle inset highlight.
- **Placeholder:** distinctly quieter than entered content while remaining legible.
- **Focus:** use the global visible indigo-white outline; do not rely on color change alone.
- **Native content:** select menus keep a solid dark option background for legibility.
- **Behavior:** validation, submission, disabled, pending, success, error, print, and API behavior are product behavior and must remain unchanged.

### Mobile menu

- **Material:** strong obsidian panel over a black modal veil with backdrop blur.
- **Shape:** `16px` panel, `11px` links, generous `3rem` minimum link height, and clear icon/label alignment.
- **Motion:** a short fade plus small downward-to-rest translation and blur resolve. Reduced motion uses immediate, complete visibility.
- **Behavior:** active-route indication, contact links, outside-close action, route-close action, and body scroll restoration are mandatory.

### Footer

- **Structure:** a centered single-column close separated from the preceding page content by the global `clamp(2.5rem, 5vw, 4.5rem)` rhythm: brand and note lead, followed by email, phone, WeChat, and location on one centered desktop row when space allows, wrapping naturally when it does not. All four contacts remain keyboard-operable copy actions with a minimum height of `44px`.
- **Small-screen contacts:** at `640px` and below, use a centered two-column grid capped at `28rem`. Email and location each span both columns; phone and WeChat share the middle row. Allow labels to wrap, including long email addresses, without a horizontal scrolling or dragging rail.
- **Portfolio endings:** the final gallery on `p1`, `p3`, and `p4`, and the project picker on `p2`, have no trailing section margin. Keep their existing page-shell bottom padding, matching About, and let the global footer separation provide the remaining gap; do not stack an extra `mb-16` / `lg:mb-24` before the footer.
- **Locale readiness:** preserve the footer's layout space but keep it visually hidden, inert, and hidden from assistive technology until the initial language is resolved, so the note and contact feedback never flash in the wrong language.
- **Feedback:** successful copy displays a small localized fixed toast for `1.8s`; failure states are honest, keyboard focus remains visible, and reduced motion removes the entrance animation.
- **Tone:** quiet and factual. The localized MetallicPaint wordmark is the sole expressive close; hover may brighten actionable contact links while non-action contact facts remain visually stable.

## Do's and Don'ts

### Do:

- **Do** preserve the nocturnal screening-room thesis, centered stage, compact floating chrome, and chapter rhythm on every user-facing route.
- **Do** let real work, process analysis, and existing project media provide the visual proof.
- **Do** use cold-white hierarchy, zinc hairlines, translucent obsidian, restrained indigo UI signals, and the one approved low-opacity FloatingLines environment consistently.
- **Do** keep bilingual parity, semantic structure, keyboard behavior, readable contrast, and all motion fallbacks.
- **Do** update this file and `.impeccable/design.json` together whenever a shipped token or component pattern changes.

### Don't:

- **Don't** restore the portfolio-template sidebar, decorative blob scaffold, or a dashboard-like card wall.
- **Don't** introduce broad colorful gradients into UI chrome, controls, cards, or content. The user-directed low-opacity `#E945F5 / #2F4BC0 / #E945F5` FloatingLines field is the sole environmental exception.
- **Don't** promote every heading to hero scale or every group into a rounded container.
- **Don't** duplicate or add persistent full-screen effects over the global FloatingLines backdrop. The temporary first-visit shutter sequence is the sole bounded interruption; DepthText and MetallicPaint remain confined to the title and footer wordmark, and the backdrop's magenta/blue gradient is not reused as general UI color.
- **Don't** alter copy, facts, navigation, media, forms, API flows, lightboxes, project data, translation behavior, or motion-accessibility behavior under the banner of design maintenance.

### Content-preservation boundary

This design system governs presentation only. The names **COOPER.**, **梁世城 Cooper**, and **小coo**; all Chinese and English copy; current navigation destinations; contact details; project descriptions and media; gallery manifests; Contact submission; Xiaocoo behavior; static-export constraints; API behavior; and accessibility affordances are immutable unless a separate product/content brief explicitly changes them. Do not fabricate testimonials, client logos, pricing, awards, metrics, or commercial claims.

### Maintenance checklist

- [ ] In all four languages, the visible home title, description, and two actions center as one group. The hero has a `100svh` minimum, symmetric `7rem` top/bottom clearance, and balanced `1.25rem` outer content insets; it grows naturally for long copy or very short screens without clipping or header overlap, with all existing motion preserved.
- [ ] Saved manual language choices take priority over supported browser preferences; all Chinese variants use Simplified Chinese, unsupported preferences fall back to English, and automatic detection never writes `localStorage`.
- [ ] Header and footer remain visually hidden and inert until the locale is ready, avoiding a wrong-language flash.
- [ ] The personal-website case selects eight real screenshots for the active language, resets its lightbox on language change, and uses the language-menu capture instead of the removed Task Brief image.
- [ ] The P2 personal-website card uses the text-free studio concept cover with a bottom readability mask; it is not represented as an actual website screenshot.
- [ ] The first homepage visit plays one skippable screening-room opening in the fixed order COOPER. → left-to-right FloatingLines reveal → COOPER. clears → page detail; later visits in the same session do not replay it, `?intro=1` forces QA playback, and reduced motion plus `NEXT_PUBLIC_INTRO_ENABLED=false` bypass it without hiding content.
- [ ] The home title uses one DepthText instance with its translated copy intact; reduced/minimal tiers are static and the loop pauses offscreen or page-hidden.
- [ ] Archivo remains the Latin face and Noto Sans SC remains the Chinese face across display, title, body, and label roles; no third expressive font has entered the system.
- [ ] Graphite, cold white, zinc hairlines, obsidian, and restrained indigo remain the UI vocabulary; magenta/blue stays confined to the approved low-opacity FloatingLines field.
- [ ] New content joins the centered `88rem` shell and responsive `900px` / `640px` collapse rules; navigation still switches at the `1024px` large breakpoint.
- [ ] Professional services still use three equal desktop columns with no featured item; mobile still resolves to one natural-height column.
- [ ] The portfolio focus rail keeps four real projects, one active state, whole-surface project links, keyboard navigation, mobile first-tap expansion, vertical behavior, and a reduced-motion fallback.
- [ ] Xiaocoo still follows transcript → suggestions → composer, and the removed Task Brief destination has not returned to the public navigation or route build.
- [ ] The footer remains centered, with four copyable contacts at least `44px` high: one desktop row that can wrap, and at `640px` and below a two-column grid with full-width email/location rows and phone/WeChat together. Labels wrap without horizontal dragging; the copy toast remains available.
- [ ] Navigation, language switching, forms, APIs, lightboxes, project data, contact methods, and Xiaocoo still behave exactly as before the visual change.
- [ ] The desktop navigation owns exactly one shared active surface that moves between routes; reduced motion resolves it immediately.
- [ ] The About photo stack opens with snow-journey on desktop and meadow-rest in the four-card mobile gallery; the `767px` or coarse no-hover query updates on viewport/input changes, preserves other photos' order, and retains the snow source asset. Drag, click, Enter, Space, text-free `4:5` crops, and the non-blocking experience badge remain intact.
- [ ] The home workflow keeps all four translated steps and their existing GSAP effects; one tap/click idempotently selects a step, real mouse hover and keyboard-visible focus still select, touch-generated hover/focus does not double-select, the active cold-white surface is opaque with an above-surface indigo focus ring, and only the active visible marquee runs.
- [ ] Keyboard focus, semantic headings, contrast, mobile scroll locking, full-motion defaults, and the explicit reduced-motion path are verified.
- [ ] `NightBackdrop` mounts exactly one FloatingLines instance with gradient `#E945F5 / #2F4BC0 / #E945F5`, speed `1`, interactivity off, bend `5 / -0.5`, damping `0.05`, and parallax `true / 0.2`.
- [ ] Fixed full-screen WebGL, vignette readability, mobile DPR `1.25` and opacity `0.44`, page-hidden render pause, reduced-motion static frame, fallback state, and full cleanup remain intact.
- [ ] The footer MetallicPaint region remains bounded, pauses offscreen/page-hidden, caps DPR at `1.5 / 1`, renders a static reduced-motion frame, and preserves the readable `COOPER.` fallback.
- [ ] `DESIGN.md` and `.impeccable/design.json` agree on tokens, components, motion, breakpoints, named rules, and guardrails.
- [ ] A bounded desktop/mobile finish review is complete. The current recorded disposition is **SHIP — no remaining fixes**.

### Provenance

This record was carbonized from `PRODUCT.md`, `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/about/page.tsx`, `src/app/portfolio/page.tsx`, `src/app/xiaocoo/page.tsx`, `src/components/SiteHeader.tsx`, `src/components/SiteFooter.tsx`, `src/components/NightBackdrop.tsx`, `src/components/motion/OpeningSequence.tsx`, `src/lib/openingIntro.ts`, `src/components/ui/FloatingLines.tsx`, `src/components/ui/DepthText.tsx`, `src/components/ui/MetallicPaint.tsx`, `src/components/ui/Stack.tsx`, `src/components/ui/FlowingMenu.tsx`, `src/components/ui/expanding-cards.tsx`, and `src/components/xiaocoo/XiaocooChat.tsx`. The committed form is direction 4, seed `94f35f2e`. The shipping background, hero title, footer signature, About stack, and home workflow are adapted React Bits effects with bounded animation, reduced-motion states, and explicit fallbacks.

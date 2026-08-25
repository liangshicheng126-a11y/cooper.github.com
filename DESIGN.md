---
name: "Cooper Nocturnal Screening Room"
description: "A bilingual portfolio staged as a restrained nocturnal screening room for work, capability, and contact."
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
typography:
  display:
    fontFamily: "var(--font-display-cjk), var(--font-archivo), sans-serif"
    fontSize: "clamp(3.4rem, 8.2vw, 6rem)"
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "-0.04em"
  title:
    fontFamily: "var(--font-display-cjk), var(--font-archivo), sans-serif"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1.333
  body:
    fontFamily: "var(--font-archivo), sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "var(--font-archivo), sans-serif"
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
  status-rail:
    backgroundColor: "transparent"
    textColor: "{colors.soft-cold-white}"
    typography: "{typography.label}"
    padding: "0.5rem 0 0.5rem 3rem"
---

# Design System: Cooper Nocturnal Screening Room

## Overview

**Creative North Star: "The Nocturnal Screening Room"**

Cooper's work is presented as a private screening room after dark: graphite black holds the frame, cold white type behaves like projected light, zinc hairlines order the programme, translucent obsidian provides just enough material separation, and indigo appears only as a controlled signal. The interface is cinematic without becoming theatrical. Work, words, and actions remain legible before atmosphere.

This world deliberately rejects the generic portfolio-template split sidebar and decorative blob scaffold. The site is a centered, full-width composition with compact floating chrome, oversized display typography, editorial chapters, and a layered night horizon. Its story is fixed: identify Cooper, understand his capabilities, inspect real work, then choose contact, Task Brief, or Xiaocoo without losing context.

Form direction 4, seed `94f35f2e`, is the shipped authority. The finish-review disposition is **SHIP — no remaining fixes**. The desktop, mobile, and P2 detail captures in `.impeccable/review/` are the visual baselines for maintenance.

**Key Characteristics:**

- Graphite-black canvas with cold white, zinc, and rare indigo signals.
- Centered full-width screening-room composition, never a split portfolio sidebar.
- Compact floating top bar over a layered, quiet night horizon.
- Display-led hierarchy paired with editorial hairlines and asymmetric chapter grids.
- Translucent obsidian surfaces with restrained blur and shallow ambient depth.
- Real project work and preserved bilingual content remain the evidence and the story.

**The Work-Is-The-Projection Rule.** Atmosphere frames the work; it never competes with, recolors, or substitutes for actual project media.

## Colors

The palette is near-monochrome and nocturnal. Indigo is a navigational and interactive signal, not a decorative wash.

### Primary

- **Indigo Signal** (`indigo-signal`): labels, small icons, bullets, status dots, and interaction cues that need attention without becoming a second visual field.
- **Indigo Core** (`indigo-core`): luminous point accents and restrained radial-light energy.
- **Indigo Action** (`indigo-action`): solid action fills inherited by functional controls; its darker hover partner is `indigo-action-hover`.

### Neutral

- **Graphite Black** (`graphite-black`): the page canvas and terminal vignette color.
- **Deep Ink** (`deep-ink`): dark text on cold-white primary actions, selection foregrounds, and scrollbar tracks.
- **Cold White** (`cold-white`): primary copy and projected display type.
- **Muted Cold White** (`muted-cold-white`): supporting copy and secondary metadata. Use `soft-cold-white` where supporting text must read more strongly.
- **Floating Obsidian** (`floating-obsidian`): the fixed top-bar material.
- **Obsidian / Strong Obsidian** (`obsidian`, `obsidian-strong`): translucent content and overlay surfaces.
- **Zinc Hairline** (`zinc-hairline`): the default one-pixel divider; reserve `zinc-hairline-strong` for chapter boundaries that need a firmer start.

**The Restrained-Indigo Rule.** Indigo marks state, action, or structure. Do not turn it into large decorative gradients, broad card fills, or a competing background motif.

**The Cold-White Ladder Rule.** Use primary, soft, muted, and faint white levels to express hierarchy; do not introduce arbitrary gray families screen by screen.

## Typography

**Display Font:** ZCOOL QingKe HuangYou (with Archivo, sans-serif fallback)

**Body Font:** Archivo (with sans-serif fallback)
**Label Font:** Archivo (with sans-serif fallback)

**Character:** ZCOOL QingKe HuangYou (`--font-display-cjk`) gives display headings—especially Chinese headings—the authored, poster-like face seen in the shipping captures. Archivo (`--font-archivo`) carries Latin text, body copy, navigation, labels, form content, and utility information with calm technical clarity.

### Hierarchy

- **Display** (`typography.display`): hero titles only. On desktop the title is oversized, centered, tightly tracked, and nearly solid-set; on narrow mobile it scales with `clamp(3rem, 15.5vw, 4.65rem)` while preserving the same weight and line-height character.
- **Title** (`typography.title`): section and chapter titles. Keep the display face at weight 400 even when legacy utility classes request bold.
- **Body** (`typography.body`): paragraphs, project analysis, form copy, and descriptive content. Long-form analysis should stay near `72ch`; compact service descriptions stay near `48ch`.
- **Label** (`typography.label`): navigation, statuses, counters, and small metadata. Use compact sizes, firm weight, and controlled tracking; uppercase is appropriate only for terse utility text.

**The Two-Voice Rule.** ZCOOL speaks for display moments and Chinese headline character; Archivo carries everything operational. Do not add a third expressive family.

**The Oversized-Once Rule.** The largest scale belongs to the first-view title. Subsequent headings step down decisively so the page reads as chapters, not repeated hero cards.

## Layout

The page shell is centered at a maximum width of `88rem` and isolated over a fixed backdrop. Main content begins below the floating chrome with `8.5rem` top padding on wider screens. The home hero occupies a centered first-view stage between `34rem` and `52rem` high, then yields to a compact stack of real content sections.

The first viewport has a fixed composition: compact floating top bar; oversized title; one supporting statement; two actions; the scroll cue where space permits; a recent-work status rail; and the layered night horizon. Preserve that order and visual dominance. Do not insert promotional modules, carousels, counters, or extra proof above it.

Home capabilities use an asymmetric `1.24fr / 0.76fr` grid. Stats use three equal columns. Workflow rows divide number, title, and description into three editorial columns. P2 analysis uses a `0.58fr / 1.42fr` chapter grid with text constrained to readable measure. Hairlines, not card gutters, carry most of the information architecture.

### Responsive rules

- The supported viewport floor is `320px`.
- At `1024px`, the full desktop navigation yields to the menu control and modal navigation panel.
- At `900px` and below, service and analysis grids become one column; the footer also becomes one column.
- At `640px` and below, header insets contract to `0.75rem`, main padding becomes `7.5rem 0.85rem 1rem`, stats and footer contacts stack, workflow becomes a two-column number/content structure, and analysis point grids become single-column.
- The mobile hero drops the desktop minimum height and uses full-width stacked actions. The status rail follows the actions; the scroll cue is omitted.
- Mobile background intensity is reduced: the horizon layer becomes wider, shorter, and less opaque, and beams fall to low opacity so text remains the priority.

### Accessibility rules

- Keep semantic headings, landmarks, link destinations, and button roles intact.
- Preserve keyboard-operable navigation, dialogs, forms, lightboxes, and all visible `:focus-visible` outlines. The shipped focus ring is a two-pixel indigo-white line offset by three pixels.
- Maintain readable contrast across translucent surfaces. Supporting copy must not fall below the established muted-white level when it carries required information.
- Preserve bilingual layout resilience: labels may grow or wrap, but navigation meaning and destination parity must remain intact.
- Use `100dvh` / `100svh` behavior where present; do not regress mobile chrome handling to brittle fixed viewport heights.

**The Centered-Stage Rule.** New surfaces join the `88rem` centered shell and chapter rhythm. They do not introduce a permanent sidebar, detached canvas, or unrelated dashboard grid.

## Elevation & Depth

Depth is mostly tonal: graphite canvas, translucent obsidian, zinc boundaries, subtle internal highlights, and low-opacity radial light. Shadows are ambient and rare. They clarify floating chrome, primary action priority, overlays, and media cards; they do not make every section look lifted.

The shipping night background is **entirely CSS-generated** by `NightBackdrop.tsx` and the `.night-backdrop*` rules in `src/app/globals.css`. Despite the legacy class name `.night-backdrop__image`, it references no raster, remote image, or generated bitmap. Its horizon, beams, falloff, and vignette are layered gradients and masks. Preserve this provenance unless a future brief explicitly authorizes a new asset strategy.

### Shadow vocabulary

- **Floating Chrome** (`0 18px 48px rgba(0, 0, 0, 0.34)`): separates the fixed top bar from the horizon.
- **Primary Action** (`0 12px 34px rgba(0, 0, 0, 0.30)`): gives the cold-white hero action one quiet lift.
- **Overlay** (`0 24px 70px rgba(0, 0, 0, 0.56)`): reserved for the mobile menu panel over its dimmed modal field.
- **Project Media** (`0 18px 52px rgba(0, 0, 0, 0.25)`): frames project imagery without turning chapters into floating cards.
- **Surface Sheen** (`inset 0 1px 0 rgba(255, 255, 255, 0.03–0.035)`): a one-line material cue on glass, panels, and fields.

### Motion rules

- State transitions use `180–300ms` easing for color, fill, border, scale, and small icon movement.
- Entrances use opacity, a short `8–20px` translation, and optional blur with the `cubic-bezier(0.16, 1, 0.3, 1)` finish. They should feel like light resolving, not objects flying in.
- Hero actions may lift up to `4px`, scale only to `1.02`, and move the arrow `3px`. Active controls compress to `0.98`.
- Continuous movement is limited to tiny directional cues and full-motion enhancements. Do not animate the CSS night horizon merely to make it busier.
- Preserve the full / reduced / minimal motion tiers and `prefers-reduced-motion`. Reduced modes remove parallax, looping decoration, smooth scrolling, and nonessential blur while leaving every word, route, control, and project visible.

**The Depth-Is-Atmosphere Rule.** Use blur, gradient falloff, and one-pixel highlights to suggest space; reserve large shadows for elements that truly float or overlay.

## Shapes

The form language is compact, softened, and architectural. Small controls and navigation use `10–14px` corners, floating chrome uses `14px`, and content panels resolve to a shared `16px` radius in the shipped nocturnal layer. Pills are reserved for dots, tiny badges, or truly pill-shaped controls.

Hairlines are essential geometry. One-pixel zinc rules organize capabilities, stats, workflows, analysis chapters, and the footer. Larger legacy radii may still exist in source classes, but the shipping CSS resolves shared glass, panel, section, and project-card surfaces to `16px`; that resolved value is authoritative.

**The Hairline-Before-Card Rule.** When grouping related information, first try spacing and a zinc divider. Add a filled container only when the content needs a distinct material layer.

**The Radius-Hierarchy Rule.** Controls stay tighter than panels; pills remain exceptional. Do not mix arbitrary `20–40px` rounded containers into new screening-room surfaces.

## Components

### Floating site header

- **Character:** compact screening-room chrome that remains present without becoming a sidebar.
- **Shape and material:** centered `88rem` maximum, `3.75rem` minimum height, `14px` radius, one-pixel translucent border, floating-obsidian fill, `22px` blur, and the Floating Chrome shadow.
- **Wordmark:** cold white, heavy Archivo, tracked lettering, preceded by one indigo signal dot.
- **Navigation:** small rounded links; default labels are muted, hover and active states become white over a restrained translucent fill. The active route also receives a one-pixel indigo-white underline.
- **Mobile:** preserve the language control, menu toggle, body scroll lock, backdrop close target, `aria-expanded`, `aria-controls`, modal semantics, and current-route state.

### Hero actions

- **Character:** one decisive invitation and one quiet alternative.
- **Primary:** cold-white surface, deep-ink text, `16px` corner, firm label, and ambient action shadow.
- **Secondary:** transparent obsidian with a zinc border and cold-white text; it must not visually rival the primary action.
- **State:** hover changes material value; full motion may add the bounded lift, scale, and arrow translation described above. Keyboard focus always remains visible.
- **Responsive:** actions sit inline on wider screens and become full-width stacked controls on mobile.

### Recent-work status rail

- **Character:** a small operational signal, not a promotional banner.
- **Structure:** indigo icon tile, signal dot and status label, recent-work label, and the preserved latest-project string. On wider screens a hairline separates it from the actions; on mobile it follows the stacked actions without the divider.
- **Rule:** keep copy compact and factual. Do not add badges, urgency, or fabricated availability language.

### Panels and editorial chapters

- **Panels:** shared `16px` corners, zinc border, dark translucent gradient, shallow internal sheen, and restrained blur.
- **Capability and stat modules:** use asymmetric or equal-column grids inside a common frame; rely on hairlines between entries.
- **Workflow and P2 analysis:** prefer open rows with top/bottom rules over nested cards. Keep analysis prose near `72ch` and points in a two-column ruled list until the mobile breakpoint.
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

- **Structure:** hairline-led two-column close with brand/note on the left and real contact methods on the right; collapse to one column at `900px`, then stack contacts at `640px`.
- **Tone:** quiet and factual. Hover may brighten actionable contact links; non-action contact facts remain visually stable.

## Do's and Don'ts

### Do:

- **Do** preserve the nocturnal screening-room thesis, centered stage, compact floating chrome, and chapter rhythm on every user-facing route.
- **Do** let real work, process analysis, and existing project media provide the visual proof.
- **Do** use cold-white hierarchy, zinc hairlines, translucent obsidian, radial beams, and restrained indigo consistently.
- **Do** keep bilingual parity, semantic structure, keyboard behavior, readable contrast, and all motion fallbacks.
- **Do** update this file and `.impeccable/design.json` together whenever a shipped token or component pattern changes.

### Don't:

- **Don't** restore the portfolio-template sidebar, decorative blob scaffold, or a dashboard-like card wall.
- **Don't** introduce broad colorful gradients, extra accent families, heavy glow, gratuitous glass, or large shadows on ordinary sections.
- **Don't** promote every heading to hero scale or every group into a rounded container.
- **Don't** replace the CSS night backdrop with a raster simply because the class name contains `image`.
- **Don't** alter copy, facts, navigation, media, forms, API flows, lightboxes, project data, translation behavior, or motion-accessibility behavior under the banner of design maintenance.

### Content-preservation boundary

This design system governs presentation only. The names **COOPER.**, **梁世城 Cooper**, and **小coo**; all Chinese and English copy; navigation destinations; contact details; project descriptions and media; gallery manifests; Task Brief fields and submission; Contact submission; Xiaocoo behavior; static-export constraints; API behavior; and accessibility affordances are immutable unless a separate product/content brief explicitly changes them. Do not fabricate testimonials, client logos, pricing, awards, metrics, or commercial claims.

### Maintenance checklist

- [ ] The first viewport still contains the floating top bar, oversized title, supporting statement, two actions, recent-work status rail, and layered night horizon in that order.
- [ ] Archivo remains the body/Latin face; ZCOOL QingKe HuangYou remains the display/Chinese face; no third expressive font has entered the system.
- [ ] Graphite, cold white, zinc hairlines, obsidian, and restrained indigo remain the only global visual vocabulary.
- [ ] New content joins the centered `88rem` shell and responsive `900px` / `640px` collapse rules; navigation still switches at the `1024px` large breakpoint.
- [ ] Desktop, mobile, and P2 detail views remain visually consistent with `.impeccable/review/desktop.png`, `mobile.png`, and `p2-detail-desktop.png`.
- [ ] Navigation, language switching, forms, APIs, lightboxes, project data, contact methods, Task Brief, and Xiaocoo still behave exactly as before the visual change.
- [ ] Keyboard focus, semantic headings, contrast, mobile scroll locking, and full/reduced/minimal motion tiers are verified.
- [ ] The shipping background remains CSS-generated, or any deliberately authorized replacement has explicit asset provenance.
- [ ] `DESIGN.md` and `.impeccable/design.json` agree on tokens, components, motion, breakpoints, named rules, and guardrails.
- [ ] A bounded desktop/mobile finish review is complete. The current recorded disposition is **SHIP — no remaining fixes**.

### Provenance

This record was carbonized from `PRODUCT.md`, `src/app/globals.css`, `src/app/layout.tsx`, `src/components/SiteHeader.tsx`, `src/components/SiteFooter.tsx`, and the shipping review captures `.impeccable/review/desktop.png`, `mobile.png`, and `p2-detail-desktop.png`. The committed form is direction 4, seed `94f35f2e`. The review captures document rendered output; the night background itself is CSS-generated and has no shipping raster source.

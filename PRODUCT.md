# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Primary audience (inferred from the existing bilingual copy and portfolio structure): prospective clients, collaborators, recruiters, and design peers evaluating Cooper's work, capabilities, and working style.
- Visitors can start a conversation through direct contact or speak with the Xiaocoo assistant; the former Task Brief page is intentionally no longer part of the public website.

## Product Purpose

cooperliang.top is Cooper Liang's multilingual personal portfolio and working contact surface. It presents a coherent picture of his brand design, UI/UX, photography, and video work, then gives visitors direct paths to inspect projects, learn about him, understand his task-brief approach, use Xiaocoo, or make contact.

## Positioning

The site joins finished visual work, process analysis, personal outdoor and artistic experience, a structured client brief workflow, and a conversational portfolio assistant in one independently designed and developed portfolio.

## Operating Context

- Visitors browse a public responsive website on desktop and mobile.
- Content is available in Chinese, English, Japanese, and Korean. The header's StaggeredMenu language selector presents options in the fixed order 中文, English, 한국어, 日本語, preserves the current route, and remembers the selected language; original artwork and user-written chat history retain their original text.
- A saved manual language choice takes priority. On a first visit, browser language preferences are checked in order for Chinese, English, Japanese, or Korean; every Chinese region and script variant uses Simplified Chinese, and an unsupported preference list falls back to English. Automatic detection does not write to localStorage; only a manual selection is saved.
- The header and footer wait for the initial locale to be ready before becoming visible and interactive, preventing a flash of the wrong language.
- In all four languages, the visible home title, supporting description, and two actions form one horizontally and vertically centered group. The first section uses a 100svh minimum and a flex column with 7rem of symmetric top/bottom clearance; the title's 1.25rem top inset is balanced by the support area's 1.25rem bottom inset. When long translations or a short viewport exceed the available height, the hero grows naturally and scrolls without clipping or overlapping the fixed navigation. Existing motion remains unchanged.
- Portfolio routes include a project index, detailed graphic/photography/video cases, and nested P2 interface-design subprojects.
- The About photo stack opens with `/photos/about-stack/snow-journey.webp` on desktop, using the final card as the top card while preserving the other photos' relative browsing order. When `(max-width: 767px)` or `(hover: none) and (pointer: coarse)` matches, it excludes that photo and retains the other four, opening with `meadow-rest.webp`; this also covers touch-phone landscape and updates when viewport or input conditions change. The snow-journey source asset remains available.
- Each home workflow step is selected by one completed tap or click; repeated activation keeps the selected step open. Real mouse hover and keyboard-visible focus can also select a step, while touch-generated hover/focus does not trigger another selection. The active cold-white marquee surface is fully opaque so the underlying row label never bleeds through after selection; its GSAP reveal and marquee motion remain unchanged. Keyboard focus is redrawn above the active surface in indigo.
- Footer contacts stay on one centered desktop row when space allows and wrap naturally when needed. At `640px` and below, email and location each span a full row in a two-column grid, with phone and WeChat sharing the middle row. Labels may wrap instead of requiring horizontal dragging; all four copy actions retain targets at least `44px` high and their localized feedback toast.
- The personal-website case uses eight real screenshots per language under public/photos/portfolio/p2/localized/{zh,en,ja,ko}/: four core-page images and four component images. The current language selects the screenshot set and changing it resets the lightbox. The language-menu image replaces the removed Task Brief image; scripts/capture-p2-design.mjs remains the capture workflow.
- The Contact route submits structured information through its existing API flow. The former Task Brief route is intentionally absent from the public build and navigation.
- Xiaocoo answers questions about Cooper's background, work, projects, and skills.

## Capabilities and Constraints

- Preserve all existing factual content, navigation destinations, media, bilingual translations, forms, API behavior, lightboxes, project data, and the explicit operating-system reduced-motion fallback. Full motion remains the default across viewport sizes and input types.
- The current stack is Next.js 15, React 19, TypeScript, Tailwind CSS, Framer Motion, GSAP, and Lucide icons.
- The site supports static export and GitHub Pages-oriented deployment where possible; server-backed contact and assistant routes remain existing product behavior.
- This redesign covers every user-facing route and shared site chrome.
- The user's explicit constraint is visual-only change: content must not be changed.

## Brand Commitments

- Preserve the names "COOPER.", "梁世城 Cooper", "小coo", and the current bilingual voice.
- Preserve the portfolio's real project imagery and existing contact details.
- The P2 personal-website selection card may use public/photos/portfolio/p2/covers/personal-website-studio.webp as a text-free studio concept background with a bottom readability mask. This cover is not an actual website screenshot; the localized case gallery remains the source of real screen evidence.
- The uploaded React hero script is the binding visual reference for this redesign: nocturnal background imagery, restrained translucent surfaces, high-contrast typography, radial light, compact rounded controls, and soft entrance motion.

## Evidence on Hand

- Bilingual product and portfolio copy: `src/locales/translations.ts`.
- Existing routes and behavior: `src/app`.
- Reusable interface and motion components: `src/components`.
- Real portfolio media and gallery manifests: `public/photos`, `public/videos`, and `public/photos/gallery-manifest.json`.
- No testimonials, external client logos, pricing, or unsupported commercial claims should be fabricated.

## Product Principles

1. Let the work lead: visual projects and real project detail remain the strongest proof.
2. Preserve clarity across media: graphic design, UI/UX, photography, and video should stay easy to distinguish and explore.
3. Make collaboration actionable: direct contact and Xiaocoo flows must remain easy to find and use without a separate Task Brief destination.
4. Treat four-language parity, full-motion defaults, and explicit reduced-motion support as core behavior, not optional polish.
5. Keep the site personal: professional capability and Cooper's exploratory character should remain visible together.

## Accessibility & Inclusion

Preserve semantic headings, keyboard-operable navigation and lightboxes, responsive layouts, readable contrast, and `prefers-reduced-motion` support. Do not infer reduced motion from screen size, touch input, or reduced-data signals.

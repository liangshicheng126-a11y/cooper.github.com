# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Primary audience (inferred from the existing bilingual copy and portfolio structure): prospective clients, collaborators, recruiters, and design peers evaluating Cooper's work, capabilities, and working style.
- Visitors can start a conversation through direct contact or speak with the Xiaocoo assistant; the former Task Brief page is intentionally no longer part of the public website.

## Product Purpose

cooperliang.top is Cooper Liang's bilingual personal portfolio and working contact surface. It presents a coherent picture of his brand design, UI/UX, photography, and video work, then gives visitors direct paths to inspect projects, learn about him, understand his task-brief approach, use Xiaocoo, or make contact.

## Positioning

The site joins finished visual work, process analysis, personal outdoor and artistic experience, a structured client brief workflow, and a conversational portfolio assistant in one independently designed and developed portfolio.

## Operating Context

- Visitors browse a public responsive website on desktop and mobile.
- Content is available in Chinese and English.
- Portfolio routes include a project index, detailed graphic/photography/video cases, and nested P2 interface-design subprojects.
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
4. Treat bilingual parity, full-motion defaults, and explicit reduced-motion support as core behavior, not optional polish.
5. Keep the site personal: professional capability and Cooper's exploratory character should remain visible together.

## Accessibility & Inclusion

Preserve semantic headings, keyboard-operable navigation and lightboxes, responsive layouts, readable contrast, and `prefers-reduced-motion` support. Do not infer reduced motion from screen size, touch input, or reduced-data signals.

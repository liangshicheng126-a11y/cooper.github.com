# Blob Splash Intro — Motion Spec

## Personality
- **Words**: fluid, luminous, confident
- **Context**: homepage splash / brand intro (first session visit)
- **Usage**: 2500ms total; lands on QA-verified static vector positions before CSS drift

## Semantic Parts
| Id | Element | Color token | ScrollBlobs class |
|----|---------|-------------|-------------------|
| blob-indigo | circle r=50 @ (94,96) | #7b86ff | blob-a / blob-indigo |
| blob-cyan | circle r=44 @ (170,104) | #53b8ff | blob-b / blob-cyan |
| blob-rose | circle r=48 @ (130,164) | #fb7185 | blob-c / blob-rose |

## Timeline

| Phase | Start | End | Behavior | Easing | Principle |
|-------|-------|-----|----------|--------|-----------|
| Settle | 0ms | 200ms | Three blobs stacked at viewport center; scale 0; opacity 0 | — | Anticipation |
| Bloom | 200ms | 1400ms | Staggered scale/opacity to 1; indigo +0ms, cyan +120ms, rose +240ms | power3.out, slight overshoot (scale 1.06 peak) | Slow in, slow out |
| Release | 1400ms | 2200ms | GSAP moves each `.blob-route` to CSS keyframe 0% pose | power2.inOut | Follow-through |
| Drift | 2200ms | ∞ | Resume `blob-route-*` + `blob-shape-*` CSS animations | CSS ease-in-out | Continuity |
| Reveal | 2000ms | 2800ms | Sidebar, LanguageToggle, main chrome stagger in | power3.out, stagger 0.08s | Staging |

## GSAP Tokens (React implementation source of truth)
- `BLOOM_DURATION`: 0.9s per blob
- `BLOOM_STAGGER`: 0.12s
- `BLOOM_EASE`: power3.out
- `BLOOM_OVERSHOOT`: scale 1.06 at 75% then settle to 1
- `RELEASE_DURATION`: 0.8s
- `RELEASE_EASE`: power2.inOut
- `REVEAL_STAGGER`: 0.08s
- `REVEAL_DURATION`: 0.45s
- `TOTAL_INTRO_MS`: ~2800

## CSS Handoff Targets (blob-route 0%)
- blob-a: translate3d(-18vw, -20vh, 0) scale(1) rotate(0deg)
- blob-b: translate3d(60vw, 6vh, 0) scale(1.05) rotate(5deg)
- blob-c: translate3d(8vw, 58vh, 0) scale(0.96) rotate(-4deg)

## Degradation
- `minimal` / `reduced` / `prefers-reduced-motion`: skip intro entirely
- `sessionStorage.blob-intro-played`: skip on repeat homepage visits same session
- `NEXT_PUBLIC_INTRO_ENABLED=false`: runtime disable without git revert

## QA Evidence
- Local overlay: `docs/brand-intro/outputs/fit_iterations/01_overlay.png`
- Final render: `docs/brand-intro/outputs/final_render.png`
- IoU diagnostic only (blur source); visual overlay is acceptance gate

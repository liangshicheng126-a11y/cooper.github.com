# Design

## Visual Direction

The miniapp uses a bright youth-community product style. The interface should feel energetic and approachable for activity discovery while staying precise enough for registration, check-in, and admin workflows.

## Color

- Base: clean lavender-tinted white and warm neutral surfaces, not heavy glass.
- Primary: coral orange for primary action and active wayfinding.
- Secondary: electric violet for depth, links, and selected states.
- Highlight: lemon yellow used sparingly for celebratory or featured moments.
- Semantic colors: green for open/active, amber for upcoming or warnings, red for full/error, blue for information.

Suggested token intent:

```css
--bg-page: #fff7ed;
--bg-gradient: linear-gradient(160deg, #fff7ed 0%, #fff1f2 42%, #eef2ff 100%);
--accent: #ff5a3d;
--accent-2: #7c3aed;
--accent-3: #facc15;
--text-primary: #251a34;
--text-secondary: rgba(37, 26, 52, 0.68);
```

## Typography

Use the system Chinese sans stack already present in the miniapp. Keep product UI labels practical: medium weight for labels, semibold for card titles and section titles, bold reserved for primary activity names and important numbers.

## Layout

- Activity cards should feel more editorial and tactile: strong image area, clear title hierarchy, compact meta rows, and a lively but readable progress section.
- Cards and panels use varied radii: smaller for inputs and chips, larger for activity cards and bottom sheets.
- Use spacing to separate groups before adding borders. Avoid nested card stacks unless the content is truly separate.

## Components

- Buttons: primary buttons use solid coral-to-violet gradient with controlled shadow; secondary buttons use tinted fills and clear borders.
- Chips: selected chips use a filled active state and slight lift. Unselected chips stay light and quiet.
- TabBar: keep the current two-tab structure but make the active state more expressive with a moving warm indicator and restrained glow.
- Forms: maintain visible labels, helper/error text below fields, and clear selected states for radio/checkbox groups.
- Badges: status badges use text plus color, with high contrast and no reliance on color alone.

## Motion

Use WXSS motion tokens:

```css
--motion-fast: 120ms;
--motion-base: 200ms;
--motion-medium: 280ms;
--motion-slow: 400ms;
--ease-out: cubic-bezier(0.22, 1, 0.36, 1);
--ease-pop: cubic-bezier(0.2, 0, 0, 1);
```

Motion should communicate state and spatial relationship. Good places for expressive feedback: TabBar selection, category chip selection, activity card press, modal entrance, FAB press, poster style selection, and progress fill. Avoid entrance choreography on admin-heavy views.

## Reduced Motion

When `prefers-reduced-motion: reduce` is active, disable translation, scale, pulse, shimmer, and long-running glow animations. Preserve color and opacity transitions where useful.

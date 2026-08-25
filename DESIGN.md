# Alianza Contigo Design System

## Direction

An institutional learning product built around deep navy, restrained gold, white surfaces, generous spacing, and familiar LMS patterns. Public pages may use larger Poppins headings; product UI uses compact Inter-led hierarchy.

## Color

- Navy: `#071C3A`; institutional navy: `#0E315C`.
- Gold: `#C89432`; light gold: `#D9AE55`, reserved for primary actions, progress, badges, and meaningful highlights.
- Background: `#F7F8FA`; surface: `#FFFFFF`; secondary text: `#667085`.
- Semantic success, warning, and destructive states must include an icon or text label, not color alone.

## Typography

- Inter for body, controls, labels, and data.
- Poppins for public-page and major page headings.
- Headings use balanced wrapping and no tighter than `-0.04em` letter spacing.

## Shape and Elevation

- Controls: 8–10px radius; cards and panels: 12–16px.
- Prefer either a quiet border or a compact shadow. Avoid combining borders with large diffuse shadows.
- Pills are reserved for badges, statuses, and segmented filters.

## Layout

- Public content max width: 1280px.
- Authenticated areas use a persistent desktop sidebar and a mobile drawer.
- Tables scroll horizontally on small screens; primary workflows become stacked sections.

## Interaction

- State transitions use 150–250ms easing and respect `prefers-reduced-motion`.
- Every control includes hover, focus-visible, disabled, and loading feedback.
- Skeletons represent loading; empty states explain the next useful action.

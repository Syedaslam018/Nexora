# NEXORA — Design System

NEXORA is a considered collection of everyday objects across fashion, tech,
home, and wellness. The visual direction is a warm studio utility system:
editorial scale, paper-grid structure, viewfinder details, and a palette that
feels tactile rather than synthetic. This is the reference for the storefront,
account, checkout, and admin UI.

## Palette

| Token          | Hex       | Role                                                         |
| -------------- | --------- | ------------------------------------------------------------ |
| `paper`        | `#F7F1E8` | Light-mode background — warm paper                           |
| `ink`          | `#241914` | Dark surfaces, headings, and primary text                    |
| `burnt-orange` | `#DF5B36` | Primary accent — CTAs, links, active states                  |
| `olive`        | `#99A63C` | Secondary accent — success/in-stock signals and chart series |
| `signal-amber` | `#E9A332` | Urgency accent — sales and low-stock warnings                |
| `clay`         | `#7B7063` | Muted text, borders, and secondary UI                        |

The palette is intentionally warm and high-contrast. It avoids cool accents and
keeps orange, olive, and amber roles distinct so the storefront stays legible.

## Typography

- **Display — Space Grotesk**: headings, hero copy. Geometric and slightly
  technical without being a monospace gimmick.
- **Body — Inter**: everything else. Neutral, highly legible at small sizes
  for dense product listings and spec tables.
- **Utility/data — JetBrains Mono**: SKUs, prices, stock counts, spec-sheet
  values, order numbers. This is the signature typographic move — treating
  numbers and identifiers the way an actual spec sheet or invoice would,
  rather than setting them in the body face like everything else.

## Signature element

Product cards and the product-detail gallery use thin **corner-bracket
frames** (viewfinder-style `⌐ ⌐` corners at each image corner, 1px,
`slate/40%`) instead of a full border or drop shadow — a nod to camera
UIs and lab equipment, appropriate for a gadget storefront. On hover, a
single thin scan-line sweeps once across the image. Used only on product
imagery, nowhere else, so it stays a signature rather than a decoration
repeated until it's noise.

## Layout notes

- Base radius: `0.6rem` — crisp and precise, with rounded pills reserved for
  compact status and utility controls.
- Prices are always set in JetBrains Mono, right-aligned in tables/cards,
  tabular-nums, so columns of prices actually line up like a real price list.
- Dark mode is a first-class target. Ink becomes the dark background and paper
  becomes the primary text surface.

## Motion and interaction

- The landing page owns the signature motion: staggered entrance, orbit rings,
  a slow editorial marquee, and a single image scan line.
- All motion is CSS-driven and respects `prefers-reduced-motion`.
- Focus rings, selection, scrollbars, loading states, and empty states use the
  same palette as the visible UI rather than browser defaults.

## Where this lives in code

- Color tokens as HSL CSS variables: `frontend/src/styles/globals.css`
- Tailwind mapping: `frontend/tailwind.config.ts`
- Fonts loaded in `frontend/index.html`

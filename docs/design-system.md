# NEXORA — Design System

NEXORA sells electronics: laptops, phones, gaming gear, home-office kit.
The design direction leans into that world's own vernacular — spec sheets,
SKUs, part numbers, schematic diagrams — rather than a generic storefront
look. This is the reference every later phase's UI work follows.

## Palette

| Token | Hex | Role |
|---|---|---|
| `paper` | `#F7F8FB` | Light-mode background — cool white, not warm cream |
| `ink` | `#0B1120` | Dark-mode background / light-mode text — deep blue-black, not pure black |
| `signal-blue` | `#3B6EF6` | Primary accent — CTAs, links, active states |
| `circuit-cyan` | `#22D3C7` | Secondary accent — charts, in-stock/success signals |
| `signal-amber` | `#F5A524` | Urgency accent — flash sales, low-stock warnings |
| `slate` | `#64748B` | Muted text, borders, secondary UI |

Deliberately not the common AI-default palettes: no warm-cream-plus-terracotta,
no near-black-plus-single-neon-accent, no zero-radius broadsheet layout.

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

- Base radius: `0.375rem` — crisp and precise, not fully sharp (that reads
  as spreadsheet/broadsheet) and not soft-rounded (reads as generic SaaS).
- Prices are always set in JetBrains Mono, right-aligned in tables/cards,
  tabular-nums, so columns of prices actually line up like a real price list.
- Dark mode is a first-class target (not an afterthought toggle) given the
  electronics/gaming audience — `ink` becomes the dark background, `paper`
  becomes dark-mode text.

## Where this lives in code

- Color tokens as HSL CSS variables: `frontend/src/styles/globals.css`
- Tailwind mapping: `frontend/tailwind.config.ts`
- Fonts loaded in `frontend/index.html`

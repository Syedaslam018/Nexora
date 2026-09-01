# Performance decisions

Most performance work in this build happened incrementally, phase by
phase, rather than as a single bolt-on pass — pagination, debounced
search, and database indexes were built alongside the features that
needed them, not retrofitted here. This doc collects the reasoning in one
place and covers what Phase 14 specifically added: route-based code
splitting, image loading strategy, HTTP caching, and memoization.

## Route-based code splitting

Every leaf page (`frontend/src/routes/lazyPages.ts`) is loaded via
`React.lazy`, not imported eagerly in the router. Without this, visiting
the storefront homepage would download the admin dashboard's bundle too —
Recharts, the entire admin page set, all of it — before the page could
render anything. `RootLayout` and `AdminLayout` each wrap their `<Outlet>`
in a `<Suspense>` boundary (not one global boundary around the whole app),
so the header/sidebar stay mounted during a route transition and only the
content area shows the loading fallback.

`NotFoundPage` is deliberately the one page kept eager — it's used as the
router's `errorElement`, which renders outside `RootLayout`'s `Suspense`
boundary entirely (an error replaces the whole routed branch, layout
included), so a lazy version there would have no `Suspense` ancestor to
catch it.

## Image loading

Every image below the fold uses `loading="lazy"` — product grids, cart
items, wishlist thumbnails, review images, admin table thumbnails, the PDP
thumbnail strip and related-products rail. The one deliberate exception is
the main product-detail gallery image: it's the page's Largest Contentful
Paint element, and lazy-loading the single most important image on the
page it's most important for would be counterproductive.

Every image container already uses a fixed `aspect-square` (established
back in Phase 4's design system) — worth noting here because that's also
what prevents layout shift as images load in, without needing explicit
`width`/`height` attributes on each `<img>`.

## HTTP caching

Public, read-heavy, infrequently-changing endpoints send a `Cache-Control`
header (`backend/src/middleware/cacheControl.ts`): product listing (30s),
product detail (60s), category tree and brand list (300s — these change
only on an explicit admin action, not on every checkout). `stale-while-
revalidate` is set alongside `max-age` so a CDN or browser can serve a
just-expired cached response immediately while revalidating in the
background, rather than every request past the cache window paying the
full round trip.

This is deliberately **not** applied globally — cart, orders, account, and
every admin endpoint stay uncached (no header set), since those respond
with per-user or otherwise sensitive data that a shared cache must never
store.

## Client-side caching (React Query)

Already established per-domain in earlier phases, not new here:
default `staleTime` is 1 minute (`lib/queryClient.ts`); categories/brands
use a longer 5-minute `staleTime` (Phase 4) since they change even less
often than that default assumes.

## Avoiding N+1 queries

Every list endpoint that joins related data does so via either a single
Prisma `include` (which Prisma compiles to one query with a JOIN or a
single batched `WHERE IN`, never one query per row) or hand-written raw
SQL with explicit `JOIN`s (the product listing query from Phase 4, every
analytics query from Phase 10, the customer list's `FILTER`-based
aggregation from Phase 9). Nowhere in this codebase does a loop issue a
database query per iteration.

## Database indexes

Covered as each phase introduced the table that needed them — see
`backend/prisma/schema.prisma`'s `@@index`/`@@unique` declarations and
`database/schema.sql`'s hand-written composite indexes (category+price for
filtered listings, user+created-at for order history, a partial index on
non-cancelled/non-pending orders for analytics queries) — not repeated
here since the reasoning lives as comments right next to each index.

## Memoization

Applied where a component either renders many times in a list or performs
a non-trivial data transform on every render:

- `ProductCard` (`React.memo`) — rendered up to ~20 times per listing
  page; a filter/sort change re-renders the whole grid, and memoizing
  means a card whose own `product` prop didn't change skips re-rendering.
- `AdminAnalyticsPage`'s chart data transforms (`useMemo`) — each of the
  three chart-data arrays is now keyed to its own source query, so one
  query settling doesn't force every chart's data to be re-mapped.

Deliberately not applied everywhere — most components here are small,
cheap to re-render, and would gain nothing from memoization while adding
a dependency-array to get wrong. `React.memo`/`useMemo` were added where a
concrete, describable cost existed (list-of-20 re-renders, a `.map()` over
externally-fetched arrays), not by default.

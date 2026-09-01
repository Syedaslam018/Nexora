import type { Request, Response, NextFunction } from "express";

/**
 * Sets a `Cache-Control` header for public, read-only GET endpoints whose
 * data doesn't need to be fresh to the second — product listings,
 * category/brand trees, product detail. `stale-while-revalidate` lets a
 * CDN or the browser serve a slightly-stale cached response immediately
 * while it revalidates in the background, rather than every request
 * paying the full round-trip.
 *
 * Deliberately NOT applied to anything user-specific (cart, orders,
 * account) or admin data — those must never be cached by a shared cache,
 * and Express's per-request nature makes it easy to apply this only to
 * the routes that opt in rather than globally with exceptions.
 */
export function cacheControl(maxAgeSeconds: number, staleWhileRevalidateSeconds = maxAgeSeconds * 5) {
  return (_req: Request, res: Response, next: NextFunction) => {
    res.setHeader(
      "Cache-Control",
      `public, max-age=${maxAgeSeconds}, stale-while-revalidate=${staleWhileRevalidateSeconds}`,
    );
    next();
  };
}

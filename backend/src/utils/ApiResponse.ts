import type { Response } from "express";

/**
 * Every successful response goes through this so the envelope
 * `{ success, data, message }` never drifts between endpoints written by
 * different services/controllers.
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  message = "Request successful",
  statusCode = 200,
): void {
  res.status(statusCode).json({ success: true, data, message });
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export function sendPaginated<T>(
  res: Response,
  items: T[],
  meta: PaginationMeta,
  message = "Request successful",
): void {
  res.status(200).json({ success: true, data: { items, meta }, message });
}

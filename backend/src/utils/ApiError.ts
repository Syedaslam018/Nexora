/**
 * Every intentional failure in the app (validation, auth, not-found,
 * conflict, etc.) throws an ApiError. The global error handler in
 * `middleware/errorHandler.ts` knows how to translate these into the
 * standard `{ success: false, message, errors? }` response shape — routes
 * and services never format error responses themselves.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: Record<string, string[]>;

  constructor(
    statusCode: number,
    message: string,
    options?: { isOperational?: boolean; errors?: Record<string, string[]> },
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.isOperational = options?.isOperational ?? true;
    this.errors = options?.errors;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, errors?: Record<string, string[]>) {
    return new ApiError(400, message, { errors });
  }
  static unauthorized(message = "Unauthorized") {
    return new ApiError(401, message);
  }
  static forbidden(message = "Forbidden") {
    return new ApiError(403, message);
  }
  static notFound(message = "Resource not found") {
    return new ApiError(404, message);
  }
  static conflict(message: string) {
    return new ApiError(409, message);
  }
  static tooManyRequests(message = "Too many requests") {
    return new ApiError(429, message);
  }
  static internal(message = "Internal server error") {
    return new ApiError(500, message, { isOperational: false });
  }
}

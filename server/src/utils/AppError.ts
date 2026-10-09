/**
 * Typed HTTP error thrown by services.
 * Controllers and the error-handler middleware use the statusCode
 * to send the correct HTTP response.
 */
export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
    // Restore prototype chain (needed when extending built-ins in TS)
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

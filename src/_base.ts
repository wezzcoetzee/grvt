/** Base error class for all SDK errors. */
export class GrvtError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "GrvtError";
  }
}

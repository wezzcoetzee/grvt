/**
 * WebSocket-specific error classes.
 */

import { TransportError } from "../_base.ts";

/** Error thrown when a WebSocket request fails. */
export class WebSocketRequestError extends TransportError {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "WebSocketRequestError";
  }
}

/**
 * GRVT Event Target for WebSocket messages.
 *
 * Listens for WebSocket messages and dispatches them as typed events.
 */

import { CustomEvent_ } from "../_polyfills.ts";

/** GRVT WebSocket subscription response. */
export interface GrvtSubscriptionResponse {
  /** Request ID from the subscribe request. */
  request_id?: number;
  /** The stream that was subscribed to. */
  stream?: string;
  /** Feed identifiers. */
  feed?: string[];
  /** Method (subscribe/unsubscribe). */
  method?: string;
  /** Whether the request was successful. */
  is_full?: boolean;
}

/** GRVT WebSocket data message. */
export interface GrvtDataMessage {
  /** The stream name. */
  stream: string;
  /** The sequence ID. */
  sequence_id?: string;
  /** Feed data (varies by stream type). */
  feed: unknown;
}

/** GRVT WebSocket error message. */
export interface GrvtErrorMessage {
  /** Error code. */
  code: number;
  /** Error message. */
  message: string;
  /** Request ID that caused the error. */
  request_id?: number;
}

/** Map of GRVT WebSocket event types to their event objects. */
export interface GrvtEventMap {
  /** Subscription response event. */
  subscriptionResponse: CustomEvent<GrvtSubscriptionResponse>;
  /** Error event. */
  error: CustomEvent<GrvtErrorMessage>;
  /** Pong (keep-alive) response. */
  pong: CustomEvent<undefined>;
  /** Data message event - dynamic channel names. */
  // deno-lint-ignore no-explicit-any
  [key: string]: CustomEvent<any>;
}

/**
 * Check if the message is a subscription response.
 */
function isSubscriptionResponse(msg: unknown): msg is GrvtSubscriptionResponse {
  return (
    typeof msg === "object" &&
    msg !== null &&
    ("method" in msg || "stream" in msg) &&
    !("feed" in msg && typeof (msg as { feed: unknown }).feed !== "undefined" &&
      !Array.isArray((msg as { feed: unknown }).feed))
  );
}

/**
 * Check if the message is a data message.
 */
function isDataMessage(msg: unknown): msg is GrvtDataMessage {
  return (
    typeof msg === "object" &&
    msg !== null &&
    "stream" in msg &&
    "feed" in msg &&
    typeof (msg as { stream: unknown }).stream === "string"
  );
}

/**
 * Check if the message is an error message.
 */
function isErrorMessage(msg: unknown): msg is GrvtErrorMessage {
  return (
    typeof msg === "object" &&
    msg !== null &&
    "code" in msg &&
    "message" in msg &&
    typeof (msg as { code: unknown }).code === "number"
  );
}

/**
 * GRVT Event Target.
 *
 * Listens for WebSocket messages and dispatches them as typed events.
 * Allows subscription handlers to listen for specific stream types.
 */
export interface GrvtEventTarget {
  addEventListener<K extends keyof GrvtEventMap>(
    type: K,
    listener: ((event: GrvtEventMap[K]) => void) | EventListenerObject | null,
    options?: boolean | AddEventListenerOptions,
  ): void;
  removeEventListener<K extends keyof GrvtEventMap>(
    type: K,
    listener: ((event: GrvtEventMap[K]) => void) | EventListenerObject | null,
    options?: boolean | EventListenerOptions,
  ): void;
  dispatchEvent(event: GrvtEventMap[keyof GrvtEventMap]): boolean;
}

export class GrvtEventTarget extends EventTarget {
  /**
   * Creates a new GrvtEventTarget.
   *
   * @param socket - The WebSocket to listen for messages on.
   */
  constructor(socket: WebSocket) {
    super();
    socket.addEventListener("message", (event) => {
      try {
        const msg = JSON.parse(event.data as string);

        // Handle pong response
        if (msg === "pong" || (typeof msg === "object" && msg?.type === "pong")) {
          this.dispatchEvent(new CustomEvent_("pong", { detail: undefined }));
          return;
        }

        // Handle error messages
        if (isErrorMessage(msg)) {
          this.dispatchEvent(new CustomEvent_("error", { detail: msg }));
          return;
        }

        // Handle subscription responses
        if (isSubscriptionResponse(msg) && !isDataMessage(msg)) {
          this.dispatchEvent(new CustomEvent_("subscriptionResponse", { detail: msg }));
          return;
        }

        // Handle data messages
        if (isDataMessage(msg)) {
          // Strip v1. prefix for event dispatch to maintain API compatibility
          const eventName = msg.stream.replace(/^v1\./, "");
          this.dispatchEvent(new CustomEvent_(eventName, { detail: msg }));
          return;
        }
      } catch {
        // Ignore JSON parsing errors
      }
    });
  }
}

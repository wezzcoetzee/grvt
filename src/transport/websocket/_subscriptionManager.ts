/**
 * WebSocket Subscription Manager for GRVT.
 *
 * Manages WebSocket subscriptions, including automatic resubscription on reconnect.
 */

import type { ISubscription } from "../_base.ts";
import type { GrvtDataMessage, GrvtEventTarget } from "./_eventTarget.ts";
import { WebSocketRequestError } from "./_errors.ts";

/** Internal state for managing a subscription. */
interface SubscriptionState {
  /** The stream name. */
  stream: string;
  /** The feed string. */
  feed: string;
  /** Map of listeners to their unsubscribe functions. */
  // deno-lint-ignore no-explicit-any
  listeners: Map<(data: any) => void, () => Promise<void>>;
  /** Promise tracking the subscription request. */
  promise: Promise<unknown>;
  /** Whether the subscription request has completed. */
  promiseFinished: boolean;
  /** Controller to signal subscription failure. */
  failureController: AbortController;
}

/**
 * Manages WebSocket subscriptions to GRVT streams.
 * Handles subscription lifecycle, resubscription on reconnect, and cleanup.
 */
export class WebSocketSubscriptionManager {
  /** Enable automatic re-subscription after reconnection. */
  resubscribe: boolean;

  private _socket: WebSocket;
  private _events: GrvtEventTarget;
  private _subscriptions: Map<string, SubscriptionState> = new Map();
  private _requestId = 0;
  private _pendingRequests: Map<number, {
    resolve: (value: unknown) => void;
    reject: (reason: unknown) => void;
  }> = new Map();

  constructor(
    socket: WebSocket,
    events: GrvtEventTarget,
    resubscribe: boolean,
  ) {
    this._socket = socket;
    this._events = events;
    this.resubscribe = resubscribe;

    // Listen for subscription responses
    events.addEventListener("subscriptionResponse", (event) => {
      const response = event.detail;
      if (response.request_id !== undefined) {
        const pending = this._pendingRequests.get(response.request_id);
        if (pending) {
          pending.resolve(response);
          this._pendingRequests.delete(response.request_id);
        }
      }
    });

    // Listen for errors
    events.addEventListener("error", (event) => {
      const error = event.detail;
      if (error.request_id !== undefined) {
        const pending = this._pendingRequests.get(error.request_id);
        if (pending) {
          pending.reject(new WebSocketRequestError(error.message));
          this._pendingRequests.delete(error.request_id);
        }
      }
    });

    // Handle socket events
    socket.addEventListener("open", () => this._handleOpen());
    socket.addEventListener("close", () => this._handleClose());
    socket.addEventListener("error", () => this._handleClose());
  }

  /**
   * Subscribes to a GRVT stream.
   *
   * @param stream - The stream name to subscribe to.
   * @param feed - The feed parameters string.
   * @param listener - A function to call when data is received.
   *
   * @returns A promise that resolves with a subscription object.
   */
  async subscribe<T>(
    stream: string,
    feed: string,
    listener: (data: T) => void,
  ): Promise<ISubscription> {
    // Create a unique identifier for the subscription
    const id = `${stream}:${feed}`;

    // Initialize new subscription if it doesn't exist
    let subscription = this._subscriptions.get(id);
    if (!subscription) {
      // Send subscription request
      const promise = this._sendSubscribe(stream, feed)
        .finally(() => {
          const sub = this._subscriptions.get(id);
          if (sub) sub.promiseFinished = true;
        });

      // Cache subscription info
      subscription = {
        stream,
        feed,
        listeners: new Map(),
        promise,
        promiseFinished: false,
        failureController: new AbortController(),
      };
      this._subscriptions.set(id, subscription);
    }

    // Create listener wrapper that extracts the feed data from the CustomEvent
    const listenerWrapper = (event: Event): void => {
      const customEvent = event as CustomEvent<GrvtDataMessage>;
      listener(customEvent.detail.feed as T);
    };

    // Initialize new listener if it doesn't exist
    let unsubscribe = subscription.listeners.get(listener);
    if (!unsubscribe) {
      // Create unsubscribe function
      unsubscribe = async (): Promise<void> => {
        // Remove listener
        this._events.removeEventListener(stream, listenerWrapper as EventListener);
        const sub = this._subscriptions.get(id);
        sub?.listeners.delete(listener);

        // If no listeners remain, unsubscribe from the stream
        if (sub?.listeners.size === 0) {
          this._subscriptions.delete(id);

          // If socket is open, send unsubscribe request
          if (this._socket.readyState === WebSocket.OPEN) {
            await this._sendUnsubscribe(stream, feed);
          }
        }
      };

      // Add listener
      this._events.addEventListener(stream, listenerWrapper as EventListener);
      subscription.listeners.set(listener, unsubscribe);
    }

    // Wait for the initial subscription request to complete
    await subscription.promise;

    // Return subscription control object
    return {
      unsubscribe,
      failureSignal: subscription.failureController.signal,
    };
  }

  /**
   * Normalizes stream name by adding v1. prefix if not present.
   */
  private _normalizeStreamName(stream: string): string {
    return stream.startsWith("v1.") ? stream : `v1.${stream}`;
  }

  /**
   * Sends a subscribe request to the server.
   */
  private _sendSubscribe(stream: string, feed: string): Promise<unknown> {
    const requestId = ++this._requestId;
    const normalizedStream = this._normalizeStreamName(stream);

    return new Promise((resolve, reject) => {
      this._pendingRequests.set(requestId, { resolve, reject });

      const message = JSON.stringify({
        request_id: requestId,
        stream: normalizedStream,
        feed: [feed],
        method: "subscribe",
        is_full: true,
      });

      if (this._socket.readyState === WebSocket.OPEN) {
        this._socket.send(message);
      } else {
        // Wait for socket to open
        const handleOpen = (): void => {
          this._socket.removeEventListener("open", handleOpen);
          this._socket.send(message);
        };
        this._socket.addEventListener("open", handleOpen);
      }

      // Set a timeout for the subscription request
      setTimeout(() => {
        if (this._pendingRequests.has(requestId)) {
          this._pendingRequests.delete(requestId);
          reject(new WebSocketRequestError("Subscription request timed out"));
        }
      }, 10_000);
    });
  }

  /**
   * Sends an unsubscribe request to the server.
   */
  private async _sendUnsubscribe(stream: string, feed: string): Promise<void> {
    const requestId = ++this._requestId;
    const normalizedStream = this._normalizeStreamName(stream);

    const message = JSON.stringify({
      request_id: requestId,
      stream: normalizedStream,
      feed: [feed],
      method: "unsubscribe",
    });

    this._socket.send(message);

    // We don't wait for unsubscribe response, fire and forget
    await Promise.resolve();
  }

  /**
   * Resubscribe to all existing subscriptions when socket reconnects.
   */
  private _handleOpen(): void {
    if (this.resubscribe) {
      for (const [id, subscription] of this._subscriptions.entries()) {
        // Only reconnect previously connected subscriptions
        if (subscription.promiseFinished) {
          subscription.promise = this._sendSubscribe(subscription.stream, subscription.feed)
            .catch((error) => subscription.failureController.abort(error))
            .finally(() => {
              const sub = this._subscriptions.get(id);
              if (sub) sub.promiseFinished = true;
            });
          subscription.promiseFinished = false;
        }
      }
    }
  }

  /**
   * Cleanup subscriptions when socket closes.
   */
  private _handleClose(): void {
    if (!this.resubscribe) {
      // If resubscribe is disabled, cleanup all subscriptions
      for (const subscription of this._subscriptions.values()) {
        for (const unsubscribe of subscription.listeners.values()) {
          unsubscribe().catch(() => {
            // Ignore errors during cleanup
          });
        }
      }
      this._subscriptions.clear();
    }

    // Reject all pending requests
    for (const pending of this._pendingRequests.values()) {
      pending.reject(new WebSocketRequestError("WebSocket connection closed"));
    }
    this._pendingRequests.clear();
  }
}

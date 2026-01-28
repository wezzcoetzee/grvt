import { GrvtError } from "../_base.ts";
import type { GrvtEndpointType } from "../types/mod.ts";

/**
 * Transport interface for executing requests to GRVT servers.
 *
 * @see {@link https://docs.grvt.io | GRVT API Documentation}
 */
export interface IRequestTransport {
  /** The environment this transport is configured for. */
  isTestnet: boolean;

  /**
   * Sends a request to the GRVT API.
   *
   * @param endpointType - The type of endpoint to send the request to (edge, trade_data, market_data).
   * @param path - The API path to send the request to.
   * @param payload - The payload to send with the request.
   * @param options - Request options.
   *
   * @returns A promise that resolves with parsed JSON response body.
   */
  request<T>(
    endpointType: GrvtEndpointType,
    path: string,
    payload: unknown,
    options?: RequestOptions,
  ): Promise<T>;
}

/** Options for request execution. */
export interface RequestOptions {
  /** {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request. */
  signal?: AbortSignal;
  /** Whether this request requires authentication (cookie). */
  requiresAuth?: boolean;
}

/**
 * Transport interface for subscription-based requests.
 */
export interface ISubscriptionTransport {
  /**
   * Subscribes to a GRVT event stream.
   *
   * @param stream - The stream name to subscribe to.
   * @param feed - The feed parameters.
   * @param listener - A function to call when data is received.
   *
   * @returns A promise that resolves with a subscription object.
   */
  subscribe<T>(
    stream: string,
    feed: string,
    listener: (data: T) => void,
  ): Promise<ISubscription>;
}

/**
 * Subscription object returned from subscribe().
 */
export interface ISubscription {
  /** Unsubscribes from the subscription. */
  unsubscribe: () => Promise<void>;
  /** Signal that aborts when the subscription fails. */
  failureSignal: AbortSignal;
}

/** Thrown when an error occurs at the transport level (e.g., timeout, network error). */
export class TransportError extends GrvtError {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "TransportError";
  }
}

/** Thrown when the GRVT API returns an error response. */
export class ApiRequestError extends GrvtError {
  /** The error code from the API. */
  readonly code?: number;
  /** The HTTP status code. */
  readonly status?: number;
  /** The raw response from the API. */
  readonly response?: unknown;

  constructor(
    args?: { message?: string; code?: number; status?: number; response?: unknown },
    options?: ErrorOptions,
  ) {
    const message = args?.message ?? "An unknown error occurred while processing an API request.";
    super(message, options);
    this.name = "ApiRequestError";
    this.code = args?.code;
    this.status = args?.status;
    this.response = args?.response;
  }
}

/**
 * Check if response is a GRVT error response.
 * GRVT errors have `code`, `message`, and `status` fields.
 */
export function isGrvtErrorResponse(
  response: unknown,
): response is { code: number; message: string; status: number } {
  return (
    typeof response === "object" &&
    response !== null &&
    "code" in response &&
    "message" in response &&
    typeof (response as { code: unknown }).code === "number" &&
    typeof (response as { message: unknown }).message === "string"
  );
}

/** Assert that response is successful, throw ApiRequestError otherwise. */
export function assertSuccessResponse(response: unknown): void {
  if (isGrvtErrorResponse(response)) {
    throw new ApiRequestError({
      message: response.message,
      code: response.code,
      status: response.status,
      response,
    });
  }
}

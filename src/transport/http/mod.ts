/**
 * HTTP transport for executing requests to the GRVT API.
 *
 * Use {@link HttpTransport} for simple requests via HTTP POST.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@wezzcoetzee/grvt";
 * import { GrvtEnv } from "@wezzcoetzee/grvt/types";
 *
 * const transport = new HttpTransport({ env: GrvtEnv.TESTNET });
 * ```
 *
 * @module
 */

import { GrvtEndpointType, GrvtEnv } from "../../types/mod.ts";
import { getEndpointDomains, getEnvConfig, type GrvtEnvConfig } from "../../config/mod.ts";
import { type IRequestTransport, type RequestOptions, TransportError } from "../_base.ts";
import { AbortSignal_ } from "../_polyfills.ts";

/** Error thrown when an HTTP request fails. */
export class HttpRequestError extends TransportError {
  /** The HTTP response that caused the error. */
  response?: Response;
  /** The response body text. */
  body?: string;

  /**
   * Creates a new HTTP request error.
   *
   * @param args - The error arguments.
   * @param args.response - The HTTP response that caused the error.
   * @param args.body - The response body text.
   * @param options - The error options.
   */
  constructor(args?: { response?: Response; body?: string }, options?: ErrorOptions) {
    const { response, body } = args ?? {};

    let message: string;
    if (response) {
      message = `${response.status} ${response.statusText}`.trim();
      if (body) message += ` - ${body}`;
    } else {
      message = `Unknown HTTP request error: ${options?.cause}`;
    }

    super(message, options);
    this.name = "HttpRequestError";
    this.response = response;
    this.body = body;
  }
}

/** Cookie data for authenticated requests. */
export interface GrvtCookie {
  /** The gravity cookie value. */
  gravity: string;
  /** The expiration timestamp in milliseconds. */
  expires: number;
}

/** Configuration options for the HTTP transport layer. */
export interface HttpTransportOptions {
  /**
   * The GRVT environment to use.
   * @default GrvtEnv.PROD
   */
  env?: GrvtEnv;
  /**
   * Request timeout in ms. Set to `null` to disable.
   * @default 10_000
   */
  timeout?: number | null;
  /**
   * API key for authenticated requests.
   */
  apiKey?: string;
  /**
   * Custom endpoint URLs. Overrides the default URLs for the environment.
   */
  endpoints?: Partial<Record<GrvtEndpointType, string>>;
  /**
   * A custom {@link https://developer.mozilla.org/en-US/docs/Web/API/RequestInit | RequestInit} that is merged with fetch requests.
   */
  fetchOptions?: Omit<RequestInit, "body" | "method">;
  /**
   * Enable debug logging.
   * @default false
   */
  debug?: boolean;
}

/**
 * HTTP transport for GRVT API.
 *
 * @see https://docs.grvt.io
 */
export class HttpTransport implements IRequestTransport {
  /** The GRVT environment configuration. */
  readonly envConfig: GrvtEnvConfig;
  /** The GRVT environment. */
  readonly env: GrvtEnv;
  /** Indicates this transport uses testnet endpoint. */
  readonly isTestnet: boolean;
  /** Request timeout in ms. Set to `null` to disable. */
  timeout: number | null;
  /** API key for authenticated requests. */
  apiKey?: string;
  /** Custom endpoint URLs. */
  endpoints: Record<GrvtEndpointType, string>;
  /** A custom RequestInit that is merged with fetch requests. */
  fetchOptions: Omit<RequestInit, "body" | "method">;
  /** Enable debug logging. */
  debug: boolean;

  /** Current authentication cookie. */
  private _cookie: GrvtCookie | null = null;
  /** Cookie refresh buffer in milliseconds (refresh 5 seconds before expiry). */
  private readonly _cookieRefreshBuffer = 5000;

  /**
   * Creates a new HTTP transport instance.
   *
   * @param options - Configuration options for the HTTP transport layer.
   */
  constructor(options?: HttpTransportOptions) {
    this.env = options?.env ?? GrvtEnv.PROD;
    this.envConfig = getEnvConfig(this.env);
    this.isTestnet = this.env === GrvtEnv.TESTNET || this.env === GrvtEnv.DEV || this.env === GrvtEnv.STG;
    this.timeout = options?.timeout === undefined ? 10_000 : options.timeout;
    this.apiKey = options?.apiKey;
    this.fetchOptions = options?.fetchOptions ?? {};
    this.debug = options?.debug ?? false;

    // Set up endpoint URLs
    const defaultEndpoints = getEndpointDomains(this.env);
    this.endpoints = {
      [GrvtEndpointType.EDGE]: options?.endpoints?.[GrvtEndpointType.EDGE] ?? defaultEndpoints[GrvtEndpointType.EDGE],
      [GrvtEndpointType.TRADE_DATA]: options?.endpoints?.[GrvtEndpointType.TRADE_DATA] ??
        defaultEndpoints[GrvtEndpointType.TRADE_DATA],
      [GrvtEndpointType.MARKET_DATA]: options?.endpoints?.[GrvtEndpointType.MARKET_DATA] ??
        defaultEndpoints[GrvtEndpointType.MARKET_DATA],
    };
  }

  /**
   * Sends a request to the GRVT API via {@link https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API | fetch}.
   *
   * @param endpointType - The type of endpoint to send the request to.
   * @param path - The API path to send the request to.
   * @param payload - The payload to send with the request.
   * @param options - Request options.
   *
   * @returns A promise that resolves with parsed JSON response body.
   *
   * @throws {HttpRequestError} Thrown when the HTTP request fails.
   */
  async request<T>(
    endpointType: GrvtEndpointType,
    path: string,
    payload: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    try {
      // Refresh cookie if needed for authenticated requests
      if (options?.requiresAuth) {
        await this._refreshCookie();
      }

      // Construct the request
      const baseUrl = this.endpoints[endpointType];
      const url = new URL(path, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);

      const headers: Record<string, string> = {
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Content-Type": "application/json",
      };

      // Add cookie header for authenticated requests
      if (options?.requiresAuth && this._cookie) {
        headers["Cookie"] = `gravity=${this._cookie.gravity}`;
      }

      const init = this._mergeRequestInit(
        {
          body: JSON.stringify(payload),
          headers,
          keepalive: true,
          method: "POST",
          signal: this.timeout ? AbortSignal_.timeout(this.timeout) : undefined,
        },
        this.fetchOptions,
        { signal: options?.signal },
      );

      this._log(`Request: ${url.toString()}`, payload);

      // Send the request and wait for a response
      const response = await fetch(url, init);

      // Validate the response
      if (!response.ok || !response.headers.get("Content-Type")?.includes("application/json")) {
        const body = await response.text().catch(() => undefined);
        throw new HttpRequestError({ response, body });
      }

      // Parse the response body
      const body = await response.json();

      this._log(`Response: ${url.toString()}`, body);

      return body;
    } catch (error) {
      if (error instanceof TransportError) throw error;
      throw new HttpRequestError(undefined, { cause: error });
    }
  }

  /**
   * Checks if the cookie should be refreshed.
   */
  private _shouldRefreshCookie(): boolean {
    if (!this.apiKey) {
      throw new Error("Attempting to use authenticated API without API key set");
    }

    if (!this._cookie) {
      return true;
    }

    const timeUntilExpiry = this._cookie.expires - Date.now();
    return timeUntilExpiry <= this._cookieRefreshBuffer;
  }

  /**
   * Refreshes the authentication cookie if needed.
   */
  private async _refreshCookie(): Promise<void> {
    if (!this._shouldRefreshCookie()) {
      return;
    }

    this._log("Refreshing authentication cookie...");

    const cookie = await this._getCookie();
    if (cookie) {
      this._cookie = cookie;
      this._log("Cookie refreshed successfully", { expires: new Date(cookie.expires).toISOString() });
    } else {
      throw new HttpRequestError({ body: "Failed to obtain authentication cookie" });
    }
  }

  /**
   * Gets a new authentication cookie from the API.
   */
  private async _getCookie(): Promise<GrvtCookie | null> {
    if (!this.apiKey) {
      return null;
    }

    try {
      const url = new URL("auth/api_key/login", this.endpoints[GrvtEndpointType.EDGE]);

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: this.apiKey }),
      });

      if (!response.ok) {
        this._log("Failed to get cookie", { status: response.status });
        return null;
      }

      // Parse the Set-Cookie header
      const setCookieHeader = response.headers.get("Set-Cookie");
      if (!setCookieHeader) {
        this._log("No Set-Cookie header in response");
        return null;
      }

      // Extract gravity cookie value and expiry
      const gravityMatch = setCookieHeader.match(/gravity=([^;]+)/);
      const expiresMatch = setCookieHeader.match(/expires=([^;]+)/i);

      if (!gravityMatch) {
        this._log("No gravity cookie in Set-Cookie header");
        return null;
      }

      const gravity = gravityMatch[1];
      let expires: number;

      if (expiresMatch) {
        expires = new Date(expiresMatch[1]).getTime();
      } else {
        // Default to 24 hours if no expiry specified
        expires = Date.now() + 24 * 60 * 60 * 1000;
      }

      return { gravity, expires };
    } catch (error) {
      this._log("Error getting cookie", error);
      return null;
    }
  }

  /** Merges multiple `HeadersInit` into one {@link https://developer.mozilla.org/en-US/docs/Web/API/Headers/Headers | Headers}. */
  protected _mergeHeadersInit(...inits: HeadersInit[]): Headers {
    const merged = new Headers();
    for (const headers of inits) {
      const entries = Symbol.iterator in headers ? headers : Object.entries(headers);
      for (const [key, value] of entries) {
        merged.set(key, value);
      }
    }
    return merged;
  }

  /** Merges multiple {@link https://developer.mozilla.org/en-US/docs/Web/API/RequestInit | RequestInit} into one. */
  protected _mergeRequestInit(...inits: RequestInit[]): RequestInit {
    const merged: RequestInit = {};
    const headersList: HeadersInit[] = [];
    const signals: AbortSignal[] = [];

    for (const init of inits) {
      Object.assign(merged, init);
      if (init.headers) headersList.push(init.headers);
      if (init.signal) signals.push(init.signal);
    }
    if (headersList.length > 0) merged.headers = this._mergeHeadersInit(...headersList);
    if (signals.length > 0) merged.signal = signals.length > 1 ? AbortSignal_.any(signals) : signals[0];

    return merged;
  }

  /** Log debug message if debug mode is enabled. */
  private _log(message: string, data?: unknown): void {
    if (this.debug) {
      if (data !== undefined) {
        // deno-lint-ignore no-console
        console.log(`[GRVT] ${message}`, data);
      } else {
        // deno-lint-ignore no-console
        console.log(`[GRVT] ${message}`);
      }
    }
  }
}

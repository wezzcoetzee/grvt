/**
 * WebSocket transport for GRVT real-time data streams.
 *
 * Use {@link WebSocketTransport} for real-time subscriptions to market data and trade data streams.
 *
 * @example Market Data Subscription
 * ```ts ignore
 * import { WebSocketTransport, GrvtEnv } from "@wezzcoetzee/grvt";
 *
 * const transport = new WebSocketTransport({
 *   env: GrvtEnv.TESTNET,
 * });
 *
 * await transport.ready();
 *
 * // Subscribe to ticker updates
 * const subscription = await transport.subscribe(
 *   "ticker.s",
 *   "BTC_USDT_Perp@500",
 *   (data) => {
 *     console.log("Ticker update:", data);
 *   }
 * );
 *
 * // Later, unsubscribe
 * await subscription.unsubscribe();
 *
 * // Close the transport
 * await transport.close();
 * ```
 *
 * @module
 */

import { GrvtEndpointType, GrvtEnv } from "../../types/mod.ts";
import { getEnvConfig } from "../../config/mod.ts";
import type { ISubscription, ISubscriptionTransport } from "../_base.ts";
import { GrvtEventTarget } from "./_eventTarget.ts";
import { WebSocketSubscriptionManager } from "./_subscriptionManager.ts";
import { WebSocketRequestError } from "./_errors.ts";

export { WebSocketRequestError };
export type { GrvtDataMessage, GrvtErrorMessage, GrvtSubscriptionResponse } from "./_eventTarget.ts";

/** Configuration options for the WebSocket transport. */
export interface WebSocketTransportOptions {
  /**
   * The GRVT environment to connect to.
   * @default GrvtEnv.TESTNET
   */
  env?: GrvtEnv;
  /**
   * The endpoint type to connect to (MARKET_DATA or TRADE_DATA).
   * @default GrvtEndpointType.MARKET_DATA
   */
  endpointType?: GrvtEndpointType;
  /**
   * Custom WebSocket endpoint URL. Overrides env-based URL.
   */
  url?: string | URL;
  /**
   * API key for authentication (required for TRADE_DATA endpoint).
   */
  apiKey?: string;
  /**
   * Session cookie for authentication (if already authenticated).
   */
  cookie?: string;
  /**
   * Timeout for subscription requests in ms.
   * @default 10_000
   */
  timeout?: number;
  /**
   * Enable automatic re-subscription after reconnection.
   * @default true
   */
  resubscribe?: boolean;
  /**
   * Enable debug logging.
   * @default false
   */
  debug?: boolean;
}

/** GRVT stream types for subscription. */
export type GrvtStreamType =
  // Market Data Streams
  | "mini.s" // Mini ticker snapshot
  | "mini.d" // Mini ticker delta
  | "ticker.s" // Full ticker snapshot
  | "ticker.d" // Full ticker delta
  | "book.s" // Orderbook snapshot
  | "book.d" // Orderbook delta
  | "trade" // Recent trades
  | "candle" // Candlestick data
  // Trade Data Streams (authenticated)
  | "order" // Order updates
  | "state" // Account state updates
  | "position" // Position updates
  | "fill" // Fill updates
  | "transfer" // Transfer updates
  | "deposit" // Deposit updates
  | "withdrawal"; // Withdrawal updates

/** Map of stream types to their endpoint types. */
export const STREAM_ENDPOINT_MAP: Record<GrvtStreamType, GrvtEndpointType> = {
  "mini.s": GrvtEndpointType.MARKET_DATA,
  "mini.d": GrvtEndpointType.MARKET_DATA,
  "ticker.s": GrvtEndpointType.MARKET_DATA,
  "ticker.d": GrvtEndpointType.MARKET_DATA,
  "book.s": GrvtEndpointType.MARKET_DATA,
  "book.d": GrvtEndpointType.MARKET_DATA,
  "trade": GrvtEndpointType.MARKET_DATA,
  "candle": GrvtEndpointType.MARKET_DATA,
  "order": GrvtEndpointType.TRADE_DATA,
  "state": GrvtEndpointType.TRADE_DATA,
  "position": GrvtEndpointType.TRADE_DATA,
  "fill": GrvtEndpointType.TRADE_DATA,
  "transfer": GrvtEndpointType.TRADE_DATA,
  "deposit": GrvtEndpointType.TRADE_DATA,
  "withdrawal": GrvtEndpointType.TRADE_DATA,
};

/**
 * WebSocket transport for GRVT real-time data streams.
 *
 * Provides subscription-based access to market data and trade data streams.
 */
export class WebSocketTransport implements ISubscriptionTransport {
  /** The GRVT environment. */
  readonly env: GrvtEnv;
  /** The endpoint type. */
  readonly endpointType: GrvtEndpointType;
  /** Whether this is a testnet connection. */
  readonly isTestnet: boolean;
  /** The underlying WebSocket. */
  readonly socket: WebSocket;
  /** Timeout for subscription requests. */
  timeout: number;

  /** Enable automatic re-subscription after reconnection. */
  get resubscribe(): boolean {
    return this._subscriptionManager.resubscribe;
  }
  set resubscribe(value: boolean) {
    this._subscriptionManager.resubscribe = value;
  }

  private _events: GrvtEventTarget;
  private _subscriptionManager: WebSocketSubscriptionManager;
  private _keepAliveInterval: ReturnType<typeof setInterval> | undefined;
  private _debug: boolean;
  private _cookie?: string;

  /**
   * Creates a new WebSocket transport instance.
   *
   * @param options - Configuration options.
   */
  constructor(options?: WebSocketTransportOptions) {
    this.env = options?.env ?? GrvtEnv.TESTNET;
    this.endpointType = options?.endpointType ?? GrvtEndpointType.MARKET_DATA;
    this.isTestnet = this.env !== GrvtEnv.PROD;
    this.timeout = options?.timeout ?? 10_000;
    this._debug = options?.debug ?? false;
    this._cookie = options?.cookie;

    // Get the WebSocket URL
    const envConfig = getEnvConfig(this.env);
    let wsUrl: string;
    if (options?.url) {
      wsUrl = options.url.toString();
    } else if (this.endpointType === GrvtEndpointType.MARKET_DATA) {
      // Use WS endpoint if available, otherwise convert RPC endpoint
      wsUrl = envConfig.marketData.wsEndpoint ??
        envConfig.marketData.rpcEndpoint.replace("https://", "wss://").replace("/v1", "/ws/v1");
    } else {
      wsUrl = envConfig.tradeData.wsEndpoint ??
        envConfig.tradeData.rpcEndpoint.replace("https://", "wss://").replace("/v1", "/ws/v1");
    }

    this._log(`Connecting to ${wsUrl}`);

    // Create WebSocket with authentication headers if needed
    this.socket = new WebSocket(wsUrl);

    // Set up event handling
    this._events = new GrvtEventTarget(this.socket);
    this._subscriptionManager = new WebSocketSubscriptionManager(
      this.socket,
      this._events,
      options?.resubscribe ?? true,
    );

    // Initialize keep-alive
    this._initKeepAlive();
  }

  // ============================================================
  // Public Methods
  // ============================================================

  /**
   * Subscribes to a GRVT stream.
   *
   * Stream names are automatically prefixed with `v1.` when sent to the server.
   * You should use unprefixed names like `"ticker.s"` rather than `"v1.ticker.s"`.
   *
   * @param stream - The stream name to subscribe to (e.g., "ticker.s", "book.s").
   * @param feed - The feed parameters string.
   * @param listener - A function to call when data is received.
   *
   * @returns A promise that resolves with a subscription object.
   *
   * @example Subscribe to ticker
   * ```ts ignore
   * const subscription = await transport.subscribe(
   *   "ticker.s",
   *   "BTC_USDT_Perp@500",
   *   (data) => console.log(data)
   * );
   * ```
   *
   * @example Subscribe to orderbook
   * ```ts ignore
   * const subscription = await transport.subscribe(
   *   "book.s",
   *   "BTC_USDT_Perp@500-10",  // instrument@rate-depth
   *   (data) => console.log(data)
   * );
   * ```
   */
  subscribe<T>(
    stream: string,
    feed: string,
    listener: (data: T) => void,
  ): Promise<ISubscription> {
    this._log(`Subscribing to ${stream} with feed ${feed}`);
    return this._subscriptionManager.subscribe(stream, feed, listener);
  }

  /**
   * Waits until the WebSocket connection is ready.
   *
   * @param signal - AbortSignal to cancel the promise.
   *
   * @returns A promise that resolves when the connection is ready.
   */
  ready(signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if already aborted
      if (signal?.aborted) {
        return reject(
          new WebSocketRequestError("Aborted while waiting for connection", { cause: signal.reason }),
        );
      }

      // Check if already open
      if (this.socket.readyState === WebSocket.OPEN) {
        this._log("WebSocket already open");
        return resolve();
      }

      // Set up event listeners
      const handleOpen = (): void => {
        this._log("WebSocket connected");
        signal?.removeEventListener("abort", handleAbort);
        this.socket.removeEventListener("error", handleError);
        resolve();
      };

      const handleError = (event: Event): void => {
        signal?.removeEventListener("abort", handleAbort);
        this.socket.removeEventListener("open", handleOpen);
        reject(new WebSocketRequestError("Failed to establish WebSocket connection", { cause: event }));
      };

      const handleAbort = (): void => {
        this.socket.removeEventListener("open", handleOpen);
        this.socket.removeEventListener("error", handleError);
        reject(new WebSocketRequestError("Aborted while waiting for connection", { cause: signal?.reason }));
      };

      this.socket.addEventListener("open", handleOpen, { once: true });
      this.socket.addEventListener("error", handleError, { once: true });
      signal?.addEventListener("abort", handleAbort, { once: true });
    });
  }

  /**
   * Closes the WebSocket connection.
   *
   * @param signal - AbortSignal to cancel the promise.
   *
   * @returns A promise that resolves when the connection is closed.
   */
  close(signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if already aborted
      if (signal?.aborted) {
        return reject(
          new WebSocketRequestError("Aborted while closing connection", { cause: signal.reason }),
        );
      }

      // Check if already closed
      if (this.socket.readyState === WebSocket.CLOSED) {
        this._log("WebSocket already closed");
        return resolve();
      }

      // Set up event listeners
      const handleClose = (): void => {
        this._log("WebSocket closed");
        signal?.removeEventListener("abort", handleAbort);
        resolve();
      };

      const handleAbort = (): void => {
        this.socket.removeEventListener("close", handleClose);
        reject(new WebSocketRequestError("Aborted while closing connection", { cause: signal?.reason }));
      };

      this.socket.addEventListener("close", handleClose, { once: true });
      signal?.addEventListener("abort", handleAbort, { once: true });

      // Stop keep-alive
      this._stopKeepAlive();

      // Initiate close
      this.socket.close();
    });
  }

  // ============================================================
  // Keep-Alive Logic
  // ============================================================

  private _initKeepAlive(): void {
    const start = (): void => {
      if (this._keepAliveInterval) return;
      this._keepAliveInterval = setInterval(() => {
        if (this.socket.readyState === WebSocket.OPEN) {
          this.socket.send(JSON.stringify({ method: "ping" }));
        }
      }, 30_000);
    };

    const stop = (): void => {
      this._stopKeepAlive();
    };

    this.socket.addEventListener("open", start);
    this.socket.addEventListener("close", stop);
    this.socket.addEventListener("error", stop);
  }

  private _stopKeepAlive(): void {
    if (this._keepAliveInterval) {
      clearInterval(this._keepAliveInterval);
      this._keepAliveInterval = undefined;
    }
  }

  // ============================================================
  // Logging
  // ============================================================

  private _log(message: string): void {
    if (this._debug) {
      // deno-lint-ignore no-console
      console.log(`[GrvtWS] ${message}`);
    }
  }
}

// ============================================================
// Helper Functions for Feed Construction
// ============================================================

/**
 * Construct a feed string for ticker/mini streams.
 *
 * @param instrument - The instrument symbol (e.g., "BTC_USDT_Perp").
 * @param rate - Update rate in ms (e.g., "500").
 *
 * @returns The feed string (e.g., "BTC_USDT_Perp@500").
 */
export function buildTickerFeed(instrument: string, rate = "500"): string {
  return `${instrument}@${rate}`;
}

/**
 * Construct a feed string for orderbook snapshot streams.
 *
 * @param instrument - The instrument symbol.
 * @param rate - Update rate in ms.
 * @param depth - Orderbook depth (e.g., "10").
 *
 * @returns The feed string (e.g., "BTC_USDT_Perp@500-10").
 */
export function buildOrderbookFeed(instrument: string, rate = "500", depth = "10"): string {
  return `${instrument}@${rate}-${depth}`;
}

/**
 * Construct a feed string for trade streams.
 *
 * @param instrument - The instrument symbol.
 * @param limit - Maximum number of trades (e.g., "50").
 *
 * @returns The feed string (e.g., "BTC_USDT_Perp@50").
 */
export function buildTradeFeed(instrument: string, limit = "50"): string {
  return `${instrument}@${limit}`;
}

/**
 * Construct a feed string for candlestick streams.
 *
 * @param instrument - The instrument symbol.
 * @param interval - Candlestick interval (e.g., "CI_1_M").
 * @param type - Candlestick type (e.g., "TRADE").
 *
 * @returns The feed string (e.g., "BTC_USDT_Perp@CI_1_M-TRADE").
 */
export function buildCandleFeed(instrument: string, interval = "CI_1_M", type = "TRADE"): string {
  return `${instrument}@${interval}-${type}`;
}

/**
 * Construct a feed string for order/state/position/fill streams.
 *
 * @param subAccountId - The sub-account ID.
 * @param instrument - Optional instrument filter.
 *
 * @returns The feed string (e.g., "123456789" or "123456789-BTC_USDT_Perp").
 */
export function buildAccountFeed(subAccountId: string, instrument?: string): string {
  if (instrument) {
    return `${subAccountId}-${instrument}`;
  }
  return subAccountId;
}

/**
 * Construct a feed string for account streams with kind/base/quote filters.
 *
 * @param subAccountId - The sub-account ID.
 * @param kind - Instrument kind filter.
 * @param base - Base currency filter.
 * @param quote - Quote currency filter.
 *
 * @returns The feed string (e.g., "123456789-PERPETUAL-BTC-USDT").
 */
export function buildFilteredAccountFeed(
  subAccountId: string,
  kind?: string,
  base?: string,
  quote?: string,
): string {
  return `${subAccountId}-${kind ?? ""}-${base ?? ""}-${quote ?? ""}`;
}

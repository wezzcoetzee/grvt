/**
 * Transport layer for executing requests to GRVT servers.
 *
 * Use {@link HttpTransport} for HTTP POST requests.
 * Use {@link WebSocketTransport} for real-time subscriptions.
 *
 * @example HTTP Transport
 * ```ts
 * import { HttpTransport } from "@wezzcoetzee/grvt";
 * import { GrvtEnv } from "@wezzcoetzee/grvt/types";
 *
 * const transport = new HttpTransport({ env: GrvtEnv.TESTNET });
 * ```
 *
 * @example WebSocket Transport
 * ```ts
 * import { WebSocketTransport } from "@wezzcoetzee/grvt";
 * import { GrvtEnv } from "@wezzcoetzee/grvt/types";
 *
 * const ws = new WebSocketTransport({ env: GrvtEnv.TESTNET });
 * await ws.ready();
 * const subscription = await ws.subscribe("ticker.s", "BTC_USDT_Perp@500", console.log);
 * ```
 *
 * @module
 */

export * from "./_base.ts";
export * from "./http/mod.ts";
export * from "./websocket/mod.ts";

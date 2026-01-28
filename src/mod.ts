/**
 * GRVT TypeScript SDK
 *
 * A Deno-first, NPM-compatible TypeScript SDK for the GRVT Exchange.
 *
 * @module
 *
 * @example Basic Usage
 * ```ts
 * import { HttpTransport, GrvtEnv } from "@wezzcoetzee/grvt";
 *
 * // Create transport for testnet
 * const transport = new HttpTransport({
 *   env: GrvtEnv.TESTNET,
 *   apiKey: "your-api-key",
 * });
 * ```
 */

// Re-export base error
export { GrvtError } from "./_base.ts";

// Re-export types
export {
  CandlestickInterval,
  CandlestickType,
  Currency,
  GrvtEndpointType,
  GrvtEnv,
  InstrumentSettlementPeriod,
  Kind,
  MarginType,
  OrderRejectReason,
  OrderStatus,
  SubAccountTradeInterval,
  TimeInForce,
  Venue,
} from "./types/mod.ts";

// Re-export config
export {
  CHAIN_IDS,
  EDGE_ENDPOINTS,
  ENDPOINT_VERSION,
  type EndpointName,
  getAllEndpoints,
  getEndpoint,
  getEndpointDomains,
  getEnvConfig,
  getWsEndpoint,
  GRVT_ENDPOINTS,
  type GrvtEndpointConfig,
  type GrvtEnvConfig,
  MARKET_DATA_ENDPOINTS,
  TRADE_DATA_ENDPOINTS,
  WS_STREAMS,
} from "./config/mod.ts";

// Re-export transport
export {
  ApiRequestError,
  assertSuccessResponse,
  buildAccountFeed,
  buildCandleFeed,
  buildFilteredAccountFeed,
  buildOrderbookFeed,
  buildTickerFeed,
  buildTradeFeed,
  type GrvtCookie,
  type GrvtDataMessage,
  type GrvtErrorMessage,
  type GrvtStreamType,
  type GrvtSubscriptionResponse,
  HttpRequestError,
  HttpTransport,
  type HttpTransportOptions,
  type IRequestTransport,
  isGrvtErrorResponse,
  type ISubscription,
  type ISubscriptionTransport,
  type RequestOptions,
  STREAM_ENDPOINT_MAP,
  TransportError,
  WebSocketRequestError,
  WebSocketTransport,
  type WebSocketTransportOptions,
} from "./transport/mod.ts";

// Re-export signing
export {
  type AbstractEthersV5Signer,
  type AbstractEthersV6Signer,
  type AbstractViemLocalAccount,
  type AbstractWallet,
  AbstractWalletError,
  buildCreateOrderPayload,
  DEFAULT_SIZE_MULTIPLIER,
  EIP712_ORDER_TYPES,
  generateClientOrderId,
  generateExpiration,
  generateNonce,
  getEIP712Domain,
  getWalletAddress,
  type InstrumentInfo,
  type OrderLeg,
  type OrderParams,
  PRICE_MULTIPLIER,
  PrivateKeySigner,
  type Signature,
  type SignedOrder,
  signOrder,
  signTypedData,
  type SignTypedDataParams,
  TIME_IN_FORCE_VALUES,
} from "./signing/mod.ts";

// Re-export raw client
export { GrvtRawClient, type GrvtRawClientOptions } from "./raw/mod.ts";

// Re-export CCXT-style client
export {
  type CancelOrderParams,
  CCXT_INTERVAL_MAP,
  type CCXTInterval,
  type CreateOrderParams,
  type FetchAccountHistoryParams,
  type FetchFundingRateHistoryParams,
  type FetchMarketsParams,
  type FetchMyTradesParams,
  type FetchOHLCVParams,
  type FetchOpenOrdersParams,
  type FetchOrderHistoryParams,
  type FetchPositionsParams,
  type FetchTradesParams,
  GrvtClient,
  type GrvtClientOptions,
  GrvtInvalidOrder,
  type GrvtOrderSide,
  type GrvtOrderType,
  msToNs,
  nowNs,
  nsToMs,
  type Num,
  parseSymbol,
} from "./ccxt/mod.ts";

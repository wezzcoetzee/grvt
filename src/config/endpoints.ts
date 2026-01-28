/**
 * GRVT API Endpoint Definitions
 *
 * Defines all API endpoint paths grouped by endpoint type.
 */

import { GrvtEndpointType, type GrvtEnv } from "../types/mod.ts";
import { getEndpointDomains } from "./environment.ts";

/**
 * API version for endpoint paths
 */
export const ENDPOINT_VERSION = "v1";

/**
 * Edge endpoint paths
 */
export const EDGE_ENDPOINTS = {
  GRAPHQL: "query",
  AUTH: "auth/api_key/login",
} as const;

/**
 * Trade data endpoint paths
 */
export const TRADE_DATA_ENDPOINTS: {
  readonly CREATE_ORDER: string;
  readonly CANCEL_ALL_ORDERS: string;
  readonly CANCEL_ORDER: string;
  readonly GET_OPEN_ORDERS: string;
  readonly GET_ACCOUNT_SUMMARY: string;
  readonly GET_FUNDING_ACCOUNT_SUMMARY: string;
  readonly GET_AGGREGATED_ACCOUNT_SUMMARY: string;
  readonly GET_ACCOUNT_HISTORY: string;
  readonly GET_POSITIONS: string;
  readonly GET_ORDER: string;
  readonly GET_ORDER_HISTORY: string;
  readonly GET_FILL_HISTORY: string;
} = {
  CREATE_ORDER: `full/${ENDPOINT_VERSION}/create_order`,
  CANCEL_ALL_ORDERS: `full/${ENDPOINT_VERSION}/cancel_all_orders`,
  CANCEL_ORDER: `full/${ENDPOINT_VERSION}/cancel_order`,
  GET_OPEN_ORDERS: `full/${ENDPOINT_VERSION}/open_orders`,
  GET_ACCOUNT_SUMMARY: `full/${ENDPOINT_VERSION}/account_summary`,
  GET_FUNDING_ACCOUNT_SUMMARY: `full/${ENDPOINT_VERSION}/funding_account_summary`,
  GET_AGGREGATED_ACCOUNT_SUMMARY: `full/${ENDPOINT_VERSION}/aggregated_account_summary`,
  GET_ACCOUNT_HISTORY: `full/${ENDPOINT_VERSION}/account_history`,
  GET_POSITIONS: `full/${ENDPOINT_VERSION}/positions`,
  GET_ORDER: `full/${ENDPOINT_VERSION}/order`,
  GET_ORDER_HISTORY: `full/${ENDPOINT_VERSION}/order_history`,
  GET_FILL_HISTORY: `full/${ENDPOINT_VERSION}/fill_history`,
} as const;

/**
 * Market data endpoint paths
 */
export const MARKET_DATA_ENDPOINTS: {
  readonly GET_ALL_INSTRUMENTS: string;
  readonly GET_INSTRUMENTS: string;
  readonly GET_INSTRUMENT: string;
  readonly GET_TICKER: string;
  readonly GET_MINI_TICKER: string;
  readonly GET_ORDER_BOOK: string;
  readonly GET_TRADES: string;
  readonly GET_TRADE_HISTORY: string;
  readonly GET_FUNDING: string;
  readonly GET_CANDLESTICK: string;
} = {
  GET_ALL_INSTRUMENTS: `full/${ENDPOINT_VERSION}/all_instruments`,
  GET_INSTRUMENTS: `full/${ENDPOINT_VERSION}/instruments`,
  GET_INSTRUMENT: `full/${ENDPOINT_VERSION}/instrument`,
  GET_TICKER: `full/${ENDPOINT_VERSION}/ticker`,
  GET_MINI_TICKER: `full/${ENDPOINT_VERSION}/mini`,
  GET_ORDER_BOOK: `full/${ENDPOINT_VERSION}/book`,
  GET_TRADES: `full/${ENDPOINT_VERSION}/trade`,
  GET_TRADE_HISTORY: `full/${ENDPOINT_VERSION}/trade_history`,
  GET_FUNDING: `full/${ENDPOINT_VERSION}/funding`,
  GET_CANDLESTICK: `full/${ENDPOINT_VERSION}/kline`,
} as const;

/**
 * All endpoints grouped by endpoint type
 */
export const GRVT_ENDPOINTS: Record<GrvtEndpointType, Record<string, string>> = {
  [GrvtEndpointType.EDGE]: EDGE_ENDPOINTS,
  [GrvtEndpointType.TRADE_DATA]: TRADE_DATA_ENDPOINTS,
  [GrvtEndpointType.MARKET_DATA]: MARKET_DATA_ENDPOINTS,
};

/**
 * WebSocket stream to endpoint type mapping
 */
export const WS_STREAMS: Record<string, GrvtEndpointType> = {
  // Market Data streams
  "mini.s": GrvtEndpointType.MARKET_DATA,
  "mini.d": GrvtEndpointType.MARKET_DATA,
  "ticker.s": GrvtEndpointType.MARKET_DATA,
  "ticker.d": GrvtEndpointType.MARKET_DATA,
  "book.s": GrvtEndpointType.MARKET_DATA,
  "book.d": GrvtEndpointType.MARKET_DATA,
  "trade": GrvtEndpointType.MARKET_DATA,
  "candle": GrvtEndpointType.MARKET_DATA,
  // Trade Data streams
  "order": GrvtEndpointType.TRADE_DATA,
  "state": GrvtEndpointType.TRADE_DATA,
  "position": GrvtEndpointType.TRADE_DATA,
  "fill": GrvtEndpointType.TRADE_DATA,
  "transfer": GrvtEndpointType.TRADE_DATA,
  "deposit": GrvtEndpointType.TRADE_DATA,
  "withdrawal": GrvtEndpointType.TRADE_DATA,
};

/**
 * Endpoint name type (union of all endpoint names)
 */
export type EndpointName =
  | keyof typeof EDGE_ENDPOINTS
  | keyof typeof TRADE_DATA_ENDPOINTS
  | keyof typeof MARKET_DATA_ENDPOINTS;

/**
 * Get the full URL for a specific endpoint
 *
 * @param environment - The GRVT environment
 * @param endpointName - The name of the endpoint
 * @returns The full endpoint URL or null if not found
 *
 * @example
 * ```ts
 * import { getEndpoint, GrvtEnv } from "@wezzcoetzee/grvt";
 *
 * const url = getEndpoint(GrvtEnv.TESTNET, "GET_ALL_INSTRUMENTS");
 * // https://market-data.testnet.grvt.io/full/v1/all_instruments
 * ```
 */
export function getEndpoint(environment: GrvtEnv, endpointName: EndpointName): string | null {
  const domains = getEndpointDomains(environment);

  for (const [endpointType, endpoints] of Object.entries(GRVT_ENDPOINTS)) {
    if (endpointName in endpoints) {
      const path = endpoints[endpointName];
      return `${domains[endpointType as GrvtEndpointType]}/${path}`;
    }
  }

  return null;
}

/**
 * Get all endpoints for a given environment
 *
 * @param environment - The GRVT environment
 * @returns A map of endpoint names to their full URLs
 */
export function getAllEndpoints(environment: GrvtEnv): Record<string, string> {
  const domains = getEndpointDomains(environment);
  const endpoints: Record<string, string> = {};

  for (const [endpointType, endpointsMap] of Object.entries(GRVT_ENDPOINTS)) {
    for (const [name, path] of Object.entries(endpointsMap)) {
      endpoints[name] = `${domains[endpointType as GrvtEndpointType]}/${path}`;
    }
  }

  return endpoints;
}

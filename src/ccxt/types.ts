/**
 * CCXT-style types for the GRVT SDK.
 */

import type { CandlestickInterval, CandlestickType, Currency, Kind } from "../types/mod.ts";

/** Order type for CCXT-style API. */
export type GrvtOrderType = "limit" | "market";

/** Order side for CCXT-style API. */
export type GrvtOrderSide = "buy" | "sell";

/** Numeric type (number or string representation). */
export type Num = number | string;

/** Error thrown for invalid order parameters. */
export class GrvtInvalidOrder extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GrvtInvalidOrder";
  }
}

/** Parameters for fetching markets. */
export interface FetchMarketsParams {
  /** Filter by instrument kind. */
  kind?: Kind;
  /** Filter by base currency. */
  base?: Currency;
  /** Filter by quote currency. */
  quote?: Currency;
  /** Maximum number of markets to fetch. */
  limit?: number;
  /** Only fetch active markets. */
  isActive?: boolean;
}

/** Parameters for fetching open orders. */
export interface FetchOpenOrdersParams {
  /** Filter by instrument kind. */
  kind?: Kind;
  /** Filter by base currency. */
  base?: Currency;
  /** Filter by quote currency. */
  quote?: Currency;
}

/** Parameters for fetching order history. */
export interface FetchOrderHistoryParams {
  /** Filter by instrument kind. */
  kind?: Kind;
  /** Filter by base currency. */
  base?: Currency;
  /** Filter by quote currency. */
  quote?: Currency;
  /** Filter by expiration time in nanoseconds. */
  expiration?: string;
  /** Filter by strike price. */
  strikePrice?: string;
  /** Maximum number of orders to fetch. */
  limit?: number;
  /** Cursor for pagination. */
  cursor?: string;
}

/** Parameters for fetching positions. */
export interface FetchPositionsParams {
  /** Filter by instrument kind. */
  kind?: Kind;
  /** Filter by base currency. */
  base?: Currency;
  /** Filter by quote currency. */
  quote?: Currency;
}

/** Parameters for fetching my trades (fills). */
export interface FetchMyTradesParams {
  /** Filter by instrument kind. */
  kind?: Kind;
  /** Filter by base currency. */
  base?: Currency;
  /** Filter by quote currency. */
  quote?: Currency;
  /** End time in nanoseconds. */
  endTime?: string;
  /** Cursor for pagination. */
  cursor?: string;
}

/** Parameters for fetching public trades. */
export interface FetchTradesParams {
  /** End time in nanoseconds. */
  endTime?: string;
  /** Cursor for pagination. */
  cursor?: string;
}

/** Parameters for fetching account history. */
export interface FetchAccountHistoryParams {
  /** Start time in nanoseconds. */
  startTime?: string;
  /** End time in nanoseconds. */
  endTime?: string;
  /** Cursor for pagination. */
  cursor?: string;
}

/** Parameters for fetching OHLCV data. */
export interface FetchOHLCVParams {
  /** End time in nanoseconds. */
  endTime?: string;
  /** Candle type (TRADE, MARK, INDEX, MID). */
  candleType?: CandlestickType;
  /** Cursor for pagination. */
  cursor?: string;
}

/** Parameters for fetching funding rate history. */
export interface FetchFundingRateHistoryParams {
  /** End time in nanoseconds. */
  endTime?: string;
  /** Cursor for pagination. */
  cursor?: string;
}

/** Parameters for creating an order. */
export interface CreateOrderParams {
  /** Time in force. Defaults to GOOD_TILL_TIME. */
  timeInForce?: "GOOD_TILL_TIME" | "ALL_OR_NONE" | "IMMEDIATE_OR_CANCEL" | "FILL_OR_KILL";
  /** Order duration in seconds. Defaults to 24 hours. */
  orderDurationSecs?: number;
  /** Post-only flag. */
  postOnly?: boolean;
  /** Reduce-only flag. */
  reduceOnly?: boolean;
  /** Client order ID. */
  clientOrderId?: string;
}

/** Parameters for canceling an order. */
export interface CancelOrderParams {
  /** Client order ID (alternative to order ID). */
  clientOrderId?: string;
}

/** CCXT-compatible interval strings. */
export type CCXTInterval =
  | "1m"
  | "3m"
  | "5m"
  | "15m"
  | "30m"
  | "1h"
  | "2h"
  | "4h"
  | "6h"
  | "8h"
  | "12h"
  | "1d"
  | "3d"
  | "1w";

/** Map CCXT interval strings to GRVT CandlestickInterval. */
export const CCXT_INTERVAL_MAP: Record<CCXTInterval, CandlestickInterval> = {
  "1m": "CI_1_M" as CandlestickInterval,
  "3m": "CI_3_M" as CandlestickInterval,
  "5m": "CI_5_M" as CandlestickInterval,
  "15m": "CI_15_M" as CandlestickInterval,
  "30m": "CI_30_M" as CandlestickInterval,
  "1h": "CI_1_H" as CandlestickInterval,
  "2h": "CI_2_H" as CandlestickInterval,
  "4h": "CI_4_H" as CandlestickInterval,
  "6h": "CI_6_H" as CandlestickInterval,
  "8h": "CI_8_H" as CandlestickInterval,
  "12h": "CI_12_H" as CandlestickInterval,
  "1d": "CI_1_D" as CandlestickInterval,
  "3d": "CI_3_D" as CandlestickInterval,
  "1w": "CI_1_W" as CandlestickInterval,
};

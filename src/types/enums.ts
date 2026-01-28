/**
 * GRVT SDK Enums
 *
 * These enums are converted from grvt_raw_types.py
 * Only essential enums are included initially; others will be added as needed.
 */

/**
 * Environment configuration for the GRVT API
 */
export enum GrvtEnv {
  /** Development environment */
  DEV = "dev",
  /** Staging environment */
  STG = "stg",
  /** Testnet environment */
  TESTNET = "testnet",
  /** Production environment */
  PROD = "prod",
}

/**
 * Endpoint type for routing API calls
 */
export enum GrvtEndpointType {
  /** Edge endpoints (auth, graphql) */
  EDGE = "edge",
  /** Trade data endpoints */
  TRADE_DATA = "tdg",
  /** Market data endpoints */
  MARKET_DATA = "mdg",
}

/**
 * Candlestick time intervals
 */
export enum CandlestickInterval {
  /** 1 minute */
  CI_1_M = "CI_1_M",
  /** 3 minutes */
  CI_3_M = "CI_3_M",
  /** 5 minutes */
  CI_5_M = "CI_5_M",
  /** 15 minutes */
  CI_15_M = "CI_15_M",
  /** 30 minutes */
  CI_30_M = "CI_30_M",
  /** 1 hour */
  CI_1_H = "CI_1_H",
  /** 2 hours */
  CI_2_H = "CI_2_H",
  /** 4 hours */
  CI_4_H = "CI_4_H",
  /** 6 hours */
  CI_6_H = "CI_6_H",
  /** 8 hours */
  CI_8_H = "CI_8_H",
  /** 12 hours */
  CI_12_H = "CI_12_H",
  /** 1 day */
  CI_1_D = "CI_1_D",
  /** 3 days */
  CI_3_D = "CI_3_D",
  /** 5 days */
  CI_5_D = "CI_5_D",
  /** 1 week */
  CI_1_W = "CI_1_W",
  /** 2 weeks */
  CI_2_W = "CI_2_W",
  /** 3 weeks */
  CI_3_W = "CI_3_W",
  /** 4 weeks */
  CI_4_W = "CI_4_W",
}

/**
 * Candlestick price type
 */
export enum CandlestickType {
  /** Tracks traded prices */
  TRADE = "TRADE",
  /** Tracks mark prices */
  MARK = "MARK",
  /** Tracks index prices */
  INDEX = "INDEX",
  /** Tracks book mid prices */
  MID = "MID",
}

/**
 * Supported currencies
 */
export enum Currency {
  /** USD fiat currency */
  USD = "USD",
  /** USDC token */
  USDC = "USDC",
  /** USDT token */
  USDT = "USDT",
  /** ETH token */
  ETH = "ETH",
  /** BTC token */
  BTC = "BTC",
}

/**
 * Instrument settlement period
 */
export enum InstrumentSettlementPeriod {
  /** Instrument settles through perpetual funding cycles */
  PERPETUAL = "PERPETUAL",
  /** Instrument settles at an expiry date, marked as a daily instrument */
  DAILY = "DAILY",
  /** Instrument settles at an expiry date, marked as a weekly instrument */
  WEEKLY = "WEEKLY",
  /** Instrument settles at an expiry date, marked as a monthly instrument */
  MONTHLY = "MONTHLY",
  /** Instrument settles at an expiry date, marked as a quarterly instrument */
  QUARTERLY = "QUARTERLY",
}

/**
 * Instrument kind (type of derivative)
 */
export enum Kind {
  /** Perpetual asset kind */
  PERPETUAL = "PERPETUAL",
  /** Future asset kind */
  FUTURE = "FUTURE",
  /** Call option asset kind */
  CALL = "CALL",
  /** Put option asset kind */
  PUT = "PUT",
}

/**
 * Margin type for sub-accounts
 */
export enum MarginType {
  /** Simple Cross Margin Mode: all assets have a predictable margin impact, the whole subaccount shares a single margin */
  SIMPLE_CROSS_MARGIN = "SIMPLE_CROSS_MARGIN",
  /** Portfolio Cross Margin Mode: asset margin impact is analysed on portfolio level, the whole subaccount shares a single margin */
  PORTFOLIO_CROSS_MARGIN = "PORTFOLIO_CROSS_MARGIN",
}

/**
 * Order rejection reasons
 */
export enum OrderRejectReason {
  /** Order is not cancelled or rejected */
  UNSPECIFIED = "UNSPECIFIED",
  /** Client called a Cancel API */
  CLIENT_CANCEL = "CLIENT_CANCEL",
  /** Client called a Bulk Cancel API */
  CLIENT_BULK_CANCEL = "CLIENT_BULK_CANCEL",
  /** Client called a Session Cancel API, or set the WebSocket connection to 'cancelOrdersOnTerminate' */
  CLIENT_SESSION_END = "CLIENT_SESSION_END",
  /** The market order was cancelled after no/partial fill */
  MARKET_CANCEL = "MARKET_CANCEL",
  /** The IOC order was cancelled after no/partial fill */
  IOC_CANCEL = "IOC_CANCEL",
  /** The AON order was cancelled as it could not be fully matched */
  AON_CANCEL = "AON_CANCEL",
  /** The FOK order was cancelled as it could not be fully matched */
  FOK_CANCEL = "FOK_CANCEL",
  /** The order was cancelled as it has expired */
  EXPIRED = "EXPIRED",
  /** The post-only order could not be posted into the orderbook */
  FAIL_POST_ONLY = "FAIL_POST_ONLY",
  /** The reduce-only order would have caused position size to increase */
  FAIL_REDUCE_ONLY = "FAIL_REDUCE_ONLY",
  /** The order was cancelled due to market maker protection trigger */
  MM_PROTECTION = "MM_PROTECTION",
  /** The order was cancelled due to self-trade protection trigger */
  SELF_TRADE_PROTECTION = "SELF_TRADE_PROTECTION",
  /** The order matched with another order from the same sub account */
  SELF_MATCHED_SUBACCOUNT = "SELF_MATCHED_SUBACCOUNT",
  /** An active order on your sub account shares the same clientOrderId */
  OVERLAPPING_CLIENT_ORDER_ID = "OVERLAPPING_CLIENT_ORDER_ID",
  /** The order will bring the sub account below initial margin requirement */
  BELOW_MARGIN = "BELOW_MARGIN",
  /** The sub account is liquidated (and all open orders are cancelled by Gravity) */
  LIQUIDATION = "LIQUIDATION",
  /** Instrument is invalid or not found on Gravity */
  INSTRUMENT_INVALID = "INSTRUMENT_INVALID",
  /** Instrument is no longer tradable on Gravity (typically due to a market halt, or instrument expiry) */
  INSTRUMENT_DEACTIVATED = "INSTRUMENT_DEACTIVATED",
  /** System failover resulting in loss of order state */
  SYSTEM_FAILOVER = "SYSTEM_FAILOVER",
  /** The credentials used is not authorised to perform the action */
  UNAUTHORISED = "UNAUTHORISED",
  /** The session key used to sign the order expired */
  SESSION_KEY_EXPIRED = "SESSION_KEY_EXPIRED",
  /** The subaccount does not exist */
  SUB_ACCOUNT_NOT_FOUND = "SUB_ACCOUNT_NOT_FOUND",
  /** The signature used to sign the order has no trade permission */
  NO_TRADE_PERMISSION = "NO_TRADE_PERMISSION",
  /** The order payload does not contain a supported TimeInForce value */
  UNSUPPORTED_TIME_IN_FORCE = "UNSUPPORTED_TIME_IN_FORCE",
  /** The order has multiple legs, but multiple legs are not supported by this venue */
  MULTI_LEGGED_ORDER = "MULTI_LEGGED_ORDER",
}

/**
 * Order status
 */
export enum OrderStatus {
  /** Order is waiting for Trigger Condition to be hit */
  PENDING = "PENDING",
  /** Order is actively matching on the orderbook, could be unfilled or partially filled */
  OPEN = "OPEN",
  /** Order is fully filled and hence closed */
  FILLED = "FILLED",
  /** Order is rejected by GRVT Backend since it fails a particular check */
  REJECTED = "REJECTED",
  /** Order is cancelled by the user using one of the supported APIs */
  CANCELLED = "CANCELLED",
}

/**
 * Sub-account trade interval for reporting
 */
export enum SubAccountTradeInterval {
  /** 1 month */
  SAT_1_MO = "SAT_1_MO",
  /** 1 day */
  SAT_1_D = "SAT_1_D",
}

/**
 * Time in force for orders
 *
 * |                       | Must Fill All | Can Fill Partial |
 * | -                     | -             | -                |
 * | Must Fill Immediately | FOK           | IOC              |
 * | Can Fill Till Time    | AON           | GTC              |
 */
export enum TimeInForce {
  /** GTT - Remains open until it is cancelled, or expired */
  GOOD_TILL_TIME = "GOOD_TILL_TIME",
  /** AON - Either fill the whole order or none of it (Block Trades Only) */
  ALL_OR_NONE = "ALL_OR_NONE",
  /** IOC - Fill the order as much as possible, when hitting the orderbook. Then cancel it */
  IMMEDIATE_OR_CANCEL = "IMMEDIATE_OR_CANCEL",
  /** FOK - Both AoN and IoC. Either fill the full order when hitting the orderbook, or cancel it */
  FILL_OR_KILL = "FILL_OR_KILL",
}

/**
 * Trading venue
 */
export enum Venue {
  /** The trade is cleared on the orderbook venue */
  ORDERBOOK = "ORDERBOOK",
  /** The trade is cleared on the RFQ venue */
  RFQ = "RFQ",
}

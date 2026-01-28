/**
 * Raw API request and response types for GRVT.
 *
 * These types are used by the GrvtRawClient for direct API calls.
 */

import type {
  CandlestickInterval,
  CandlestickType,
  Currency,
  InstrumentSettlementPeriod,
  Kind,
  MarginType,
  OrderRejectReason,
  OrderStatus,
  TimeInForce,
  Venue,
} from "../types/mod.ts";

// =============================================================
// Common Types
// =============================================================

/** Empty request for endpoints that don't require parameters. */
export interface EmptyRequest {
  [key: string]: never;
}

/** Acknowledgment response for operations like cancel, deposit, etc. */
export interface AckResponse {
  /** Acknowledgment result. */
  result: {
    /** Acknowledgment status. */
    ack: boolean;
  };
}

// =============================================================
// Instrument Types
// =============================================================

/** Instrument data. */
export interface Instrument {
  /** The readable instrument name (e.g., "BTC_USDT_Perp"). */
  instrument: string;
  /** The asset ID used for instrument signing. */
  instrument_hash: string;
  /** The base currency. */
  base: Currency;
  /** The quote currency. */
  quote: Currency;
  /** The kind of instrument. */
  kind: Kind;
  /** Venues that this instrument can be traded at. */
  venues: Venue[];
  /** The settlement period of the instrument. */
  settlement_period: InstrumentSettlementPeriod;
  /** The smallest denomination of the base asset. */
  base_decimals: number;
  /** The smallest denomination of the quote asset. */
  quote_decimals: number;
  /** The size of a single tick, expressed in quote asset decimal units. */
  tick_size: string;
  /** The minimum contract size, expressed in base asset decimal units. */
  min_size: string;
  /** Creation time in unix nanoseconds. */
  create_time: string;
}

/** Request to get a single instrument. */
export interface GetInstrumentRequest {
  /** The readable instrument name. */
  instrument: string;
}

/** Response for get instrument. */
export interface GetInstrumentResponse {
  /** The instrument matching the request. */
  result: Instrument;
}

/** Request to get all instruments. */
export interface GetAllInstrumentsRequest {
  /** Request for active instruments only. */
  is_active?: boolean;
}

/** Response for get all instruments. */
export interface GetAllInstrumentsResponse {
  /** The instruments matching the request. */
  result: Instrument[];
}

/** Request to get filtered instruments. */
export interface GetFilteredInstrumentsRequest {
  /** The kind filter to apply. */
  kind?: Kind[];
  /** The base currency filter to apply. */
  base?: Currency[];
  /** The quote currency filter to apply. */
  quote?: Currency[];
  /** Request for active instruments only. */
  is_active?: boolean;
  /** The limit to query for. Defaults to 500; Max 100000. */
  limit?: number;
}

/** Response for get filtered instruments. */
export interface GetFilteredInstrumentsResponse {
  /** The instruments matching the request filter. */
  result: Instrument[];
}

// =============================================================
// Ticker Types
// =============================================================

/** Mini ticker data. */
export interface MiniTicker {
  /** Time at which the event was emitted in unix nanoseconds. */
  event_time?: string;
  /** The readable instrument name. */
  instrument?: string;
  /** The mark price of the instrument, expressed in 9 decimals. */
  mark_price?: string;
  /** The index price of the instrument, expressed in 9 decimals. */
  index_price?: string;
  /** The last traded price of the instrument, expressed in 9 decimals. */
  last_price?: string;
  /** The number of assets traded in the last trade. */
  last_size?: string;
  /** The mid price of the instrument, expressed in 9 decimals. */
  mid_price?: string;
  /** The best bid price of the instrument, expressed in 9 decimals. */
  best_bid_price?: string;
  /** The number of assets offered on the best bid price. */
  best_bid_size?: string;
  /** The best ask price of the instrument, expressed in 9 decimals. */
  best_ask_price?: string;
  /** The number of assets offered on the best ask price. */
  best_ask_size?: string;
}

/** Request for mini ticker. */
export interface MiniTickerRequest {
  /** The readable instrument name. */
  instrument: string;
}

/** Response for mini ticker. */
export interface MiniTickerResponse {
  /** The mini ticker matching the request. */
  result: MiniTicker;
}

/** Full ticker data. */
export interface Ticker extends MiniTicker {
  /** The current funding rate of the instrument, expressed in centibeeps. */
  funding_rate_8h_curr?: string;
  /** The average funding rate of the instrument (over last 8h), expressed in centibeeps. */
  funding_rate_8h_avg?: string;
  /** The interest rate of the underlying, expressed in centibeeps. */
  interest_rate?: string;
  /** The forward price of the option, expressed in 9 decimals. */
  forward_price?: string;
  /** The 24 hour taker buy volume, expressed in base asset decimal units. */
  buy_volume_24h_b?: string;
  /** The 24 hour taker sell volume, expressed in base asset decimal units. */
  sell_volume_24h_b?: string;
  /** The 24 hour taker buy volume, expressed in quote asset decimal units. */
  buy_volume_24h_q?: string;
  /** The 24 hour taker sell volume, expressed in quote asset decimal units. */
  sell_volume_24h_q?: string;
  /** The 24 hour highest traded price, expressed in 9 decimals. */
  high_price?: string;
  /** The 24 hour lowest traded price, expressed in 9 decimals. */
  low_price?: string;
  /** The 24 hour first traded price, expressed in 9 decimals. */
  open_price?: string;
  /** The open interest in the instrument, expressed in base asset decimal units. */
  open_interest?: string;
  /** The ratio of accounts that are net long vs net short. */
  long_short_ratio?: string;
}

/** Request for ticker. */
export interface TickerRequest {
  /** The readable instrument name. */
  instrument: string;
}

/** Response for ticker. */
export interface TickerResponse {
  /** The ticker matching the request. */
  result: Ticker;
}

// =============================================================
// Order Book Types
// =============================================================

/** Order book level. */
export interface OrderbookLevel {
  /** The price of the level, expressed in 9 decimals. */
  price: string;
  /** The number of assets offered, expressed in base asset decimal units. */
  size: string;
  /** The number of open orders at this level. */
  num_orders: number;
}

/** Order book levels data. */
export interface OrderbookLevels {
  /** Time at which the event was emitted in unix nanoseconds. */
  event_time: string;
  /** The readable instrument name. */
  instrument: string;
  /** The list of best bids up till query depth. */
  bids: OrderbookLevel[];
  /** The list of best asks up till query depth. */
  asks: OrderbookLevel[];
}

/** Request for order book levels. */
export interface OrderbookLevelsRequest {
  /** The readable instrument name. */
  instrument: string;
  /** Depth of the order book to be retrieved (10, 50, 100, 500). */
  depth: number;
}

/** Response for order book levels. */
export interface OrderbookLevelsResponse {
  /** The orderbook levels matching the request. */
  result: OrderbookLevels;
}

// =============================================================
// Trade Types
// =============================================================

/** Public trade data. */
export interface Trade {
  /** Time at which the event was emitted in unix nanoseconds. */
  event_time: string;
  /** The readable instrument name. */
  instrument: string;
  /** If taker was the buyer on the trade. */
  is_taker_buyer: boolean;
  /** The number of assets being traded, expressed in base asset decimal units. */
  size: string;
  /** The traded price, expressed in 9 decimals. */
  price: string;
  /** The mark price at point of trade, expressed in 9 decimals. */
  mark_price: string;
  /** The index price at point of trade, expressed in 9 decimals. */
  index_price: string;
  /** The interest rate at point of trade, expressed in centibeeps. */
  interest_rate: string;
  /** The forward price of the option at point of trade, expressed in 9 decimals. */
  forward_price: string;
  /** A globally unique trade identifier. */
  trade_id: string;
  /** The venue where the trade occurred. */
  venue: Venue;
}

/** Request for recent trades. */
export interface TradeRequest {
  /** The readable instrument name. */
  instrument: string;
  /** The limit to query for. Defaults to 500; Max 1000. */
  limit: number;
}

/** Response for recent trades. */
export interface TradeResponse {
  /** The public trades matching the request. */
  result: Trade[];
}

/** Request for trade history. */
export interface TradeHistoryRequest {
  /** The readable instrument name. */
  instrument: string;
  /** Start time in unix nanoseconds. */
  start_time?: string;
  /** End time in unix nanoseconds. */
  end_time?: string;
  /** The limit to query for. Defaults to 500; Max 1000. */
  limit?: number;
  /** The cursor to indicate when to start the query from. */
  cursor?: string;
}

/** Response for trade history. */
export interface TradeHistoryResponse {
  /** The public trades matching the request. */
  result: Trade[];
  /** The cursor to indicate when to start the next query from. */
  next?: string;
}

// =============================================================
// Candlestick Types
// =============================================================

/** Candlestick data. */
export interface Candlestick {
  /** Open time of kline bar in unix nanoseconds. */
  open_time: string;
  /** Close time of kline bar in unix nanoseconds. */
  close_time: string;
  /** The open price. */
  open: string;
  /** The close price. */
  close: string;
  /** The high price. */
  high: string;
  /** The low price. */
  low: string;
  /** The underlying volume transacted, expressed in base asset decimal units. */
  volume_b: string;
  /** The quote volume transacted, expressed in quote asset decimal units. */
  volume_q: string;
  /** The number of trades transacted. */
  trades: number;
  /** The readable instrument name. */
  instrument: string;
}

/** Request for candlestick data. */
export interface CandlestickRequest {
  /** The readable instrument name. */
  instrument: string;
  /** The interval of each candlestick. */
  interval: CandlestickInterval;
  /** The type of candlestick data to retrieve. */
  type: CandlestickType;
  /** Start time in unix nanoseconds. */
  start_time?: string;
  /** End time in unix nanoseconds. */
  end_time?: string;
  /** The limit to query for. Defaults to 500; Max 1000. */
  limit?: number;
  /** The cursor to indicate when to start the query from. */
  cursor?: string;
}

/** Response for candlestick data. */
export interface CandlestickResponse {
  /** The candlestick result set. */
  result: Candlestick[];
  /** The cursor to indicate when to start the next query from. */
  next?: string;
}

// =============================================================
// Funding Rate Types
// =============================================================

/** Funding rate data. */
export interface FundingRate {
  /** The readable instrument name. */
  instrument: string;
  /** The funding rate, expressed in centibeeps. */
  funding_rate: number;
  /** The funding timestamp in unix nanoseconds. */
  funding_time: string;
  /** The mark price at funding timestamp, expressed in 9 decimals. */
  mark_price: string;
}

/** Request for funding rate. */
export interface FundingRateRequest {
  /** The readable instrument name. */
  instrument: string;
  /** Start time in unix nanoseconds. */
  start_time?: string;
  /** End time in unix nanoseconds. */
  end_time?: string;
  /** The limit to query for. Defaults to 500; Max 1000. */
  limit?: number;
  /** The cursor to indicate when to start the query from. */
  cursor?: string;
}

/** Response for funding rate. */
export interface FundingRateResponse {
  /** The funding rate result set. */
  result: FundingRate[];
  /** The cursor to indicate when to start the next query from. */
  next?: string;
}

// =============================================================
// Order Types
// =============================================================

/** Order leg in an order. */
export interface OrderLegData {
  /** The instrument to trade in this leg. */
  instrument: string;
  /** The total number of contracts to trade in this leg. */
  size: string;
  /** Specifies if the order leg is a buy or sell. */
  is_buying_asset: boolean;
  /** The limit price of the order leg. */
  limit_price: string;
}

/** Signature for an order. */
export interface OrderSignature {
  /** The address (public key) of the wallet signing the payload. */
  signer: string;
  /** First component of ECDSA signature. */
  r: string;
  /** Second component of ECDSA signature. */
  s: string;
  /** Recovery identifier. */
  v: number;
  /** Timestamp after which this signature expires, in unix nanoseconds. */
  expiration: string;
  /** Signature deconflicting key. */
  nonce: number;
}

/** Order metadata. */
export interface OrderMetadata {
  /** A unique identifier of an active order, specified by the client. */
  client_order_id: string;
  /** Time at which the order was received by GRVT in unix nanoseconds. */
  create_time?: string;
}

/** Order data in API requests/responses. */
export interface OrderData {
  /** The subaccount initiating the order. */
  sub_account_id: string;
  /** If the order is a market order. */
  is_market: boolean;
  /** Time in force for the order. */
  time_in_force: TimeInForce;
  /** If true, order is post-only. */
  post_only: boolean;
  /** If true, order must reduce position size or be cancelled. */
  reduce_only: boolean;
  /** Order legs. */
  legs: OrderLegData[];
  /** The signature approving this order. */
  signature: OrderSignature;
  /** Order metadata. */
  metadata: OrderMetadata;
}

/** Full order data with state. */
export interface Order extends OrderData {
  /** The order ID. */
  order_id: string;
  /** Current order status. */
  state: {
    /** Order status. */
    status: OrderStatus;
    /** Reason for rejection if rejected. */
    reject_reason: OrderRejectReason;
    /** Remaining size to be filled. */
    remaining_size: string;
    /** Time at which the order was last updated. */
    update_time: string;
  };
}

/** Request to create an order. */
export interface CreateOrderRequest {
  /** The order to create. */
  order: OrderData;
}

/** Response for create order. */
export interface CreateOrderResponse {
  /** The created order. */
  result: Order;
}

/** Request to cancel an order. */
export interface CancelOrderRequest {
  /** The sub account ID. */
  sub_account_id: string;
  /** The order ID to cancel (required if client_order_id not provided). */
  order_id?: string;
  /** The client order ID to cancel (required if order_id not provided). */
  client_order_id?: string;
}

/** Request to cancel all orders. */
export interface CancelAllOrdersRequest {
  /** The sub account ID. */
  sub_account_id: string;
  /** Filter by instrument (optional). */
  instrument?: string;
}

/** Request to get an order. */
export interface GetOrderRequest {
  /** The sub account ID. */
  sub_account_id: string;
  /** The order ID. */
  order_id?: string;
  /** The client order ID. */
  client_order_id?: string;
}

/** Response for get order. */
export interface GetOrderResponse {
  /** The order matching the request. */
  result: Order;
}

/** Request for open orders. */
export interface OpenOrdersRequest {
  /** The sub account ID. */
  sub_account_id: string;
  /** Filter by kind. */
  kind?: Kind[];
  /** Filter by base currency. */
  base?: Currency[];
  /** Filter by quote currency. */
  quote?: Currency[];
}

/** Response for open orders. */
export interface OpenOrdersResponse {
  /** The open orders. */
  result: Order[];
}

/** Request for order history. */
export interface OrderHistoryRequest {
  /** The sub account ID. */
  sub_account_id: string;
  /** Filter by kind. */
  kind?: Kind[];
  /** Filter by base currency. */
  base?: Currency[];
  /** Filter by quote currency. */
  quote?: Currency[];
  /** Start time in unix nanoseconds. */
  start_time?: string;
  /** End time in unix nanoseconds. */
  end_time?: string;
  /** The limit to query for. */
  limit?: number;
  /** The cursor to indicate when to start the query from. */
  cursor?: string;
}

/** Response for order history. */
export interface OrderHistoryResponse {
  /** The order history. */
  result: Order[];
  /** The cursor to indicate when to start the next query from. */
  next: string;
}

// =============================================================
// Fill Types
// =============================================================

/** Fill (trade) data for a user's order. */
export interface Fill {
  /** Time at which the event was emitted in unix nanoseconds. */
  event_time: string;
  /** The sub account ID that participated in the trade. */
  sub_account_id: string;
  /** The instrument being represented. */
  instrument: string;
  /** The side that the subaccount took on the trade. */
  is_buyer: boolean;
  /** The role that the subaccount took on the trade. */
  is_taker: boolean;
  /** The number of assets being traded. */
  size: string;
  /** The traded price, expressed in 9 decimals. */
  price: string;
  /** The mark price at point of trade. */
  mark_price: string;
  /** The index price at point of trade. */
  index_price: string;
  /** The interest rate at point of trade. */
  interest_rate: string;
  /** The forward price at point of trade. */
  forward_price: string;
  /** The realized PnL of the trade. */
  realized_pnl: string;
  /** The fees paid on the trade. */
  fee: string;
  /** The fee rate paid on the trade. */
  fee_rate: string;
  /** A globally unique trade identifier. */
  trade_id: string;
  /** The order ID. */
  order_id: string;
  /** The venue where the trade occurred. */
  venue: Venue;
  /** The client order ID. */
  client_order_id: string;
}

/** Request for fill history. */
export interface FillHistoryRequest {
  /** The sub account ID. */
  sub_account_id: string;
  /** Filter by kind. */
  kind?: Kind[];
  /** Filter by base currency. */
  base?: Currency[];
  /** Filter by quote currency. */
  quote?: Currency[];
  /** Start time in unix nanoseconds. */
  start_time?: string;
  /** End time in unix nanoseconds. */
  end_time?: string;
  /** The limit to query for. */
  limit?: number;
  /** The cursor to indicate when to start the query from. */
  cursor?: string;
}

/** Response for fill history. */
export interface FillHistoryResponse {
  /** The fills matching the request. */
  result: Fill[];
  /** The cursor to indicate when to start the next query from. */
  next: string;
}

// =============================================================
// Position Types
// =============================================================

/** Position data. */
export interface Position {
  /** Time at which the event was emitted in unix nanoseconds. */
  event_time: string;
  /** The sub account ID. */
  sub_account_id: string;
  /** The instrument being represented. */
  instrument: string;
  /** The size of the position. Negative for short positions. */
  size: string;
  /** The notional value of the position. */
  notional: string;
  /** The entry price of the position, expressed in 9 decimals. */
  entry_price: string;
  /** The exit price of the position, expressed in 9 decimals. */
  exit_price: string;
  /** The mark price of the position, expressed in 9 decimals. */
  mark_price: string;
  /** The unrealized PnL of the position. */
  unrealized_pnl: string;
  /** The realized PnL of the position. */
  realized_pnl: string;
  /** The total PnL of the position. */
  total_pnl: string;
  /** The ROI of the position, expressed as a percentage. */
  roi: string;
  /** The index price of the quote currency (reported in USD). */
  quote_index_price: string;
}

/** Request for positions. */
export interface PositionsRequest {
  /** The sub account ID. */
  sub_account_id: string;
  /** Filter by kind. */
  kind?: Kind[];
  /** Filter by base currency. */
  base?: Currency[];
  /** Filter by quote currency. */
  quote?: Currency[];
}

/** Response for positions. */
export interface PositionsResponse {
  /** The positions matching the request. */
  result: Position[];
}

// =============================================================
// Account Types
// =============================================================

/** Spot balance data. */
export interface SpotBalance {
  /** The currency. */
  currency: Currency;
  /** This currency's balance. */
  balance: string;
  /** The index price of this currency (reported in USD). */
  index_price: string;
}

/** Sub account data. */
export interface SubAccount {
  /** Time at which the event was emitted in unix nanoseconds. */
  event_time: string;
  /** The sub account ID. */
  sub_account_id: string;
  /** The type of margin algorithm this subaccount uses. */
  margin_type: MarginType;
  /** The settlement, margin, and reporting currency. */
  settle_currency: Currency;
  /** The total unrealized PnL. */
  unrealized_pnl: string;
  /** The total equity. */
  total_equity: string;
  /** The initial margin required. */
  initial_margin: string;
  /** The maintenance margin required. */
  maintenance_margin: string;
  /** The available balance. */
  available_balance: string;
  /** The list of spot assets owned. */
  spot_balances: SpotBalance[];
  /** The list of positions owned. */
  positions: Position[];
  /** The index price of the settle currency (reported in USD). */
  settle_index_price: string;
}

/** Request for sub account summary. */
export interface SubAccountSummaryRequest {
  /** The sub account ID. */
  sub_account_id: string;
}

/** Response for sub account summary. */
export interface SubAccountSummaryResponse {
  /** The sub account. */
  result: SubAccount;
}

/** Request for sub account history. */
export interface SubAccountHistoryRequest {
  /** The sub account ID. */
  sub_account_id: string;
  /** Start time in unix nanoseconds. */
  start_time?: string;
  /** End time in unix nanoseconds. */
  end_time?: string;
  /** The limit to query for. */
  limit?: number;
  /** The cursor to indicate when to start the query from. */
  cursor?: string;
}

/** Response for sub account history. */
export interface SubAccountHistoryResponse {
  /** The sub account history. */
  result: SubAccount[];
  /** The cursor to indicate when to start the next query from. */
  next: string;
}

/** Aggregated account summary data. */
export interface AggregatedAccountSummary {
  /** The main account ID. */
  main_account_id: string;
  /** Total equity, denominated in USD. */
  total_equity: string;
  /** The list of spot assets owned. */
  spot_balances: SpotBalance[];
}

/** Response for aggregated account summary. */
export interface AggregatedAccountSummaryResponse {
  /** The aggregated account summary. */
  result: AggregatedAccountSummary;
}

/** Funding account summary data. */
export interface FundingAccountSummary {
  /** The main account ID. */
  main_account_id: string;
  /** Total equity, denominated in USD. */
  total_equity: string;
  /** The list of spot assets owned. */
  spot_balances: SpotBalance[];
}

/** Response for funding account summary. */
export interface FundingAccountSummaryResponse {
  /** The funding account summary. */
  result: FundingAccountSummary;
}

// =============================================================
// Transfer Types (Deposit, Withdrawal, Transfer)
// =============================================================

/** Request for deposit. */
export interface DepositRequest {
  /** The main account ID to deposit to. */
  main_account_id: string;
  /** The sub account ID to deposit to. */
  to_sub_account_id: string;
  /** The currency to deposit. */
  currency: Currency;
  /** The number of tokens to deposit. */
  num_tokens: string;
}

/** Request for deposit history. */
export interface DepositHistoryRequest {
  /** The main account ID. */
  main_account_id?: string;
  /** Start time in unix nanoseconds. */
  start_time?: string;
  /** End time in unix nanoseconds. */
  end_time?: string;
  /** The limit to query for. */
  limit?: number;
  /** The cursor to indicate when to start the query from. */
  cursor?: string;
}

/** Deposit data. */
export interface Deposit {
  /** The main account ID. */
  main_account_id: string;
  /** The sub account ID. */
  to_sub_account_id: string;
  /** The currency. */
  currency: Currency;
  /** The number of tokens. */
  num_tokens: string;
  /** Time at which the event was emitted. */
  event_time: string;
}

/** Response for deposit history. */
export interface DepositHistoryResponse {
  /** The deposits matching the request. */
  result: Deposit[];
  /** The cursor to indicate when to start the next query from. */
  next?: string;
}

/** Request for transfer between sub accounts. */
export interface TransferRequest {
  /** The sub account to transfer from. */
  from_sub_account_id: string;
  /** The sub account to transfer to. */
  to_sub_account_id: string;
  /** The currency to transfer. */
  currency: Currency;
  /** The number of tokens to transfer. */
  num_tokens: string;
}

/** Request for transfer history. */
export interface TransferHistoryRequest {
  /** The main account ID. */
  main_account_id?: string;
  /** Start time in unix nanoseconds. */
  start_time?: string;
  /** End time in unix nanoseconds. */
  end_time?: string;
  /** The limit to query for. */
  limit?: number;
  /** The cursor to indicate when to start the query from. */
  cursor?: string;
}

/** Transfer data. */
export interface Transfer {
  /** The sub account transferred from. */
  from_sub_account_id: string;
  /** The sub account transferred to. */
  to_sub_account_id: string;
  /** The currency. */
  currency: Currency;
  /** The number of tokens. */
  num_tokens: string;
  /** Time at which the event was emitted. */
  event_time: string;
}

/** Response for transfer history. */
export interface TransferHistoryResponse {
  /** The transfers matching the request. */
  result: Transfer[];
  /** The cursor to indicate when to start the next query from. */
  next?: string;
}

/** Request for withdrawal. */
export interface WithdrawalRequest {
  /** The main account ID. */
  main_account_id: string;
  /** The sub account to withdraw from. */
  from_sub_account_id: string;
  /** The address to withdraw to. */
  to_eth_address: string;
  /** The currency to withdraw. */
  currency: Currency;
  /** The number of tokens to withdraw. */
  num_tokens: string;
}

/** Request for withdrawal history. */
export interface WithdrawalHistoryRequest {
  /** The main account ID. */
  main_account_id?: string;
  /** Start time in unix nanoseconds. */
  start_time?: string;
  /** End time in unix nanoseconds. */
  end_time?: string;
  /** The limit to query for. */
  limit?: number;
  /** The cursor to indicate when to start the query from. */
  cursor?: string;
}

/** Withdrawal data. */
export interface Withdrawal {
  /** The main account ID. */
  main_account_id: string;
  /** The sub account withdrawn from. */
  from_sub_account_id: string;
  /** The address withdrawn to. */
  to_eth_address: string;
  /** The currency. */
  currency: Currency;
  /** The number of tokens. */
  num_tokens: string;
  /** Time at which the event was emitted. */
  event_time: string;
}

/** Response for withdrawal history. */
export interface WithdrawalHistoryResponse {
  /** The withdrawals matching the request. */
  result: Withdrawal[];
  /** The cursor to indicate when to start the next query from. */
  next?: string;
}

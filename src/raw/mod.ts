/**
 * GRVT Raw API Client
 *
 * Low-level API client that provides direct access to all GRVT API endpoints
 * with typed requests and responses.
 *
 * @example
 * ```ts ignore
 * import { GrvtRawClient } from "@wezzcoetzee/grvt/raw";
 * import { GrvtEnv } from "@wezzcoetzee/grvt/types";
 *
 * const client = new GrvtRawClient({
 *   env: GrvtEnv.TESTNET,
 *   apiKey: "your-api-key",
 * });
 *
 * // Fetch all instruments
 * const instruments = await client.getAllInstruments({ is_active: true });
 * console.log(instruments.result);
 *
 * // Fetch ticker
 * const ticker = await client.getTicker({ instrument: "BTC_USDT_Perp" });
 * console.log(ticker.result);
 * ```
 *
 * @module
 */

// Client
export { GrvtRawClient, type GrvtRawClientOptions } from "./client.ts";

// Types
export type {
  // Common
  AckResponse,
  // Account
  AggregatedAccountSummary,
  AggregatedAccountSummaryResponse,
  // Order
  CancelAllOrdersRequest,
  CancelOrderRequest,
  // Candlestick
  Candlestick,
  CandlestickRequest,
  CandlestickResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  // Transfers
  Deposit,
  DepositHistoryRequest,
  DepositHistoryResponse,
  DepositRequest,
  EmptyRequest,
  // Fill
  Fill,
  FillHistoryRequest,
  FillHistoryResponse,
  FundingAccountSummary,
  FundingAccountSummaryResponse,
  // Funding Rate
  FundingRate,
  FundingRateRequest,
  FundingRateResponse,
  // Instrument
  GetAllInstrumentsRequest,
  GetAllInstrumentsResponse,
  GetFilteredInstrumentsRequest,
  GetFilteredInstrumentsResponse,
  GetInstrumentRequest,
  GetInstrumentResponse,
  GetOrderRequest,
  GetOrderResponse,
  Instrument,
  // Ticker
  MiniTicker,
  MiniTickerRequest,
  MiniTickerResponse,
  OpenOrdersRequest,
  OpenOrdersResponse,
  Order,
  // Order Book
  OrderbookLevel,
  OrderbookLevels,
  OrderbookLevelsRequest,
  OrderbookLevelsResponse,
  OrderData,
  OrderHistoryRequest,
  OrderHistoryResponse,
  OrderLegData,
  OrderMetadata,
  OrderSignature,
  // Position
  Position,
  PositionsRequest,
  PositionsResponse,
  SpotBalance,
  SubAccount,
  SubAccountHistoryRequest,
  SubAccountHistoryResponse,
  SubAccountSummaryRequest,
  SubAccountSummaryResponse,
  Ticker,
  TickerRequest,
  TickerResponse,
  // Trade
  Trade,
  TradeHistoryRequest,
  TradeHistoryResponse,
  TradeRequest,
  TradeResponse,
  Transfer,
  TransferHistoryRequest,
  TransferHistoryResponse,
  TransferRequest,
  Withdrawal,
  WithdrawalHistoryRequest,
  WithdrawalHistoryResponse,
  WithdrawalRequest,
} from "./types.ts";

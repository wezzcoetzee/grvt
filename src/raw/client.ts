/**
 * GRVT Raw API Client
 *
 * Low-level API client that provides direct access to all GRVT API endpoints.
 */

import { GrvtEndpointType, type GrvtEnv } from "../types/mod.ts";
import { HttpTransport, type HttpTransportOptions } from "../transport/mod.ts";
import { assertSuccessResponse, type IRequestTransport } from "../transport/_base.ts";
import type {
  AckResponse,
  AggregatedAccountSummaryResponse,
  CancelAllOrdersRequest,
  CancelOrderRequest,
  CandlestickRequest,
  CandlestickResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  DepositHistoryRequest,
  DepositHistoryResponse,
  DepositRequest,
  EmptyRequest,
  FillHistoryRequest,
  FillHistoryResponse,
  FundingAccountSummaryResponse,
  FundingRateRequest,
  FundingRateResponse,
  GetAllInstrumentsRequest,
  GetAllInstrumentsResponse,
  GetFilteredInstrumentsRequest,
  GetFilteredInstrumentsResponse,
  GetInstrumentRequest,
  GetInstrumentResponse,
  GetOrderRequest,
  GetOrderResponse,
  MiniTickerRequest,
  MiniTickerResponse,
  OpenOrdersRequest,
  OpenOrdersResponse,
  OrderbookLevelsRequest,
  OrderbookLevelsResponse,
  OrderHistoryRequest,
  OrderHistoryResponse,
  PositionsRequest,
  PositionsResponse,
  SubAccountHistoryRequest,
  SubAccountHistoryResponse,
  SubAccountSummaryRequest,
  SubAccountSummaryResponse,
  TickerRequest,
  TickerResponse,
  TradeHistoryRequest,
  TradeHistoryResponse,
  TradeRequest,
  TradeResponse,
  TransferHistoryRequest,
  TransferHistoryResponse,
  TransferRequest,
  WithdrawalHistoryRequest,
  WithdrawalHistoryResponse,
  WithdrawalRequest,
} from "./types.ts";

/** Configuration options for the GrvtRawClient. */
export interface GrvtRawClientOptions extends HttpTransportOptions {
  /** Optional custom transport. If not provided, HttpTransport will be used. */
  transport?: IRequestTransport;
}

/**
 * GRVT Raw API Client
 *
 * Provides direct access to all GRVT API endpoints with typed requests and responses.
 *
 * @example
 * ```ts ignore
 * import { GrvtRawClient, GrvtEnv } from "@wezzcoetzee/grvt";
 *
 * const client = new GrvtRawClient({
 *   env: GrvtEnv.TESTNET,
 *   apiKey: "your-api-key",
 * });
 *
 * // Fetch all instruments
 * const instruments = await client.getAllInstruments({ is_active: true });
 * console.log(instruments.result);
 * ```
 */
export class GrvtRawClient {
  /** The transport used for API requests. */
  readonly transport: IRequestTransport;
  /** The GRVT environment. */
  readonly env: GrvtEnv;

  /**
   * Creates a new GrvtRawClient instance.
   *
   * @param options - Configuration options.
   */
  constructor(options: GrvtRawClientOptions) {
    if (options.transport) {
      this.transport = options.transport;
      this.env = options.env!;
    } else {
      const httpTransport = new HttpTransport(options);
      this.transport = httpTransport;
      this.env = httpTransport.env;
    }
  }

  // =============================================================
  // Market Data Methods (Public)
  // =============================================================

  /**
   * Get a single instrument by name.
   *
   * @param request - The request parameters.
   * @returns The instrument data.
   *
   * @example
   * ```ts ignore
   * const response = await client.getInstrument({ instrument: "BTC_USDT_Perp" });
   * console.log(response.result);
   * ```
   */
  async getInstrument(request: GetInstrumentRequest): Promise<GetInstrumentResponse> {
    const response = await this.transport.request<GetInstrumentResponse>(
      GrvtEndpointType.MARKET_DATA,
      "full/v1/instrument",
      request,
    );
    assertSuccessResponse(response);
    return response;
  }

  /**
   * Get all instruments.
   *
   * @param request - The request parameters.
   * @returns The list of instruments.
   *
   * @example
   * ```ts ignore
   * const response = await client.getAllInstruments({ is_active: true });
   * console.log(response.result);
   * ```
   */
  async getAllInstruments(request: GetAllInstrumentsRequest = {}): Promise<GetAllInstrumentsResponse> {
    const response = await this.transport.request<GetAllInstrumentsResponse>(
      GrvtEndpointType.MARKET_DATA,
      "full/v1/all_instruments",
      request,
    );
    assertSuccessResponse(response);
    return response;
  }

  /**
   * Get filtered instruments.
   *
   * @param request - The request parameters with filters.
   * @returns The list of instruments matching the filters.
   *
   * @example
   * ```ts ignore
   * const response = await client.getFilteredInstruments({
   *   kind: [Kind.PERPETUAL],
   *   is_active: true,
   * });
   * console.log(response.result);
   * ```
   */
  async getFilteredInstruments(request: GetFilteredInstrumentsRequest = {}): Promise<GetFilteredInstrumentsResponse> {
    const response = await this.transport.request<GetFilteredInstrumentsResponse>(
      GrvtEndpointType.MARKET_DATA,
      "full/v1/instruments",
      request,
    );
    assertSuccessResponse(response);
    return response;
  }

  /**
   * Get mini ticker for an instrument.
   *
   * @param request - The request parameters.
   * @returns The mini ticker data.
   *
   * @example
   * ```ts ignore
   * const response = await client.getMiniTicker({ instrument: "BTC_USDT_Perp" });
   * console.log(response.result);
   * ```
   */
  async getMiniTicker(request: MiniTickerRequest): Promise<MiniTickerResponse> {
    const response = await this.transport.request<MiniTickerResponse>(
      GrvtEndpointType.MARKET_DATA,
      "full/v1/mini",
      request,
    );
    assertSuccessResponse(response);
    return response;
  }

  /**
   * Get full ticker for an instrument.
   *
   * @param request - The request parameters.
   * @returns The ticker data.
   *
   * @example
   * ```ts ignore
   * const response = await client.getTicker({ instrument: "BTC_USDT_Perp" });
   * console.log(response.result);
   * ```
   */
  async getTicker(request: TickerRequest): Promise<TickerResponse> {
    const response = await this.transport.request<TickerResponse>(
      GrvtEndpointType.MARKET_DATA,
      "full/v1/ticker",
      request,
    );
    assertSuccessResponse(response);
    return response;
  }

  /**
   * Get order book levels for an instrument.
   *
   * @param request - The request parameters.
   * @returns The order book levels.
   *
   * @example
   * ```ts ignore
   * const response = await client.getOrderbookLevels({
   *   instrument: "BTC_USDT_Perp",
   *   depth: 10,
   * });
   * console.log(response.result);
   * ```
   */
  async getOrderbookLevels(request: OrderbookLevelsRequest): Promise<OrderbookLevelsResponse> {
    const response = await this.transport.request<OrderbookLevelsResponse>(
      GrvtEndpointType.MARKET_DATA,
      "full/v1/book",
      request,
    );
    assertSuccessResponse(response);
    return response;
  }

  /**
   * Get recent trades for an instrument.
   *
   * @param request - The request parameters.
   * @returns The recent trades.
   *
   * @example
   * ```ts ignore
   * const response = await client.getTrades({
   *   instrument: "BTC_USDT_Perp",
   *   limit: 100,
   * });
   * console.log(response.result);
   * ```
   */
  async getTrades(request: TradeRequest): Promise<TradeResponse> {
    const response = await this.transport.request<TradeResponse>(
      GrvtEndpointType.MARKET_DATA,
      "full/v1/trade",
      request,
    );
    assertSuccessResponse(response);
    return response;
  }

  /**
   * Get trade history for an instrument.
   *
   * @param request - The request parameters.
   * @returns The trade history.
   *
   * @example
   * ```ts ignore
   * const response = await client.getTradeHistory({
   *   instrument: "BTC_USDT_Perp",
   *   limit: 100,
   * });
   * console.log(response.result);
   * ```
   */
  async getTradeHistory(request: TradeHistoryRequest): Promise<TradeHistoryResponse> {
    const response = await this.transport.request<TradeHistoryResponse>(
      GrvtEndpointType.MARKET_DATA,
      "full/v1/trade_history",
      request,
    );
    assertSuccessResponse(response);
    return response;
  }

  /**
   * Get candlestick data for an instrument.
   *
   * @param request - The request parameters.
   * @returns The candlestick data.
   *
   * @example
   * ```ts ignore
   * import { CandlestickInterval, CandlestickType } from "@wezzcoetzee/grvt/types";
   *
   * const response = await client.getCandlestick({
   *   instrument: "BTC_USDT_Perp",
   *   interval: CandlestickInterval.CI_1_H,
   *   type: CandlestickType.TRADE,
   *   limit: 100,
   * });
   * console.log(response.result);
   * ```
   */
  async getCandlestick(request: CandlestickRequest): Promise<CandlestickResponse> {
    const response = await this.transport.request<CandlestickResponse>(
      GrvtEndpointType.MARKET_DATA,
      "full/v1/kline",
      request,
    );
    assertSuccessResponse(response);
    return response;
  }

  /**
   * Get funding rate history for an instrument.
   *
   * @param request - The request parameters.
   * @returns The funding rate history.
   *
   * @example
   * ```ts ignore
   * const response = await client.getFundingRate({
   *   instrument: "BTC_USDT_Perp",
   *   limit: 100,
   * });
   * console.log(response.result);
   * ```
   */
  async getFundingRate(request: FundingRateRequest): Promise<FundingRateResponse> {
    const response = await this.transport.request<FundingRateResponse>(
      GrvtEndpointType.MARKET_DATA,
      "full/v1/funding",
      request,
    );
    assertSuccessResponse(response);
    return response;
  }

  // =============================================================
  // Trading Methods (Authenticated)
  // =============================================================

  /**
   * Create an order.
   *
   * @param request - The order to create.
   * @returns The created order.
   *
   * @example
   * ```ts ignore
   * const response = await client.createOrder({
   *   order: signedOrder,
   * });
   * console.log(response.result);
   * ```
   */
  async createOrder(request: CreateOrderRequest): Promise<CreateOrderResponse> {
    const response = await this.transport.request<CreateOrderResponse>(
      GrvtEndpointType.TRADE_DATA,
      "full/v1/create_order",
      request,
      { requiresAuth: true },
    );
    assertSuccessResponse(response);
    return response;
  }

  /**
   * Cancel an order.
   *
   * @param request - The order to cancel.
   * @returns Acknowledgment response.
   *
   * @example
   * ```ts ignore
   * const response = await client.cancelOrder({
   *   sub_account_id: "123456789",
   *   order_id: "order-id",
   * });
   * console.log(response.result.ack);
   * ```
   */
  async cancelOrder(request: CancelOrderRequest): Promise<AckResponse> {
    const response = await this.transport.request<AckResponse>(
      GrvtEndpointType.TRADE_DATA,
      "full/v1/cancel_order",
      request,
      { requiresAuth: true },
    );
    assertSuccessResponse(response);
    return response;
  }

  /**
   * Cancel all orders.
   *
   * @param request - The request parameters.
   * @returns Acknowledgment response.
   *
   * @example
   * ```ts ignore
   * const response = await client.cancelAllOrders({
   *   sub_account_id: "123456789",
   * });
   * console.log(response.result.ack);
   * ```
   */
  async cancelAllOrders(request: CancelAllOrdersRequest): Promise<AckResponse> {
    const response = await this.transport.request<AckResponse>(
      GrvtEndpointType.TRADE_DATA,
      "full/v1/cancel_all_orders",
      request,
      { requiresAuth: true },
    );
    assertSuccessResponse(response);
    return response;
  }

  /**
   * Get an order by ID.
   *
   * @param request - The request parameters.
   * @returns The order.
   *
   * @example
   * ```ts ignore
   * const response = await client.getOrder({
   *   sub_account_id: "123456789",
   *   order_id: "order-id",
   * });
   * console.log(response.result);
   * ```
   */
  async getOrder(request: GetOrderRequest): Promise<GetOrderResponse> {
    const response = await this.transport.request<GetOrderResponse>(
      GrvtEndpointType.TRADE_DATA,
      "full/v1/order",
      request,
      { requiresAuth: true },
    );
    assertSuccessResponse(response);
    return response;
  }

  /**
   * Get open orders.
   *
   * @param request - The request parameters.
   * @returns The open orders.
   *
   * @example
   * ```ts ignore
   * const response = await client.getOpenOrders({
   *   sub_account_id: "123456789",
   * });
   * console.log(response.result);
   * ```
   */
  async getOpenOrders(request: OpenOrdersRequest): Promise<OpenOrdersResponse> {
    const response = await this.transport.request<OpenOrdersResponse>(
      GrvtEndpointType.TRADE_DATA,
      "full/v1/open_orders",
      request,
      { requiresAuth: true },
    );
    assertSuccessResponse(response);
    return response;
  }

  /**
   * Get order history.
   *
   * @param request - The request parameters.
   * @returns The order history.
   *
   * @example
   * ```ts ignore
   * const response = await client.getOrderHistory({
   *   sub_account_id: "123456789",
   *   limit: 100,
   * });
   * console.log(response.result);
   * ```
   */
  async getOrderHistory(request: OrderHistoryRequest): Promise<OrderHistoryResponse> {
    const response = await this.transport.request<OrderHistoryResponse>(
      GrvtEndpointType.TRADE_DATA,
      "full/v1/order_history",
      request,
      { requiresAuth: true },
    );
    assertSuccessResponse(response);
    return response;
  }

  /**
   * Get fill history.
   *
   * @param request - The request parameters.
   * @returns The fill history.
   *
   * @example
   * ```ts ignore
   * const response = await client.getFillHistory({
   *   sub_account_id: "123456789",
   *   limit: 100,
   * });
   * console.log(response.result);
   * ```
   */
  async getFillHistory(request: FillHistoryRequest): Promise<FillHistoryResponse> {
    const response = await this.transport.request<FillHistoryResponse>(
      GrvtEndpointType.TRADE_DATA,
      "full/v1/fill_history",
      request,
      { requiresAuth: true },
    );
    assertSuccessResponse(response);
    return response;
  }

  /**
   * Get positions.
   *
   * @param request - The request parameters.
   * @returns The positions.
   *
   * @example
   * ```ts ignore
   * const response = await client.getPositions({
   *   sub_account_id: "123456789",
   * });
   * console.log(response.result);
   * ```
   */
  async getPositions(request: PositionsRequest): Promise<PositionsResponse> {
    const response = await this.transport.request<PositionsResponse>(
      GrvtEndpointType.TRADE_DATA,
      "full/v1/positions",
      request,
      { requiresAuth: true },
    );
    assertSuccessResponse(response);
    return response;
  }

  // =============================================================
  // Account Methods (Authenticated)
  // =============================================================

  /**
   * Get sub account summary.
   *
   * @param request - The request parameters.
   * @returns The sub account summary.
   *
   * @example
   * ```ts ignore
   * const response = await client.getSubAccountSummary({
   *   sub_account_id: "123456789",
   * });
   * console.log(response.result);
   * ```
   */
  async getSubAccountSummary(request: SubAccountSummaryRequest): Promise<SubAccountSummaryResponse> {
    const response = await this.transport.request<SubAccountSummaryResponse>(
      GrvtEndpointType.TRADE_DATA,
      "full/v1/account_summary",
      request,
      { requiresAuth: true },
    );
    assertSuccessResponse(response);
    return response;
  }

  /**
   * Get sub account history.
   *
   * @param request - The request parameters.
   * @returns The sub account history.
   *
   * @example
   * ```ts ignore
   * const response = await client.getSubAccountHistory({
   *   sub_account_id: "123456789",
   *   limit: 100,
   * });
   * console.log(response.result);
   * ```
   */
  async getSubAccountHistory(request: SubAccountHistoryRequest): Promise<SubAccountHistoryResponse> {
    const response = await this.transport.request<SubAccountHistoryResponse>(
      GrvtEndpointType.TRADE_DATA,
      "full/v1/account_history",
      request,
      { requiresAuth: true },
    );
    assertSuccessResponse(response);
    return response;
  }

  /**
   * Get aggregated account summary.
   *
   * @param request - The request parameters (empty).
   * @returns The aggregated account summary.
   *
   * @example
   * ```ts ignore
   * const response = await client.getAggregatedAccountSummary({});
   * console.log(response.result);
   * ```
   */
  async getAggregatedAccountSummary(request: EmptyRequest = {}): Promise<AggregatedAccountSummaryResponse> {
    const response = await this.transport.request<AggregatedAccountSummaryResponse>(
      GrvtEndpointType.TRADE_DATA,
      "full/v1/aggregated_account_summary",
      request,
      { requiresAuth: true },
    );
    assertSuccessResponse(response);
    return response;
  }

  /**
   * Get funding account summary.
   *
   * @param request - The request parameters (empty).
   * @returns The funding account summary.
   *
   * @example
   * ```ts ignore
   * const response = await client.getFundingAccountSummary({});
   * console.log(response.result);
   * ```
   */
  async getFundingAccountSummary(request: EmptyRequest = {}): Promise<FundingAccountSummaryResponse> {
    const response = await this.transport.request<FundingAccountSummaryResponse>(
      GrvtEndpointType.TRADE_DATA,
      "full/v1/funding_account_summary",
      request,
      { requiresAuth: true },
    );
    assertSuccessResponse(response);
    return response;
  }

  // =============================================================
  // Transfer Methods (Authenticated)
  // =============================================================

  /**
   * Make a deposit.
   *
   * @param request - The deposit request.
   * @returns Acknowledgment response.
   *
   * @example
   * ```ts ignore
   * const response = await client.deposit({
   *   main_account_id: "main-id",
   *   to_sub_account_id: "123456789",
   *   currency: Currency.USDT,
   *   num_tokens: "1000",
   * });
   * console.log(response.result.ack);
   * ```
   */
  async deposit(request: DepositRequest): Promise<AckResponse> {
    const response = await this.transport.request<AckResponse>(
      GrvtEndpointType.TRADE_DATA,
      "full/v1/deposit",
      request,
      { requiresAuth: true },
    );
    assertSuccessResponse(response);
    return response;
  }

  /**
   * Get deposit history.
   *
   * @param request - The request parameters.
   * @returns The deposit history.
   *
   * @example
   * ```ts ignore
   * const response = await client.getDepositHistory({
   *   limit: 100,
   * });
   * console.log(response.result);
   * ```
   */
  async getDepositHistory(request: DepositHistoryRequest = {}): Promise<DepositHistoryResponse> {
    const response = await this.transport.request<DepositHistoryResponse>(
      GrvtEndpointType.TRADE_DATA,
      "full/v1/deposit_history",
      request,
      { requiresAuth: true },
    );
    assertSuccessResponse(response);
    return response;
  }

  /**
   * Make a transfer between sub accounts.
   *
   * @param request - The transfer request.
   * @returns Acknowledgment response.
   *
   * @example
   * ```ts ignore
   * const response = await client.transfer({
   *   from_sub_account_id: "123456789",
   *   to_sub_account_id: "987654321",
   *   currency: Currency.USDT,
   *   num_tokens: "100",
   * });
   * console.log(response.result.ack);
   * ```
   */
  async transfer(request: TransferRequest): Promise<AckResponse> {
    const response = await this.transport.request<AckResponse>(
      GrvtEndpointType.TRADE_DATA,
      "full/v1/transfer",
      request,
      { requiresAuth: true },
    );
    assertSuccessResponse(response);
    return response;
  }

  /**
   * Get transfer history.
   *
   * @param request - The request parameters.
   * @returns The transfer history.
   *
   * @example
   * ```ts ignore
   * const response = await client.getTransferHistory({
   *   limit: 100,
   * });
   * console.log(response.result);
   * ```
   */
  async getTransferHistory(request: TransferHistoryRequest = {}): Promise<TransferHistoryResponse> {
    const response = await this.transport.request<TransferHistoryResponse>(
      GrvtEndpointType.TRADE_DATA,
      "full/v1/transfer_history",
      request,
      { requiresAuth: true },
    );
    assertSuccessResponse(response);
    return response;
  }

  /**
   * Make a withdrawal.
   *
   * @param request - The withdrawal request.
   * @returns Acknowledgment response.
   *
   * @example
   * ```ts ignore
   * const response = await client.withdrawal({
   *   main_account_id: "main-id",
   *   from_sub_account_id: "123456789",
   *   to_eth_address: "0x...",
   *   currency: Currency.USDT,
   *   num_tokens: "100",
   * });
   * console.log(response.result.ack);
   * ```
   */
  async withdrawal(request: WithdrawalRequest): Promise<AckResponse> {
    const response = await this.transport.request<AckResponse>(
      GrvtEndpointType.TRADE_DATA,
      "full/v1/withdrawal",
      request,
      { requiresAuth: true },
    );
    assertSuccessResponse(response);
    return response;
  }

  /**
   * Get withdrawal history.
   *
   * @param request - The request parameters.
   * @returns The withdrawal history.
   *
   * @example
   * ```ts ignore
   * const response = await client.getWithdrawalHistory({
   *   limit: 100,
   * });
   * console.log(response.result);
   * ```
   */
  async getWithdrawalHistory(request: WithdrawalHistoryRequest = {}): Promise<WithdrawalHistoryResponse> {
    const response = await this.transport.request<WithdrawalHistoryResponse>(
      GrvtEndpointType.TRADE_DATA,
      "full/v1/withdrawal_history",
      request,
      { requiresAuth: true },
    );
    assertSuccessResponse(response);
    return response;
  }
}

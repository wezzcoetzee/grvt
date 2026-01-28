/**
 * GRVT CCXT-Style Client
 *
 * High-level, CCXT-compatible client for the GRVT Exchange.
 */

import { CandlestickType, type GrvtEnv, TimeInForce } from "../types/mod.ts";
import { GrvtRawClient, type GrvtRawClientOptions } from "../raw/mod.ts";
import type {
  Candlestick,
  Fill,
  FundingRate,
  Instrument,
  MiniTicker,
  Order,
  OrderbookLevels,
  Position,
  SubAccount,
  Ticker,
  Trade,
} from "../raw/types.ts";
import {
  buildCreateOrderPayload,
  generateClientOrderId,
  generateExpiration,
  generateNonce,
  type InstrumentInfo,
  PrivateKeySigner,
  type SignedOrder,
  signOrder,
} from "../signing/mod.ts";
import type { AbstractWallet } from "../signing/_abstractWallet.ts";
import {
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
  GrvtInvalidOrder,
  type GrvtOrderSide,
  type GrvtOrderType,
  type Num,
} from "./types.ts";
import { msToNs, parseSymbol } from "./utils.ts";

/** Configuration options for the GrvtClient. */
export interface GrvtClientOptions extends GrvtRawClientOptions {
  /** Trading account ID (sub-account ID) for authenticated operations. */
  tradingAccountId?: string;
  /** Private key for order signing. Can be a hex string or an AbstractWallet. */
  privateKey?: string | AbstractWallet;
  /** Whether to auto-load markets on initialization. Defaults to true. */
  autoLoadMarkets?: boolean;
}

/**
 * GRVT CCXT-Style Client
 *
 * Provides a high-level, CCXT-compatible API for interacting with the GRVT Exchange.
 * This client wraps the raw API and provides:
 * - Automatic market loading
 * - Order validation
 * - Order signing integration
 * - CCXT-compatible method signatures
 *
 * @example
 * ```ts
 * import { GrvtClient, GrvtEnv } from "@wezzcoetzee/grvt";
 *
 * const client = new GrvtClient({
 *   env: GrvtEnv.TESTNET,
 *   apiKey: "your-api-key",
 *   tradingAccountId: "123456789",
 *   privateKey: "0x...",
 * });
 *
 * // Load markets (auto-loaded by default)
 * await client.loadMarkets();
 *
 * // Fetch ticker
 * const ticker = await client.fetchTicker("BTC_USDT_Perp");
 *
 * // Create a limit order
 * const order = await client.createOrder("BTC_USDT_Perp", "limit", "buy", 0.01, 50000);
 * ```
 */
export class GrvtClient {
  /** The underlying raw API client. */
  readonly raw: GrvtRawClient;
  /** The GRVT environment. */
  readonly env: GrvtEnv;
  /** Trading account ID for authenticated operations. */
  readonly tradingAccountId?: string;
  /** Wallet for signing orders. */
  private _wallet?: AbstractWallet;
  /** Loaded markets, keyed by symbol. */
  markets: Map<string, Instrument> = new Map();
  /** Whether markets have been loaded. */
  marketsLoaded = false;

  /**
   * Creates a new GrvtClient instance.
   *
   * @param options - Configuration options.
   */
  constructor(options: GrvtClientOptions) {
    this.raw = new GrvtRawClient(options);
    this.env = this.raw.env;
    this.tradingAccountId = options.tradingAccountId;

    // Set up wallet for signing
    if (options.privateKey) {
      if (typeof options.privateKey === "string") {
        this._wallet = new PrivateKeySigner(options.privateKey);
      } else {
        this._wallet = options.privateKey;
      }
    }
  }

  // =============================================================
  // Initialization
  // =============================================================

  /**
   * Load all markets from the exchange.
   *
   * This fetches all active perpetual instruments and stores them
   * for validation and order signing.
   *
   * @returns A map of symbol to instrument data.
   *
   * @example
   * ```ts ignore
   * const markets = await client.loadMarkets();
   * console.log(markets.get("BTC_USDT_Perp"));
   * ```
   */
  async loadMarkets(): Promise<Map<string, Instrument>> {
    const response = await this.raw.getAllInstruments({ is_active: true });

    this.markets.clear();
    for (const instrument of response.result) {
      this.markets.set(instrument.instrument, instrument);
    }

    this.marketsLoaded = true;
    return this.markets;
  }

  // =============================================================
  // Validation Helpers
  // =============================================================

  /**
   * Check that order arguments are valid.
   */
  private _checkOrderArguments(
    orderType: GrvtOrderType,
    side: GrvtOrderSide,
    amount: Num,
    price: Num | undefined,
  ): void {
    if (orderType !== "limit" && orderType !== "market") {
      throw new GrvtInvalidOrder(`Invalid order type: ${orderType}. Must be 'limit' or 'market'.`);
    }

    if (side !== "buy" && side !== "sell") {
      throw new GrvtInvalidOrder(`Invalid order side: ${side}. Must be 'buy' or 'sell'.`);
    }

    if (orderType === "limit") {
      if (price === undefined || price === null || Number(price) <= 0) {
        throw new GrvtInvalidOrder("Limit orders require a positive price.");
      }
    } else if (orderType === "market") {
      if (price !== undefined && price !== null && Number(price) > 0) {
        throw new GrvtInvalidOrder("Market orders should not have a price.");
      }
    }

    if (!amount || Number(amount) <= 0) {
      throw new GrvtInvalidOrder("Order amount must be greater than 0.");
    }
  }

  /**
   * Check that the trading account is set up for authenticated operations.
   */
  private _checkAccountAuth(): void {
    if (!this.tradingAccountId) {
      throw new GrvtInvalidOrder("This operation requires a trading account ID.");
    }
  }

  /**
   * Check that the symbol is valid (exists in loaded markets).
   */
  private _checkValidSymbol(symbol: string): void {
    if (!this.marketsLoaded) {
      throw new GrvtInvalidOrder("Markets not loaded. Call loadMarkets() first.");
    }

    if (!this.markets.has(symbol)) {
      throw new GrvtInvalidOrder(`Symbol not found: ${symbol}`);
    }
  }

  /**
   * Get instrument info for signing orders.
   */
  private _getInstrumentsForSigning(): Record<string, InstrumentInfo> {
    const instruments: Record<string, InstrumentInfo> = {};
    for (const [symbol, instrument] of this.markets) {
      instruments[symbol] = {
        instrumentHash: instrument.instrument_hash,
        baseDecimals: instrument.base_decimals,
      };
    }
    return instruments;
  }

  // =============================================================
  // Market Data Methods (Public)
  // =============================================================

  /**
   * Fetch all markets from the exchange.
   *
   * @param params - Filter parameters.
   * @returns List of instruments.
   *
   * @example
   * ```ts ignore
   * const markets = await client.fetchMarkets({ kind: Kind.PERPETUAL });
   * ```
   */
  async fetchMarkets(params: FetchMarketsParams = {}): Promise<Instrument[]> {
    const response = await this.raw.getFilteredInstruments({
      kind: params.kind ? [params.kind] : undefined,
      base: params.base ? [params.base] : undefined,
      quote: params.quote ? [params.quote] : undefined,
      limit: params.limit ?? 500,
      is_active: params.isActive ?? true,
    });
    return response.result;
  }

  /**
   * Fetch all markets (no filters).
   *
   * @param isActive - Whether to only fetch active markets.
   * @returns List of instruments.
   */
  async fetchAllMarkets(isActive = true): Promise<Instrument[]> {
    const response = await this.raw.getAllInstruments({ is_active: isActive });
    return response.result;
  }

  /**
   * Fetch a single market by symbol.
   *
   * @param symbol - The instrument symbol.
   * @returns The instrument data.
   */
  async fetchMarket(symbol: string): Promise<Instrument> {
    const response = await this.raw.getInstrument({ instrument: symbol });
    return response.result;
  }

  /**
   * Fetch the ticker for a symbol.
   *
   * @param symbol - The instrument symbol.
   * @returns The ticker data.
   *
   * @example
   * ```ts ignore
   * const ticker = await client.fetchTicker("BTC_USDT_Perp");
   * console.log(ticker.last_price);
   * ```
   */
  async fetchTicker(symbol: string): Promise<Ticker> {
    const response = await this.raw.getTicker({ instrument: symbol });
    return response.result;
  }

  /**
   * Fetch the mini ticker for a symbol.
   *
   * @param symbol - The instrument symbol.
   * @returns The mini ticker data.
   */
  async fetchMiniTicker(symbol: string): Promise<MiniTicker> {
    const response = await this.raw.getMiniTicker({ instrument: symbol });
    return response.result;
  }

  /**
   * Fetch the order book for a symbol.
   *
   * @param symbol - The instrument symbol.
   * @param limit - Order book depth (10, 50, 100, 500). Defaults to 10.
   * @returns The order book data.
   *
   * @example
   * ```ts ignore
   * const orderbook = await client.fetchOrderBook("BTC_USDT_Perp", 10);
   * console.log(orderbook.bids, orderbook.asks);
   * ```
   */
  async fetchOrderBook(symbol: string, limit = 10): Promise<OrderbookLevels> {
    const response = await this.raw.getOrderbookLevels({ instrument: symbol, depth: limit });
    return response.result;
  }

  /**
   * Fetch recent trades for a symbol.
   *
   * @param symbol - The instrument symbol.
   * @param limit - Maximum number of trades. Defaults to 100.
   * @returns List of recent trades.
   */
  async fetchRecentTrades(symbol: string, limit = 100): Promise<Trade[]> {
    const response = await this.raw.getTrades({ instrument: symbol, limit });
    return response.result;
  }

  /**
   * Fetch trade history for a symbol.
   *
   * @param symbol - The instrument symbol.
   * @param since - Fetch trades since this timestamp (ms).
   * @param limit - Maximum number of trades. Defaults to 100.
   * @param params - Additional parameters.
   * @returns Trade history with pagination cursor.
   */
  async fetchTrades(
    symbol: string,
    since?: number,
    limit = 100,
    params: FetchTradesParams = {},
  ): Promise<{ result: Trade[]; next?: string }> {
    const response = await this.raw.getTradeHistory({
      instrument: symbol,
      start_time: since ? msToNs(since) : undefined,
      end_time: params.endTime,
      limit,
      cursor: params.cursor,
    });
    return { result: response.result, next: response.next ?? undefined };
  }

  /**
   * Fetch OHLCV (candlestick) data for a symbol.
   *
   * @param symbol - The instrument symbol.
   * @param timeframe - The timeframe (e.g., "1m", "1h", "1d").
   * @param since - Fetch candles since this timestamp (ms).
   * @param limit - Maximum number of candles. Defaults to 100.
   * @param params - Additional parameters.
   * @returns Candlestick data with pagination cursor.
   *
   * @example
   * ```ts ignore
   * const candles = await client.fetchOHLCV("BTC_USDT_Perp", "1h", undefined, 100);
   * ```
   */
  async fetchOHLCV(
    symbol: string,
    timeframe?: CCXTInterval,
    since?: number,
    limit?: number,
    params: FetchOHLCVParams = {},
  ): Promise<{ result: Candlestick[]; next?: string }> {
    const effectiveTimeframe = timeframe ?? "1h";
    const effectiveLimit = limit ?? 100;
    const interval = CCXT_INTERVAL_MAP[effectiveTimeframe];
    if (!interval) {
      throw new GrvtInvalidOrder(`Invalid timeframe: ${effectiveTimeframe}`);
    }

    const response = await this.raw.getCandlestick({
      instrument: symbol,
      interval,
      type: params.candleType ?? CandlestickType.TRADE,
      start_time: since ? msToNs(since) : undefined,
      end_time: params.endTime,
      limit: effectiveLimit,
      cursor: params.cursor,
    });
    return { result: response.result, next: response.next ?? undefined };
  }

  /**
   * Fetch funding rate history for a symbol.
   *
   * @param symbol - The instrument symbol.
   * @param since - Fetch funding rates since this timestamp (ms).
   * @param limit - Maximum number of entries. Defaults to 100.
   * @param params - Additional parameters.
   * @returns Funding rate history with pagination cursor.
   */
  async fetchFundingRateHistory(
    symbol: string,
    since?: number,
    limit = 100,
    params: FetchFundingRateHistoryParams = {},
  ): Promise<{ result: FundingRate[]; next?: string }> {
    const response = await this.raw.getFundingRate({
      instrument: symbol,
      start_time: since ? msToNs(since) : undefined,
      end_time: params.endTime,
      limit,
      cursor: params.cursor,
    });
    return { result: response.result, next: response.next ?? undefined };
  }

  // =============================================================
  // Trading Methods (Authenticated)
  // =============================================================

  /**
   * Create an order.
   *
   * @param symbol - The instrument symbol.
   * @param orderType - Order type ("limit" or "market").
   * @param side - Order side ("buy" or "sell").
   * @param amount - Order amount in base currency.
   * @param price - Limit price (required for limit orders).
   * @param params - Additional order parameters.
   * @returns The created order.
   *
   * @example
   * ```ts ignore
   * const order = await client.createOrder(
   *   "BTC_USDT_Perp",
   *   "limit",
   *   "buy",
   *   0.01,
   *   50000,
   *   { post_only: true }
   * );
   * ```
   */
  async createOrder(
    symbol: string,
    orderType: GrvtOrderType,
    side: GrvtOrderSide,
    amount: Num,
    price?: Num,
    params: CreateOrderParams = {},
  ): Promise<Order> {
    this._checkAccountAuth();
    this._checkValidSymbol(symbol);
    this._checkOrderArguments(orderType, side, amount, price);

    if (!this._wallet) {
      throw new GrvtInvalidOrder("Private key required for creating orders.");
    }

    // Determine time in force
    let timeInForce: TimeInForce;
    switch (params.timeInForce) {
      case "ALL_OR_NONE":
        timeInForce = TimeInForce.ALL_OR_NONE;
        break;
      case "IMMEDIATE_OR_CANCEL":
        timeInForce = TimeInForce.IMMEDIATE_OR_CANCEL;
        break;
      case "FILL_OR_KILL":
        timeInForce = TimeInForce.FILL_OR_KILL;
        break;
      default:
        timeInForce = TimeInForce.GOOD_TILL_TIME;
    }

    // Calculate expiration
    const durationSecs = params.orderDurationSecs ?? 24 * 60 * 60; // Default 24 hours
    const expiration = generateExpiration(durationSecs * 1000);

    // Sign the order
    const signedOrder: SignedOrder = await signOrder({
      wallet: this._wallet,
      env: this.env,
      order: {
        subAccountId: this.tradingAccountId!,
        isMarket: orderType === "market",
        timeInForce,
        postOnly: params.postOnly,
        reduceOnly: params.reduceOnly,
        legs: [{
          instrument: symbol,
          size: String(amount),
          isBuyingAsset: side === "buy",
          limitPrice: price ? String(price) : "0",
        }],
        nonce: generateNonce(),
        expiration,
      },
      instruments: this._getInstrumentsForSigning(),
      clientOrderId: params.clientOrderId ?? generateClientOrderId(),
    });

    // Build payload and submit
    const payload = buildCreateOrderPayload(signedOrder);
    const response = await this.raw.createOrder(payload);
    return response.result;
  }

  /**
   * Create a limit order.
   *
   * @param symbol - The instrument symbol.
   * @param side - Order side ("buy" or "sell").
   * @param amount - Order amount in base currency.
   * @param price - Limit price.
   * @param params - Additional order parameters.
   * @returns The created order.
   */
  createLimitOrder(
    symbol: string,
    side: GrvtOrderSide,
    amount: Num,
    price: Num,
    params: CreateOrderParams = {},
  ): Promise<Order> {
    return this.createOrder(symbol, "limit", side, amount, price, params);
  }

  /**
   * Create a market order.
   *
   * @param symbol - The instrument symbol.
   * @param side - Order side ("buy" or "sell").
   * @param amount - Order amount in base currency.
   * @param params - Additional order parameters.
   * @returns The created order.
   */
  createMarketOrder(
    symbol: string,
    side: GrvtOrderSide,
    amount: Num,
    params: CreateOrderParams = {},
  ): Promise<Order> {
    return this.createOrder(symbol, "market", side, amount, undefined, params);
  }

  /**
   * Cancel an order.
   *
   * @param id - The order ID (or undefined if using client_order_id in params).
   * @param symbol - The instrument symbol (optional, not used).
   * @param params - Additional parameters (can include client_order_id).
   * @returns True if the cancel was acknowledged.
   */
  async cancelOrder(
    id?: string,
    _symbol?: string,
    params: CancelOrderParams = {},
  ): Promise<boolean> {
    this._checkAccountAuth();

    if (!id && !params.clientOrderId) {
      throw new GrvtInvalidOrder("Cancel order requires either order_id or client_order_id.");
    }

    const response = await this.raw.cancelOrder({
      sub_account_id: this.tradingAccountId!,
      order_id: id,
      client_order_id: params.clientOrderId,
    });

    return response.result?.ack ?? false;
  }

  /**
   * Cancel all orders.
   *
   * @param symbol - Filter by symbol (optional).
   * @returns True if the cancel was acknowledged.
   */
  async cancelAllOrders(symbol?: string): Promise<boolean> {
    this._checkAccountAuth();

    const response = await this.raw.cancelAllOrders({
      sub_account_id: this.tradingAccountId!,
      instrument: symbol,
    });

    return response.result?.ack ?? false;
  }

  /**
   * Fetch an order by ID.
   *
   * @param id - The order ID (or undefined if using client_order_id in params).
   * @param symbol - The instrument symbol (optional, not used).
   * @param params - Additional parameters (can include client_order_id).
   * @returns The order.
   */
  async fetchOrder(
    id?: string,
    _symbol?: string,
    params: CancelOrderParams = {},
  ): Promise<Order> {
    this._checkAccountAuth();

    if (!id && !params.clientOrderId) {
      throw new GrvtInvalidOrder("Fetch order requires either order_id or client_order_id.");
    }

    const response = await this.raw.getOrder({
      sub_account_id: this.tradingAccountId!,
      order_id: id,
      client_order_id: params.clientOrderId,
    });

    return response.result;
  }

  /**
   * Fetch open orders.
   *
   * @param symbol - Filter by symbol (optional).
   * @param since - Not used (for CCXT compatibility).
   * @param limit - Not used (for CCXT compatibility).
   * @param params - Additional filter parameters.
   * @returns List of open orders.
   */
  async fetchOpenOrders(
    symbol?: string,
    _since?: number,
    _limit?: number,
    params: FetchOpenOrdersParams = {},
  ): Promise<Order[]> {
    this._checkAccountAuth();

    let kind = params.kind ? [params.kind] : undefined;
    let base = params.base ? [params.base] : undefined;
    let quote = params.quote ? [params.quote] : undefined;

    // If symbol is provided, parse it to get kind, base, quote
    if (symbol) {
      const parsed = parseSymbol(symbol);
      kind = [parsed.kind];
      base = [parsed.base];
      quote = [parsed.quote];
    }

    const response = await this.raw.getOpenOrders({
      sub_account_id: this.tradingAccountId!,
      kind,
      base,
      quote,
    });

    let orders = response.result;

    // Filter by exact symbol if provided
    if (symbol) {
      orders = orders.filter((o) => o.legs?.[0]?.instrument === symbol);
    }

    return orders;
  }

  /**
   * Fetch order history.
   *
   * @param params - Filter and pagination parameters.
   * @returns Order history with pagination cursor.
   */
  async fetchOrderHistory(
    params: FetchOrderHistoryParams = {},
  ): Promise<{ result: Order[]; next: string }> {
    this._checkAccountAuth();

    const response = await this.raw.getOrderHistory({
      sub_account_id: this.tradingAccountId!,
      kind: params.kind ? [params.kind] : undefined,
      base: params.base ? [params.base] : undefined,
      quote: params.quote ? [params.quote] : undefined,
      limit: params.limit,
      cursor: params.cursor,
    });

    return { result: response.result, next: response.next };
  }

  // =============================================================
  // Account Methods (Authenticated)
  // =============================================================

  /**
   * Fetch positions.
   *
   * @param symbols - Filter by symbols (optional).
   * @param params - Additional filter parameters.
   * @returns List of positions.
   *
   * @example
   * ```ts ignore
   * const positions = await client.fetchPositions(["BTC_USDT_Perp"]);
   * ```
   */
  async fetchPositions(
    symbols: string[] = [],
    params: FetchPositionsParams = {},
  ): Promise<Position[]> {
    this._checkAccountAuth();

    let kind = params.kind ? [params.kind] : undefined;
    let base = params.base ? [params.base] : undefined;
    let quote = params.quote ? [params.quote] : undefined;

    // If symbols are provided, parse them to get kind, base, quote
    if (symbols.length > 0) {
      const kinds = new Set<string>();
      const bases = new Set<string>();
      const quotes = new Set<string>();

      for (const symbol of symbols) {
        const parsed = parseSymbol(symbol);
        kinds.add(parsed.kind);
        bases.add(parsed.base);
        quotes.add(parsed.quote);
      }

      kind = [...kinds] as typeof kind;
      base = [...bases] as typeof base;
      quote = [...quotes] as typeof quote;
    }

    const response = await this.raw.getPositions({
      sub_account_id: this.tradingAccountId!,
      kind,
      base,
      quote,
    });

    let positions = response.result;

    // Filter by exact symbols if provided
    if (symbols.length > 0) {
      positions = positions.filter((p) => symbols.includes(p.instrument));
    }

    return positions;
  }

  /**
   * Fetch my trades (fill history).
   *
   * @param symbol - Filter by symbol (optional).
   * @param since - Fetch trades since this timestamp (ms).
   * @param limit - Maximum number of trades. Defaults to 100.
   * @param params - Additional filter parameters.
   * @returns Fill history with pagination cursor.
   */
  async fetchMyTrades(
    symbol?: string,
    since?: number,
    limit = 100,
    params: FetchMyTradesParams = {},
  ): Promise<{ result: Fill[]; next: string }> {
    this._checkAccountAuth();

    let kind = params.kind ? [params.kind] : undefined;
    let base = params.base ? [params.base] : undefined;
    let quote = params.quote ? [params.quote] : undefined;

    // If symbol is provided, parse it
    if (symbol) {
      const parsed = parseSymbol(symbol);
      kind = [parsed.kind];
      base = [parsed.base];
      quote = [parsed.quote];
    }

    const response = await this.raw.getFillHistory({
      sub_account_id: this.tradingAccountId!,
      kind,
      base,
      quote,
      start_time: since ? msToNs(since) : undefined,
      end_time: params.endTime,
      limit,
      cursor: params.cursor,
    });

    let fills = response.result;

    // Filter by exact symbol if provided
    if (symbol) {
      fills = fills.filter((f) => f.instrument === symbol);
    }

    return { result: fills, next: response.next };
  }

  /**
   * Get account summary.
   *
   * @param type - Type of summary ("sub-account", "funding", or "aggregated").
   * @returns The account summary.
   */
  async getAccountSummary(
    type: "sub-account" | "funding" | "aggregated",
  ): Promise<SubAccount | { main_account_id: string; total_equity: string; spot_balances: unknown[] }> {
    this._checkAccountAuth();

    if (type === "sub-account") {
      const response = await this.raw.getSubAccountSummary({
        sub_account_id: this.tradingAccountId!,
      });
      return response.result;
    } else if (type === "funding") {
      const response = await this.raw.getFundingAccountSummary({});
      return response.result;
    } else if (type === "aggregated") {
      const response = await this.raw.getAggregatedAccountSummary({});
      return response.result;
    }

    throw new GrvtInvalidOrder(`Invalid account summary type: ${type}`);
  }

  /**
   * Fetch account history.
   *
   * @param params - Filter and pagination parameters.
   * @returns Account history with pagination cursor.
   */
  async fetchAccountHistory(
    params: FetchAccountHistoryParams = {},
  ): Promise<{ result: SubAccount[]; next: string }> {
    this._checkAccountAuth();

    const response = await this.raw.getSubAccountHistory({
      sub_account_id: this.tradingAccountId!,
      start_time: params.startTime,
      end_time: params.endTime,
      cursor: params.cursor,
    });

    return { result: response.result, next: response.next };
  }
}

# GrvtClient API Reference

High-level CCXT-style client with automatic market loading, order validation, and built-in signing.

## Constructor

```ts
new GrvtClient(options: GrvtClientOptions)
```

### Options

| Option             | Type                       | Required | Default | Description                         |
| ------------------ | -------------------------- | -------- | ------- | ----------------------------------- |
| `env`              | `GrvtEnv`                  | No       | `PROD`  | GRVT environment                    |
| `apiKey`           | `string`                   | No       | -       | API key for authenticated endpoints |
| `tradingAccountId` | `string`                   | No       | -       | Sub-account ID for trading          |
| `privateKey`       | `string \| AbstractWallet` | No       | -       | Private key or wallet for signing   |
| `autoLoadMarkets`  | `boolean`                  | No       | `true`  | Auto-load markets on init           |

### Example

```ts
import { GrvtClient, GrvtEnv } from "@wezzcoetzee/grvt";

const client = new GrvtClient({
  env: GrvtEnv.TESTNET,
  apiKey: "your-api-key",
  tradingAccountId: "123456789",
  privateKey: "0x...",
});

await client.loadMarkets();
```

## Properties

| Property           | Type                      | Description                |
| ------------------ | ------------------------- | -------------------------- |
| `raw`              | `GrvtRawClient`           | Underlying raw client      |
| `env`              | `GrvtEnv`                 | GRVT environment           |
| `tradingAccountId` | `string \| undefined`     | Trading account ID         |
| `markets`          | `Map<string, Instrument>` | Loaded markets             |
| `marketsLoaded`    | `boolean`                 | Whether markets are loaded |

---

## Initialization

### loadMarkets

Load all active markets. Required before placing orders.

```ts
const markets = await client.loadMarkets();
console.log(markets.size); // Number of instruments
```

**Returns:** `Map<string, Instrument>`

---

## Market Data Methods

### fetchMarkets

Fetch markets with filters.

```ts
import { Kind } from "@wezzcoetzee/grvt";

const markets = await client.fetchMarkets({
  kind: Kind.PERPETUAL,
  isActive: true,
  limit: 100,
});
```

| Parameter  | Type       | Description               |
| ---------- | ---------- | ------------------------- |
| `kind`     | `Kind`     | Filter by instrument kind |
| `base`     | `Currency` | Filter by base currency   |
| `quote`    | `Currency` | Filter by quote currency  |
| `isActive` | `boolean`  | Filter by active status   |
| `limit`    | `number`   | Maximum results           |

**Returns:** `Instrument[]`

---

### fetchAllMarkets

Fetch all markets without filters.

```ts
const markets = await client.fetchAllMarkets(true); // isActive
```

**Returns:** `Instrument[]`

---

### fetchMarket

Fetch a single market by symbol.

```ts
const market = await client.fetchMarket("BTC_USDT_Perp");
```

**Returns:** `Instrument`

---

### fetchTicker

Fetch full ticker for a symbol.

```ts
const ticker = await client.fetchTicker("BTC_USDT_Perp");
console.log(ticker.last_price);
console.log(ticker.base_volume);
```

**Returns:** `Ticker`

---

### fetchMiniTicker

Fetch mini ticker for a symbol.

```ts
const mini = await client.fetchMiniTicker("BTC_USDT_Perp");
```

**Returns:** `MiniTicker`

---

### fetchOrderBook

Fetch order book for a symbol.

```ts
const orderbook = await client.fetchOrderBook("BTC_USDT_Perp", 10);
console.log(orderbook.bids);
console.log(orderbook.asks);
```

| Parameter | Type     | Default | Description                        |
| --------- | -------- | ------- | ---------------------------------- |
| `symbol`  | `string` | -       | Instrument symbol                  |
| `limit`   | `number` | `10`    | Orderbook depth (10, 50, 100, 500) |

**Returns:** `OrderbookLevels`

---

### fetchRecentTrades

Fetch recent trades for a symbol.

```ts
const trades = await client.fetchRecentTrades("BTC_USDT_Perp", 100);
```

**Returns:** `Trade[]`

---

### fetchTrades

Fetch trade history with pagination.

```ts
const { result, next } = await client.fetchTrades(
  "BTC_USDT_Perp",
  Date.now() - 3600000, // since (ms)
  100, // limit
  { cursor: nextCursor }, // pagination
);
```

**Returns:** `{ result: Trade[], next?: string }`

---

### fetchOHLCV

Fetch OHLCV (candlestick) data with CCXT-style timeframes.

```ts
const { result, next } = await client.fetchOHLCV(
  "BTC_USDT_Perp",
  "1h", // timeframe
  undefined, // since (ms)
  100, // limit
);
```

| Timeframe | Description |
| --------- | ----------- |
| `1m`      | 1 minute    |
| `3m`      | 3 minutes   |
| `5m`      | 5 minutes   |
| `15m`     | 15 minutes  |
| `30m`     | 30 minutes  |
| `1h`      | 1 hour      |
| `2h`      | 2 hours     |
| `4h`      | 4 hours     |
| `6h`      | 6 hours     |
| `8h`      | 8 hours     |
| `12h`     | 12 hours    |
| `1d`      | 1 day       |
| `3d`      | 3 days      |
| `1w`      | 1 week      |

**Returns:** `{ result: Candlestick[], next?: string }`

---

### fetchFundingRateHistory

Fetch funding rate history.

```ts
const { result, next } = await client.fetchFundingRateHistory(
  "BTC_USDT_Perp",
  Date.now() - 86400000, // since (ms)
  100, // limit
);
```

**Returns:** `{ result: FundingRate[], next?: string }`

---

## Order Methods

### createOrder

Create an order with automatic signing.

```ts
const order = await client.createOrder(
  "BTC_USDT_Perp", // symbol
  "limit", // type: "limit" | "market"
  "buy", // side: "buy" | "sell"
  0.01, // amount
  50000, // price (required for limit)
  {
    postOnly: true,
    reduceOnly: false,
    timeInForce: "GOOD_TILL_TIME",
    orderDurationSecs: 3600,
    clientOrderId: "my-order-1",
  },
);
```

#### Parameters

| Parameter                  | Type                  | Required  | Description                     |
| -------------------------- | --------------------- | --------- | ------------------------------- |
| `symbol`                   | `string`              | Yes       | Instrument symbol               |
| `orderType`                | `"limit" \| "market"` | Yes       | Order type                      |
| `side`                     | `"buy" \| "sell"`     | Yes       | Order side                      |
| `amount`                   | `number \| string`    | Yes       | Order amount                    |
| `price`                    | `number \| string`    | For limit | Limit price                     |
| `params.postOnly`          | `boolean`             | No        | Post-only flag                  |
| `params.reduceOnly`        | `boolean`             | No        | Reduce-only flag                |
| `params.timeInForce`       | `string`              | No        | Time in force                   |
| `params.orderDurationSecs` | `number`              | No        | Order duration (default: 86400) |
| `params.clientOrderId`     | `string`              | No        | Custom order ID                 |

#### Time In Force Values

| Value                 | Description                              |
| --------------------- | ---------------------------------------- |
| `GOOD_TILL_TIME`      | Remains open until cancelled or expired  |
| `ALL_OR_NONE`         | Fill entire order or none (block trades) |
| `IMMEDIATE_OR_CANCEL` | Fill what's possible, cancel rest        |
| `FILL_OR_KILL`        | Fill entire order immediately or cancel  |

**Returns:** `Order`

**Throws:** `GrvtInvalidOrder` on validation failure

---

### createLimitOrder

Convenience method for limit orders.

```ts
const order = await client.createLimitOrder(
  "BTC_USDT_Perp",
  "buy",
  0.01,
  50000,
  { postOnly: true },
);
```

**Returns:** `Order`

---

### createMarketOrder

Convenience method for market orders.

```ts
const order = await client.createMarketOrder(
  "BTC_USDT_Perp",
  "sell",
  0.01,
);
```

**Returns:** `Order`

---

### cancelOrder

Cancel an order by ID.

```ts
const success = await client.cancelOrder("order-id");

// Or by client order ID
const success = await client.cancelOrder(undefined, undefined, {
  clientOrderId: "my-order-1",
});
```

**Returns:** `boolean`

---

### cancelAllOrders

Cancel all orders, optionally filtered by symbol.

```ts
const success = await client.cancelAllOrders("BTC_USDT_Perp");
```

**Returns:** `boolean`

---

### fetchOrder

Fetch an order by ID.

```ts
const order = await client.fetchOrder("order-id");
```

**Returns:** `Order`

---

### fetchOpenOrders

Fetch open orders.

```ts
const orders = await client.fetchOpenOrders("BTC_USDT_Perp");
```

| Parameter      | Type       | Description      |
| -------------- | ---------- | ---------------- |
| `symbol`       | `string`   | Filter by symbol |
| `params.kind`  | `Kind`     | Filter by kind   |
| `params.base`  | `Currency` | Filter by base   |
| `params.quote` | `Currency` | Filter by quote  |

**Returns:** `Order[]`

---

### fetchOrderHistory

Fetch order history with pagination.

```ts
const { result, next } = await client.fetchOrderHistory({
  limit: 100,
  cursor: nextCursor,
});
```

**Returns:** `{ result: Order[], next: string }`

---

## Account Methods

### fetchPositions

Fetch positions.

```ts
const positions = await client.fetchPositions(["BTC_USDT_Perp"]);
```

| Parameter      | Type       | Description       |
| -------------- | ---------- | ----------------- |
| `symbols`      | `string[]` | Filter by symbols |
| `params.kind`  | `Kind`     | Filter by kind    |
| `params.base`  | `Currency` | Filter by base    |
| `params.quote` | `Currency` | Filter by quote   |

**Returns:** `Position[]`

---

### fetchMyTrades

Fetch fill history (my trades).

```ts
const { result, next } = await client.fetchMyTrades(
  "BTC_USDT_Perp",
  Date.now() - 86400000, // since (ms)
  100, // limit
);
```

**Returns:** `{ result: Fill[], next: string }`

---

### getAccountSummary

Get account summary.

```ts
// Sub-account summary
const summary = await client.getAccountSummary("sub-account");

// Funding account summary
const funding = await client.getAccountSummary("funding");

// Aggregated across all sub-accounts
const aggregated = await client.getAccountSummary("aggregated");
```

| Type            | Description                        |
| --------------- | ---------------------------------- |
| `"sub-account"` | Current sub-account summary        |
| `"funding"`     | Funding account summary            |
| `"aggregated"`  | Aggregated across all sub-accounts |

**Returns:** `SubAccount` or funding summary object

---

### fetchAccountHistory

Fetch account history with pagination.

```ts
const { result, next } = await client.fetchAccountHistory({
  startTime: "1704067200000000000", // nanoseconds
  cursor: nextCursor,
});
```

**Returns:** `{ result: SubAccount[], next: string }`

---

## Utility Properties

### raw

Access the underlying `GrvtRawClient`:

```ts
// Use raw client for methods not in GrvtClient
const response = await client.raw.getTradeHistory({
  instrument: "BTC_USDT_Perp",
  limit: 100,
});
```

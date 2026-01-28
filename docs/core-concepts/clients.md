# Clients

The SDK provides two client classes that wrap the transports with typed methods and convenience features.

## Client Comparison

| Feature        | `GrvtRawClient`        | `GrvtClient`                |
| -------------- | ---------------------- | --------------------------- |
| API Style      | Low-level, direct      | CCXT-compatible, high-level |
| Method Names   | `getOpenOrders`        | `fetchOpenOrders`           |
| Order Signing  | Manual                 | Automatic                   |
| Market Loading | Manual                 | Automatic validation        |
| Best For       | Custom implementations | Trading bots, familiar API  |

## GrvtRawClient

Low-level client providing direct access to all GRVT API endpoints with typed requests and responses.

### Initialization

```ts
import { GrvtEnv, GrvtRawClient } from "@wezzcoetzee/grvt";

const client = new GrvtRawClient({
  env: GrvtEnv.TESTNET,
  apiKey: "your-api-key", // Required for authenticated endpoints
});
```

### Options

| Option      | Type                | Default | Description                        |
| ----------- | ------------------- | ------- | ---------------------------------- |
| `env`       | `GrvtEnv`           | `PROD`  | GRVT environment                   |
| `apiKey`    | `string`            | -       | API key for authenticated requests |
| `timeout`   | `number \| null`    | `10000` | Request timeout in ms              |
| `transport` | `IRequestTransport` | -       | Custom transport instance          |

### Usage Example

```ts
// Market data (no auth)
const instruments = await client.getAllInstruments({ is_active: true });
const ticker = await client.getTicker({ instrument: "BTC_USDT_Perp" });
const orderbook = await client.getOrderbookLevels({
  instrument: "BTC_USDT_Perp",
  depth: 10,
});

// Trading (requires auth)
const positions = await client.getPositions({
  sub_account_id: "123456789",
});

const openOrders = await client.getOpenOrders({
  sub_account_id: "123456789",
});
```

### Available Methods

See [GrvtRawClient API Reference](../api-reference/raw-client.md) for the complete method list.

## GrvtClient

High-level CCXT-style client with automatic market loading, order validation, and built-in signing.

### Initialization

```ts
import { GrvtClient, GrvtEnv } from "@wezzcoetzee/grvt";

const client = new GrvtClient({
  env: GrvtEnv.TESTNET,
  apiKey: "your-api-key",
  tradingAccountId: "123456789",
  privateKey: "0x...",
});

// Load markets before trading
await client.loadMarkets();
```

### Options

| Option             | Type                       | Default | Description                        |
| ------------------ | -------------------------- | ------- | ---------------------------------- |
| `env`              | `GrvtEnv`                  | `PROD`  | GRVT environment                   |
| `apiKey`           | `string`                   | -       | API key for authenticated requests |
| `tradingAccountId` | `string`                   | -       | Sub-account ID for trading         |
| `privateKey`       | `string \| AbstractWallet` | -       | Private key or wallet for signing  |
| `autoLoadMarkets`  | `boolean`                  | `true`  | Auto-load markets on init          |

### Market Loading

Markets must be loaded before placing orders. This fetches instrument data required for order signing:

```ts
// Load all active markets
await client.loadMarkets();

// Access loaded markets
const btcPerp = client.markets.get("BTC_USDT_Perp");
console.log(btcPerp.instrument_hash);
```

### Order Methods

```ts
// Generic order creation
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

// Convenience methods
const limitOrder = await client.createLimitOrder(
  "BTC_USDT_Perp",
  "buy",
  0.01,
  50000,
);

const marketOrder = await client.createMarketOrder(
  "BTC_USDT_Perp",
  "sell",
  0.01,
);

// Cancel orders
await client.cancelOrder(order.order_id);
await client.cancelAllOrders("BTC_USDT_Perp"); // Optional symbol filter
```

### Market Data Methods

```ts
// Fetch methods return typed data
const ticker = await client.fetchTicker("BTC_USDT_Perp");
const orderbook = await client.fetchOrderBook("BTC_USDT_Perp", 10);
const trades = await client.fetchRecentTrades("BTC_USDT_Perp", 100);

// OHLCV with CCXT-style timeframes
const candles = await client.fetchOHLCV(
  "BTC_USDT_Perp",
  "1h", // timeframe
  undefined, // since (timestamp)
  100, // limit
);

// Funding rate history
const funding = await client.fetchFundingRateHistory("BTC_USDT_Perp");
```

### Account Methods

```ts
// Positions
const positions = await client.fetchPositions(["BTC_USDT_Perp"]);

// Orders
const openOrders = await client.fetchOpenOrders("BTC_USDT_Perp");
const orderHistory = await client.fetchOrderHistory({ limit: 100 });

// Fills (my trades)
const fills = await client.fetchMyTrades("BTC_USDT_Perp");

// Account summary
const summary = await client.getAccountSummary("sub-account");
```

### Available Methods

See [GrvtClient API Reference](../api-reference/ccxt-client.md) for the complete method list.

## Custom Transport

Both clients accept a custom transport for advanced use cases:

```ts
import { GrvtEnv, GrvtRawClient, HttpTransport } from "@wezzcoetzee/grvt";

const customTransport = new HttpTransport({
  env: GrvtEnv.TESTNET,
  timeout: 30000,
  debug: true,
  fetchOptions: {
    headers: {
      "X-Custom-Header": "value",
    },
  },
});

const client = new GrvtRawClient({
  env: GrvtEnv.TESTNET,
  transport: customTransport,
});
```

## Accessing the Raw Client

`GrvtClient` exposes its underlying `GrvtRawClient`:

```ts
const client = new GrvtClient({ ... });

// Access raw client for direct API calls
const response = await client.raw.getTradeHistory({
  instrument: "BTC_USDT_Perp",
  limit: 100,
});
```

## Next Steps

- [Error Handling](./error-handling.md) - Handle errors gracefully
- [Raw Client API](../api-reference/raw-client.md) - Complete method reference
- [CCXT Client API](../api-reference/ccxt-client.md) - Complete method reference

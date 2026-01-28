# Transports

Transports handle communication with the GRVT API. The SDK provides two transport types:

| Transport            | Protocol  | Use Case                    |
| -------------------- | --------- | --------------------------- |
| `HttpTransport`      | HTTP POST | Request/response operations |
| `WebSocketTransport` | WebSocket | Real-time subscriptions     |

## HttpTransport

The HTTP transport is used for all request/response operations: fetching data, placing orders, managing positions.

### Basic Usage

```ts
import { GrvtEndpointType, GrvtEnv, HttpTransport } from "@wezzcoetzee/grvt";

const transport = new HttpTransport({
  env: GrvtEnv.TESTNET,
});

// Make a request
const response = await transport.request<{ result: any[] }>(
  GrvtEndpointType.MARKET_DATA,
  "full/v1/all_instruments",
  { is_active: true },
);
```

### Configuration Options

| Option         | Type                                        | Default | Description                                    |
| -------------- | ------------------------------------------- | ------- | ---------------------------------------------- |
| `env`          | `GrvtEnv`                                   | `PROD`  | GRVT environment                               |
| `timeout`      | `number \| null`                            | `10000` | Request timeout in ms. `null` disables timeout |
| `apiKey`       | `string`                                    | -       | API key for authenticated requests             |
| `endpoints`    | `Partial<Record<GrvtEndpointType, string>>` | -       | Custom endpoint URLs                           |
| `fetchOptions` | `RequestInit`                               | -       | Custom fetch options merged with requests      |
| `debug`        | `boolean`                                   | `false` | Enable debug logging                           |

### Authentication

Authenticated endpoints require an API key. The transport handles cookie-based authentication automatically:

```ts
const transport = new HttpTransport({
  env: GrvtEnv.TESTNET,
  apiKey: "your-api-key",
});

// Authenticated request
const response = await transport.request(
  GrvtEndpointType.TRADE_DATA,
  "full/v1/positions",
  { sub_account_id: "123456" },
  { requiresAuth: true },
);
```

The transport:

1. Exchanges the API key for a session cookie on first authenticated request
2. Caches the cookie and refreshes it automatically before expiration
3. Includes the cookie in subsequent authenticated requests

### Endpoint Types

| Type          | Description                      | Authentication |
| ------------- | -------------------------------- | -------------- |
| `EDGE`        | Auth, GraphQL                    | No             |
| `MARKET_DATA` | Instruments, tickers, orderbooks | No             |
| `TRADE_DATA`  | Orders, positions, fills         | Yes            |

### Custom Endpoints

Override default endpoint URLs:

```ts
const transport = new HttpTransport({
  env: GrvtEnv.TESTNET,
  endpoints: {
    [GrvtEndpointType.MARKET_DATA]: "https://custom-market-data.example.com",
  },
});
```

## WebSocketTransport

The WebSocket transport provides real-time data subscriptions.

### Basic Usage

```ts
import { GrvtEnv, WebSocketTransport } from "@wezzcoetzee/grvt";

const ws = new WebSocketTransport({
  env: GrvtEnv.TESTNET,
});

// Wait for connection
await ws.ready();

// Subscribe to a stream
const subscription = await ws.subscribe(
  "ticker.s",
  "BTC_USDT_Perp@500",
  (data) => {
    console.log("Received:", data);
  },
);

// Unsubscribe when done
await subscription.unsubscribe();

// Close connection
await ws.close();
```

### Configuration Options

| Option         | Type               | Default       | Description                         |
| -------------- | ------------------ | ------------- | ----------------------------------- |
| `env`          | `GrvtEnv`          | `TESTNET`     | GRVT environment                    |
| `endpointType` | `GrvtEndpointType` | `MARKET_DATA` | Endpoint type                       |
| `url`          | `string \| URL`    | -             | Custom WebSocket URL                |
| `apiKey`       | `string`           | -             | API key for trade data streams      |
| `cookie`       | `string`           | -             | Pre-authenticated session cookie    |
| `timeout`      | `number`           | `10000`       | Subscription timeout in ms          |
| `resubscribe`  | `boolean`          | `true`        | Auto-resubscribe after reconnection |
| `debug`        | `boolean`          | `false`       | Enable debug logging                |

### Stream Types

#### Market Data Streams (No Auth)

| Stream     | Description          | Feed Format                      |
| ---------- | -------------------- | -------------------------------- |
| `mini.s`   | Mini ticker snapshot | `{instrument}@{rate}`            |
| `mini.d`   | Mini ticker delta    | `{instrument}@{rate}`            |
| `ticker.s` | Full ticker snapshot | `{instrument}@{rate}`            |
| `ticker.d` | Full ticker delta    | `{instrument}@{rate}`            |
| `book.s`   | Orderbook snapshot   | `{instrument}@{rate}-{depth}`    |
| `book.d`   | Orderbook delta      | `{instrument}@{rate}-{depth}`    |
| `trade`    | Recent trades        | `{instrument}@{limit}`           |
| `candle`   | Candlestick data     | `{instrument}@{interval}-{type}` |

#### Trade Data Streams (Auth Required)

| Stream       | Description        | Feed Format                                       |
| ------------ | ------------------ | ------------------------------------------------- |
| `order`      | Order updates      | `{subAccountId}` or `{subAccountId}-{instrument}` |
| `state`      | Account state      | `{subAccountId}`                                  |
| `position`   | Position updates   | `{subAccountId}`                                  |
| `fill`       | Fill updates       | `{subAccountId}`                                  |
| `transfer`   | Transfer updates   | `{subAccountId}`                                  |
| `deposit`    | Deposit updates    | `{subAccountId}`                                  |
| `withdrawal` | Withdrawal updates | `{subAccountId}`                                  |

### Feed Builders

Helper functions construct feed strings:

```ts
import {
  buildAccountFeed,
  buildCandleFeed,
  buildOrderbookFeed,
  buildTickerFeed,
  buildTradeFeed,
} from "@wezzcoetzee/grvt";

// Ticker: instrument@rate
buildTickerFeed("BTC_USDT_Perp", "500"); // "BTC_USDT_Perp@500"

// Orderbook: instrument@rate-depth
buildOrderbookFeed("BTC_USDT_Perp", "500", "10"); // "BTC_USDT_Perp@500-10"

// Trades: instrument@limit
buildTradeFeed("BTC_USDT_Perp", "50"); // "BTC_USDT_Perp@50"

// Candles: instrument@interval-type
buildCandleFeed("BTC_USDT_Perp", "CI_1_M", "TRADE"); // "BTC_USDT_Perp@CI_1_M-TRADE"

// Account: subAccountId or subAccountId-instrument
buildAccountFeed("123456789"); // "123456789"
buildAccountFeed("123456789", "BTC_USDT_Perp"); // "123456789-BTC_USDT_Perp"
```

### Trade Data Subscriptions

Trade data streams require authentication:

```ts
const ws = new WebSocketTransport({
  env: GrvtEnv.TESTNET,
  endpointType: GrvtEndpointType.TRADE_DATA,
  apiKey: "your-api-key",
});

await ws.ready();

// Subscribe to order updates
const orderSub = await ws.subscribe(
  "order",
  buildAccountFeed("123456789"),
  (data) => {
    console.log("Order update:", data);
  },
);
```

### Connection Lifecycle

```ts
const ws = new WebSocketTransport({ env: GrvtEnv.TESTNET });

// ready() waits for WebSocket OPEN state
await ws.ready();

// subscribe() sends subscription request and waits for confirmation
const sub = await ws.subscribe("ticker.s", "BTC_USDT_Perp@500", handler);

// unsubscribe() sends unsubscription request
await sub.unsubscribe();

// close() closes the WebSocket connection
await ws.close();
```

### Error Handling

Use the subscription's `failureSignal` to detect failures:

```ts
const subscription = await ws.subscribe("ticker.s", feed, handler);

subscription.failureSignal.addEventListener("abort", (event) => {
  console.error("Subscription failed:", event);
});
```

## Next Steps

- [Clients](./clients.md) - High-level client wrappers
- [Error Handling](./error-handling.md) - Error types and handling

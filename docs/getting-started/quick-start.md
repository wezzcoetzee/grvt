# Quick Start

This guide walks through the basic operations: reading market data, placing orders, and subscribing to real-time
updates.

## Environment Setup

GRVT provides multiple environments for testing and production:

| Environment | Value             | Chain ID | Description                |
| ----------- | ----------------- | -------- | -------------------------- |
| Production  | `GrvtEnv.PROD`    | 325      | Live trading               |
| Testnet     | `GrvtEnv.TESTNET` | 326      | Testing with testnet funds |
| Staging     | `GrvtEnv.STG`     | 328      | Internal staging           |
| Development | `GrvtEnv.DEV`     | 327      | Internal development       |

{% hint style="info" %} Use `GrvtEnv.TESTNET` for development and testing. Switch to `GrvtEnv.PROD` only for production
trading. {% endhint %}

## Reading Market Data

Market data is publicly available without authentication:

```ts
import { GrvtEnv, GrvtRawClient } from "@wezzcoetzee/grvt";

const client = new GrvtRawClient({
  env: GrvtEnv.TESTNET,
});

// Get all active instruments
const instruments = await client.getAllInstruments({ is_active: true });
console.log("Instruments:", instruments.result.map((i) => i.instrument));

// Get ticker for a specific instrument
const ticker = await client.getTicker({ instrument: "BTC_USDT_Perp" });
console.log("Last price:", ticker.result.last_price);
console.log("Mark price:", ticker.result.mark_price);

// Get orderbook
const orderbook = await client.getOrderbookLevels({
  instrument: "BTC_USDT_Perp",
  depth: 10,
});
console.log("Best bid:", orderbook.result.bids[0]);
console.log("Best ask:", orderbook.result.asks[0]);
```

## Placing Orders

Order placement requires authentication via API key and order signing via private key:

{% stepper %} {% step %}

### Get API Key

Generate an API key from your GRVT account dashboard. {% endstep %}

{% step %}

### Initialize Client

```ts
import { GrvtClient, GrvtEnv } from "@wezzcoetzee/grvt";

const client = new GrvtClient({
  env: GrvtEnv.TESTNET,
  apiKey: process.env.GRVT_API_KEY,
  tradingAccountId: process.env.GRVT_TRADING_ACCOUNT_ID,
  privateKey: process.env.GRVT_PRIVATE_KEY,
});
```

{% endstep %}

{% step %}

### Load Markets

Markets must be loaded before placing orders (required for order signing):

```ts
await client.loadMarkets();
```

{% endstep %}

{% step %}

### Place Order

```ts
// Limit buy order
const order = await client.createOrder(
  "BTC_USDT_Perp", // symbol
  "limit", // type
  "buy", // side
  0.01, // amount
  50000, // price
  {
    postOnly: true, // optional: post-only
    orderDurationSecs: 3600, // optional: 1 hour expiry
  },
);
console.log("Order ID:", order.order_id);
```

{% endstep %} {% endstepper %}

## WebSocket Subscriptions

For real-time data, use the WebSocket transport (available on production):

```ts
import { buildOrderbookFeed, buildTickerFeed, GrvtEnv, WebSocketTransport } from "@wezzcoetzee/grvt";

const ws = new WebSocketTransport({
  env: GrvtEnv.PROD, // Note: WebSocket streams require production environment
});

// Wait for connection
await ws.ready();

// Subscribe to ticker updates (every 500ms)
const tickerSub = await ws.subscribe(
  "ticker.s",
  buildTickerFeed("BTC_USDT_Perp", "500"),
  (data) => {
    console.log("Ticker:", data.last_price);
  },
);

// Subscribe to orderbook snapshots (depth 10, every 500ms)
const bookSub = await ws.subscribe(
  "book.s",
  buildOrderbookFeed("BTC_USDT_Perp", "500", "10"),
  (data) => {
    console.log("Orderbook:", data);
  },
);

// Unsubscribe and close when done
await tickerSub.unsubscribe();
await bookSub.unsubscribe();
await ws.close();
```

{% hint style="warning" %} WebSocket streams may not be available on all environments. Use `GrvtEnv.PROD` for guaranteed
stream availability. {% endhint %}

## Complete Example

Here's a complete example combining market data, order placement, and position monitoring:

```ts
import { GrvtClient, GrvtEnv } from "@wezzcoetzee/grvt";

async function main() {
  const client = new GrvtClient({
    env: GrvtEnv.TESTNET,
    apiKey: process.env.GRVT_API_KEY!,
    tradingAccountId: process.env.GRVT_TRADING_ACCOUNT_ID!,
    privateKey: process.env.GRVT_PRIVATE_KEY!,
  });

  // Load markets
  await client.loadMarkets();

  // Check current positions
  const positions = await client.fetchPositions(["BTC_USDT_Perp"]);
  console.log("Current positions:", positions);

  // Get current price
  const ticker = await client.fetchTicker("BTC_USDT_Perp");
  const currentPrice = parseFloat(ticker.last_price);
  console.log("Current price:", currentPrice);

  // Place a limit buy below current price
  const buyPrice = Math.floor(currentPrice * 0.99);
  const order = await client.createOrder(
    "BTC_USDT_Perp",
    "limit",
    "buy",
    0.01,
    buyPrice,
  );
  console.log("Order placed:", order.order_id);

  // Check open orders
  const openOrders = await client.fetchOpenOrders("BTC_USDT_Perp");
  console.log("Open orders:", openOrders.length);

  // Cancel the order
  await client.cancelOrder(order.order_id);
  console.log("Order cancelled");
}

main().catch(console.error);
```

## Next Steps

- [Transports](../core-concepts/transports.md) - Learn about HTTP and WebSocket transports
- [Clients](../core-concepts/clients.md) - Understand the different client types
- [API Reference](../api-reference/raw-client.md) - Full method documentation

# FAQ

## General

### What environments are available?

| Environment       | Use Case                |
| ----------------- | ----------------------- |
| `GrvtEnv.TESTNET` | Development and testing |
| `GrvtEnv.PROD`    | Live trading            |
| `GrvtEnv.STG`     | Internal staging        |
| `GrvtEnv.DEV`     | Internal development    |

Use `TESTNET` for all development and testing. Switch to `PROD` only for production deployments with real funds.

### Which client should I use?

| Client          | Best For                                          |
| --------------- | ------------------------------------------------- |
| `GrvtClient`    | Trading bots, CCXT familiarity, automatic signing |
| `GrvtRawClient` | Custom implementations, direct API access         |
| `HttpTransport` | Maximum control, minimal bundle size              |

### What's the difference between GrvtClient and GrvtRawClient?

`GrvtRawClient` provides direct access to the API with typed methods. You handle signing manually.

`GrvtClient` wraps `GrvtRawClient` with:

- Automatic market loading
- Order validation
- Built-in order signing
- CCXT-compatible method names

---

## Authentication

### How do I get an API key?

Generate an API key from your GRVT account dashboard. Keep it secure and never commit it to version control.

### What's the difference between API key and private key?

| Credential  | Purpose                                               |
| ----------- | ----------------------------------------------------- |
| API Key     | Authenticates API requests (read data, submit orders) |
| Private Key | Signs orders cryptographically (EIP-712)              |

Both are required for trading. Only the API key is needed for reading data.

### Why do I need to sign orders?

GRVT uses EIP-712 typed data signing for order integrity. This ensures:

- Orders can't be tampered with
- Only the account owner can place orders
- Orders are tied to a specific chain ID

---

## Orders

### Why do I get "Markets not loaded"?

Call `loadMarkets()` before placing orders:

```ts
const client = new GrvtClient({ ... });
await client.loadMarkets();  // Required!
await client.createOrder(...);
```

### Why do I get "Invalid order type"?

Order types must be exactly `"limit"` or `"market"`:

```ts
// Correct
await client.createOrder("BTC_USDT_Perp", "limit", "buy", 0.01, 50000);

// Wrong
await client.createOrder("BTC_USDT_Perp", "LIMIT", "buy", 0.01, 50000);
```

### How do I place a market order?

```ts
// Don't provide a price
await client.createOrder("BTC_USDT_Perp", "market", "buy", 0.01);

// Or use convenience method
await client.createMarketOrder("BTC_USDT_Perp", "buy", 0.01);
```

### How do I cancel an order?

```ts
// By order ID
await client.cancelOrder("order-id");

// By client order ID
await client.cancelOrder(undefined, undefined, { clientOrderId: "my-order" });

// Cancel all
await client.cancelAllOrders();
await client.cancelAllOrders("BTC_USDT_Perp"); // Filter by symbol
```

---

## WebSocket

### How do I subscribe to real-time data?

```ts
import { buildTickerFeed, WebSocketTransport } from "@wezzcoetzee/grvt";

const ws = new WebSocketTransport({ env: GrvtEnv.TESTNET });
await ws.ready();

const sub = await ws.subscribe(
  "ticker.s",
  buildTickerFeed("BTC_USDT_Perp", "500"),
  (data) => console.log(data),
);

// Later
await sub.unsubscribe();
await ws.close();
```

### Why did my subscription stop working?

Check the `failureSignal`:

```ts
sub.failureSignal.addEventListener("abort", (event) => {
  console.error("Subscription failed:", event);
  // Reconnect logic here
});
```

### How do I reconnect automatically?

The transport has `resubscribe: true` by default, but you need to handle reconnection yourself:

```ts
async function connectWithReconnect() {
  while (true) {
    try {
      const ws = new WebSocketTransport({ env: GrvtEnv.TESTNET });
      await ws.ready();

      const sub = await ws.subscribe(...);

      // Wait for failure
      await new Promise((_, reject) => {
        sub.failureSignal.addEventListener("abort", reject);
      });
    } catch (error) {
      console.error("Reconnecting...");
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}
```

---

## Errors

### What does "Insufficient margin" mean?

Your account doesn't have enough collateral for the order. Check:

- Account balance
- Existing positions
- Order size

### What does "Symbol not found" mean?

The symbol isn't in your loaded markets. Either:

- The symbol is misspelled
- The instrument is inactive
- Markets weren't loaded

```ts
await client.loadMarkets();
console.log(client.markets.has("BTC_USDT_Perp")); // true/false
```

### How do I handle rate limits?

The SDK doesn't handle rate limits automatically. Implement backoff:

```ts
async function withBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429) {
        await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
        continue;
      }
      throw error;
    }
  }
}
```

---

## TypeScript

### Why are types missing?

Make sure you're importing from the correct path:

```ts
// Types
import { GrvtEnv, TimeInForce } from "@wezzcoetzee/grvt/types";

// Or from main
import { GrvtEnv, TimeInForce } from "@wezzcoetzee/grvt";
```

### How do I type WebSocket data?

```ts
interface TickerData {
  last_price: string;
  base_volume: string;
  // ...
}

await ws.subscribe<TickerData>("ticker.s", feed, (data) => {
  console.log(data.last_price); // Typed!
});
```

---

## Platform-Specific

### Does it work in browsers?

Yes, with a bundler (Vite, webpack, esbuild). WebSocket and fetch are native browser APIs.

### Does it work in Node.js?

Yes, Node.js 18+ has native fetch and WebSocket support.

### Does it work in Deno?

Yes, Deno is the primary development target. Use JSR imports:

```ts
import { GrvtClient } from "jsr:@wezzcoetzee/grvt";
```

### Does it work in Bun?

Yes, Bun 1.0+ is fully supported.

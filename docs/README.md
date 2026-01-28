# GRVT TypeScript SDK

A Deno-first, NPM-compatible TypeScript SDK for the [GRVT Exchange](https://grvt.io).

{% tabs %} {% tab title="npm" %}

```bash
npm install @wezzcoetzee/grvt
```

{% endtab %} {% tab title="pnpm" %}

```bash
pnpm add @wezzcoetzee/grvt
```

{% endtab %} {% tab title="yarn" %}

```bash
yarn add @wezzcoetzee/grvt
```

{% endtab %} {% tab title="bun" %}

```bash
bun add @wezzcoetzee/grvt
```

{% endtab %} {% tab title="deno" %}

```bash
deno add jsr:@wezzcoetzee/grvt
```

{% endtab %} {% endtabs %}

## Features

<table data-view="cards">
<thead><tr><th></th><th></th></tr></thead>
<tbody>
<tr><td><strong>Type Safe</strong></td><td>Full TypeScript support with typed requests, responses, and enums</td></tr>
<tr><td><strong>Minimal Dependencies</strong></td><td>Only 3 dependencies: @noble/hashes, micro-eth-signer, valibot</td></tr>
<tr><td><strong>Universal</strong></td><td>Works in Deno, Node.js, Bun, and browsers</td></tr>
<tr><td><strong>Multiple Transports</strong></td><td>HTTP for requests, WebSocket for real-time streams</td></tr>
<tr><td><strong>Wallet Support</strong></td><td>Native signer, viem, and ethers v5/v6 compatibility</td></tr>
<tr><td><strong>Tree Shakeable</strong></td><td>Import only what you need with modular exports</td></tr>
</tbody>
</table>

## Quick Examples

{% tabs %} {% tab title="Read Data" %}

```ts
import { GrvtEnv, GrvtRawClient } from "@wezzcoetzee/grvt";

const client = new GrvtRawClient({
  env: GrvtEnv.TESTNET,
});

// Fetch all active instruments
const instruments = await client.getAllInstruments({ is_active: true });
console.log(instruments.result);

// Fetch ticker for BTC perpetual
const ticker = await client.getTicker({ instrument: "BTC_USDT_Perp" });
console.log(ticker.result.last_price);
```

{% endtab %} {% tab title="Place Orders" %}

```ts
import { GrvtClient, GrvtEnv } from "@wezzcoetzee/grvt";

const client = new GrvtClient({
  env: GrvtEnv.TESTNET,
  apiKey: "your-api-key",
  tradingAccountId: "123456789",
  privateKey: "0x...",
});

// Load markets (required for order signing)
await client.loadMarkets();

// Place a limit buy order
const order = await client.createOrder(
  "BTC_USDT_Perp",
  "limit",
  "buy",
  0.01, // amount
  50000, // price
);
console.log(order);
```

{% endtab %} {% tab title="Real-time Updates" %}

```ts
import { buildTickerFeed, GrvtEnv, WebSocketTransport } from "@wezzcoetzee/grvt";

const ws = new WebSocketTransport({
  env: GrvtEnv.TESTNET,
});

await ws.ready();

// Subscribe to ticker updates
const subscription = await ws.subscribe(
  "ticker.s",
  buildTickerFeed("BTC_USDT_Perp", "500"),
  (data) => {
    console.log("Ticker update:", data);
  },
);

// Later: unsubscribe
await subscription.unsubscribe();
await ws.close();
```

{% endtab %} {% endtabs %}

## Client Types

| Client               | Description                             | Use Case                        |
| -------------------- | --------------------------------------- | ------------------------------- |
| `GrvtRawClient`      | Low-level API client with typed methods | Direct API access, custom logic |
| `GrvtClient`         | CCXT-style high-level client            | Trading bots, familiar API      |
| `HttpTransport`      | HTTP transport only                     | Custom client implementations   |
| `WebSocketTransport` | WebSocket transport only                | Real-time data streams          |

## Next Steps

- [Installation](./getting-started/installation.md) - Detailed installation guide
- [Quick Start](./getting-started/quick-start.md) - Get up and running
- [Core Concepts](./core-concepts/transports.md) - Understand the architecture
- [API Reference](./api-reference/raw-client.md) - Full method documentation

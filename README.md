# GRVT TypeScript SDK

A Deno-first, NPM-compatible TypeScript SDK for the [GRVT Exchange](https://grvt.io).

## Features

- **Deno & NPM**: Native TypeScript for Deno, works with Node.js 18+
- **Full Type Safety**: Complete TypeScript types for all API requests/responses
- **EIP-712 Signing**: Built-in order signing (viem, ethers, or standalone)
- **WebSocket Support**: Real-time market data and trade updates
- **Two Client Styles**: CCXT-style high-level or Raw low-level API access

## Installation

### Deno

```bash
deno add jsr:@wezzcoetzee/grvt
```

### Node.js

```bash
npm install @wezzcoetzee/grvt
```

## Quick Start

### CCXT-Style Client (Recommended)

```ts
import { GrvtClient, GrvtEnv } from "@wezzcoetzee/grvt";

const client = new GrvtClient({
  env: GrvtEnv.TESTNET,
  apiKey: "your-api-key",
  tradingAccountId: "123456789",
  privateKey: "0x...",
});

await client.loadMarkets();

// Fetch market data
const ticker = await client.fetchTicker("BTC_USDT_Perp");
const orderbook = await client.fetchOrderBook("BTC_USDT_Perp", 10);

// Create an order
const order = await client.createLimitOrder("BTC_USDT_Perp", "buy", 0.01, 50000);

// Fetch positions
const positions = await client.fetchPositions();
```

### Raw API Client

```ts
import { GrvtEnv, GrvtRawClient } from "@wezzcoetzee/grvt";

const client = new GrvtRawClient({
  env: GrvtEnv.TESTNET,
  apiKey: "your-api-key",
});

const instruments = await client.getAllInstruments({ is_active: true });
const ticker = await client.getTicker({ instrument: "BTC_USDT_Perp" });
```

### WebSocket

```ts
import { buildTickerFeed, GrvtEnv, WebSocketTransport } from "@wezzcoetzee/grvt";

const ws = new WebSocketTransport({ env: GrvtEnv.TESTNET });
await ws.ready();

const sub = await ws.subscribe("ticker.s", buildTickerFeed("BTC_USDT_Perp", "500"), (data) => {
  console.log("Ticker:", data);
});

await sub.unsubscribe();
await ws.close();
```

## Documentation

For detailed API reference, examples, and guides, see the
[full documentation](https://wezzcoetzee.gitbook.io/grvt-docs).

## Development

```bash
git clone https://github.com/wezzcoetzee/grvt.git
cd grvt

deno test -A        # Run tests
deno fmt            # Format
deno lint           # Lint
```

## License

MIT

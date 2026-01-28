# Getting Started Examples

Executable examples demonstrating the GRVT SDK.

## Prerequisites

- [Deno 2+](https://deno.land/)
- GRVT testnet account (for authenticated example)

## Environment Variables

For the authenticated example, set these environment variables:

```bash
export GRVT_API_KEY="your-api-key"
export GRVT_PRIVATE_KEY="your-private-key"
export GRVT_TRADING_ACCOUNT_ID="your-trading-account-id"
```

Get your API key from the [GRVT Dashboard](https://testnet.grvt.io/).

## Running Examples

From the repository root:

```bash
# Public market data (no auth required)
deno task example:market-data

# WebSocket streams (no auth required)
deno task example:websocket

# Authenticated trading workflow (requires auth)
deno task example:authenticated
```

Or run directly:

```bash
deno run --allow-net examples/getting-started/market-data.ts
deno run --allow-net examples/getting-started/websocket-streams.ts
deno run --allow-net --allow-env examples/getting-started/authenticated.ts
```

## Examples

| File                   | Description                                  | Auth Required |
| ---------------------- | -------------------------------------------- | ------------- |
| `market-data.ts`       | Public market data via REST                  | No            |
| `websocket-streams.ts` | Real-time market data via WebSocket          | No            |
| `authenticated.ts`     | Complete trading workflow with order signing | Yes           |

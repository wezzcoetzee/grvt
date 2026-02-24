# Architecture — @wezzcoetzee/grvt

## Overview

TypeScript SDK providing two client tiers for the GRVT crypto derivatives exchange. Runs on Deno, cross-published to JSR
and NPM.

## Directory Structure

```
src/
├── mod.ts                    # Root barrel — flat re-exports from all modules
├── _base.ts                  # GrvtError base class
├── types/                    # Enums (Currency, Kind, TimeInForce, OrderStatus, etc.)
├── config/
│   ├── environment.ts        # Per-env URLs + chain IDs (PROD=325, TESTNET=326)
│   └── endpoints.ts          # REST paths, WS stream names, endpoint resolution
├── transport/
│   ├── _base.ts              # IRequestTransport / ISubscriptionTransport interfaces
│   ├── http/mod.ts           # HttpTransport — REST with cookie auth
│   └── websocket/mod.ts      # WebSocketTransport — pub/sub with feed builders
├── signing/
│   ├── eip712.ts             # EIP-712 domain, order types, price multiplier (1e9)
│   ├── orderSigning.ts       # signOrder, buildCreateOrderPayload
│   ├── _abstractWallet.ts    # Wallet union (viem, ethers v5/v6)
│   └── _privateKeySigner.ts  # Built-in signer (micro-eth-signer, no viem/ethers)
├── raw/
│   ├── client.ts             # GrvtRawClient — 25+ methods, 1:1 API mapping
│   └── types.ts              # All request/response interfaces
└── ccxt/
    ├── client.ts             # GrvtClient — CCXT-style wrapper with signing
    ├── types.ts              # Order types, interval maps
    └── utils.ts              # parseSymbol, ns/ms conversion
```

## Module Graph

```
types ─→ config ─→ transport ─→ signing ─→ raw ─→ ccxt
                                                    │
                                              GrvtClient uses
                                              GrvtRawClient + signOrder
```

## Export Strategy

Each module has `mod.ts` barrel files. Root `src/mod.ts` re-exports everything into a flat namespace. Consumers can also
import from subpaths:

```ts
import { GrvtClient } from "@wezzcoetzee/grvt"; // everything
import { GrvtRawClient } from "@wezzcoetzee/grvt/raw"; // just raw client
import { HttpTransport } from "@wezzcoetzee/grvt/transport";
```

## Two-Client Design

### GrvtRawClient (`src/raw/client.ts`)

Thin wrapper over `IRequestTransport`. Each method maps 1:1 to a GRVT REST endpoint. Returns raw API response types with
snake_case fields. No signing, no market loading — caller manages everything.

**Use when**: you want full control, custom transports, or only need market data.

### GrvtClient (`src/ccxt/client.ts`)

CCXT-style ergonomic client. Wraps `GrvtRawClient` and adds:

- Automatic market loading and instrument resolution
- Order signing via `signOrder()` with wallet abstraction
- Symbol parsing (`BTC_USDT_Perp` → kind/base/quote)
- Convenience methods (`createLimitOrder`, `createMarketOrder`)
- Input validation with `GrvtInvalidOrder` errors

**Use when**: you want a batteries-included trading client.

## Transport Layer

### HTTP (`src/transport/http/mod.ts`)

- Implements `IRequestTransport`
- Auth: POST to `/auth/api_key/login` with API key, caches `gravity` cookie
- Auto-refreshes cookie 5 seconds before expiry
- Configurable timeout (default 10s) via `AbortSignal.any()`
- Optional custom endpoints per `GrvtEndpointType` (edge/trade/market)

### WebSocket (`src/transport/websocket/mod.ts`)

- Implements `ISubscriptionTransport`
- Feed builders: `buildTickerFeed`, `buildOrderbookFeed`, `buildTradeFeed`, `buildCandleFeed`, `buildAccountFeed`
- Auto-resubscribe on reconnect (configurable)
- 30-second keepalive ping
- Stream names auto-prefixed with `v1.`

## Signing Flow

1. Caller provides `OrderParams` with human-readable values (price as number, size as number)
2. `signOrder()` converts to fixed-point integers (price × 1e9, size × 10^baseDecimals)
3. Builds EIP-712 typed data with domain `{ name: "GRVT Exchange", version: "0", chainId }`
4. Signs via `AbstractWallet` dispatch (detects viem/ethers v5/ethers v6 by structural typing)
5. Returns `SignedOrder` with split signature (r, s, v)
6. `buildCreateOrderPayload()` converts to snake_case for the REST API

## Wallet Abstraction

Structural typing — no imports from viem or ethers:

| Type                       | Detection                                   | Method                                  |
| -------------------------- | ------------------------------------------- | --------------------------------------- |
| `AbstractViemLocalAccount` | has `.address` string                       | `.signTypedData(params)`                |
| `AbstractEthersV6Signer`   | has `.signTypedData` (not `_signTypedData`) | `.signTypedData(domain, types, value)`  |
| `AbstractEthersV5Signer`   | has `._signTypedData`                       | `._signTypedData(domain, types, value)` |

Built-in `PrivateKeySigner` uses `@paulmillr/micro-eth-signer` — zero dependency on viem/ethers.

## Environment Configuration

| Environment | Chain ID | Edge Domain                  |
| ----------- | -------- | ---------------------------- |
| PROD        | 325      | `edge.grvt.io`               |
| TESTNET     | 326      | `edge.testnet.grvt.io`       |
| DEV         | 327      | `edge.dev.gravitymarkets.io` |
| STG         | 327      | `edge.stg.gravitymarkets.io` |

Each env has three endpoint types: edge (auth/graphql), trade data, and market data — each with RPC and WS URLs.

## Error Hierarchy

```
GrvtError
├── TransportError
│   ├── HttpRequestError    (response?, body?)
│   └── WebSocketRequestError
├── ApiRequestError         (code?, status?, response?)
└── AbstractWalletError

GrvtInvalidOrder (separate hierarchy — order validation errors)
```

## CI/CD Pipeline

PRs run format check, lint, doc check, and tests with coverage (uploaded to Coveralls).

Releases trigger dual publishing:

- **JSR**: `npx jsr publish`
- **NPM**: `dnt` build (`scripts/build_npm.ts`) → `npm publish` with semver tag detection (alpha/beta/rc → named tags,
  stable → latest)

## Data Conventions

- All timestamps: **unix nanoseconds as strings** (not milliseconds, not numbers)
- All prices: **9-decimal fixed-point as strings** (multiply by `PRICE_MULTIPLIER = 1_000_000_000n`)
- Contract sizes: **variable decimal fixed-point** (multiply by `10^baseDecimals`)
- Symbols: `BASE_QUOTE_Kind` format (e.g., `BTC_USDT_Perp`, `ETH_USDT_Call_20Oct23_2800`)

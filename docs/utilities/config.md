# Configuration

The SDK provides utilities for environment configuration and endpoint management.

## Environments

GRVT provides multiple environments for different stages of development:

```ts
import { GrvtEnv } from "@wezzcoetzee/grvt";
```

| Environment | Value             | Chain ID | Description                      |
| ----------- | ----------------- | -------- | -------------------------------- |
| Production  | `GrvtEnv.PROD`    | 325      | Live trading with real funds     |
| Testnet     | `GrvtEnv.TESTNET` | 326      | Testing with testnet funds       |
| Staging     | `GrvtEnv.STG`     | 327      | Internal staging environment     |
| Development | `GrvtEnv.DEV`     | 327      | Internal development environment |

```ts
// Use testnet for development
const client = new GrvtRawClient({
  env: GrvtEnv.TESTNET,
});

// Use production for live trading
const client = new GrvtRawClient({
  env: GrvtEnv.PROD,
});
```

## Chain IDs

Chain IDs are used for EIP-712 signing:

```ts
import { CHAIN_IDS, GrvtEnv } from "@wezzcoetzee/grvt";

console.log(CHAIN_IDS[GrvtEnv.PROD]); // 325
console.log(CHAIN_IDS[GrvtEnv.TESTNET]); // 326
console.log(CHAIN_IDS[GrvtEnv.STG]); // 327
console.log(CHAIN_IDS[GrvtEnv.DEV]); // 327
```

## Environment Configuration

### getEnvConfig

Get the full configuration for an environment:

```ts
import { getEnvConfig, GrvtEnv } from "@wezzcoetzee/grvt";

const config = getEnvConfig(GrvtEnv.TESTNET);
```

**Returns:** `GrvtEnvConfig`

```ts
interface GrvtEnvConfig {
  edge: {
    rpcEndpoint: string; // "https://edge.testnet.grvt.io"
    wsEndpoint: string | null;
  };
  tradeData: {
    rpcEndpoint: string; // "https://trades.testnet.grvt.io"
    wsEndpoint: string; // "wss://trades.testnet.grvt.io/ws"
  };
  marketData: {
    rpcEndpoint: string; // "https://market-data.testnet.grvt.io"
    wsEndpoint: string; // "wss://market-data.testnet.grvt.io/ws"
  };
  chainId: number; // 326
}
```

### getEndpointDomains

Get base URLs for each endpoint type:

```ts
import { getEndpointDomains, GrvtEndpointType, GrvtEnv } from "@wezzcoetzee/grvt";

const domains = getEndpointDomains(GrvtEnv.TESTNET);
// {
//   [GrvtEndpointType.EDGE]: "https://edge.testnet.grvt.io",
//   [GrvtEndpointType.TRADE_DATA]: "https://trades.testnet.grvt.io",
//   [GrvtEndpointType.MARKET_DATA]: "https://market-data.testnet.grvt.io",
// }
```

### getWsEndpoint

Get WebSocket endpoint URL:

```ts
import { getWsEndpoint, GrvtEndpointType, GrvtEnv } from "@wezzcoetzee/grvt";

const wsUrl = getWsEndpoint(GrvtEnv.TESTNET, GrvtEndpointType.MARKET_DATA);
// "wss://market-data.testnet.grvt.io/ws"
```

## Endpoint Types

```ts
import { GrvtEndpointType } from "@wezzcoetzee/grvt";
```

| Type          | Value    | Description                      |
| ------------- | -------- | -------------------------------- |
| `EDGE`        | `"edge"` | Authentication, GraphQL          |
| `TRADE_DATA`  | `"tdg"`  | Orders, positions, fills         |
| `MARKET_DATA` | `"mdg"`  | Instruments, tickers, orderbooks |

## API Endpoints

### Endpoint Constants

```ts
import {
  EDGE_ENDPOINTS,
  ENDPOINT_VERSION,
  GRVT_ENDPOINTS,
  MARKET_DATA_ENDPOINTS,
  TRADE_DATA_ENDPOINTS,
} from "@wezzcoetzee/grvt";

console.log(ENDPOINT_VERSION); // "v1"

// Edge endpoints
console.log(EDGE_ENDPOINTS.AUTH); // "auth/api_key/login"

// Trade data endpoints
console.log(TRADE_DATA_ENDPOINTS.CREATE_ORDER); // "full/v1/create_order"

// Market data endpoints
console.log(MARKET_DATA_ENDPOINTS.GET_TICKER); // "full/v1/ticker"
```

### getEndpoint

Get full URL for a named endpoint:

```ts
import { getEndpoint, GrvtEnv } from "@wezzcoetzee/grvt";

const url = getEndpoint(GrvtEnv.TESTNET, "GET_ALL_INSTRUMENTS");
// "https://market-data.testnet.grvt.io/full/v1/all_instruments"
```

### getAllEndpoints

Get all endpoint URLs for an environment:

```ts
import { getAllEndpoints, GrvtEnv } from "@wezzcoetzee/grvt";

const endpoints = getAllEndpoints(GrvtEnv.TESTNET);
// {
//   AUTH: "https://edge.testnet.grvt.io/auth/api_key/login",
//   CREATE_ORDER: "https://trades.testnet.grvt.io/full/v1/create_order",
//   GET_TICKER: "https://market-data.testnet.grvt.io/full/v1/ticker",
//   ...
// }
```

## WebSocket Streams

### Stream to Endpoint Mapping

```ts
import { GrvtEndpointType, WS_STREAMS } from "@wezzcoetzee/grvt";

// Market data streams
console.log(WS_STREAMS["ticker.s"]); // GrvtEndpointType.MARKET_DATA
console.log(WS_STREAMS["book.s"]); // GrvtEndpointType.MARKET_DATA

// Trade data streams (require auth)
console.log(WS_STREAMS["order"]); // GrvtEndpointType.TRADE_DATA
console.log(WS_STREAMS["position"]); // GrvtEndpointType.TRADE_DATA
```

### Available Streams

| Stream       | Endpoint    | Description          |
| ------------ | ----------- | -------------------- |
| `mini.s`     | MARKET_DATA | Mini ticker snapshot |
| `mini.d`     | MARKET_DATA | Mini ticker delta    |
| `ticker.s`   | MARKET_DATA | Full ticker snapshot |
| `ticker.d`   | MARKET_DATA | Full ticker delta    |
| `book.s`     | MARKET_DATA | Orderbook snapshot   |
| `book.d`     | MARKET_DATA | Orderbook delta      |
| `trade`      | MARKET_DATA | Recent trades        |
| `candle`     | MARKET_DATA | Candlestick data     |
| `order`      | TRADE_DATA  | Order updates        |
| `state`      | TRADE_DATA  | Account state        |
| `position`   | TRADE_DATA  | Position updates     |
| `fill`       | TRADE_DATA  | Fill updates         |
| `transfer`   | TRADE_DATA  | Transfer updates     |
| `deposit`    | TRADE_DATA  | Deposit updates      |
| `withdrawal` | TRADE_DATA  | Withdrawal updates   |

## Custom Endpoints

Override default endpoints when creating transports:

```ts
import { GrvtEndpointType, GrvtEnv, HttpTransport } from "@wezzcoetzee/grvt";

const transport = new HttpTransport({
  env: GrvtEnv.TESTNET,
  endpoints: {
    [GrvtEndpointType.MARKET_DATA]: "https://custom-market-data.example.com",
  },
});
```

## Type Exports

```ts
import type { EndpointName, GrvtEndpointConfig, GrvtEnvConfig } from "@wezzcoetzee/grvt";
```

| Type                 | Description                              |
| -------------------- | ---------------------------------------- |
| `GrvtEnvConfig`      | Full environment configuration           |
| `GrvtEndpointConfig` | Single endpoint configuration (RPC + WS) |
| `EndpointName`       | Union of all endpoint names              |

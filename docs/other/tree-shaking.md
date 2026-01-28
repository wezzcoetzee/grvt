# Tree Shaking

The SDK supports tree shaking through modular exports. Import only what you need to minimize bundle size.

## Export Paths

| Path                          | Contents                               |
| ----------------------------- | -------------------------------------- |
| `@wezzcoetzee/grvt`           | Everything (main entry)                |
| `@wezzcoetzee/grvt/types`     | Enums and type definitions             |
| `@wezzcoetzee/grvt/config`    | Environment and endpoint configuration |
| `@wezzcoetzee/grvt/transport` | HTTP and WebSocket transports          |
| `@wezzcoetzee/grvt/signing`   | Order signing utilities                |
| `@wezzcoetzee/grvt/raw`       | GrvtRawClient                          |
| `@wezzcoetzee/grvt/ccxt`      | GrvtClient (CCXT-style)                |

## Import Examples

### Full Import (Not Recommended for Bundles)

```ts
// Imports everything
import {
  GrvtClient,
  GrvtEnv,
  GrvtRawClient,
  HttpTransport,
  WebSocketTransport,
  // ... everything else
} from "@wezzcoetzee/grvt";
```

### Modular Imports (Recommended)

{% tabs %} {% tab title="Types Only" %}

```ts
import { Currency, GrvtEnv, Kind, OrderStatus, TimeInForce } from "@wezzcoetzee/grvt/types";
```

{% endtab %} {% tab title="Config Only" %}

```ts
import { CHAIN_IDS, getEndpoint, getEnvConfig, WS_STREAMS } from "@wezzcoetzee/grvt/config";
```

{% endtab %} {% tab title="Transport Only" %}

```ts
import { buildOrderbookFeed, buildTickerFeed, HttpTransport, WebSocketTransport } from "@wezzcoetzee/grvt/transport";
```

{% endtab %} {% tab title="Signing Only" %}

```ts
import { generateExpiration, generateNonce, PrivateKeySigner, signOrder } from "@wezzcoetzee/grvt/signing";
```

{% endtab %} {% tab title="Raw Client Only" %}

```ts
import { GrvtRawClient } from "@wezzcoetzee/grvt/raw";
import { GrvtEnv } from "@wezzcoetzee/grvt/types";

const client = new GrvtRawClient({
  env: GrvtEnv.TESTNET,
});
```

{% endtab %} {% tab title="CCXT Client Only" %}

```ts
import { GrvtClient } from "@wezzcoetzee/grvt/ccxt";
import { GrvtEnv } from "@wezzcoetzee/grvt/types";

const client = new GrvtClient({
  env: GrvtEnv.TESTNET,
});
```

{% endtab %} {% endtabs %}

## Common Patterns

### Market Data Only (Smallest Bundle)

For read-only market data access:

```ts
import { HttpTransport } from "@wezzcoetzee/grvt/transport";
import { GrvtEndpointType, GrvtEnv } from "@wezzcoetzee/grvt/types";

const transport = new HttpTransport({
  env: GrvtEnv.TESTNET,
});

const response = await transport.request<{ result: any[] }>(
  GrvtEndpointType.MARKET_DATA,
  "full/v1/all_instruments",
  { is_active: true },
);
```

### Real-time Data Only

For WebSocket subscriptions without trading:

```ts
import { buildOrderbookFeed, buildTickerFeed, WebSocketTransport } from "@wezzcoetzee/grvt/transport";
import { GrvtEnv } from "@wezzcoetzee/grvt/types";

const ws = new WebSocketTransport({
  env: GrvtEnv.TESTNET,
});

await ws.ready();
await ws.subscribe("ticker.s", buildTickerFeed("BTC_USDT_Perp"), console.log);
```

### Trading (Full Feature)

For full trading functionality:

```ts
import { GrvtClient } from "@wezzcoetzee/grvt/ccxt";
import { GrvtEnv, TimeInForce } from "@wezzcoetzee/grvt/types";

const client = new GrvtClient({
  env: GrvtEnv.TESTNET,
  apiKey: "...",
  tradingAccountId: "...",
  privateKey: "...",
});

await client.loadMarkets();
await client.createOrder("BTC_USDT_Perp", "limit", "buy", 0.01, 50000);
```

### Custom Signing

For advanced signing workflows:

```ts
import {
  PrivateKeySigner,
  signOrder,
  buildCreateOrderPayload,
  generateNonce,
  generateExpiration,
} from "@wezzcoetzee/grvt/signing";
import { GrvtEnv, TimeInForce } from "@wezzcoetzee/grvt/types";

const signer = new PrivateKeySigner("0x...");

const signedOrder = await signOrder({
  wallet: signer,
  env: GrvtEnv.TESTNET,
  order: { ... },
  instruments: { ... },
});

const payload = buildCreateOrderPayload(signedOrder);
```

## Deno Imports

For Deno, use the JSR registry:

```ts
// Full import
import { GrvtClient } from "jsr:@wezzcoetzee/grvt";

// Modular imports
import { GrvtEnv } from "jsr:@wezzcoetzee/grvt/types";
import { HttpTransport } from "jsr:@wezzcoetzee/grvt/transport";
import { GrvtRawClient } from "jsr:@wezzcoetzee/grvt/raw";
```

## Bundle Size Tips

1. **Import from specific paths** rather than the main entry point
2. **Avoid importing types from main** - use `/types` path
3. **Don't import signing utilities** if you're only reading data
4. **Use `GrvtRawClient`** if you don't need CCXT convenience methods
5. **Use `HttpTransport` directly** for maximum control and smallest bundle

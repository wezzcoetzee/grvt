# Error Handling

The SDK uses a hierarchy of typed errors to help you handle different failure scenarios.

## Error Hierarchy

```
GrvtError (base)
├── TransportError
│   ├── HttpRequestError
│   └── WebSocketRequestError
├── ApiRequestError
├── AbstractWalletError
└── GrvtInvalidOrder
```

## GrvtError

Base error class for all SDK errors.

```ts
import { GrvtError } from "@wezzcoetzee/grvt";

try {
  await client.fetchTicker("INVALID");
} catch (error) {
  if (error instanceof GrvtError) {
    console.error("SDK error:", error.message);
  }
}
```

## TransportError

Thrown when communication with the GRVT API fails at the network level.

```ts
import { TransportError } from "@wezzcoetzee/grvt";

try {
  await client.fetchTicker("BTC_USDT_Perp");
} catch (error) {
  if (error instanceof TransportError) {
    console.error("Transport failed:", error.message);
    // Network issue, timeout, etc.
  }
}
```

## HttpRequestError

Thrown when an HTTP request fails. Extends `TransportError`.

```ts
import { HttpRequestError } from "@wezzcoetzee/grvt";

try {
  await transport.request(...);
} catch (error) {
  if (error instanceof HttpRequestError) {
    console.error("HTTP error:", error.message);
    console.error("Status:", error.response?.status);
    console.error("Body:", error.body);
  }
}
```

| Property   | Type                    | Description              |
| ---------- | ----------------------- | ------------------------ |
| `response` | `Response \| undefined` | The HTTP response object |
| `body`     | `string \| undefined`   | The response body text   |

## WebSocketRequestError

Thrown when a WebSocket operation fails. Extends `TransportError`.

```ts
import { WebSocketRequestError } from "@wezzcoetzee/grvt";

try {
  await ws.ready();
} catch (error) {
  if (error instanceof WebSocketRequestError) {
    console.error("WebSocket error:", error.message);
  }
}
```

## ApiRequestError

Thrown when the GRVT API returns an error response (the request succeeded, but the API rejected it).

```ts
import { ApiRequestError } from "@wezzcoetzee/grvt";

try {
  await client.getOrder({
    sub_account_id: "123",
    order_id: "invalid",
  });
} catch (error) {
  if (error instanceof ApiRequestError) {
    console.error("API error:", error.message);
    console.error("Error code:", error.code);
    console.error("HTTP status:", error.status);
    console.error("Raw response:", error.response);
  }
}
```

| Property   | Type                  | Description      |
| ---------- | --------------------- | ---------------- |
| `code`     | `number \| undefined` | GRVT error code  |
| `status`   | `number \| undefined` | HTTP status code |
| `response` | `unknown`             | Raw API response |

## AbstractWalletError

Thrown when wallet operations fail (signing, address derivation).

```ts
import { AbstractWalletError } from "@wezzcoetzee/grvt";

try {
  await signOrder({ wallet, ... });
} catch (error) {
  if (error instanceof AbstractWalletError) {
    console.error("Wallet error:", error.message);
    // Invalid private key, signing failed, etc.
  }
}
```

## GrvtInvalidOrder

Thrown by `GrvtClient` when order validation fails before submission.

```ts
import { GrvtInvalidOrder } from "@wezzcoetzee/grvt";

try {
  await client.createOrder("INVALID", "limit", "buy", 0.01, 50000);
} catch (error) {
  if (error instanceof GrvtInvalidOrder) {
    console.error("Invalid order:", error.message);
    // Symbol not found, invalid parameters, missing auth, etc.
  }
}
```

Common causes:

- Symbol not in loaded markets
- Markets not loaded (`loadMarkets()` not called)
- Missing `tradingAccountId`
- Missing `privateKey`
- Invalid order type or side
- Missing price for limit orders
- Price provided for market orders

## Error Handling Patterns

### Comprehensive Error Handling

```ts
import { ApiRequestError, GrvtError, GrvtInvalidOrder, HttpRequestError } from "@wezzcoetzee/grvt";

async function placeOrder() {
  try {
    return await client.createOrder("BTC_USDT_Perp", "limit", "buy", 0.01, 50000);
  } catch (error) {
    if (error instanceof GrvtInvalidOrder) {
      // Client-side validation failed
      console.error("Invalid order parameters:", error.message);
      return null;
    }

    if (error instanceof ApiRequestError) {
      // API rejected the request
      if (error.code === 1001) {
        console.error("Insufficient margin");
      } else if (error.code === 1002) {
        console.error("Order would trigger self-trade");
      } else {
        console.error("API error:", error.message);
      }
      return null;
    }

    if (error instanceof HttpRequestError) {
      // Network or HTTP error
      console.error("Network error:", error.message);
      // Retry logic could go here
      return null;
    }

    // Unknown error
    throw error;
  }
}
```

### Retrying Failed Requests

```ts
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000,
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof HttpRequestError) {
        lastError = error;
        console.warn(`Attempt ${attempt} failed, retrying...`);
        await new Promise((r) => setTimeout(r, delayMs * attempt));
        continue;
      }
      // Don't retry API errors or validation errors
      throw error;
    }
  }

  throw lastError;
}

// Usage
const ticker = await withRetry(() => client.fetchTicker("BTC_USDT_Perp"));
```

### WebSocket Error Recovery

```ts
async function connectWithReconnect() {
  while (true) {
    try {
      const ws = new WebSocketTransport({ env: GrvtEnv.TESTNET });
      await ws.ready();

      const sub = await ws.subscribe("ticker.s", feed, handler);

      // Wait for failure
      await new Promise((_, reject) => {
        sub.failureSignal.addEventListener("abort", reject);
      });
    } catch (error) {
      console.error("WebSocket error, reconnecting...", error);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
}
```

## Checking Error Responses

Use `isGrvtErrorResponse` to check if a response is an error:

```ts
import { isGrvtErrorResponse } from "@wezzcoetzee/grvt";

const response = await transport.request(...);

if (isGrvtErrorResponse(response)) {
  console.error("Error:", response.message);
  console.error("Code:", response.code);
}
```

## Next Steps

- [Order Signing](../utilities/signing.md) - Handle signing errors
- [API Reference](../api-reference/raw-client.md) - Method-specific errors

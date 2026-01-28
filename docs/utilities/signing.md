# Order Signing

GRVT orders must be signed using EIP-712 typed data signing. The SDK provides utilities for signing orders with various
wallet types.

## PrivateKeySigner

A built-in signer that doesn't require viem or ethers.

```ts
import { PrivateKeySigner } from "@wezzcoetzee/grvt";

const signer = new PrivateKeySigner("0xabc123...");
console.log(signer.address); // 0x...
```

### Constructor

| Parameter    | Type     | Description                            |
| ------------ | -------- | -------------------------------------- |
| `privateKey` | `string` | Hex string (with or without 0x prefix) |

### Methods

#### signTypedData

Signs EIP-712 typed data.

```ts
const signature = await signer.signTypedData({
  domain: { ... },
  types: { ... },
  primaryType: "Order",
  message: { ... },
});
```

## Wallet Compatibility

The SDK supports multiple wallet types through the `AbstractWallet` interface:

{% tabs %} {% tab title="PrivateKeySigner (Built-in)" %}

```ts
import { PrivateKeySigner } from "@wezzcoetzee/grvt";

const wallet = new PrivateKeySigner("0x...");
```

{% endtab %} {% tab title="viem" %}

```ts
import { privateKeyToAccount } from "viem/accounts";

const wallet = privateKeyToAccount("0x...");
```

{% endtab %} {% tab title="ethers v6" %}

```ts
import { Wallet } from "ethers";

const wallet = new Wallet("0x...");
```

{% endtab %} {% tab title="ethers v5" %}

```ts
import { Wallet } from "@ethersproject/wallet";

const wallet = new Wallet("0x...");
```

{% endtab %} {% endtabs %}

## signOrder

Signs an order and returns a payload ready for submission.

```ts
import { generateExpiration, generateNonce, PrivateKeySigner, signOrder } from "@wezzcoetzee/grvt";
import { GrvtEnv, TimeInForce } from "@wezzcoetzee/grvt";

const signer = new PrivateKeySigner("0x...");

const signedOrder = await signOrder({
  wallet: signer,
  env: GrvtEnv.TESTNET,
  order: {
    subAccountId: "123456789",
    isMarket: false,
    timeInForce: TimeInForce.GOOD_TILL_TIME,
    postOnly: true,
    reduceOnly: false,
    legs: [{
      instrument: "BTC_USDT_Perp",
      size: "0.01",
      isBuyingAsset: true,
      limitPrice: "50000",
    }],
    nonce: generateNonce(),
    expiration: generateExpiration(86400000), // 24 hours in ms
  },
  instruments: {
    "BTC_USDT_Perp": {
      instrumentHash: "0x...",
      baseDecimals: 9,
    },
  },
  clientOrderId: "my-order-1",
});
```

### Parameters

| Parameter       | Type                             | Required | Description                            |
| --------------- | -------------------------------- | -------- | -------------------------------------- |
| `wallet`        | `AbstractWallet`                 | Yes      | Wallet for signing                     |
| `env`           | `GrvtEnv`                        | Yes      | GRVT environment (determines chain ID) |
| `order`         | `OrderParams`                    | Yes      | Order parameters                       |
| `instruments`   | `Record<string, InstrumentInfo>` | Yes      | Instrument metadata                    |
| `clientOrderId` | `string`                         | No       | Client-specified order ID              |

### OrderParams

| Field          | Type          | Required | Description                        |
| -------------- | ------------- | -------- | ---------------------------------- |
| `subAccountId` | `string`      | Yes      | Sub-account ID                     |
| `isMarket`     | `boolean`     | Yes      | Market order flag                  |
| `timeInForce`  | `TimeInForce` | Yes      | Time in force                      |
| `postOnly`     | `boolean`     | No       | Post-only flag                     |
| `reduceOnly`   | `boolean`     | No       | Reduce-only flag                   |
| `legs`         | `OrderLeg[]`  | Yes      | Order legs                         |
| `nonce`        | `number`      | Yes      | Unique nonce                       |
| `expiration`   | `string`      | Yes      | Expiration timestamp (nanoseconds) |

### OrderLeg

| Field           | Type      | Required | Description                       |
| --------------- | --------- | -------- | --------------------------------- |
| `instrument`    | `string`  | Yes      | Instrument symbol                 |
| `size`          | `string`  | Yes      | Order size                        |
| `isBuyingAsset` | `boolean` | Yes      | True for buy, false for sell      |
| `limitPrice`    | `string`  | Yes      | Limit price (0 for market orders) |

### InstrumentInfo

| Field            | Type     | Description              |
| ---------------- | -------- | ------------------------ |
| `instrumentHash` | `string` | Instrument hash from API |
| `baseDecimals`   | `number` | Base currency decimals   |

**Returns:** `SignedOrder`

## buildCreateOrderPayload

Converts a signed order into the format expected by the API.

```ts
import { buildCreateOrderPayload } from "@wezzcoetzee/grvt";

const payload = buildCreateOrderPayload(signedOrder);
await client.createOrder(payload);
```

## Helper Functions

### generateNonce

Generates a unique nonce for order signing.

```ts
import { generateNonce } from "@wezzcoetzee/grvt";

const nonce = generateNonce(); // Returns a random 32-bit integer
```

### generateExpiration

Generates an expiration timestamp.

```ts
import { generateExpiration } from "@wezzcoetzee/grvt";

// Expire in 24 hours
const expiration = generateExpiration(86400000); // Returns nanosecond timestamp

// Expire in 1 hour
const expiration1h = generateExpiration(3600000);
```

| Parameter    | Type     | Default    | Description                           |
| ------------ | -------- | ---------- | ------------------------------------- |
| `durationMs` | `number` | `86400000` | Duration until expiry in milliseconds |

### generateClientOrderId

Generates a unique client order ID.

```ts
import { generateClientOrderId } from "@wezzcoetzee/grvt";

const clientOrderId = generateClientOrderId(); // UUID v4
```

## EIP-712 Types

The SDK exports EIP-712 types for advanced use cases:

```ts
import {
  DEFAULT_SIZE_MULTIPLIER,
  EIP712_ORDER_TYPES,
  getEIP712Domain,
  PRICE_MULTIPLIER,
  TIME_IN_FORCE_VALUES,
} from "@wezzcoetzee/grvt";

// Get domain for a specific environment
const domain = getEIP712Domain(GrvtEnv.TESTNET);
// { name: "GRVT Exchange", version: "0", chainId: 326, verifyingContract: "0x..." }

// Price multiplier (10^9)
console.log(PRICE_MULTIPLIER); // 1000000000n

// Time in force enum values
console.log(TIME_IN_FORCE_VALUES);
// { GOOD_TILL_TIME: 1, ALL_OR_NONE: 2, IMMEDIATE_OR_CANCEL: 3, FILL_OR_KILL: 4 }
```

## signTypedData

Low-level function for signing EIP-712 typed data with any supported wallet type.

```ts
import { signTypedData } from "@wezzcoetzee/grvt";

const signature = await signTypedData({
  wallet: signer,
  domain: { ... },
  types: { ... },
  primaryType: "Order",
  message: { ... },
});
```

## getWalletAddress

Extract address from any supported wallet type.

```ts
import { getWalletAddress } from "@wezzcoetzee/grvt";

const address = await getWalletAddress(wallet);
```

## Complete Example

```ts
import {
  buildCreateOrderPayload,
  generateClientOrderId,
  generateExpiration,
  generateNonce,
  GrvtEnv,
  GrvtRawClient,
  PrivateKeySigner,
  signOrder,
  TimeInForce,
} from "@wezzcoetzee/grvt";

async function placeSignedOrder() {
  const client = new GrvtRawClient({
    env: GrvtEnv.TESTNET,
    apiKey: process.env.GRVT_API_KEY!,
  });

  const signer = new PrivateKeySigner(process.env.GRVT_PRIVATE_KEY!);

  // Get instrument info
  const { result: instrument } = await client.getInstrument({
    instrument: "BTC_USDT_Perp",
  });

  // Sign the order
  const signedOrder = await signOrder({
    wallet: signer,
    env: GrvtEnv.TESTNET,
    order: {
      subAccountId: process.env.GRVT_TRADING_ACCOUNT_ID!,
      isMarket: false,
      timeInForce: TimeInForce.GOOD_TILL_TIME,
      postOnly: true,
      legs: [{
        instrument: "BTC_USDT_Perp",
        size: "0.01",
        isBuyingAsset: true,
        limitPrice: "50000",
      }],
      nonce: generateNonce(),
      expiration: generateExpiration(86400000),
    },
    instruments: {
      "BTC_USDT_Perp": {
        instrumentHash: instrument.instrument_hash,
        baseDecimals: instrument.base_decimals,
      },
    },
    clientOrderId: generateClientOrderId(),
  });

  // Submit the order
  const payload = buildCreateOrderPayload(signedOrder);
  const response = await client.createOrder(payload);
  console.log("Order placed:", response.result);
}
```

{% hint style="tip" %} For most use cases, prefer `GrvtClient` which handles signing automatically. Use these low-level
utilities only when you need custom signing logic. {% endhint %}

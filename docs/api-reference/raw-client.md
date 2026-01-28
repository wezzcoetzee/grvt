# GrvtRawClient API Reference

Low-level client providing direct access to all GRVT API endpoints.

## Constructor

```ts
new GrvtRawClient(options: GrvtRawClientOptions)
```

### Options

| Option      | Type                | Required | Default | Description                         |
| ----------- | ------------------- | -------- | ------- | ----------------------------------- |
| `env`       | `GrvtEnv`           | No       | `PROD`  | GRVT environment                    |
| `apiKey`    | `string`            | No       | -       | API key for authenticated endpoints |
| `timeout`   | `number \| null`    | No       | `10000` | Request timeout in ms               |
| `transport` | `IRequestTransport` | No       | -       | Custom transport instance           |

### Example

```ts
import { GrvtEnv, GrvtRawClient } from "@wezzcoetzee/grvt";

const client = new GrvtRawClient({
  env: GrvtEnv.TESTNET,
  apiKey: "your-api-key",
});
```

## Properties

| Property    | Type                | Description                         |
| ----------- | ------------------- | ----------------------------------- |
| `transport` | `IRequestTransport` | The transport used for API requests |
| `env`       | `GrvtEnv`           | The GRVT environment                |

---

## Market Data Methods

These methods do not require authentication.

### getInstrument

Get a single instrument by name.

```ts
const response = await client.getInstrument({
  instrument: "BTC_USDT_Perp",
});
```

| Parameter    | Type     | Required | Description       |
| ------------ | -------- | -------- | ----------------- |
| `instrument` | `string` | Yes      | Instrument symbol |

**Returns:** `GetInstrumentResponse`

---

### getAllInstruments

Get all instruments.

```ts
const response = await client.getAllInstruments({
  is_active: true,
});
```

| Parameter   | Type      | Required | Description             |
| ----------- | --------- | -------- | ----------------------- |
| `is_active` | `boolean` | No       | Filter by active status |

**Returns:** `GetAllInstrumentsResponse`

---

### getFilteredInstruments

Get instruments with filters.

```ts
import { Kind } from "@wezzcoetzee/grvt";

const response = await client.getFilteredInstruments({
  kind: [Kind.PERPETUAL],
  is_active: true,
  limit: 100,
});
```

| Parameter   | Type         | Required | Description               |
| ----------- | ------------ | -------- | ------------------------- |
| `kind`      | `Kind[]`     | No       | Filter by instrument kind |
| `base`      | `Currency[]` | No       | Filter by base currency   |
| `quote`     | `Currency[]` | No       | Filter by quote currency  |
| `is_active` | `boolean`    | No       | Filter by active status   |
| `limit`     | `number`     | No       | Maximum results           |

**Returns:** `GetFilteredInstrumentsResponse`

---

### getMiniTicker

Get mini ticker for an instrument.

```ts
const response = await client.getMiniTicker({
  instrument: "BTC_USDT_Perp",
});
```

| Parameter    | Type     | Required | Description       |
| ------------ | -------- | -------- | ----------------- |
| `instrument` | `string` | Yes      | Instrument symbol |

**Returns:** `MiniTickerResponse`

---

### getTicker

Get full ticker for an instrument.

```ts
const response = await client.getTicker({
  instrument: "BTC_USDT_Perp",
});
```

| Parameter    | Type     | Required | Description       |
| ------------ | -------- | -------- | ----------------- |
| `instrument` | `string` | Yes      | Instrument symbol |

**Returns:** `TickerResponse`

---

### getOrderbookLevels

Get order book levels.

```ts
const response = await client.getOrderbookLevels({
  instrument: "BTC_USDT_Perp",
  depth: 10,
});
```

| Parameter    | Type     | Required | Description                        |
| ------------ | -------- | -------- | ---------------------------------- |
| `instrument` | `string` | Yes      | Instrument symbol                  |
| `depth`      | `number` | No       | Orderbook depth (10, 50, 100, 500) |

**Returns:** `OrderbookLevelsResponse`

---

### getTrades

Get recent trades.

```ts
const response = await client.getTrades({
  instrument: "BTC_USDT_Perp",
  limit: 100,
});
```

| Parameter    | Type     | Required | Description       |
| ------------ | -------- | -------- | ----------------- |
| `instrument` | `string` | Yes      | Instrument symbol |
| `limit`      | `number` | No       | Maximum trades    |

**Returns:** `TradeResponse`

---

### getTradeHistory

Get trade history with pagination.

```ts
const response = await client.getTradeHistory({
  instrument: "BTC_USDT_Perp",
  start_time: "1704067200000000000", // nanoseconds
  limit: 100,
});
```

| Parameter    | Type     | Required | Description               |
| ------------ | -------- | -------- | ------------------------- |
| `instrument` | `string` | Yes      | Instrument symbol         |
| `start_time` | `string` | No       | Start time in nanoseconds |
| `end_time`   | `string` | No       | End time in nanoseconds   |
| `limit`      | `number` | No       | Maximum trades            |
| `cursor`     | `string` | No       | Pagination cursor         |

**Returns:** `TradeHistoryResponse` with `next` cursor

---

### getCandlestick

Get candlestick (OHLCV) data.

```ts
import { CandlestickInterval, CandlestickType } from "@wezzcoetzee/grvt";

const response = await client.getCandlestick({
  instrument: "BTC_USDT_Perp",
  interval: CandlestickInterval.CI_1_H,
  type: CandlestickType.TRADE,
  limit: 100,
});
```

| Parameter    | Type                  | Required | Description                          |
| ------------ | --------------------- | -------- | ------------------------------------ |
| `instrument` | `string`              | Yes      | Instrument symbol                    |
| `interval`   | `CandlestickInterval` | Yes      | Candle interval                      |
| `type`       | `CandlestickType`     | Yes      | Price type (TRADE, MARK, INDEX, MID) |
| `start_time` | `string`              | No       | Start time in nanoseconds            |
| `end_time`   | `string`              | No       | End time in nanoseconds              |
| `limit`      | `number`              | No       | Maximum candles                      |
| `cursor`     | `string`              | No       | Pagination cursor                    |

**Returns:** `CandlestickResponse`

---

### getFundingRate

Get funding rate history.

```ts
const response = await client.getFundingRate({
  instrument: "BTC_USDT_Perp",
  limit: 100,
});
```

| Parameter    | Type     | Required | Description               |
| ------------ | -------- | -------- | ------------------------- |
| `instrument` | `string` | Yes      | Instrument symbol         |
| `start_time` | `string` | No       | Start time in nanoseconds |
| `end_time`   | `string` | No       | End time in nanoseconds   |
| `limit`      | `number` | No       | Maximum entries           |
| `cursor`     | `string` | No       | Pagination cursor         |

**Returns:** `FundingRateResponse`

---

## Trading Methods

These methods require authentication (`apiKey`).

### createOrder

Create an order. Requires a pre-signed order payload.

```ts
const response = await client.createOrder({
  order: signedOrderPayload,
});
```

| Parameter | Type          | Required | Description          |
| --------- | ------------- | -------- | -------------------- |
| `order`   | `SignedOrder` | Yes      | Signed order payload |

**Returns:** `CreateOrderResponse`

{% hint style="info" %} Use the [signing utilities](../utilities/signing.md) to create signed order payloads, or use
`GrvtClient` which handles signing automatically. {% endhint %}

---

### cancelOrder

Cancel a single order.

```ts
const response = await client.cancelOrder({
  sub_account_id: "123456789",
  order_id: "order-id",
});

// Or by client order ID
const response = await client.cancelOrder({
  sub_account_id: "123456789",
  client_order_id: "my-order-1",
});
```

| Parameter         | Type     | Required | Description                               |
| ----------------- | -------- | -------- | ----------------------------------------- |
| `sub_account_id`  | `string` | Yes      | Sub-account ID                            |
| `order_id`        | `string` | No       | Order ID (either this or client_order_id) |
| `client_order_id` | `string` | No       | Client order ID                           |

**Returns:** `AckResponse`

---

### cancelAllOrders

Cancel all orders.

```ts
const response = await client.cancelAllOrders({
  sub_account_id: "123456789",
  instrument: "BTC_USDT_Perp", // optional filter
});
```

| Parameter        | Type     | Required | Description          |
| ---------------- | -------- | -------- | -------------------- |
| `sub_account_id` | `string` | Yes      | Sub-account ID       |
| `instrument`     | `string` | No       | Filter by instrument |

**Returns:** `AckResponse`

---

### getOrder

Get an order by ID.

```ts
const response = await client.getOrder({
  sub_account_id: "123456789",
  order_id: "order-id",
});
```

| Parameter         | Type     | Required | Description     |
| ----------------- | -------- | -------- | --------------- |
| `sub_account_id`  | `string` | Yes      | Sub-account ID  |
| `order_id`        | `string` | No       | Order ID        |
| `client_order_id` | `string` | No       | Client order ID |

**Returns:** `GetOrderResponse`

---

### getOpenOrders

Get open orders.

```ts
const response = await client.getOpenOrders({
  sub_account_id: "123456789",
  kind: [Kind.PERPETUAL],
});
```

| Parameter        | Type         | Required | Description               |
| ---------------- | ------------ | -------- | ------------------------- |
| `sub_account_id` | `string`     | Yes      | Sub-account ID            |
| `kind`           | `Kind[]`     | No       | Filter by instrument kind |
| `base`           | `Currency[]` | No       | Filter by base currency   |
| `quote`          | `Currency[]` | No       | Filter by quote currency  |

**Returns:** `OpenOrdersResponse`

---

### getOrderHistory

Get order history with pagination.

```ts
const response = await client.getOrderHistory({
  sub_account_id: "123456789",
  limit: 100,
});
```

| Parameter        | Type         | Required | Description               |
| ---------------- | ------------ | -------- | ------------------------- |
| `sub_account_id` | `string`     | Yes      | Sub-account ID            |
| `kind`           | `Kind[]`     | No       | Filter by instrument kind |
| `base`           | `Currency[]` | No       | Filter by base currency   |
| `quote`          | `Currency[]` | No       | Filter by quote currency  |
| `limit`          | `number`     | No       | Maximum orders            |
| `cursor`         | `string`     | No       | Pagination cursor         |

**Returns:** `OrderHistoryResponse` with `next` cursor

---

### getFillHistory

Get fill history with pagination.

```ts
const response = await client.getFillHistory({
  sub_account_id: "123456789",
  limit: 100,
});
```

| Parameter        | Type         | Required | Description               |
| ---------------- | ------------ | -------- | ------------------------- |
| `sub_account_id` | `string`     | Yes      | Sub-account ID            |
| `kind`           | `Kind[]`     | No       | Filter by instrument kind |
| `base`           | `Currency[]` | No       | Filter by base currency   |
| `quote`          | `Currency[]` | No       | Filter by quote currency  |
| `start_time`     | `string`     | No       | Start time in nanoseconds |
| `end_time`       | `string`     | No       | End time in nanoseconds   |
| `limit`          | `number`     | No       | Maximum fills             |
| `cursor`         | `string`     | No       | Pagination cursor         |

**Returns:** `FillHistoryResponse` with `next` cursor

---

### getPositions

Get positions.

```ts
const response = await client.getPositions({
  sub_account_id: "123456789",
});
```

| Parameter        | Type         | Required | Description               |
| ---------------- | ------------ | -------- | ------------------------- |
| `sub_account_id` | `string`     | Yes      | Sub-account ID            |
| `kind`           | `Kind[]`     | No       | Filter by instrument kind |
| `base`           | `Currency[]` | No       | Filter by base currency   |
| `quote`          | `Currency[]` | No       | Filter by quote currency  |

**Returns:** `PositionsResponse`

---

## Account Methods

### getSubAccountSummary

Get sub-account summary.

```ts
const response = await client.getSubAccountSummary({
  sub_account_id: "123456789",
});
```

**Returns:** `SubAccountSummaryResponse`

---

### getSubAccountHistory

Get sub-account history.

```ts
const response = await client.getSubAccountHistory({
  sub_account_id: "123456789",
  limit: 100,
});
```

**Returns:** `SubAccountHistoryResponse`

---

### getAggregatedAccountSummary

Get aggregated account summary across all sub-accounts.

```ts
const response = await client.getAggregatedAccountSummary({});
```

**Returns:** `AggregatedAccountSummaryResponse`

---

### getFundingAccountSummary

Get funding account summary.

```ts
const response = await client.getFundingAccountSummary({});
```

**Returns:** `FundingAccountSummaryResponse`

---

## Transfer Methods

### deposit

Make a deposit from funding account to sub-account.

```ts
import { Currency } from "@wezzcoetzee/grvt";

const response = await client.deposit({
  main_account_id: "main-id",
  to_sub_account_id: "123456789",
  currency: Currency.USDT,
  num_tokens: "1000",
});
```

**Returns:** `AckResponse`

---

### getDepositHistory

Get deposit history.

```ts
const response = await client.getDepositHistory({
  limit: 100,
});
```

**Returns:** `DepositHistoryResponse`

---

### transfer

Transfer between sub-accounts.

```ts
const response = await client.transfer({
  from_sub_account_id: "123456789",
  to_sub_account_id: "987654321",
  currency: Currency.USDT,
  num_tokens: "100",
});
```

**Returns:** `AckResponse`

---

### getTransferHistory

Get transfer history.

```ts
const response = await client.getTransferHistory({
  limit: 100,
});
```

**Returns:** `TransferHistoryResponse`

---

### withdrawal

Make a withdrawal.

```ts
const response = await client.withdrawal({
  main_account_id: "main-id",
  from_sub_account_id: "123456789",
  to_eth_address: "0x...",
  currency: Currency.USDT,
  num_tokens: "100",
});
```

**Returns:** `AckResponse`

---

### getWithdrawalHistory

Get withdrawal history.

```ts
const response = await client.getWithdrawalHistory({
  limit: 100,
});
```

**Returns:** `WithdrawalHistoryResponse`

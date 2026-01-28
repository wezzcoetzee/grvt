# Table of contents

- [Introduction](README.md)

## Getting Started

- [Installation](getting-started/installation.md)
- [Quick Start](getting-started/quick-start.md)

## Core Concepts

- [Transports](core-concepts/transports.md)
- [Clients](core-concepts/clients.md)
- [Error Handling](core-concepts/error-handling.md)

## API Reference

- [GrvtRawClient](api-reference/raw-client.md)
- [GrvtClient (CCXT-style)](api-reference/ccxt-client.md)

- Market Data Methods
  - ```yaml
    type: builtin:openapi
    props:
      models: false
      downloadLink: false
    dependencies:
      spec:
        ref:
          kind: openapi
          spec: grvt-market-data-getAllInstruments
    ```
  - ```yaml
    type: builtin:openapi
    props:
      models: false
      downloadLink: false
    dependencies:
      spec:
        ref:
          kind: openapi
          spec: grvt-market-data-getCandlestick
    ```
  - ```yaml
    type: builtin:openapi
    props:
      models: false
      downloadLink: false
    dependencies:
      spec:
        ref:
          kind: openapi
          spec: grvt-market-data-getFilteredInstruments
    ```
  - ```yaml
    type: builtin:openapi
    props:
      models: false
      downloadLink: false
    dependencies:
      spec:
        ref:
          kind: openapi
          spec: grvt-market-data-getFundingRate
    ```
  - ```yaml
    type: builtin:openapi
    props:
      models: false
      downloadLink: false
    dependencies:
      spec:
        ref:
          kind: openapi
          spec: grvt-market-data-getInstrument
    ```
  - ```yaml
    type: builtin:openapi
    props:
      models: false
      downloadLink: false
    dependencies:
      spec:
        ref:
          kind: openapi
          spec: grvt-market-data-getMiniTicker
    ```
  - ```yaml
    type: builtin:openapi
    props:
      models: false
      downloadLink: false
    dependencies:
      spec:
        ref:
          kind: openapi
          spec: grvt-market-data-getOrderbookLevels
    ```
  - ```yaml
    type: builtin:openapi
    props:
      models: false
      downloadLink: false
    dependencies:
      spec:
        ref:
          kind: openapi
          spec: grvt-market-data-getTicker
    ```
  - ```yaml
    type: builtin:openapi
    props:
      models: false
      downloadLink: false
    dependencies:
      spec:
        ref:
          kind: openapi
          spec: grvt-market-data-getTradeHistory
    ```
  - ```yaml
    type: builtin:openapi
    props:
      models: false
      downloadLink: false
    dependencies:
      spec:
        ref:
          kind: openapi
          spec: grvt-market-data-getTrades
    ```

- Trade Data Methods
  - ```yaml
    type: builtin:openapi
    props:
      models: false
      downloadLink: false
    dependencies:
      spec:
        ref:
          kind: openapi
          spec: grvt-trade-data-cancelAllOrders
    ```
  - ```yaml
    type: builtin:openapi
    props:
      models: false
      downloadLink: false
    dependencies:
      spec:
        ref:
          kind: openapi
          spec: grvt-trade-data-cancelOrder
    ```
  - ```yaml
    type: builtin:openapi
    props:
      models: false
      downloadLink: false
    dependencies:
      spec:
        ref:
          kind: openapi
          spec: grvt-trade-data-createOrder
    ```
  - ```yaml
    type: builtin:openapi
    props:
      models: false
      downloadLink: false
    dependencies:
      spec:
        ref:
          kind: openapi
          spec: grvt-trade-data-deposit
    ```
  - ```yaml
    type: builtin:openapi
    props:
      models: false
      downloadLink: false
    dependencies:
      spec:
        ref:
          kind: openapi
          spec: grvt-trade-data-getAggregatedAccountSummary
    ```
  - ```yaml
    type: builtin:openapi
    props:
      models: false
      downloadLink: false
    dependencies:
      spec:
        ref:
          kind: openapi
          spec: grvt-trade-data-getDepositHistory
    ```
  - ```yaml
    type: builtin:openapi
    props:
      models: false
      downloadLink: false
    dependencies:
      spec:
        ref:
          kind: openapi
          spec: grvt-trade-data-getFillHistory
    ```
  - ```yaml
    type: builtin:openapi
    props:
      models: false
      downloadLink: false
    dependencies:
      spec:
        ref:
          kind: openapi
          spec: grvt-trade-data-getFundingAccountSummary
    ```
  - ```yaml
    type: builtin:openapi
    props:
      models: false
      downloadLink: false
    dependencies:
      spec:
        ref:
          kind: openapi
          spec: grvt-trade-data-getOpenOrders
    ```
  - ```yaml
    type: builtin:openapi
    props:
      models: false
      downloadLink: false
    dependencies:
      spec:
        ref:
          kind: openapi
          spec: grvt-trade-data-getOrder
    ```
  - ```yaml
    type: builtin:openapi
    props:
      models: false
      downloadLink: false
    dependencies:
      spec:
        ref:
          kind: openapi
          spec: grvt-trade-data-getOrderHistory
    ```
  - ```yaml
    type: builtin:openapi
    props:
      models: false
      downloadLink: false
    dependencies:
      spec:
        ref:
          kind: openapi
          spec: grvt-trade-data-getPositions
    ```
  - ```yaml
    type: builtin:openapi
    props:
      models: false
      downloadLink: false
    dependencies:
      spec:
        ref:
          kind: openapi
          spec: grvt-trade-data-getSubAccountHistory
    ```
  - ```yaml
    type: builtin:openapi
    props:
      models: false
      downloadLink: false
    dependencies:
      spec:
        ref:
          kind: openapi
          spec: grvt-trade-data-getSubAccountSummary
    ```
  - ```yaml
    type: builtin:openapi
    props:
      models: false
      downloadLink: false
    dependencies:
      spec:
        ref:
          kind: openapi
          spec: grvt-trade-data-getTransferHistory
    ```
  - ```yaml
    type: builtin:openapi
    props:
      models: false
      downloadLink: false
    dependencies:
      spec:
        ref:
          kind: openapi
          spec: grvt-trade-data-getWithdrawalHistory
    ```
  - ```yaml
    type: builtin:openapi
    props:
      models: false
      downloadLink: false
    dependencies:
      spec:
        ref:
          kind: openapi
          spec: grvt-trade-data-transfer
    ```
  - ```yaml
    type: builtin:openapi
    props:
      models: false
      downloadLink: false
    dependencies:
      spec:
        ref:
          kind: openapi
          spec: grvt-trade-data-withdrawal
    ```

## Utilities

- [Order Signing](utilities/signing.md)
- [Configuration](utilities/config.md)

## Other

- [Tree Shaking](other/tree-shaking.md)
- [FAQ](other/faq.md)

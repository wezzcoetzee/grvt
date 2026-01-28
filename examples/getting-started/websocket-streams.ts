/**
 * Example: WebSocket Streams
 *
 * Demonstrates subscribing to real-time market data streams via WebSocket.
 *
 * Run: deno task example:websocket
 */

import { GrvtEnv, WebSocketTransport } from "@wezzcoetzee/grvt";

const ws = new WebSocketTransport({
  env: GrvtEnv.TESTNET,
});

console.log("Connecting to GRVT WebSocket...\n");

// Subscribe to ticker stream for BTC perpetual
console.log("Subscribing to ticker stream for BTC_USDT_Perp...");
const tickerSub = await ws.subscribe(
  "ticker.s",
  "BTC_USDT_Perp@500",
  // deno-lint-ignore no-explicit-any
  (data: any) => {
    console.log("Ticker:", {
      instrument: data.instrument,
      lastPrice: data.last_price,
      markPrice: data.mark_price,
      indexPrice: data.index_price,
      volume24h: data.buy_volume_24h_b,
    });
  },
);

// Monitor subscription failures
tickerSub.failureSignal.addEventListener("abort", () => {
  console.error("Ticker subscription failed:", tickerSub.failureSignal.reason);
});

// Subscribe to mini (summary) stream
console.log("Subscribing to mini stream for BTC_USDT_Perp...");
const miniSub = await ws.subscribe(
  "mini.s",
  "BTC_USDT_Perp@500",
  // deno-lint-ignore no-explicit-any
  (data: any) => {
    console.log("Mini:", {
      instrument: data.instrument,
      lastPrice: data.last_price,
      markPrice: data.mark_price,
      fundingRate: data.funding_rate,
      openInterest: data.open_interest,
    });
  },
);

miniSub.failureSignal.addEventListener("abort", () => {
  console.error("Mini subscription failed:", miniSub.failureSignal.reason);
});

// Subscribe to top-of-book stream
console.log("Subscribing to book stream for BTC_USDT_Perp...");
const bookSub = await ws.subscribe(
  "book.s",
  "BTC_USDT_Perp@500-10",
  // deno-lint-ignore no-explicit-any
  (data: any) => {
    console.log("Book:", {
      instrument: data.instrument,
      bestBid: data.bids?.[0],
      bestAsk: data.asks?.[0],
    });
  },
);

bookSub.failureSignal.addEventListener("abort", () => {
  console.error("Book subscription failed:", bookSub.failureSignal.reason);
});

console.log("\nSubscriptions active. Press Ctrl+C to exit.\n");

// Keep the process alive
await new Promise((resolve) => {
  // Handle graceful shutdown
  const cleanup = async () => {
    console.log("\n\nShutting down...");
    await tickerSub.unsubscribe();
    await miniSub.unsubscribe();
    await bookSub.unsubscribe();
    ws.close();
    console.log("Cleanup complete.");
    resolve(undefined);
  };

  // Listen for interrupt signals
  Deno.addSignalListener("SIGINT", cleanup);
  Deno.addSignalListener("SIGTERM", cleanup);
});

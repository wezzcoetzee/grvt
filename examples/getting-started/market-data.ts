/**
 * Example: Public Market Data
 *
 * Demonstrates fetching market data without authentication using GrvtRawClient.
 *
 * Run: deno task example:market-data
 */

import { GrvtEnv, GrvtRawClient } from "@wezzcoetzee/grvt";

const client = new GrvtRawClient({
  env: GrvtEnv.TESTNET,
});

// Get all active instruments
console.log("Fetching active instruments...\n");
const instruments = await client.getAllInstruments({ is_active: true });
console.log(
  "Active instruments:",
  instruments.result.map((i) => i.instrument),
);
console.log(`Total: ${instruments.result.length}\n`);

// Get ticker for BTC_USDT_Perp
console.log("Fetching BTC_USDT_Perp ticker...\n");
const ticker = await client.getTicker({ instrument: "BTC_USDT_Perp" });
console.log("Last price:", ticker.result.last_price);
console.log("Mark price:", ticker.result.mark_price);
console.log("24h buy volume:", ticker.result.buy_volume_24h_b);
console.log("24h sell volume:", ticker.result.sell_volume_24h_b, "\n");

// Get orderbook levels
console.log("Fetching orderbook (depth 10)...\n");
const orderbook = await client.getOrderbookLevels({
  instrument: "BTC_USDT_Perp",
  depth: 10,
});

console.log("Bids:");
for (const bid of orderbook.result.bids) {
  console.log(`  ${bid.price} @ ${bid.size}`);
}

console.log("\nAsks:");
for (const ask of orderbook.result.asks) {
  console.log(`  ${ask.price} @ ${ask.size}`);
}

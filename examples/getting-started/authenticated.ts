/**
 * Example: Authenticated Trading Workflow
 *
 * Demonstrates a full trading workflow: checking positions, placing orders,
 * and managing open orders.
 *
 * Required env vars: GRVT_API_KEY, GRVT_PRIVATE_KEY, GRVT_TRADING_ACCOUNT_ID
 *
 * Run: deno task example:authenticated
 */

import { GrvtClient, GrvtEnv } from "@wezzcoetzee/grvt";

const apiKey = Deno.env.get("GRVT_API_KEY");
const privateKey = Deno.env.get("GRVT_PRIVATE_KEY");
const tradingAccountId = Deno.env.get("GRVT_TRADING_ACCOUNT_ID");

if (!apiKey || !privateKey || !tradingAccountId) {
  console.error("Missing required environment variables:");
  console.error("  GRVT_API_KEY, GRVT_PRIVATE_KEY, GRVT_TRADING_ACCOUNT_ID");
  Deno.exit(1);
}

async function main(): Promise<void> {
  const client = new GrvtClient({
    env: GrvtEnv.TESTNET,
    apiKey,
    privateKey,
    tradingAccountId,
  });

  console.log("=== GRVT Trading Workflow ===\n");

  // Load markets
  console.log("Loading markets...");
  await client.loadMarkets();
  console.log("Markets loaded\n");

  // Check current positions
  console.log("Checking BTC_USDT_Perp position...");
  const positions = await client.fetchPositions(["BTC_USDT_Perp"]);
  if (positions.length > 0) {
    const pos = positions[0];
    console.log(`  Size: ${pos.size}`);
    console.log(`  Entry: ${pos.entry_price}`);
    console.log(`  Unrealized PnL: ${pos.unrealized_pnl}`);
  } else {
    console.log("  No open position");
  }
  console.log();

  // Get current price
  console.log("Fetching current price...");
  const ticker = await client.fetchTicker("BTC_USDT_Perp");
  const currentPrice = parseFloat(ticker.last_price ?? "0");
  console.log(`  Current: ${currentPrice}`);
  console.log(`  Mark: ${ticker.mark_price}\n`);

  // Place a limit buy below market
  const buyPrice = Math.floor(currentPrice * 0.99);
  console.log(`Placing limit buy @ ${buyPrice}...`);
  const order = await client.createOrder("BTC_USDT_Perp", "limit", "buy", 0.01, buyPrice);
  console.log(`  Order ID: ${order.order_id}`);
  console.log(`  Status: ${order.state.status}\n`);

  // Check open orders
  console.log("Fetching open orders...");
  const openOrders = await client.fetchOpenOrders("BTC_USDT_Perp");
  console.log(`  Open orders: ${openOrders.length}`);
  for (const o of openOrders) {
    const leg = o.legs[0];
    const side = leg.is_buying_asset ? "BUY" : "SELL";
    console.log(`    ${o.order_id}: ${side} ${leg.size} @ ${leg.limit_price}`);
  }
  console.log();

  // Cancel the order
  console.log("Cancelling order...");
  await client.cancelOrder(order.order_id);
  console.log("  Order cancelled\n");

  // Verify
  const remaining = await client.fetchOpenOrders("BTC_USDT_Perp");
  console.log(`Remaining open orders: ${remaining.length}`);
  console.log("\n=== Workflow Complete ===");
}

main().catch((err) => {
  console.error("Error:", err);
  Deno.exit(1);
});

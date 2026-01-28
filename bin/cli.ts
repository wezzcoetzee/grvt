#!/usr/bin/env node
// deno-lint-ignore-file no-console

/**
 * Command-line interface for interacting with GRVT API.
 *
 * @example
 * ```sh
 * npx @wezzcoetzee/grvt <method> [options]
 * ```
 *
 * @example Market Data
 * ```sh
 * npx @wezzcoetzee/grvt getAllInstruments --is_active true
 * npx @wezzcoetzee/grvt getTicker --instrument BTC_USDT_Perp
 * ```
 *
 * @example Authenticated Endpoints
 * ```sh
 * npx @wezzcoetzee/grvt getPositions --api-key YOUR_KEY --sub_account_id 123456789
 * ```
 */

// @ts-ignore: Ignore missing TS types when building npm
import process from "node:process";
import { type Args, extractArgs, transformArgs } from "./_utils.ts";
import { GrvtEnv, GrvtRawClient, HttpTransport } from "../src/mod.ts";

// ============================================================
// Types
// ============================================================

type RawClientMethod = keyof GrvtRawClient;

// ============================================================
// Execute
// ============================================================

class EchoTransport extends HttpTransport {
  constructor(env: GrvtEnv, apiKey?: string) {
    super({ env, apiKey });
  }
  override request<T>(_endpointType: unknown, _endpoint: string, payload: unknown): Promise<T> {
    return new Promise((resolve) => resolve({ status: "ok", response: payload } as T));
  }
}

function parseEnv(args: Args<false>): GrvtEnv {
  const envArg = args.env as string | undefined;
  if (!envArg) return GrvtEnv.PROD;

  switch (envArg.toLowerCase()) {
    case "dev":
      return GrvtEnv.DEV;
    case "stg":
      return GrvtEnv.STG;
    case "testnet":
      return GrvtEnv.TESTNET;
    case "prod":
      return GrvtEnv.PROD;
    default:
      throw new Error(`Invalid environment "${envArg}". Use "dev", "stg", "testnet", or "prod"`);
  }
}

async function executeMethod(method: string, args: Args<false>): Promise<unknown> {
  const env = parseEnv(args);
  const timeout = Number(args.timeout) || undefined;
  const isOffline = "offline" in args;
  const apiKey = args["api-key"] as string | undefined;

  // Build params from args, excluding CLI-specific flags
  const params: Record<string, unknown> = {};
  for (const key in args) {
    if (
      key === "_" || key === "env" || key === "timeout" ||
      key === "offline" || key === "api-key" || key === "help" || key === "h"
    ) {
      continue;
    }
    params[key] = args[key];
  }

  const transport = isOffline ? new EchoTransport(env, apiKey) : new HttpTransport({ env, timeout, apiKey });
  const client = new GrvtRawClient({ transport, env });

  if (!(method in client)) {
    throw new Error(`Unknown method "${method}". Use --help to see available methods.`);
  }

  // @ts-expect-error: dynamic method access
  const response = await client[method as RawClientMethod](params);
  return isOffline ? response.response : response;
}

// ============================================================
// CLI
// ============================================================

function printHelp(): void {
  console.log(`GRVT CLI

Usage:
  npx @wezzcoetzee/grvt <method> [options]

Common Options:
  --env <env>             Environment: dev, stg, testnet, prod (default: prod)
  --api-key <key>         API key for authenticated endpoints
  --timeout <number>      Request timeout in milliseconds (default: 10000)
  --offline               Generate request payload without sending
  --help, -h              Show this help message

=============================================================================
MARKET DATA METHODS (Public)
=============================================================================

Instruments:
  getInstrument           --instrument <string>
  getAllInstruments       [--is_active <bool>]
  getFilteredInstruments  [--kind <json>] [--base <json>] [--quote <json>]
                          [--is_active <bool>] [--limit <number>]

Ticker:
  getMiniTicker           --instrument <string>
  getTicker               --instrument <string>

Order Book:
  getOrderbookLevels      --instrument <string> [--depth <10|50|100|500>]

Trades:
  getTrades               --instrument <string> [--limit <number>]
  getTradeHistory         --instrument <string> [--limit <number>]
                          [--start_time <ns>] [--end_time <ns>] [--cursor <string>]

Candlesticks:
  getCandlestick          --instrument <string> --interval <CI_1_M|CI_1_H|...>
                          --type <TRADE|MARK|INDEX|MID>
                          [--start_time <ns>] [--end_time <ns>]
                          [--limit <number>] [--cursor <string>]

Funding:
  getFundingRate          --instrument <string> [--limit <number>]
                          [--start_time <ns>] [--end_time <ns>] [--cursor <string>]

=============================================================================
TRADING METHODS (Authenticated - requires --api-key)
=============================================================================

Orders:
  createOrder             --order <json>
  cancelOrder             --sub_account_id <string> --order_id <string>
                          [--client_order_id <string>]
  cancelAllOrders         --sub_account_id <string> [--instrument <string>]
  getOrder                --sub_account_id <string> --order_id <string>
                          [--client_order_id <string>]
  getOpenOrders           --sub_account_id <string>
                          [--kind <json>] [--base <json>] [--quote <json>]
  getOrderHistory         --sub_account_id <string>
                          [--kind <json>] [--base <json>] [--quote <json>]
                          [--limit <number>] [--cursor <string>]

Fills:
  getFillHistory          --sub_account_id <string>
                          [--kind <json>] [--base <json>] [--quote <json>]
                          [--start_time <ns>] [--end_time <ns>]
                          [--limit <number>] [--cursor <string>]

Positions:
  getPositions            --sub_account_id <string>
                          [--kind <json>] [--base <json>] [--quote <json>]

=============================================================================
ACCOUNT METHODS (Authenticated - requires --api-key)
=============================================================================

Account Summary:
  getSubAccountSummary    --sub_account_id <string>
  getSubAccountHistory    --sub_account_id <string>
                          [--start_time <ns>] [--end_time <ns>] [--cursor <string>]
  getAggregatedAccountSummary  (no params)
  getFundingAccountSummary     (no params)

=============================================================================
TRANSFER METHODS (Authenticated - requires --api-key)
=============================================================================

Deposits:
  deposit                 --main_account_id <string> --to_sub_account_id <string>
                          --currency <USD|USDC|USDT|ETH|BTC> --num_tokens <string>
  getDepositHistory       [--limit <number>] [--cursor <string>]

Transfers:
  transfer                --from_sub_account_id <string> --to_sub_account_id <string>
                          --currency <USD|USDC|USDT|ETH|BTC> --num_tokens <string>
  getTransferHistory      [--limit <number>] [--cursor <string>]

Withdrawals:
  withdrawal              --main_account_id <string> --from_sub_account_id <string>
                          --to_eth_address <address> --currency <USD|USDC|USDT|ETH|BTC>
                          --num_tokens <string>
  getWithdrawalHistory    [--limit <number>] [--cursor <string>]

=============================================================================
INTERVALS
=============================================================================

Candlestick Intervals:
  CI_1_M, CI_3_M, CI_5_M, CI_15_M, CI_30_M      (minutes)
  CI_1_H, CI_2_H, CI_4_H, CI_6_H, CI_8_H, CI_12_H  (hours)
  CI_1_D, CI_3_D, CI_5_D                        (days)
  CI_1_W, CI_2_W, CI_3_W, CI_4_W                (weeks)

=============================================================================
EXAMPLES
=============================================================================

  # Get all active instruments
  npx @wezzcoetzee/grvt getAllInstruments --is_active true

  # Get BTC perpetual ticker
  npx @wezzcoetzee/grvt getTicker --instrument BTC_USDT_Perp

  # Get order book with depth 10
  npx @wezzcoetzee/grvt getOrderbookLevels --instrument BTC_USDT_Perp --depth 10

  # Get candlestick data
  npx @wezzcoetzee/grvt getCandlestick --instrument BTC_USDT_Perp --interval CI_1_H --type TRADE --limit 100

  # Get recent trades
  npx @wezzcoetzee/grvt getTrades --instrument BTC_USDT_Perp --limit 50

  # Get funding rate history
  npx @wezzcoetzee/grvt getFundingRate --instrument BTC_USDT_Perp --limit 100

  # Use testnet
  npx @wezzcoetzee/grvt getAllInstruments --env testnet

  # Get positions (authenticated)
  npx @wezzcoetzee/grvt getPositions --api-key YOUR_API_KEY --sub_account_id 123456789

  # Get account summary (authenticated)
  npx @wezzcoetzee/grvt getSubAccountSummary --api-key YOUR_API_KEY --sub_account_id 123456789

  # Preview request payload (offline mode)
  npx @wezzcoetzee/grvt getTicker --instrument BTC_USDT_Perp --offline`);
}

// ============================================================
// Entry
// ============================================================

const rawArgs = extractArgs(process.argv.slice(2), {
  flags: ["help", "h", "offline"],
  collect: false,
});
const args = transformArgs(rawArgs, { number: "string" });
const [method] = args._;

if (args.help || args.h || !method) {
  printHelp();
} else {
  executeMethod(method, args)
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch((error) => console.error(error));
}

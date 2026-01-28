// deno-lint-ignore-file no-console

/**
 * Generates OpenAPI specs from SDK TypeScript types and syncs them to GitBook.
 *
 * Required environment variables:
 * - GITBOOK_TOKEN: GitBook API token
 * - GITBOOK_ORG_ID: GitBook organization ID
 *
 * @example
 * ```sh
 * deno run -A docs/.scripts/updateOpenAPI.ts
 * ```
 */

// ======================================================================================
// Type Definitions
// ======================================================================================

type EndpointCategory = "market_data" | "trade_data";

interface MethodSpec {
  path: string;
  requestType: string;
  responseType: string;
  description: string;
  requiresAuth: boolean;
}

type AllMethods = Record<EndpointCategory, Record<string, MethodSpec>>;

type OpenAPISpecs = Record<EndpointCategory, Record<string, unknown>>;

// ======================================================================================
// Method Definitions (extracted from GrvtRawClient)
// ======================================================================================

function getAllMethods(): AllMethods {
  console.log("[Methods] Building method definitions from GrvtRawClient...");

  const marketDataMethods: Record<string, MethodSpec> = {
    getInstrument: {
      path: "full/v1/instrument",
      requestType: "GetInstrumentRequest",
      responseType: "GetInstrumentResponse",
      description: "Get a single instrument by name",
      requiresAuth: false,
    },
    getAllInstruments: {
      path: "full/v1/all_instruments",
      requestType: "GetAllInstrumentsRequest",
      responseType: "GetAllInstrumentsResponse",
      description: "Get all instruments",
      requiresAuth: false,
    },
    getFilteredInstruments: {
      path: "full/v1/instruments",
      requestType: "GetFilteredInstrumentsRequest",
      responseType: "GetFilteredInstrumentsResponse",
      description: "Get filtered instruments based on criteria",
      requiresAuth: false,
    },
    getMiniTicker: {
      path: "full/v1/mini",
      requestType: "MiniTickerRequest",
      responseType: "MiniTickerResponse",
      description: "Get mini ticker for an instrument",
      requiresAuth: false,
    },
    getTicker: {
      path: "full/v1/ticker",
      requestType: "TickerRequest",
      responseType: "TickerResponse",
      description: "Get full ticker for an instrument",
      requiresAuth: false,
    },
    getOrderbookLevels: {
      path: "full/v1/book",
      requestType: "OrderbookLevelsRequest",
      responseType: "OrderbookLevelsResponse",
      description: "Get order book levels for an instrument",
      requiresAuth: false,
    },
    getTrades: {
      path: "full/v1/trade",
      requestType: "TradeRequest",
      responseType: "TradeResponse",
      description: "Get recent trades for an instrument",
      requiresAuth: false,
    },
    getTradeHistory: {
      path: "full/v1/trade_history",
      requestType: "TradeHistoryRequest",
      responseType: "TradeHistoryResponse",
      description: "Get trade history for an instrument",
      requiresAuth: false,
    },
    getCandlestick: {
      path: "full/v1/kline",
      requestType: "CandlestickRequest",
      responseType: "CandlestickResponse",
      description: "Get candlestick data for an instrument",
      requiresAuth: false,
    },
    getFundingRate: {
      path: "full/v1/funding",
      requestType: "FundingRateRequest",
      responseType: "FundingRateResponse",
      description: "Get funding rate history for an instrument",
      requiresAuth: false,
    },
  };

  const tradeDataMethods: Record<string, MethodSpec> = {
    createOrder: {
      path: "full/v1/create_order",
      requestType: "CreateOrderRequest",
      responseType: "CreateOrderResponse",
      description: "Create an order",
      requiresAuth: true,
    },
    cancelOrder: {
      path: "full/v1/cancel_order",
      requestType: "CancelOrderRequest",
      responseType: "AckResponse",
      description: "Cancel an order",
      requiresAuth: true,
    },
    cancelAllOrders: {
      path: "full/v1/cancel_all_orders",
      requestType: "CancelAllOrdersRequest",
      responseType: "AckResponse",
      description: "Cancel all orders",
      requiresAuth: true,
    },
    getOrder: {
      path: "full/v1/order",
      requestType: "GetOrderRequest",
      responseType: "GetOrderResponse",
      description: "Get an order by ID",
      requiresAuth: true,
    },
    getOpenOrders: {
      path: "full/v1/open_orders",
      requestType: "OpenOrdersRequest",
      responseType: "OpenOrdersResponse",
      description: "Get open orders",
      requiresAuth: true,
    },
    getOrderHistory: {
      path: "full/v1/order_history",
      requestType: "OrderHistoryRequest",
      responseType: "OrderHistoryResponse",
      description: "Get order history",
      requiresAuth: true,
    },
    getFillHistory: {
      path: "full/v1/fill_history",
      requestType: "FillHistoryRequest",
      responseType: "FillHistoryResponse",
      description: "Get fill history",
      requiresAuth: true,
    },
    getPositions: {
      path: "full/v1/positions",
      requestType: "PositionsRequest",
      responseType: "PositionsResponse",
      description: "Get positions",
      requiresAuth: true,
    },
    getSubAccountSummary: {
      path: "full/v1/account_summary",
      requestType: "SubAccountSummaryRequest",
      responseType: "SubAccountSummaryResponse",
      description: "Get sub account summary",
      requiresAuth: true,
    },
    getSubAccountHistory: {
      path: "full/v1/account_history",
      requestType: "SubAccountHistoryRequest",
      responseType: "SubAccountHistoryResponse",
      description: "Get sub account history",
      requiresAuth: true,
    },
    getAggregatedAccountSummary: {
      path: "full/v1/aggregated_account_summary",
      requestType: "EmptyRequest",
      responseType: "AggregatedAccountSummaryResponse",
      description: "Get aggregated account summary",
      requiresAuth: true,
    },
    getFundingAccountSummary: {
      path: "full/v1/funding_account_summary",
      requestType: "EmptyRequest",
      responseType: "FundingAccountSummaryResponse",
      description: "Get funding account summary",
      requiresAuth: true,
    },
    deposit: {
      path: "full/v1/deposit",
      requestType: "DepositRequest",
      responseType: "AckResponse",
      description: "Make a deposit",
      requiresAuth: true,
    },
    getDepositHistory: {
      path: "full/v1/deposit_history",
      requestType: "DepositHistoryRequest",
      responseType: "DepositHistoryResponse",
      description: "Get deposit history",
      requiresAuth: true,
    },
    transfer: {
      path: "full/v1/transfer",
      requestType: "TransferRequest",
      responseType: "AckResponse",
      description: "Make a transfer between sub accounts",
      requiresAuth: true,
    },
    getTransferHistory: {
      path: "full/v1/transfer_history",
      requestType: "TransferHistoryRequest",
      responseType: "TransferHistoryResponse",
      description: "Get transfer history",
      requiresAuth: true,
    },
    withdrawal: {
      path: "full/v1/withdrawal",
      requestType: "WithdrawalRequest",
      responseType: "AckResponse",
      description: "Make a withdrawal",
      requiresAuth: true,
    },
    getWithdrawalHistory: {
      path: "full/v1/withdrawal_history",
      requestType: "WithdrawalHistoryRequest",
      responseType: "WithdrawalHistoryResponse",
      description: "Get withdrawal history",
      requiresAuth: true,
    },
  };

  const result: AllMethods = {
    market_data: marketDataMethods,
    trade_data: tradeDataMethods,
  };

  const totalMethods = Object.values(result).reduce((sum, cat) => sum + Object.keys(cat).length, 0);
  console.log(`[Methods] Defined ${totalMethods} methods`);

  return result;
}

// ======================================================================================
// OpenAPI Spec Generation
// ======================================================================================

const SECTION_TITLES: Record<EndpointCategory, string> = {
  market_data: "Market Data Methods",
  trade_data: "Trade Data Methods",
};

const SERVER_URLS: Record<EndpointCategory, { mainnet: string; testnet: string }> = {
  market_data: {
    mainnet: "https://market-data.grvt.io",
    testnet: "https://market-data.testnet.grvt.io",
  },
  trade_data: {
    mainnet: "https://trades.grvt.io",
    testnet: "https://trades.testnet.grvt.io",
  },
};

function generateOpenAPISpecs(methods: AllMethods): OpenAPISpecs {
  console.log("[OpenAPI] Generating OpenAPI specs...");
  const result: OpenAPISpecs = { market_data: {}, trade_data: {} };

  for (const category of Object.keys(methods) as EndpointCategory[]) {
    const categoryMethods = methods[category];
    const servers = SERVER_URLS[category];

    for (const [methodName, methodSpec] of Object.entries(categoryMethods)) {
      const spec = {
        openapi: "3.1.1",
        info: {
          title: `GRVT API - ${methodName}`,
          version: "1.0.0",
        },
        servers: [
          { url: servers.mainnet, description: "Mainnet" },
          { url: servers.testnet, description: "Testnet" },
        ],
        tags: [
          {
            name: methodName,
            "x-page-title": methodName,
            "x-page-slug": methodName,
          },
        ],
        paths: {
          [`/${methodSpec.path}`]: {
            post: {
              tags: [methodName],
              summary: methodSpec.description,
              description: methodSpec.description,
              ...(methodSpec.requiresAuth && {
                security: [{ ApiKeyAuth: [] }, { CookieAuth: [] }],
              }),
              requestBody: {
                content: {
                  "application/json": {
                    schema: {
                      $ref: `#/components/schemas/${methodSpec.requestType}`,
                    },
                  },
                },
                required: true,
              },
              responses: {
                "200": {
                  description: "Successful response",
                  content: {
                    "application/json": {
                      schema: {
                        $ref: `#/components/schemas/${methodSpec.responseType}`,
                      },
                    },
                  },
                },
                "400": {
                  description: "Bad Request",
                  content: {
                    "application/json": {
                      schema: {
                        type: "object",
                        properties: {
                          code: { type: "integer" },
                          message: { type: "string" },
                          status: { type: "string" },
                        },
                      },
                    },
                  },
                },
                "401": {
                  description: "Unauthorized",
                  content: {
                    "application/json": {
                      schema: {
                        type: "object",
                        properties: {
                          code: { type: "integer" },
                          message: { type: "string" },
                          status: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          securitySchemes: {
            ApiKeyAuth: {
              type: "apiKey",
              in: "header",
              name: "Authorization",
              description: "API key authentication using Bearer token",
            },
            CookieAuth: {
              type: "apiKey",
              in: "cookie",
              name: "gravity",
              description: "Session cookie authentication",
            },
          },
          schemas: {},
        },
      };

      result[category][methodName] = spec;
    }
  }

  const totalSpecs = Object.values(result).reduce((sum, cat) => sum + Object.keys(cat).length, 0);
  console.log(`[OpenAPI] Generated ${totalSpecs} specs`);

  return result;
}

// ======================================================================================
// Update SUMMARY.md
// ======================================================================================

export async function updateSummary(openapiSpecs: OpenAPISpecs): Promise<void> {
  console.log("[Summary] Updating SUMMARY.md...");
  const summaryPath = new URL("../SUMMARY.md", import.meta.url);
  const summary = await Deno.readTextFile(summaryPath);

  const apiHeader = "## API Reference";
  const start = summary.indexOf(apiHeader);
  if (start === -1) throw new Error("Section '## API Reference' not found in SUMMARY.md");

  const nextHeaderIndex = summary.indexOf("\n## ", start + apiHeader.length);
  const prefix = summary.slice(0, start);
  const suffix = nextHeaderIndex === -1 ? "" : summary.slice(nextHeaderIndex);

  const lines = ["## API Reference", ""];
  lines.push("- [GrvtRawClient](api-reference/raw-client.md)");
  lines.push("- [GrvtClient (CCXT-style)](api-reference/ccxt-client.md)");
  lines.push("");

  const orderedCategories: EndpointCategory[] = ["market_data", "trade_data"];

  for (const category of orderedCategories) {
    const methods = Object.keys(openapiSpecs[category]).sort();
    if (!methods.length) continue;

    lines.push(`- ${SECTION_TITLES[category]}`);
    for (const method of methods) {
      lines.push(
        `  - \`\`\`yaml`,
        "    type: builtin:openapi",
        "    props:",
        "      models: false",
        "      downloadLink: false",
        "    dependencies:",
        "      spec:",
        "        ref:",
        "          kind: openapi",
        `          spec: grvt-${category.replace("_", "-")}-${method}`,
        "    ```",
      );
    }
    lines.push("");
  }

  await Deno.writeTextFile(summaryPath, `${prefix}${lines.join("\n")}${suffix}`.trimEnd() + "\n");
  const totalMethods = Object.values(openapiSpecs).reduce((sum, cat) => sum + Object.keys(cat).length, 0);
  console.log(`[Summary] Updated with ${totalMethods} methods`);
}

// ======================================================================================
// Update GitBook OpenAPI Specs
// ======================================================================================

export async function updateGitBookOpenAPIs(
  openapiSpecs: OpenAPISpecs,
  gitbookToken: string,
  orgId: string,
): Promise<void> {
  console.log("[GitBook] Starting GitBook OpenAPI sync...");
  const apiBase = "https://api.gitbook.com/v1";
  const headers = {
    Authorization: `Bearer ${gitbookToken}`,
    "Content-Type": "application/json",
  };

  const specs = Object.entries(openapiSpecs)
    .flatMap(([category, methods]) =>
      Object.entries(methods).map(([name, spec]) => ({
        slug: `grvt-${category.replace("_", "-")}-${name}`,
        text: JSON.stringify(spec),
      }))
    )
    .sort((a, b) => a.slug.localeCompare(b.slug));

  console.log(`[GitBook] Prepared ${specs.length} local specs`);
  if (specs.length === 0) {
    console.log("[GitBook] No specs to upload.");
    return;
  }

  const localSlugs = new Set(specs.map((s) => s.slug));

  console.log("[GitBook] Fetching existing specs from GitBook...");
  const allRemoteSpecs: Array<{ slug: string }> = [];
  let nextPage: string | undefined;
  let pageCount = 0;

  do {
    pageCount++;
    const url = new URL(`${apiBase}/orgs/${orgId}/openapi`);
    url.searchParams.set("limit", "1000");
    if (nextPage) url.searchParams.set("page", nextPage);

    const listRes = await fetch(url.toString(), { headers });
    if (!listRes.ok) {
      const body = await listRes.text();
      throw new Error(`Failed to list GitBook specs (${listRes.status}): ${body}`);
    }

    const data = await listRes.json();

    allRemoteSpecs.push(...data.items);
    nextPage = data.next?.page;
  } while (nextPage);

  const remoteSlugs = allRemoteSpecs.map((item) => item.slug).filter((slug) => slug.startsWith("grvt-"));
  console.log(`[GitBook] Fetched ${remoteSlugs.length} existing specs from GitBook over ${pageCount} page(s)`);

  const toDelete = remoteSlugs.filter((slug) => !localSlugs.has(slug));
  if (toDelete.length > 0) {
    console.log(`[GitBook] Deleting ${toDelete.length} obsolete spec(s)...`);
  }
  for (const slug of remoteSlugs) {
    if (!localSlugs.has(slug)) {
      const delRes = await fetch(`${apiBase}/orgs/${orgId}/openapi/${slug}`, {
        method: "DELETE",
        headers,
      });

      if (!delRes.ok) {
        const body = await delRes.text();
        throw new Error(`Delete failed for ${slug} (${delRes.status}): ${body}`);
      }

      console.log(`[GitBook] Deleted ${slug}`);
    }
  }

  const toUpdate = specs.filter((s) => remoteSlugs.includes(s.slug));
  const toCreate = specs.filter((s) => !remoteSlugs.includes(s.slug));
  console.log(`[GitBook] Uploading ${toCreate.length} new, updating ${toUpdate.length} existing spec(s)...`);

  for (const { slug, text } of specs) {
    const isUpdate = remoteSlugs.includes(slug);
    const res = await fetch(`${apiBase}/orgs/${orgId}/openapi/${slug}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ source: { text } }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`${isUpdate ? "Update" : "Upload"} failed for ${slug} (${res.status}): ${body}`);
    }

    console.log(`[GitBook] ${isUpdate ? "Updated" : "Uploaded"} ${slug}`);
  }

  console.log(`[GitBook] Sync completed`);
}

// ======================================================================================
// Main
// ======================================================================================

import "jsr:@std/dotenv@^0.225.5/load";

if (import.meta.main) {
  console.log("==".repeat(40));
  console.log("Starting GRVT OpenAPI Update Process");
  console.log("==".repeat(40));

  const GITBOOK_TOKEN = Deno.env.get("GITBOOK_TOKEN");
  const GITBOOK_ORG_ID = Deno.env.get("GITBOOK_ORG_ID");

  if (!GITBOOK_TOKEN || !GITBOOK_ORG_ID) {
    throw new Error("GITBOOK_TOKEN and GITBOOK_ORG_ID must be set in environment variables");
  }

  const methods = getAllMethods();
  const openapiSpecs = generateOpenAPISpecs(methods);
  await updateSummary(openapiSpecs);
  await updateGitBookOpenAPIs(openapiSpecs, GITBOOK_TOKEN, GITBOOK_ORG_ID);

  console.log("==".repeat(40));
  console.log(`Process completed successfully`);
  console.log("==".repeat(40));
}

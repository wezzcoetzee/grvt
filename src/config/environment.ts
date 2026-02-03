/**
 * GRVT Environment Configuration
 *
 * Provides endpoint URLs and chain IDs for different GRVT environments.
 */

import { GrvtEndpointType, GrvtEnv } from "../types/mod.ts";

/**
 * Configuration for a single endpoint (RPC and WebSocket)
 */
export interface GrvtEndpointConfig {
  /** HTTP RPC endpoint URL */
  rpcEndpoint: string;
  /** WebSocket endpoint URL (null for endpoints that don't support WebSocket) */
  wsEndpoint: string | null;
}

/**
 * Full environment configuration including all endpoint types
 */
export interface GrvtEnvConfig {
  /** Edge endpoint configuration (auth, graphql) */
  edge: GrvtEndpointConfig;
  /** Trade data endpoint configuration */
  tradeData: GrvtEndpointConfig;
  /** Market data endpoint configuration */
  marketData: GrvtEndpointConfig;
  /** Chain ID for EIP-712 signing */
  chainId: number;
}

/**
 * Chain IDs for each environment
 */
export const CHAIN_IDS: Record<GrvtEnv, number> = {
  [GrvtEnv.DEV]: 327,
  [GrvtEnv.STG]: 327,
  [GrvtEnv.TESTNET]: 326,
  [GrvtEnv.PROD]: 325,
};

/**
 * Get the full environment configuration for a given environment
 *
 * @param environment - The GRVT environment
 * @returns The environment configuration with all endpoints and chain ID
 *
 * @example
 * ```ts
 * import { getEnvConfig, GrvtEnv } from "@wezzcoetzee/grvt";
 *
 * const config = getEnvConfig(GrvtEnv.TESTNET);
 * console.log(config.marketData.rpcEndpoint);
 * // https://market-data.testnet.grvt.io
 * ```
 */
export function getEnvConfig(environment: GrvtEnv): GrvtEnvConfig {
  switch (environment) {
    case GrvtEnv.PROD:
      return {
        edge: {
          rpcEndpoint: "https://edge.grvt.io",
          wsEndpoint: null,
        },
        tradeData: {
          rpcEndpoint: "https://trades.grvt.io",
          wsEndpoint: "wss://trades.grvt.io/ws",
        },
        marketData: {
          rpcEndpoint: "https://market-data.grvt.io",
          wsEndpoint: "wss://market-data.grvt.io/ws",
        },
        chainId: CHAIN_IDS[GrvtEnv.PROD],
      };

    case GrvtEnv.TESTNET:
      return {
        edge: {
          rpcEndpoint: `https://edge.${environment}.grvt.io`,
          wsEndpoint: null,
        },
        tradeData: {
          rpcEndpoint: `https://trades.${environment}.grvt.io`,
          wsEndpoint: `wss://trades.${environment}.grvt.io/ws`,
        },
        marketData: {
          rpcEndpoint: `https://market-data.${environment}.grvt.io`,
          wsEndpoint: `wss://market-data.${environment}.grvt.io/ws`,
        },
        chainId: CHAIN_IDS[GrvtEnv.TESTNET],
      };

    case GrvtEnv.DEV:
    case GrvtEnv.STG:
      return {
        edge: {
          rpcEndpoint: `https://edge.${environment}.gravitymarkets.io`,
          wsEndpoint: null,
        },
        tradeData: {
          rpcEndpoint: `https://trades.${environment}.gravitymarkets.io`,
          wsEndpoint: `wss://trades.${environment}.gravitymarkets.io/ws`,
        },
        marketData: {
          rpcEndpoint: `https://market-data.${environment}.gravitymarkets.io`,
          wsEndpoint: `wss://market-data.${environment}.gravitymarkets.io/ws`,
        },
        chainId: CHAIN_IDS[environment],
      };

    default:
      throw new Error(`Unknown environment: ${environment}`);
  }
}

/**
 * Get endpoint domains for a given environment
 *
 * @param environment - The GRVT environment
 * @returns A map of endpoint types to their base URLs
 */
export function getEndpointDomains(environment: GrvtEnv): Record<GrvtEndpointType, string> {
  const config = getEnvConfig(environment);
  return {
    [GrvtEndpointType.EDGE]: config.edge.rpcEndpoint,
    [GrvtEndpointType.TRADE_DATA]: config.tradeData.rpcEndpoint,
    [GrvtEndpointType.MARKET_DATA]: config.marketData.rpcEndpoint,
  };
}

/**
 * Get WebSocket endpoint URL for a given environment and endpoint type
 *
 * @param environment - The GRVT environment
 * @param endpointType - The type of endpoint
 * @returns The WebSocket URL or null if not available
 */
export function getWsEndpoint(environment: GrvtEnv, endpointType: GrvtEndpointType): string | null {
  const config = getEnvConfig(environment);

  switch (endpointType) {
    case GrvtEndpointType.TRADE_DATA:
      return config.tradeData.wsEndpoint;
    case GrvtEndpointType.MARKET_DATA:
      return config.marketData.wsEndpoint;
    case GrvtEndpointType.EDGE:
      return config.edge.wsEndpoint;
    default:
      return null;
  }
}

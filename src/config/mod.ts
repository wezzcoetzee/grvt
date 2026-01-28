/**
 * GRVT SDK Configuration
 *
 * Environment and endpoint configuration for the GRVT API.
 *
 * @module
 */

export {
  CHAIN_IDS,
  getEndpointDomains,
  getEnvConfig,
  getWsEndpoint,
  type GrvtEndpointConfig,
  type GrvtEnvConfig,
} from "./environment.ts";

export {
  EDGE_ENDPOINTS,
  ENDPOINT_VERSION,
  type EndpointName,
  getAllEndpoints,
  getEndpoint,
  GRVT_ENDPOINTS,
  MARKET_DATA_ENDPOINTS,
  TRADE_DATA_ENDPOINTS,
  WS_STREAMS,
} from "./endpoints.ts";

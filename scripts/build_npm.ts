/**
 * Builds the Deno library for working with NodeJS or publishing to npm
 *
 * @example
 * ```sh
 * deno run -A scripts/build_npm.ts
 * ```
 */

import { build, emptyDir } from "jsr:@deno/dnt@^0.42.3";
import denoJson from "../deno.json" with { type: "json" };

/**
 * Convert JSR dependencies to npm equivalents in deno.json imports.
 * This is necessary because dnt needs npm package names for the npm build.
 */
async function modifyImports(): Promise<() => Promise<void>> {
  const jsr2npm: Record<string, string> = {
    "jsr:@noble/hashes": "npm:@noble/hashes",
    "jsr:@paulmillr/micro-eth-signer": "npm:micro-eth-signer",
    "jsr:@valibot/valibot": "npm:valibot",
  };

  const rawConfig = await Deno.readTextFile("./deno.json");
  let tempConfig = rawConfig;
  for (const [jsr, npm] of Object.entries(jsr2npm)) {
    tempConfig = tempConfig.replace(jsr, npm);
  }
  await Deno.writeTextFile("./deno.json", tempConfig);

  return async (): Promise<void> => {
    await Deno.writeTextFile("./deno.json", rawConfig);
  };
}

const restoreConfig = await modifyImports();
try {
  await emptyDir("./build/npm");
  await build({
    entryPoints: [
      ...Object.entries(denoJson.exports).map(([k, v]) => ({ name: k, path: v })),
    ],
    outDir: "./build/npm",
    shims: {},
    typeCheck: "both",
    test: false,
    package: {
      name: "@wezzcoetzee/grvt",
      version: denoJson.version,
      description: "GRVT Exchange TypeScript SDK",
      keywords: [
        "api",
        "library",
        "sdk",
        "javascript",
        "typescript",
        "cryptocurrency",
        "trading",
        "blockchain",
        "exchange",
        "web3",
        "dex",
        "grvt",
        "gravity",
      ],
      homepage: "https://github.com/wezzcoetzee/grvt",
      bugs: {
        url: "https://github.com/wezzcoetzee/grvt/issues",
      },
      repository: {
        type: "git",
        url: "git+https://github.com/wezzcoetzee/grvt.git",
      },
      license: "MIT",
      author: {
        name: "wezzcoetzee",
      },
      sideEffects: false,
      engines: {
        node: ">=20.0.0",
      },
    },
    compilerOptions: {
      lib: ["ESNext", "DOM"],
      target: "Latest",
      sourceMap: true,
    },
  });

  // Copy additional files to npm build directory
  await Promise.all([
    Deno.copyFile("LICENSE", "build/npm/LICENSE").catch(() => {}),
    Deno.copyFile("README.md", "build/npm/README.md").catch(() => {}),
  ]);
} finally {
  await restoreConfig();
}

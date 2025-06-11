/// <reference types="vitest" />
import { resolve } from "node:path";
import { defineConfig, searchForWorkspaceRoot } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import { nxViteTsPaths } from "@nx/vite/plugins/nx-tsconfig-paths.plugin";

export default defineConfig((_config) => {
  return {
    root: __dirname,
    build: {
      outDir: "../../dist/apps/ove-renderer",
      reportCompressedSize: true,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
    server: {
      port: 4102,
      host: "0.0.0.0",
      fs: {
        allow: [searchForWorkspaceRoot(process.cwd())]
      }
    },
    preview: {
      port: 4103,
      host: "0.0.0.0"
    },
    cacheDir: "../../node_modules/.vite/ove-renderer",
    plugins: [nxViteTsPaths(), viteSingleFile()],
    test: {
      reporters: ["default"],
      coverage: {
        reportsDirectory: "../../coverage/apps/ove-renderer",
        provider: "v8",
      },
      globals: true,
      cache: {
        dir: "../../node_modules/.vitest",
      },
      environment: "jsdom",
      include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts}"],
    },
  };
});

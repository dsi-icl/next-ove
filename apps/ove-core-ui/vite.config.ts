/// <reference types="vitest" />
import react from "@vitejs/plugin-react";
import { defineConfig, searchForWorkspaceRoot } from "vite";
import { nxViteTsPaths } from "@nx/vite/plugins/nx-tsconfig-paths.plugin";

export default defineConfig((_config) => {
  return {
    root: __dirname,
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern"
        }
      }
    },
    build: {
      outDir: "../../dist/apps/ove-core-ui",
      reportCompressedSize: true,
      commonjsOptions: {
        transformMixedEsModules: true
      }
    },
    cacheDir: "../../node_modules/.vite/ove-core-ui",
    server: {
      port: 4202,
      host: "0.0.0.0",
      fs: {
        allow: [searchForWorkspaceRoot(process.cwd())]
      }
    },
    preview: {
      port: 4203,
      host: "0.0.0.0"
    },
    plugins: [react(), nxViteTsPaths()],
    test: {
      reporters: ["default"],
      coverage: {
        reportsDirectory: "../../coverage/apps/ove-core-ui",
        provider: "v8"
      },
      globals: true,
      cache: {
        dir: "../../node_modules/.vitest"
      },
      environment: "jsdom",
      include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"]
    }
  };
});

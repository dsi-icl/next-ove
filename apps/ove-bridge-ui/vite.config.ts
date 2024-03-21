// / <reference types="vitest" />
import { defineConfig } from "vite";
import MillionLint from "@million/lint";
import react from "@vitejs/plugin-react";
import { nxViteTsPaths } from "@nx/vite/plugins/nx-tsconfig-paths.plugin";

export default defineConfig(({ mode }) => ({
  root: __dirname,
  base: "./",
  build: {
    outDir: "../../dist/apps/ove-bridge-ui",
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
  cacheDir: "../../node_modules/.vite/ove-bridge-ui",
  server: {
    port: 4200,
    host: "localhost"
  },
  preview: {
    port: 4300,
    host: "localhost"
  },
  plugins: [react(), nxViteTsPaths()].concat(
    mode === "linting" ? [MillionLint.vite()] : []),
  test: {
    reporters: ["default"],
    coverage: {
      reportsDirectory: "../../coverage/apps/ove-bridge-ui",
      provider: "v8"
    },
    globals: true,
    cache: {
      dir: "../../node_modules/.vitest"
    },
    environment: "jsdom",
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"]
  }
}));

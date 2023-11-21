// / <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  cacheDir: "../../node_modules/.vite/ove-client-ui",
  server: {
    port: 4201,
    host: "127.0.0.1"
  },
  preview: {
    port: 4301,
    host: "127.0.0.1"
  },
  plugins: [
    react(),
    viteTsConfigPaths({
      root: "../../"
    })
  ],
  test: {
    globals: true,
    cache: {
      dir: "../../node_modules/.vitest"
    },
    environment: "jsdom",
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"]
  }
});

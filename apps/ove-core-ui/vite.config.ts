/// <reference types="vitest" />
import react from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";
import { defineConfig, searchForWorkspaceRoot, loadEnv } from "vite";

export default defineConfig(({ command: _command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    cacheDir: "../../node_modules/.vite/ove-core-ui",
    define: {
      VITE_CORE_URL: env.CORE_URL,
      VITE_CORE_API_VERSION: env.CORE_API_VERSION
    },
    server: {
      port: parseInt(env.VITE_PORT),
      host: env.VITE_HOST,
      fs: {
        allow: [
          searchForWorkspaceRoot(process.cwd())
        ]
      }
    },
    preview: {
      port: parseInt(env.VITE_PORT),
      host: env.VITE_HOST
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
  };
});

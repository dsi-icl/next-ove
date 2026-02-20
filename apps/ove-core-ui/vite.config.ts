/// <reference types="vitest" />
import react from "@vitejs/plugin-react";
import { defineConfig, searchForWorkspaceRoot, loadEnv } from "vite";
import { nxViteTsPaths } from "@nx/vite/plugins/nx-tsconfig-paths.plugin";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  console.log(env.VITE_FONT_URL);
  fetch("https://next-ove.dsi.ic.ac.uk/fonts/263.woff2").catch(console.error);
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
      },
      proxy: {
        "/fonts": {
          target: env.VITE_FONT_URL,
          changeOrigin: true,
          secure: false,
        },
      },
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

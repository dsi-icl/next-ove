/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import viteTsConfigPaths from 'vite-tsconfig-paths';
import { defineConfig, searchForWorkspaceRoot } from "vite";

export default defineConfig( {
    cacheDir: '../../node_modules/.vite/ove-core-ui',
    server: {
      port: parseInt(process.env.VITE_PORT ?? "4202"),
      host: '0.0.0.0',
      fs: {
        allow: [
          searchForWorkspaceRoot(process.cwd()),
        ],
      },
    },
    preview: {
      port: parseInt(process.env.VITE_PORT ?? "4202"),
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      viteTsConfigPaths({
        root: '../../',
      }),
    ],
    test: {
      globals: true,
      cache: {
        dir: '../../node_modules/.vitest',
      },
      environment: 'jsdom',
      include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    },
});

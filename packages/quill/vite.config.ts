/// <reference types="vitest" />

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    port: 5200,
  },
  optimizeDeps: {
    exclude: ["@weave/loom", "@weave/twine"],
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
});

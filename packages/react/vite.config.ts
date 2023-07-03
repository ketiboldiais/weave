import react from "@vitejs/plugin-react";
import path from "path";
import dts from "vite-plugin-dts";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
    }),
  ],
  server: {
    port: 5200,
  },
  optimizeDeps: {
    exclude: ["@weave/loom", "@weave/twine"],
  },
  build: {
    sourcemap: false,
    lib: {
      entry: path.resolve(__dirname, "src/index.tsx"),
      name: "weave-react",
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      external: ["react", "react-dom", "d3"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
});

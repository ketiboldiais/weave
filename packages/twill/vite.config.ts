import { defineConfig } from "vite";
import { resolve } from "path";
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
    })
  ],
  build: {
    minify: 'esbuild',
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "twill",
      fileName: "index",
			formats: ['es'],
    },
  },
});

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
    rollupOptions: {
      external: ['./src/prototypes.ts']
    },
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "quill",
      fileName: "index",
			formats: ['es'],
    },
  },
});

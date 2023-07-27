/// <reference types="vitest" />

import react from "@vitejs/plugin-react";
import path from "path";
import dts from "vite-plugin-dts";
import { defineConfig } from "vite";
import mdx from "@mdx-js/rollup";
import remarkSectionize from 'remark-sectionize';
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypePrism from "@mapbox/rehype-prism";
import remarkDirective from "remark-directive";
import remarkDirectiveRehype from "remark-directive-rehype";

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
    }),
    mdx({
      providerImportSource: "@mdx-js/react",
      remarkPlugins: [
        remarkSectionize,
        remarkMath,
        remarkGfm,
        remarkDirective,
        remarkDirectiveRehype,
      ],
      rehypePlugins: [rehypeKatex, rehypeSlug, rehypePrism],
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

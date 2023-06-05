// vite.config.ts
import { defineConfig } from "file:///Users/ketiboldiais/My%20Drive/prj/weave/node_modules/.pnpm/vite@4.3.9_@types+node@20.2.5/node_modules/vite/dist/node/index.js";
import { resolve } from "path";
import dts from "file:///Users/ketiboldiais/My%20Drive/prj/weave/node_modules/.pnpm/vite-plugin-dts@2.3.0_@types+node@20.2.5_vite@4.3.9/node_modules/vite-plugin-dts/dist/index.mjs";
var __vite_injected_original_dirname = "/Users/ketiboldiais/My Drive/prj/weave/packages/twine";
var vite_config_default = defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true
    })
  ],
  build: {
    minify: true,
    lib: {
      entry: resolve(__vite_injected_original_dirname, "src/index.ts"),
      name: "Twine",
      fileName: "index",
      formats: ["es"]
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMva2V0aWJvbGRpYWlzL015IERyaXZlL3Byai93ZWF2ZS9wYWNrYWdlcy90d2luZVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2tldGlib2xkaWFpcy9NeSBEcml2ZS9wcmovd2VhdmUvcGFja2FnZXMvdHdpbmUvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2tldGlib2xkaWFpcy9NeSUyMERyaXZlL3Byai93ZWF2ZS9wYWNrYWdlcy90d2luZS92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSBcInBhdGhcIjtcbmltcG9ydCBkdHMgZnJvbSAndml0ZS1wbHVnaW4tZHRzJztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIGR0cyh7XG4gICAgICBpbnNlcnRUeXBlc0VudHJ5OiB0cnVlLFxuICAgIH0pXG4gIF0sXG4gIGJ1aWxkOiB7XG4gICAgbWluaWZ5OiB0cnVlLFxuICAgIGxpYjoge1xuICAgICAgZW50cnk6IHJlc29sdmUoX19kaXJuYW1lLCBcInNyYy9pbmRleC50c1wiKSxcbiAgICAgIG5hbWU6IFwiVHdpbmVcIixcbiAgICAgIGZpbGVOYW1lOiBcImluZGV4XCIsXG5cdFx0XHRmb3JtYXRzOiBbJ2VzJ10sXG4gICAgfSxcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFtVixTQUFTLG9CQUFvQjtBQUNoWCxTQUFTLGVBQWU7QUFDeEIsT0FBTyxTQUFTO0FBRmhCLElBQU0sbUNBQW1DO0FBSXpDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLElBQUk7QUFBQSxNQUNGLGtCQUFrQjtBQUFBLElBQ3BCLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsSUFDUixLQUFLO0FBQUEsTUFDSCxPQUFPLFFBQVEsa0NBQVcsY0FBYztBQUFBLE1BQ3hDLE1BQU07QUFBQSxNQUNOLFVBQVU7QUFBQSxNQUNiLFNBQVMsQ0FBQyxJQUFJO0FBQUEsSUFDYjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=

// vitest.config.ts
import { defineConfig } from "file:///Users/john/Projects/address-plus/node_modules/.pnpm/vitest@1.6.1_@types+node@20.19.16/node_modules/vitest/dist/config.js";
import { resolve } from "path";
var __vite_injected_original_dirname = "/Users/john/Projects/address-plus";
var vitest_config_default = defineConfig({
  resolve: {
    alias: {
      "@": resolve(__vite_injected_original_dirname, "./src")
    }
  },
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.spec.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/**/*.spec.ts", "src/**/*.d.ts"],
      reporter: ["text", "html", "lcov"]
    }
  }
});
export {
  vitest_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZXN0LmNvbmZpZy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9qb2huL1Byb2plY3RzL2FkZHJlc3MtcGx1c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2pvaG4vUHJvamVjdHMvYWRkcmVzcy1wbHVzL3ZpdGVzdC5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2pvaG4vUHJvamVjdHMvYWRkcmVzcy1wbHVzL3ZpdGVzdC5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZXN0L2NvbmZpZ1wiO1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gXCJwYXRoXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgXCJAXCI6IHJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxuICAgIH0sXG4gIH0sXG4gIHRlc3Q6IHtcbiAgICBnbG9iYWxzOiB0cnVlLFxuICAgIGVudmlyb25tZW50OiBcIm5vZGVcIixcbiAgICBpbmNsdWRlOiBbXCJzcmMvKiovKi50ZXN0LnRzXCIsIFwic3JjLyoqLyouc3BlYy50c1wiXSxcbiAgICBjb3ZlcmFnZToge1xuICAgICAgcHJvdmlkZXI6IFwidjhcIixcbiAgICAgIGluY2x1ZGU6IFtcInNyYy8qKi8qLnRzXCJdLFxuICAgICAgZXhjbHVkZTogW1wic3JjLyoqLyoudGVzdC50c1wiLCBcInNyYy8qKi8qLnNwZWMudHNcIiwgXCJzcmMvKiovKi5kLnRzXCJdLFxuICAgICAgcmVwb3J0ZXI6IFtcInRleHRcIiwgXCJodG1sXCIsIFwibGNvdlwiXSxcbiAgICB9LFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXlSLFNBQVMsb0JBQW9CO0FBQ3RULFNBQVMsZUFBZTtBQUR4QixJQUFNLG1DQUFtQztBQUd6QyxJQUFPLHdCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ2pDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsTUFBTTtBQUFBLElBQ0osU0FBUztBQUFBLElBQ1QsYUFBYTtBQUFBLElBQ2IsU0FBUyxDQUFDLG9CQUFvQixrQkFBa0I7QUFBQSxJQUNoRCxVQUFVO0FBQUEsTUFDUixVQUFVO0FBQUEsTUFDVixTQUFTLENBQUMsYUFBYTtBQUFBLE1BQ3ZCLFNBQVMsQ0FBQyxvQkFBb0Isb0JBQW9CLGVBQWU7QUFBQSxNQUNqRSxVQUFVLENBQUMsUUFBUSxRQUFRLE1BQU07QUFBQSxJQUNuQztBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=

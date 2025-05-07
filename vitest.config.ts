import { fileURLToPath } from 'url';
/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // 支持全局API，不需要导入describe, it, expect等
    globals: true,
    include: ["tests/**/*.test.ts"],
    environment: "node",
    coverage: {
      reporter: ["json-summary"]
    }
  },

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  }
}); 
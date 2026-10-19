// Vite configuration — serves index.html from project root, outputs to dist/
import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  build: {
    outDir: "dist",
  },
  test: {
    // Exclude Playwright E2E specs — they use a different test runner.
    exclude: ["e2e/**", "node_modules/**"],
  },
});

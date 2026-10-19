// Vite configuration — serves index.html from project root, outputs to dist/
import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  build: {
    outDir: "dist",
  },
});

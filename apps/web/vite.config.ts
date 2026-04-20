import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  preview: { port: 4174 },
  resolve: {
    alias: {
      "@extension": path.resolve(__dirname, "../browser-extension/src"),
    },
  },
});

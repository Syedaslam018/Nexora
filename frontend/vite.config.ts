import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Lets the frontend call `/api/...` in dev without CORS/URL juggling;
      // production instead uses VITE_API_URL directly (see src/api/client.ts).
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
      // Socket.IO's handshake starts as a plain HTTP request before
      // upgrading to a WebSocket — `ws: true` is what makes Vite's dev
      // proxy forward that upgrade instead of just the initial request.
      "/socket.io": {
        target: "http://localhost:4000",
        ws: true,
        changeOrigin: true,
      },
    },
  },
});

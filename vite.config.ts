import path from "node:path";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  plugins: [
    tailwindcss(),
    // src/server.ts wraps TanStack Start's server entry with an SSR error page.
    tanstackStart({ server: { entry: "server" } }),
    // Production builds only. Nitro picks the host's output format automatically
    // (Vercel when building on Vercel, a Node server otherwise).
    ...(command === "build" ? [nitro()] : []),
    viteReact(),
  ],
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "src") },
    dedupe: ["react", "react-dom", "@tanstack/react-query", "@tanstack/query-core"],
  },
  server: { port: 8080 },
}));

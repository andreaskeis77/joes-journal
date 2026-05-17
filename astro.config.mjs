import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://zumfettigenjoe.com",
  output: "static",
  trailingSlash: "never",
  server: {
    host: "127.0.0.1",
    port: 4321,
  },
});

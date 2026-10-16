import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/mwarindimwari-matrix/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": "/tmp/mm/web/src",
    },
  },
});

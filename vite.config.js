import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "632e23ec-7214-4d7d-83fe-fe6e30cbd747-00-v0a5p9im30uv.kirk.replit.dev",
    ],
  },
});

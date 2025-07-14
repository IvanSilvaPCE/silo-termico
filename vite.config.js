import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "6ffd4e3f-43a3-4577-a938-94f6a1d197da-00-3hrfgzpvchfpt.riker.replit.dev",
    ],
  },
});

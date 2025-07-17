import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "aa3e9bf2-21c8-442e-a571-08c9d17ad426-00-2h6h63f64poen.picard.replit.dev",
    ],
  },
});

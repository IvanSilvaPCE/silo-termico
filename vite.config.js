import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "1be7011f-633c-4d4e-a7e4-d62741a65a1a-00-2m6ecmfwzaleb.janeway.replit.dev",
    ],
  },
});

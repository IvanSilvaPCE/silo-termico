import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "b72d6c06-d7c7-46d0-a116-69fdd2178de6-00-19qgxa7cdmx1s.janeway.replit.dev",
    ],
  },
});

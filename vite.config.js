import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "f9f728be-66cc-4aae-8977-b42884fca764-00-njy8xoa8mct1.janeway.replit.dev",
    ],
  },
});

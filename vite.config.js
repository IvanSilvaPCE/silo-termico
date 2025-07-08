import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "11d4209d-e7e4-45ac-afea-7dc34cd0ab6c-00-36atop32p3kf1.janeway.replit.dev",
    ],
  },
});

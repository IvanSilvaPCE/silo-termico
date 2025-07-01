import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "441eef59-0696-43fa-8df9-f6fff1cde0e5-00-2whv2qqpyml17.picard.replit.dev",
    ],
  },
});

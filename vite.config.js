import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "2394a14b-937e-400d-863b-66085f748f24-00-rtfdh970x2a6.picard.replit.dev",
    ],
  },
});

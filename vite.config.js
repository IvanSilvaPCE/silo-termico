import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "dfff80c4-b767-4498-962a-8dd82b764fa6-00-3cgm27trpu068.riker.replit.dev",
    ],
  },
});

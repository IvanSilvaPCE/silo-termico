import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "60ec7c30-8d0a-421f-9c63-aefee8dec73e-00-2qwzib2prwhdm.picard.replit.dev",
    ],
  },
});

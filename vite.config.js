import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "85992962-32fa-4684-a13a-1d33416da231-00-2qsb3aj4nfik8.worf.replit.dev",
    ],
  },
});

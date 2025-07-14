import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "69a8a29a-3d57-4db6-a4da-3525a932435d-00-308auvjevjj4e.worf.replit.dev",
    ],
  },
});

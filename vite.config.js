import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "e20436b9-7114-4a99-a914-1da7735fab43-00-2v58kp3xee65m.riker.replit.dev",
    ],
  },
});

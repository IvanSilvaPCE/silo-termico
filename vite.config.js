import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "a44e4abc-fb36-4cbb-9587-7a76dfb93fee-00-2t4uuch05jpuc.worf.replit.dev",
    ],
  },
});

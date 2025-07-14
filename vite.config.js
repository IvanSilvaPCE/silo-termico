import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "b4d321bd-3667-40ec-b066-dd8e26f4ffae-00-357oq9hqss2d5.kirk.replit.dev",
    ],
  },
});

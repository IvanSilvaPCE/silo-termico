import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "be3d2c6f-44ee-4326-93e6-23562f09c2de-00-3swey9swtdqf5.picard.replit.dev",
    ],
  },
});

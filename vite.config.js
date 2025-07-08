import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "e1fdcd54-c2f7-497d-bde0-262cdbbb26d9-00-zebt9g4niwa.janeway.replit.dev",
    ],
  },
});

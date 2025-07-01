import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "a598f79b-0180-4fe3-8fb0-1694bbb6f697-00-20ngit59db413.janeway.replit.dev",
    ],
  },
});

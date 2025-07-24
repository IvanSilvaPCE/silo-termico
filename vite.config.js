import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "5a860c7b-37bd-4ffd-a807-4ee5130dc4b8-00-2l0jqug3p0iw2.spock.replit.dev",
    ],
  },
});

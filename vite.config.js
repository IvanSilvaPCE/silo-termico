import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "2ceafef7-b7a3-4bfd-aa4b-fb8ad94dcbae-00-2dhcpsxvmknqx.worf.replit.dev",
    ],
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "42e8c485-1ef0-434d-84fd-f173502b459d-00-trxutjnf9izs.riker.replit.dev",
    ],
  },
});

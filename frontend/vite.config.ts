import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
<<<<<<< HEAD
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss(), react()],
=======

export default defineConfig({
  plugins: [react()],
>>>>>>> 7c29aad (initial commit)
  server: {
    port: 5173,
    host: true,
  },
});

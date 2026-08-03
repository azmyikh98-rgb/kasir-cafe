import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: __dirname,
  base: './', // path relatif -> aman dipasang di subfolder Hostinger mana pun
  build: {
    // Build ke ../docs (root repo) supaya bisa langsung dipakai GitHub Pages
    // (Settings -> Pages -> Deploy from a branch -> main -> /docs).
    outDir: '../docs',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'login.html'),
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Saat development (`npm run dev`), request /api diteruskan ke PHP
      // built-in server (`php -S localhost:8080 -t backend`) supaya tidak
      // kena masalah CORS dan sesi login tetap jalan normal.
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});

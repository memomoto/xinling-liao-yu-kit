import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tailwindcss(), tsConfigPaths(), react()],
  publicDir: 'public',
  server: {
    host: true,
    port: 5173,
  },
});

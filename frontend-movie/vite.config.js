import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Add the Tailwind CSS Vite plugin
  ],
  server: {
    port: 3000,
  },
  publicDir: 'public', // Explicitly set the public directory
});